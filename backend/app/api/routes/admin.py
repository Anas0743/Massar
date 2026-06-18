from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import require_roles
from app.core.security import get_password_hash
from app.models.entities import Booking, ExpertProfile, Payment, Review, User
from app.models.enums import BookingStatus, PaymentStatus, UserRole
from app.schemas.schemas import AdminExpertCreate, AdminStats, BookingRead, ExpertRead, PaymentStatusUpdate, UserRead
from app.services.serializers import serialize_booking, serialize_expert

router = APIRouter(prefix="/admin", tags=["admin"])


def validate_payment_update(booking: Booking, payload: PaymentStatusUpdate) -> None:
    if settings.PAYMENT_REFERENCE_REQUIRED and payload.status in {PaymentStatus.PAID, PaymentStatus.REFUNDED}:
        if not payload.transaction_reference or not payload.transaction_reference.strip():
            raise HTTPException(status_code=400, detail="Transaction reference is required for paid or refunded payments.")

    if payload.status == PaymentStatus.UNPAID and booking.status in {BookingStatus.CONFIRMED, BookingStatus.COMPLETED}:
        raise HTTPException(
            status_code=400,
            detail="Confirmed or completed bookings cannot be marked unpaid. Update the booking status first.",
        )

    if payload.status == PaymentStatus.REFUNDED and (
        booking.payment is None or booking.payment.status != PaymentStatus.PAID
    ):
        raise HTTPException(status_code=400, detail="Only paid payments can be refunded.")


@router.get("/stats", response_model=AdminStats)
def stats(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> AdminStats:
    students_count = db.scalar(select(func.count(User.id)).where(User.role == UserRole.STUDENT)) or 0
    experts_count = db.scalar(select(func.count(User.id)).where(User.role == UserRole.EXPERT)) or 0
    bookings_count = db.scalar(select(func.count(Booking.id))) or 0
    completed = db.scalar(select(func.count(Booking.id)).where(Booking.status == BookingStatus.COMPLETED)) or 0
    pending = db.scalar(select(func.count(Booking.id)).where(Booking.status == BookingStatus.PENDING)) or 0
    avg_rating = db.scalar(select(func.coalesce(func.avg(Review.rating), 0))) or 0
    return AdminStats(
        students_count=students_count,
        experts_count=experts_count,
        bookings_count=bookings_count,
        completed_bookings_count=completed,
        pending_bookings_count=pending,
        average_rating=round(float(avg_rating), 2),
    )


@router.get("/users", response_model=list[UserRead])
def users(
    role: UserRole | None = None,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[UserRead]:
    statement = select(User).order_by(User.created_at.desc())
    if role:
        statement = statement.where(User.role == role)
    return [UserRead.model_validate(user) for user in db.scalars(statement).all()]


@router.get("/students", response_model=list[UserRead])
def students(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[UserRead]:
    return [UserRead.model_validate(user) for user in db.scalars(select(User).where(User.role == UserRole.STUDENT)).all()]


@router.get("/experts", response_model=list[ExpertRead])
def experts(
    approved: bool | None = None,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[ExpertRead]:
    statement = select(User).join(ExpertProfile, ExpertProfile.user_id == User.id).where(User.role == UserRole.EXPERT)
    if approved is not None:
        statement = statement.where(ExpertProfile.is_approved.is_(approved))
    return [serialize_expert(db, user) for user in db.scalars(statement.order_by(User.created_at.desc())).all()]


@router.post("/experts", response_model=ExpertRead, status_code=201)
def create_expert(
    payload: AdminExpertCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    existing = db.scalars(select(User).where(User.email == payload.email.lower())).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    expert = User(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        avatar_url=payload.avatar_url,
        role=UserRole.EXPERT,
        password_hash=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(expert)
    db.flush()
    db.add(
        ExpertProfile(
            user_id=expert.id,
            title=payload.title,
            company=payload.company,
            years_of_experience=payload.years_of_experience,
            bio=payload.bio,
            hourly_price=payload.hourly_price,
            session_duration_minutes=payload.session_duration_minutes,
            linkedin_url=payload.linkedin_url,
            github_url=payload.github_url,
            portfolio_url=payload.portfolio_url,
            is_approved=payload.is_approved,
        )
    )
    db.commit()
    db.refresh(expert)
    return serialize_expert(db, expert)


@router.put("/experts/{expert_id}/approve", response_model=ExpertRead)
def approve_expert(
    expert_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    expert = db.get(User, expert_id)
    if not expert or expert.role != UserRole.EXPERT or not expert.expert_profile:
        raise HTTPException(status_code=404, detail="Expert not found")
    expert.expert_profile.is_approved = True
    expert.is_active = True
    db.commit()
    db.refresh(expert)
    return serialize_expert(db, expert)


@router.put("/experts/{expert_id}/reject", response_model=ExpertRead)
def reject_expert(
    expert_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ExpertRead:
    expert = db.get(User, expert_id)
    if not expert or expert.role != UserRole.EXPERT or not expert.expert_profile:
        raise HTTPException(status_code=404, detail="Expert not found")
    expert.expert_profile.is_approved = False
    db.commit()
    db.refresh(expert)
    return serialize_expert(db, expert)


@router.get("/bookings", response_model=list[BookingRead])
def bookings(
    status: BookingStatus | None = None,
    expert_id: int | None = Query(default=None),
    student_id: int | None = Query(default=None),
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[BookingRead]:
    statement = select(Booking)
    if status:
        statement = statement.where(Booking.status == status)
    if expert_id:
        statement = statement.where(Booking.expert_id == expert_id)
    if student_id:
        statement = statement.where(Booking.student_id == student_id)
    rows = db.scalars(statement.order_by(Booking.scheduled_at.desc())).all()
    return [serialize_booking(db, booking) for booking in rows]


@router.put("/bookings/{booking_id}/payment-status", response_model=BookingRead)
def update_payment_status(
    booking_id: int,
    payload: PaymentStatusUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> BookingRead:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    validate_payment_update(booking, payload)

    payment = db.scalars(select(Payment).where(Payment.booking_id == booking.id)).first()
    if not payment:
        payment = Payment(booking_id=booking.id, amount=booking.price, currency="JOD")
        db.add(payment)
    payment.status = payload.status
    if payload.transaction_reference is not None:
        payment.transaction_reference = payload.transaction_reference.strip() or None
    db.commit()
    db.refresh(booking)
    return serialize_booking(db, booking)
