from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.entities import StudentProfile, User
from app.models.enums import UserRole
from app.schemas.schemas import StudentProfileRead, StudentProfileUpdate

router = APIRouter(tags=["profiles"])


@router.get("/student/profile", response_model=StudentProfileRead)
def get_student_profile(current_user: User = Depends(require_roles(UserRole.STUDENT))) -> StudentProfileRead:
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return StudentProfileRead.model_validate(current_user.student_profile)


@router.put("/student/profile", response_model=StudentProfileRead)
def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
    db: Session = Depends(get_db),
) -> StudentProfileRead:
    profile = current_user.student_profile
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    data = payload.model_dump()
    for field in ["name", "phone", "avatar_url"]:
        value = data.pop(field)
        if value is not None:
            setattr(current_user, field, value)
    for field, value in data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return StudentProfileRead.model_validate(profile)
