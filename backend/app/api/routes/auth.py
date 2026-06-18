import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.rate_limit import rate_limit
from app.core.security import create_access_token, create_url_safe_token, get_password_hash, hash_token, verify_password
from app.models.entities import PasswordResetToken, StudentProfile, User
from app.models.enums import UserRole
from app.schemas.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    MeResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    Token,
    UserRead,
)
from app.services.email import send_password_reset_email
from app.services.serializers import serialize_expert, student_profile_or_none

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)
PASSWORD_RESET_RESPONSE = "If the email is registered, password reset instructions will be sent."


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    _: None = Depends(rate_limit(settings.REGISTER_RATE_LIMIT, "auth:register")),
    db: Session = Depends(get_db),
) -> Token:
    if payload.role != UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="Public registration is available for students only")

    existing = db.scalars(select(User).where(User.email == payload.email.lower())).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        avatar_url=payload.avatar_url,
        role=UserRole.STUDENT,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()

    db.add(StudentProfile(user_id=user.id))

    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.token_version)
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.post("/login", response_model=Token)
def login(
    payload: LoginRequest,
    _: None = Depends(rate_limit(settings.LOGIN_RATE_LIMIT, "auth:login")),
    db: Session = Depends(get_db),
) -> Token:
    user = db.scalars(select(User).where(User.email == payload.email.lower())).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(user.id, user.token_version)
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MeResponse:
    return MeResponse(
        user=UserRead.model_validate(current_user),
        student_profile=student_profile_or_none(current_user),
        expert_profile=serialize_expert(db, current_user) if current_user.role == UserRole.EXPERT else None,
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    current_user.token_version += 1
    db.commit()
    return {"message": "Logged out successfully"}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    _: None = Depends(rate_limit(settings.PASSWORD_CHANGE_RATE_LIMIT, "auth:change-password")),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if verify_password(payload.new_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different")

    current_user.password_hash = get_password_hash(payload.new_password)
    current_user.token_version += 1
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/password-reset/request")
def request_password_reset(
    payload: PasswordResetRequest,
    _: None = Depends(rate_limit(settings.PASSWORD_RESET_RATE_LIMIT, "auth:password-reset-request")),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user = db.scalars(select(User).where(User.email == payload.email.lower())).first()
    if not user or not user.is_active:
        return {"message": PASSWORD_RESET_RESPONSE}

    now = datetime.now(UTC)
    existing_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ).all()
    for existing_token in existing_tokens:
        existing_token.used_at = now

    raw_token = create_url_safe_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=now + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES),
        )
    )
    db.commit()

    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?{urlencode({'token': raw_token})}"
    if not send_password_reset_email(user.email, user.name, reset_url):
        logger.warning("Password reset email was not sent for user_id=%s", user.id)

    return {"message": PASSWORD_RESET_RESPONSE}


@router.post("/password-reset/confirm")
def confirm_password_reset(
    payload: PasswordResetConfirm,
    _: None = Depends(rate_limit(settings.PASSWORD_RESET_CONFIRM_RATE_LIMIT, "auth:password-reset-confirm")),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    now = datetime.now(UTC)
    token_record = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hash_token(payload.token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
    ).first()
    if not token_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password reset link is invalid or expired")

    user = db.get(User, token_record.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password reset link is invalid or expired")
    if verify_password(payload.new_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different")

    user.password_hash = get_password_hash(payload.new_password)
    user.token_version += 1
    token_record.used_at = now
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/admin-check")
def admin_check(_: User = Depends(require_roles(UserRole.ADMIN))) -> dict[str, str]:
    return {"status": "ok"}
