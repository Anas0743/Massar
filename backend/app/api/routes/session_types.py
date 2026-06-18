from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.entities import SessionType, User
from app.models.enums import UserRole
from app.schemas.schemas import SessionTypeCreate, SessionTypeRead, SessionTypeUpdate

router = APIRouter(tags=["session-types"])


@router.get("/session-types", response_model=list[SessionTypeRead])
def list_session_types(db: Session = Depends(get_db), include_inactive: bool = False) -> list[SessionTypeRead]:
    if include_inactive:
        raise HTTPException(status_code=403, detail="Inactive session types are available from the admin API only")
    statement = select(SessionType).order_by(SessionType.name)
    statement = statement.where(SessionType.is_active.is_(True))
    return [SessionTypeRead.model_validate(session_type) for session_type in db.scalars(statement).all()]


@router.get("/admin/session-types", response_model=list[SessionTypeRead])
def admin_list_session_types(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[SessionTypeRead]:
    return [SessionTypeRead.model_validate(session_type) for session_type in db.scalars(select(SessionType).order_by(SessionType.name)).all()]


@router.post("/admin/session-types", response_model=SessionTypeRead, status_code=status.HTTP_201_CREATED)
def create_session_type(
    payload: SessionTypeCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SessionTypeRead:
    session_type = SessionType(**payload.model_dump())
    db.add(session_type)
    db.commit()
    db.refresh(session_type)
    return SessionTypeRead.model_validate(session_type)


@router.put("/admin/session-types/{session_type_id}", response_model=SessionTypeRead)
def update_session_type(
    session_type_id: int,
    payload: SessionTypeUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SessionTypeRead:
    session_type = db.get(SessionType, session_type_id)
    if not session_type:
        raise HTTPException(status_code=404, detail="Session type not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(session_type, field, value)
    db.commit()
    db.refresh(session_type)
    return SessionTypeRead.model_validate(session_type)


@router.delete("/admin/session-types/{session_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session_type(
    session_type_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    session_type = db.get(SessionType, session_type_id)
    if not session_type:
        raise HTTPException(status_code=404, detail="Session type not found")
    session_type.is_active = False
    db.commit()
