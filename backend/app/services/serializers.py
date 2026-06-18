from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import (
    Availability,
    Booking,
    ExpertProfile,
    Payment,
    Review,
    SessionNote,
    SessionType,
    Track,
    User,
    expert_session_types,
    expert_tracks,
)
from app.schemas.schemas import (
    AvailabilityRead,
    BookingRead,
    ExpertRead,
    PaymentRead,
    ReviewRead,
    SessionNoteRead,
    SessionTypeRead,
    StudentProfileRead,
    TrackRead,
)


def get_expert_tracks(db: Session, expert_id: int) -> list[TrackRead]:
    rows = db.scalars(
        select(Track)
        .join(expert_tracks, Track.id == expert_tracks.c.track_id)
        .where(expert_tracks.c.expert_id == expert_id, Track.is_active.is_(True))
        .order_by(Track.name)
    ).all()
    return [TrackRead.model_validate(row) for row in rows]


def get_expert_session_types(db: Session, expert_id: int) -> list[SessionTypeRead]:
    rows = db.execute(
        select(SessionType, expert_session_types.c.custom_price)
        .join(expert_session_types, SessionType.id == expert_session_types.c.session_type_id)
        .where(expert_session_types.c.expert_id == expert_id, SessionType.is_active.is_(True))
        .order_by(SessionType.name)
    ).all()

    return [
        SessionTypeRead(
            id=session_type.id,
            name=session_type.name,
            slug=session_type.slug,
            description=session_type.description,
            duration_minutes=session_type.duration_minutes,
            base_price=session_type.base_price,
            is_active=session_type.is_active,
            custom_price=custom_price,
        )
        for session_type, custom_price in rows
    ]


def get_expert_availability(db: Session, expert_id: int) -> list[AvailabilityRead]:
    rows = db.scalars(
        select(Availability)
        .where(Availability.expert_id == expert_id)
        .order_by(Availability.day_of_week, Availability.start_time)
    ).all()
    return [AvailabilityRead.model_validate(row) for row in rows]


def serialize_expert(db: Session, user: User) -> ExpertRead:
    profile = user.expert_profile or ExpertProfile(user_id=user.id)
    return ExpertRead(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        avatar_url=user.avatar_url,
        title=profile.title,
        company=profile.company,
        years_of_experience=profile.years_of_experience or 0,
        bio=profile.bio,
        hourly_price=profile.hourly_price or 0,
        session_duration_minutes=profile.session_duration_minutes or 45,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        portfolio_url=profile.portfolio_url,
        is_approved=profile.is_approved if profile.id else False,
        rating_average=profile.rating_average or 0,
        rating_count=profile.rating_count or 0,
        tracks=get_expert_tracks(db, user.id),
        session_types=get_expert_session_types(db, user.id),
        availability=get_expert_availability(db, user.id),
    )


def serialize_review(db: Session, review: Review) -> ReviewRead:
    student = db.get(User, review.student_id) if review.student_id is not None else None
    return ReviewRead(
        id=review.id,
        booking_id=review.booking_id,
        student_id=review.student_id,
        expert_id=review.expert_id,
        student_name=student.name if student else None,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


def serialize_booking(db: Session, booking: Booking) -> BookingRead:
    student = db.get(User, booking.student_id) if booking.student_id is not None else None
    expert = db.get(User, booking.expert_id) if booking.expert_id is not None else None
    expert_profile = expert.expert_profile if expert else None
    session_type = db.get(SessionType, booking.session_type_id)
    payment = db.scalars(select(Payment).where(Payment.booking_id == booking.id)).first()
    session_note = db.scalars(select(SessionNote).where(SessionNote.booking_id == booking.id)).first()
    review = db.scalars(select(Review).where(Review.booking_id == booking.id)).first()

    return BookingRead(
        id=booking.id,
        student_id=booking.student_id,
        expert_id=booking.expert_id,
        session_type_id=booking.session_type_id,
        scheduled_at=booking.scheduled_at,
        duration_minutes=booking.duration_minutes,
        price=booking.price,
        status=booking.status,
        meeting_url=booking.meeting_url,
        student_message=booking.student_message,
        expert_message=booking.expert_message,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        student_name=student.name if student else "طالب غير معروف",
        expert_name=expert.name if expert else "خبير غير معروف",
        expert_title=expert_profile.title if expert_profile else None,
        session_type_name=session_type.name if session_type else "جلسة",
        payment=PaymentRead.model_validate(payment) if payment else None,
        session_note=SessionNoteRead.model_validate(session_note) if session_note else None,
        review=serialize_review(db, review) if review else None,
    )


def recalculate_expert_rating(db: Session, expert_id: int) -> None:
    rating_avg, rating_count = db.execute(
        select(func.coalesce(func.avg(Review.rating), 0), func.count(Review.id)).where(Review.expert_id == expert_id)
    ).one()
    profile = db.scalars(select(ExpertProfile).where(ExpertProfile.user_id == expert_id)).first()
    if profile:
        profile.rating_average = round(float(rating_avg or 0), 2)
        profile.rating_count = int(rating_count or 0)


def student_profile_or_none(user: User) -> StudentProfileRead | None:
    if not user.student_profile:
        return None
    return StudentProfileRead.model_validate(user.student_profile)
