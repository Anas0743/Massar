from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.entities import Track, User
from app.models.enums import UserRole
from app.schemas.schemas import TrackCreate, TrackRead, TrackUpdate

router = APIRouter(tags=["tracks"])


@router.get("/tracks", response_model=list[TrackRead])
def list_tracks(db: Session = Depends(get_db), include_inactive: bool = False) -> list[TrackRead]:
    if include_inactive:
        raise HTTPException(status_code=403, detail="Inactive tracks are available from the admin API only")
    statement = select(Track).order_by(Track.name)
    statement = statement.where(Track.is_active.is_(True))
    return [TrackRead.model_validate(track) for track in db.scalars(statement).all()]


@router.get("/admin/tracks", response_model=list[TrackRead])
def admin_list_tracks(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[TrackRead]:
    return [TrackRead.model_validate(track) for track in db.scalars(select(Track).order_by(Track.name)).all()]


@router.post("/admin/tracks", response_model=TrackRead, status_code=status.HTTP_201_CREATED)
def create_track(
    payload: TrackCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> TrackRead:
    track = Track(**payload.model_dump())
    db.add(track)
    db.commit()
    db.refresh(track)
    return TrackRead.model_validate(track)


@router.put("/admin/tracks/{track_id}", response_model=TrackRead)
def update_track(
    track_id: int,
    payload: TrackUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> TrackRead:
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(track, field, value)
    db.commit()
    db.refresh(track)
    return TrackRead.model_validate(track)


@router.delete("/admin/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    db.delete(track)
    db.commit()
