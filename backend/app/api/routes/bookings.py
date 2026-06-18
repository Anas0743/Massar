from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.rate_limit import rate_limit
from app.models.entities import Booking, ExpertProfile, Payment, Review, SessionNote, SessionType, User, expert_session_types
from app.models.enums import BookingStatus, PaymentStatus, UserRole
from app.schemas.schemas import (
    BookingCreate,
    BookingRead,
    BookingStatusUpdate,
    MeetingUrlUpdate,
    ReviewCreate,
    ReviewRead,
    SessionNoteCreate,
    SessionNoteRead,
)
from app.services.booking_slots import lock_expert_booking_calendar, validate_booking_slot
from app.services.serializers import recalculate_expert_rating, serialize_booking, serialize_review

router = APIRouter(tags=["bookings"])


def utc_now() -> datetime:
    return datetime.now(UTC)


def normalized_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def booking_ends_at(booking: Booking) -> datetime:
    return normalized_utc(booking.scheduled_at) + timedelta(minutes=booking.duration_minutes)


def booking_is_paid(booking: Booking) -> bool:
    return booking.payment is not None and booking.payment.status == PaymentStatus.PAID


def get_booking_or_404(db: Session, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def ensure_booking_access(user: User, booking: Booking) -> None:
    if user.role == UserRole.ADMIN:
        return
    if user.role == UserRole.STUDENT and booking.student_id == user.id:
        return
    if user.role == UserRole.EXPERT and booking.expert_id == user.id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot access this booking")


def ensure_booking_can_be_cancelled_by_student(booking: Booking) -> None:
    if booking.status not in {BookingStatus.PENDING, BookingStatus.CONFIRMED}:
        raise HTTPException(status_code=400, detail="This booking cannot be cancelled")

    cutoff_at = normalized_utc(booking.scheduled_at) - timedelta(hours=settings.BOOKING_CANCELLATION_CUTOFF_HOURS)
    if utc_now() >= cutoff_at:
        raise HTTPException(
            status_code=400,
            detail=f"Bookings can only be cancelled at least {settings.BOOKING_CANCELLATION_CUTOFF_HOURS} hours before the session.",
        )


def ensure_paid_if_required(booking: Booking, next_status: BookingStatus) -> None:
    if not settings.REQUIRE_PAYMENT_BEFORE_CONFIRMATION:
        return
    if next_status not in {BookingStatus.CONFIRMED, BookingStatus.COMPLETED}:
        return
    if not booking_is_paid(booking):
        raise HTTPException(status_code=400, detail="Payment must be marked as paid before confirming or completing this booking.")


def ensure_session_has_ended(booking: Booking) -> None:
    if utc_now() < booking_ends_at(booking):
        raise HTTPException(status_code=400, detail="This booking cannot be completed before the scheduled session ends.")


def ensure_booking_status_transition(booking: Booking, next_status: BookingStatus, actor: User) -> None:
    if next_status == booking.status:
        return

    if actor.role == UserRole.STUDENT:
        if next_status != BookingStatus.CANCELLED:
            raise HTTPException(status_code=403, detail="Students can only cancel their own bookings")
        ensure_booking_can_be_cancelled_by_student(booking)
        return

    if actor.role == UserRole.EXPERT:
        allowed = {
            BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.REJECTED},
            BookingStatus.CONFIRMED: {BookingStatus.COMPLETED, BookingStatus.CANCELLED},
        }
        if next_status not in allowed.get(booking.status, set()):
            raise HTTPException(status_code=400, detail="Invalid status transition for expert")
        ensure_paid_if_required(booking, next_status)
        if next_status == BookingStatus.COMPLETED:
            ensure_session_has_ended(booking)
        if next_status == BookingStatus.CANCELLED and utc_now() >= normalized_utc(booking.scheduled_at):
            raise HTTPException(status_code=400, detail="Confirmed bookings can only be cancelled before the session starts.")
        return

    if actor.role == UserRole.ADMIN:
        allowed = {
            BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED},
            BookingStatus.CONFIRMED: {BookingStatus.COMPLETED, BookingStatus.CANCELLED},
            BookingStatus.REJECTED: {BookingStatus.PENDING},
            BookingStatus.CANCELLED: {BookingStatus.PENDING},
        }
        if next_status not in allowed.get(booking.status, set()):
            raise HTTPException(status_code=400, detail="Invalid booking status transition")
        ensure_paid_if_required(booking, next_status)
        if next_status == BookingStatus.COMPLETED:
            ensure_session_has_ended(booking)
        return

    raise HTTPException(status_code=403, detail="You cannot update this booking")


