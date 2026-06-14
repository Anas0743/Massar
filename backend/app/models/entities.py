from datetime import datetime, time

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import BookingStatus, ContactStatus, PaymentMethod, PaymentStatus, UserRole


expert_tracks = Table(
    "expert_tracks",
    Base.metadata,
    Column("expert_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("track_id", ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True),
)

expert_session_types = Table(
    "expert_session_types",
    Base.metadata,
    Column("expert_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("session_type_id", ForeignKey("session_types.id", ondelete="CASCADE"), primary_key=True),
    Column("custom_price", Float, nullable=True),
)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False),
        default=UserRole.STUDENT,
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    student_profile: Mapped["StudentProfile | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    expert_profile: Mapped["ExpertProfile | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    student_bookings: Mapped[list["Booking"]] = relationship(
        back_populates="student",
        foreign_keys="Booking.student_id",
    )
    expert_bookings: Mapped[list["Booking"]] = relationship(
        back_populates="expert",
        foreign_keys="Booking.expert_id",
    )


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    university: Mapped[str | None] = mapped_column(String(180), nullable=True)
    major: Mapped[str | None] = mapped_column(String(180), nullable=True)
    academic_year: Mapped[str | None] = mapped_column(String(80), nullable=True)
    current_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    interested_tracks: Mapped[list[str]] = mapped_column(JSON, default=list)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cv_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="student_profile")


class ExpertProfile(Base):
    __tablename__ = "expert_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    title: Mapped[str | None] = mapped_column(String(180), nullable=True)
    company: Mapped[str | None] = mapped_column(String(180), nullable=True)
    years_of_experience: Mapped[int] = mapped_column(Integer, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    hourly_price: Mapped[float] = mapped_column(Float, default=0)
    session_duration_minutes: Mapped[int] = mapped_column(Integer, default=45)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    rating_average: Mapped[float] = mapped_column(Float, default=0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped[User] = relationship(back_populates="expert_profile")


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(80), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class SessionType(Base):
    __tablename__ = "session_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(140), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45)
    base_price: Mapped[float] = mapped_column(Float, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Availability(Base):
    __tablename__ = "availability"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    expert_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("expert_id", "day_of_week", "start_time", "end_time", name="uq_expert_availability"),
    )


class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expert_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_type_id: Mapped[int] = mapped_column(ForeignKey("session_types.id", ondelete="RESTRICT"))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False),
        default=BookingStatus.PENDING,
        nullable=False,
    )
    meeting_url: Mapped[str | None] = mapped_column(String(700), nullable=True)
    student_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    expert_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped[User] = relationship(back_populates="student_bookings", foreign_keys=[student_id])
    expert: Mapped[User] = relationship(back_populates="expert_bookings", foreign_keys=[expert_id])
    session_type: Mapped[SessionType] = relationship()
    session_note: Mapped["SessionNote | None"] = relationship(
        back_populates="booking",
        cascade="all, delete-orphan",
        uselist=False,
    )
    review: Mapped["Review | None"] = relationship(
        back_populates="booking",
        cascade="all, delete-orphan",
        uselist=False,
    )
    payment: Mapped["Payment | None"] = relationship(
        back_populates="booking",
        cascade="all, delete-orphan",
        uselist=False,
    )


class SessionNote(Base):
    __tablename__ = "session_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[str | None] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_plan_30_days: Mapped[str | None] = mapped_column(Text, nullable=True)
    resources: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_steps: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    booking: Mapped[Booking] = relationship(back_populates="session_note")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expert_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    booking: Mapped[Booking] = relationship(back_populates="review")
    student: Mapped[User] = relationship(foreign_keys=[student_id])
    expert: Mapped[User] = relationship(foreign_keys=[expert_id])


class FAQ(Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question: Mapped[str] = mapped_column(String(300), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ContactStatus] = mapped_column(
        Enum(ContactStatus, native_enum=False),
        default=ContactStatus.NEW,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="JOD")
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False),
        default=PaymentStatus.UNPAID,
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False),
        default=PaymentMethod.MANUAL,
    )
    transaction_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    booking: Mapped[Booking] = relationship(back_populates="payment")
