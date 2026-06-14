from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.entities import StudentProfile, User
from app.models.enums import UserRole
from app.schemas.schemas import LoginRequest, MeResponse, RegisterRequest, Token, UserRead
from app.services.serializers import serialize_expert, student_profile_or_none

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> Token:
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
    token = create_access_token(user.id)
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.scalars(select(User).where(User.email == payload.email.lower())).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MeResponse:
    return MeResponse(
        user=UserRead.model_validate(current_user),
        student_profile=student_profile_or_none(current_user),
        expert_profile=serialize_expert(db, current_user) if current_user.role == UserRole.EXPERT else None,
    )


@router.post("/logout")
def logout(_: User = Depends(get_current_user)) -> dict[str, str]:
    return {"message": "Token invalidation is handled on the frontend in this MVP"}


@router.get("/admin-check")
def admin_check(_: User = Depends(require_roles(UserRole.ADMIN))) -> dict[str, str]:
    return {"status": "ok"}