@router.post("/bookings", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    _: None = Depends(rate_limit(settings.BOOKING_RATE_LIMIT, "bookings:create")),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
    db: Session = Depends(get_db),
) -> BookingRead:
    expert = db.get(User, payload.expert_id)
    if not expert or expert.role != UserRole.EXPERT or not expert.is_active or not expert.expert_profile:
        raise HTTPException(status_code=404, detail="Expert not found")
    if not expert.expert_profile.is_approved:
        raise HTTPException(status_code=400, detail="Expert is not approved yet")

    session_type = db.get(SessionType, payload.session_type_id)
    if not session_type or not session_type.is_active:
        raise HTTPException(status_code=404, detail="Session type not found")

    scheduled_at = payload.scheduled_at
    if scheduled_at.tzinfo is None:
        raise HTTPException(status_code=400, detail="Booking time must include a timezone")
    scheduled_at = scheduled_at.astimezone(UTC)
    now = utc_now()
    if scheduled_at < now:
        raise HTTPException(status_code=400, detail="Cannot book a session in the past")

    offered_session = db.execute(
        select(expert_session_types.c.custom_price).where(
            expert_session_types.c.expert_id == payload.expert_id,
            expert_session_types.c.session_type_id == payload.session_type_id,
        )
    ).first()
    if offered_session is None:
        raise HTTPException(status_code=400, detail="This expert does not offer the selected session type")

    custom_price = offered_session[0]
    price = custom_price if custom_price is not None else session_type.base_price or expert.expert_profile.hourly_price
    duration = session_type.duration_minutes or expert.expert_profile.session_duration_minutes
    lock_expert_booking_calendar(db, payload.expert_id)
    try:
        validate_booking_slot(db, payload.expert_id, scheduled_at, duration)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    booking = Booking(
        student_id=current_user.id,
        expert_id=payload.expert_id,
        session_type_id=payload.session_type_id,
        scheduled_at=scheduled_at,
        duration_minutes=duration,
        price=price,
        status=BookingStatus.PENDING,
        student_message=payload.student_message,
    )
    db.add(booking)
    db.flush()
    db.add(
        Payment(
            booking_id=booking.id,
            amount=price,
            currency="JOD",
            status=PaymentStatus.UNPAID,
            payment_method=payload.payment_method,
        )
    )
    db.commit()
    db.refresh(booking)
    return serialize_booking(db, booking)


@router.get("/student/bookings", response_model=list[BookingRead])
def get_student_bookings(
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
    db: Session = Depends(get_db),
) -> list[BookingRead]:
    bookings = db.scalars(
        select(Booking).where(Booking.student_id == current_user.id).order_by(Booking.scheduled_at.desc())
    ).all()
    return [serialize_booking(db, booking) for booking in bookings]


@router.get("/expert/bookings", response_model=list[BookingRead])
def get_expert_bookings(
    current_user: User = Depends(require_roles(UserRole.EXPERT)),
    db: Session = Depends(get_db),
) -> list[BookingRead]:
    bookings = db.scalars(
        select(Booking).where(Booking.expert_id == current_user.id).order_by(Booking.scheduled_at.desc())
    ).all()
    return [serialize_booking(db, booking) for booking in bookings]


@router.get("/bookings/{booking_id}", response_model=BookingRead)
def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingRead:
    booking = get_booking_or_404(db, booking_id)
    ensure_booking_access(current_user, booking)
    return serialize_booking(db, booking)


@router.put("/bookings/{booking_id}/status", response_model=BookingRead)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingRead:
    booking = get_booking_or_404(db, booking_id)
    ensure_booking_access(current_user, booking)
    ensure_booking_status_transition(booking, payload.status, current_user)

    booking.status = payload.status
    if payload.expert_message is not None:
        booking.expert_message = payload.expert_message
    db.commit()
    db.refresh(booking)
    return serialize_booking(db, booking)


@router.put("/bookings/{booking_id}/meeting-url", response_model=BookingRead)
def update_meeting_url(
    booking_id: int,
    payload: MeetingUrlUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingRead:
    booking = get_booking_or_404(db, booking_id)
    if current_user.role not in {UserRole.EXPERT, UserRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Only experts and admins can add meeting links")
    ensure_booking_access(current_user, booking)
    booking.meeting_url = payload.meeting_url
    db.commit()
    db.refresh(booking)
    return serialize_booking(db, booking)


@router.post("/bookings/{booking_id}/session-note", response_model=SessionNoteRead)
def upsert_session_note(
    booking_id: int,
    payload: SessionNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionNoteRead:
    booking = get_booking_or_404(db, booking_id)
    if current_user.role not in {UserRole.EXPERT, UserRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Only experts and admins can add session notes")
    ensure_booking_access(current_user, booking)
    if booking.status not in {BookingStatus.CONFIRMED, BookingStatus.COMPLETED}:
        raise HTTPException(status_code=400, detail="Session notes are available only for confirmed or completed bookings")
    ensure_session_has_ended(booking)

    note = db.scalars(select(SessionNote).where(SessionNote.booking_id == booking.id)).first()
    if note:
        for field, value in payload.model_dump().items():
            setattr(note, field, value)
    else:
        note = SessionNote(booking_id=booking.id, **payload.model_dump())
        db.add(note)

    if booking.status == BookingStatus.CONFIRMED:
        ensure_paid_if_required(booking, BookingStatus.COMPLETED)
        booking.status = BookingStatus.COMPLETED
    db.commit()
    db.refresh(note)
    return SessionNoteRead.model_validate(note)


@router.post("/bookings/{booking_id}/review", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    booking_id: int,
    payload: ReviewCreate,
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
    db: Session = Depends(get_db),
) -> ReviewRead:
    booking = get_booking_or_404(db, booking_id)
    if booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review your own bookings")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="You can review only after the session is completed")

    existing = db.scalars(select(Review).where(Review.booking_id == booking.id)).first()
    if existing:
        raise HTTPException(status_code=409, detail="This booking already has a review")

    review = Review(
        booking_id=booking.id,
        student_id=current_user.id,
        expert_id=booking.expert_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.flush()
    recalculate_expert_rating(db, booking.expert_id)
    db.commit()
    db.refresh(review)
    return serialize_review(db, review)
