from datetime import datetime, time
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

from app.models.enums import BookingStatus, ContactStatus, PaymentMethod, PaymentStatus, UserRole


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None


class UserRead(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(UserBase):
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.STUDENT


class AdminExpertCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    title: str | None = None
    company: str | None = None
    years_of_experience: int = Field(default=0, ge=0, le=60)
    bio: str | None = None
    hourly_price: float = Field(default=0, ge=0)
    session_duration_minutes: int = Field(default=45, ge=15, le=240)
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    is_approved: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(min_length=20, max_length=300)
    new_password: str = Field(min_length=8, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = None
    avatar_url: str | None = None
    university: str | None = None
    major: str | None = None
    academic_year: str | None = None
    current_skills: list[str] = []
    interested_tracks: list[str] = []
    github_url: str | None = None
    linkedin_url: str | None = None
    cv_url: str | None = None
    bio: str | None = None


class StudentProfileRead(BaseModel):
    id: int
    user_id: int
    university: str | None
    major: str | None
    academic_year: str | None
    current_skills: list[str]
    interested_tracks: list[str]
    github_url: str | None
    linkedin_url: str | None
    cv_url: str | None
    bio: str | None

    model_config = ConfigDict(from_attributes=True)


class TrackBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5)
    icon: str | None = None
    is_active: bool = True


class TrackCreate(TrackBase):
    pass


class TrackUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    is_active: bool | None = None


class TrackRead(TrackBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SessionTypeBase(BaseModel):
    name: str = Field(min_length=2, max_length=140)
    slug: str = Field(min_length=2, max_length=140)
    description: str = Field(min_length=5)
    duration_minutes: int = Field(default=45, ge=15, le=240)
    base_price: float = Field(default=0, ge=0)
    is_active: bool = True


class SessionTypeCreate(SessionTypeBase):
    pass


class SessionTypeUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=240)
    base_price: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class SessionTypeRead(SessionTypeBase):
    id: int
    custom_price: float | None = None

    model_config = ConfigDict(from_attributes=True)


class ExpertProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = None
    avatar_url: str | None = None
    title: str | None = None
    company: str | None = None
    years_of_experience: int | None = Field(default=None, ge=0, le=60)
    bio: str | None = None
    hourly_price: float | None = Field(default=None, ge=0)
    session_duration_minutes: int | None = Field(default=None, ge=15, le=240)
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    track_ids: list[int] | None = None
    session_type_ids: list[int] | None = None


class AvailabilityCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    is_active: bool = True


class AvailabilityRead(AvailabilityCreate):
    id: int
    expert_id: int

    model_config = ConfigDict(from_attributes=True)


class ExpertRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None
    title: str | None = None
    company: str | None = None
    years_of_experience: int = 0
    bio: str | None = None
    hourly_price: float = 0
    session_duration_minutes: int = 45
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    is_approved: bool = False
    rating_average: float = 0
    rating_count: int = 0
    tracks: list[TrackRead] = []
    session_types: list[SessionTypeRead] = []
    availability: list[AvailabilityRead] = []


class BookingCreate(BaseModel):
    expert_id: int
    session_type_id: int
    scheduled_at: datetime
    student_message: str | None = Field(default=None, max_length=2000)
    payment_method: PaymentMethod = PaymentMethod.MANUAL


class AvailableSlotRead(BaseModel):
    starts_at: datetime
    ends_at: datetime


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    expert_message: str | None = None


class MeetingUrlUpdate(BaseModel):
    meeting_url: str = Field(min_length=5, max_length=700)


class PaymentRead(BaseModel):
    id: int
    amount: float
    currency: str
    status: PaymentStatus
    payment_method: PaymentMethod
    transaction_reference: str | None

    model_config = ConfigDict(from_attributes=True)


class PaymentStatusUpdate(BaseModel):
    status: PaymentStatus
    transaction_reference: str | None = None


class SessionNoteCreate(BaseModel):
    summary: str = Field(min_length=10)
    strengths: str | None = None
    weaknesses: str | None = None
    action_plan_30_days: str | None = None
    resources: str | None = None
    next_steps: str | None = None


class SessionNoteRead(SessionNoteCreate):
    id: int
    booking_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewRead(BaseModel):
    id: int
    booking_id: int
    student_id: int | None
    expert_id: int | None
    student_name: str | None = None
    rating: int
    comment: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingRead(BaseModel):
    id: int
    student_id: int | None
    expert_id: int | None
    session_type_id: int
    scheduled_at: datetime
    duration_minutes: int
    price: float
    status: BookingStatus
    meeting_url: str | None
    student_message: str | None
    expert_message: str | None
    created_at: datetime
    updated_at: datetime
    student_name: str
    expert_name: str
    expert_title: str | None = None
    session_type_name: str
    payment: PaymentRead | None = None
    session_note: SessionNoteRead | None = None
    review: ReviewRead | None = None


class FAQBase(BaseModel):
    question: str = Field(min_length=5, max_length=300)
    answer: str = Field(min_length=5)
    order: int = 0
    is_active: bool = True


class FAQCreate(FAQBase):
    pass


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    order: int | None = None
    is_active: bool | None = None


class FAQRead(FAQBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = None
    message: str = Field(min_length=10)


class ContactMessageRead(ContactMessageCreate):
    id: int
    status: ContactStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    students_count: int
    experts_count: int
    bookings_count: int
    completed_bookings_count: int
    pending_bookings_count: int
    average_rating: float


class MeResponse(BaseModel):
    user: UserRead
    student_profile: StudentProfileRead | None = None
    expert_profile: ExpertRead | None = None
    extras: dict[str, Any] = {}
