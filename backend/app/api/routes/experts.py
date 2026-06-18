from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, insert, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.entities import Availability, ExpertProfile, Review, SessionType, Track, User, expert_session_types, expert_tracks
from app.models.enums import UserRole
from app.schemas.schemas import AvailableSlotRead, AvailabilityCreate, AvailabilityRead, ExpertProfileUpdate, ExpertRead, ReviewRead
from app.services.booking_slots import generate_available_slots
from app.services.serializers import get_expert_availability, serialize_expert, serialize_review

router = APIRouter(tags=["experts"])


def ensure_expert_profile(db: Session, user: User) -> ExpertProfile:
    profile = user.expert_profile
    if not profile:
        profile = ExpertProfile(user_id=user.id, is_approved=False)
        db.add(profile)
        db.flush()
    return profile


def apply_expert_profile_update(db: Session, user: User, payload: ExpertProfileUpdate) -> User:
    profile = ensure_expert_profile(db, user)
    data = payload.model_dump(exclude_unset=True)

    for field in ["name", "phone", "avatar_url"]:
        value = data.pop(field, None)
        if value is not None:
            setattr(user, field, value)

    track_ids = data.pop("track_ids", None)
    session_type_ids = data.pop("session_type_ids", None)
    for field, value in data.items():
        if value is not None:
            setattr(profile, field, value)

    if track_ids is not None:
        if track_ids:
            existing_tracks = db.scalars(select(Track.id).where(Track.id.in_(track_ids), Track.is_active.is_(True))).all()
            if len(existing_tracks) != len(set(track_ids)):
                raise HTTPException(status_code=400, detail="One or more tracks do not exist or are inactive")
        db.execute(delete(expert_tracks).where(expert_tracks.c.expert_id == user.id))
        for track_id in track_ids:
            db.execute(insert(expert_tracks).values(expert_id=user.id, track_id=track_id))

    if session_type_ids is not None:
        if session_type_ids:
            existing_sessions = db.scalars(
                select(SessionType.id).where(SessionType.id.in_(session_type_ids), SessionType.is_active.is_(True))
            ).all()
            if len(existing_sessions) != len(set(session_type_ids)):
                raise HTTPException(status_code=400, detail="One or more session types do not exist or are inactive")
        db.execute(delete(expert_session_types).where(expert_session_types.c.expert_id == user.id))
        for session_type_id in session_type_ids:
            db.execute(insert(expert_session_types).values(expert_id=user.id, session_type_id=session_type_id))

    db.commit()
    db.refresh(user)
    return user


@router.get("/experts", response_model=list[ExpertRead])
def list_experts(
    search: str | None = None,
    track: str | None = None,
    max_price: float | None = Query(default=None, ge=0),
    min_rating: float | None = Query(default=None, ge=0, le=5),
    db: Session = Depends(get_db),
) -> list[ExpertRead]:
    statement = (
        select(User)
        .join(ExpertProfile, ExpertProfile.user_id == User.id)
        .where(
            User.role == UserRole.EXPERT,
            User.is_active.is_(True),
            ExpertProfile.is_approved.is_(True),
        )
    )

    if search:
        like = f"%{search}%"
        statement = statement.where(
            or_(
                User.name.ilike(like),
                ExpertProfile.title.ilike(like),
                ExpertProfile.company.ilike(like),
                ExpertProfile.bio.ilike(like),
            )
        )
    if max_price is not None:
        statement = statement.where(ExpertProfile.hourly_price <= max_price)
    if min_rating is not None:
        statement = statement.where(ExpertProfile.rating_average >= min_rating)
    if track:
        statement = (
            statement.join(expert_tracks, expert_tracks.c.expert_id == User.id)
            .join(Track, Track.id == expert_tracks.c.track_id)
            .where(Track.slug == track, Track.is_active.is_(True))
        )

    users = db.scalars(statement.distinct().order_by(ExpertProfile.rating_average.desc(), User.name)).all()
    return [serialize_expert(db, user) for user in users]


@router.get("/experts/profile", response_model=ExpertRead)
def get_my_expert_profile(
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    return serialize_expert(db, current_user)


@router.post("/experts/profile", response_model=ExpertRead)
def create_my_expert_profile(
    payload: ExpertProfileUpdate,
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    user = apply_expert_profile_update(db, current_user, payload)
    return serialize_expert(db, user)


@router.put("/experts/profile", response_model=ExpertRead)
def update_my_expert_profile(
    payload: ExpertProfileUpdate,
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    user = apply_expert_profile_update(db, current_user, payload)
    return serialize_expert(db, user)


@router.get("/experts/{expert_id}", response_model=ExpertRead)
def get_expert(expert_id: int, db: Session = Depends(get_db)) -> ExpertRead:
    user = db.get(User, expert_id)
    if not user or user.role != UserRole.EXPERT or not user.is_active or not user.expert_profile:
        raise HTTPException(status_code=404, detail="Expert not found")
    if not user.expert_profile.is_approved:
        raise HTTPException(status_code=404, detail="Expert not found")
    return serialize_expert(db, user)


@router.get("/experts/{expert_id}/availability", response_model=list[AvailabilityRead])
def get_public_availability(expert_id: int, db: Session = Depends(get_db)) -> list[AvailabilityRead]:
    user = db.get(User, expert_id)
    if not user or user.role != UserRole.EXPERT:
        raise HTTPException(status_code=404, detail="Expert not found")
    return get_expert_availability(db, expert_id)


@router.get("/experts/{expert_id}/available-slots", response_model=list[AvailableSlotRead])
def get_available_slots(
    expert_id: int,
    session_type_id: int = Query(..., gt=0),
    days: int = Query(default=14, ge=1, le=60),
    db: Session = Depends(get_db),
) -> list[AvailableSlotRead]:
    user = db.get(User, expert_id)
    if not user or user.role != UserRole.EXPERT or not user.is_active or not user.expert_profile:
        raise HTTPException(status_code=404, detail="Expert not found")
    if not user.expert_profile.is_approved:
        raise HTTPException(status_code=404, detail="Expert not found")

    session_type = db.get(SessionType, session_type_id)
    if not session_type or not session_type.is_active:
        raise HTTPException(status_code=404, detail="Session type not found")

    offered_session = db.execute(
        select(expert_session_types.c.session_type_id).where(
            expert_session_types.c.expert_id == expert_id,
            expert_session_types.c.session_type_id == session_type_id,
        )
    ).first()
    if offered_session is None:
        raise HTTPException(status_code=400, detail="This expert does not offer the selected session type")

    slots = generate_available_slots(db, expert_id, session_type.duration_minutes, days)
    return [AvailableSlotRead(starts_at=starts_at, ends_at=ends_at) for starts_at, ends_at in slots]


@router.get("/experts/{expert_id}/reviews", response_model=list[ReviewRead])
def get_expert_reviews(expert_id: int, db: Session = Depends(get_db)) -> list[ReviewRead]:
    user = db.get(User, expert_id)
    if not user or user.role != UserRole.EXPERT:
        raise HTTPException(status_code=404, detail="Expert not found")
    reviews = db.scalars(select(Review).where(Review.expert_id == expert_id).order_by(Review.created_at.desc())).all()
    return [serialize_review(db, review) for review in reviews]


@router.get("/expert/availability", response_model=list[AvailabilityRead])
def my_availability(
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> list[AvailabilityRead]:
    return get_expert_availability(db, current_user.id)


@router.put("/expert/availability", response_model=list[AvailabilityRead])
def update_my_availability(
    payload: list[AvailabilityCreate],
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> list[AvailabilityRead]:
    for item in payload:
        if item.end_time <= item.start_time:
            raise HTTPException(status_code=400, detail="End time must be after start time")

    db.execute(delete(Availability).where(Availability.expert_id == current_user.id))
    for item in payload:
        db.add(Availability(expert_id=current_user.id, **item.model_dump()))
    db.commit()
    return get_expert_availability(db, current_user.id)
