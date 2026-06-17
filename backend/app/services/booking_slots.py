from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import Availability, Booking
from app.models.enums import BookingStatus

ACTIVE_BOOKING_STATUSES = (BookingStatus.PENDING, BookingStatus.CONFIRMED)
SLOT_STEP_MINUTES = 15
MAX_RETURNED_SLOTS = 160


def platform_timezone() -> ZoneInfo:
    return ZoneInfo(settings.PLATFORM_TIMEZONE)


def normalize_to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def platform_day_index(value: datetime) -> int:
    local_value = normalize_to_utc(value).astimezone(platform_timezone())
    return (local_value.weekday() + 1) % 7


def overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    return start_a < end_b and start_b < end_a


def booking_window(booking: Booking) -> tuple[datetime, datetime]:
    starts_at = normalize_to_utc(booking.scheduled_at)
    return starts_at, starts_at + timedelta(minutes=booking.duration_minutes)


def get_busy_bookings(db: Session, expert_id: int, window_start: datetime, window_end: datetime) -> list[Booking]:
    starts_at = normalize_to_utc(window_start)
    ends_at = normalize_to_utc(window_end)
    return db.scalars(
        select(Booking).where(
            Booking.expert_id == expert_id,
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            Booking.scheduled_at >= starts_at - timedelta(hours=8),
            Booking.scheduled_at < ends_at,
        )
    ).all()


def conflicts_with_bookings(starts_at: datetime, ends_at: datetime, bookings: list[Booking]) -> bool:
    slot_start = normalize_to_utc(starts_at)
    slot_end = normalize_to_utc(ends_at)
    for booking in bookings:
        booking_start, booking_end = booking_window(booking)
        if overlaps(slot_start, slot_end, booking_start, booking_end):
            return True
    return False


def lock_expert_booking_calendar(db: Session, expert_id: int) -> None:
    bind = db.get_bind()
    if bind.dialect.name != "postgresql":
        return

    # Serializes booking writes for one expert across app workers.
    db.execute(text("SELECT pg_advisory_xact_lock(:lock_key)"), {"lock_key": 9_100_000_000 + expert_id})


def is_inside_availability(db: Session, expert_id: int, starts_at: datetime, ends_at: datetime) -> bool:
    tz = platform_timezone()
    local_start = normalize_to_utc(starts_at).astimezone(tz)
    local_end = normalize_to_utc(ends_at).astimezone(tz)
    if local_start.date() != local_end.date():
        return False

    day_index = platform_day_index(starts_at)
    rows = db.scalars(
        select(Availability).where(
            Availability.expert_id == expert_id,
            Availability.day_of_week == day_index,
            Availability.is_active.is_(True),
        )
    ).all()

    return any(row.start_time <= local_start.time() and local_end.time() <= row.end_time for row in rows)


def validate_booking_slot(db: Session, expert_id: int, starts_at: datetime, duration_minutes: int) -> None:
    if starts_at.tzinfo is None:
        raise ValueError("Booking time must include a timezone.")
    if starts_at.minute % SLOT_STEP_MINUTES != 0 or starts_at.second or starts_at.microsecond:
        raise ValueError("Booking time must start on a 15-minute boundary.")

    starts_utc = normalize_to_utc(starts_at)
    ends_utc = starts_utc + timedelta(minutes=duration_minutes)

    if not is_inside_availability(db, expert_id, starts_utc, ends_utc):
        raise ValueError("Selected time is outside the expert availability.")

    busy_bookings = get_busy_bookings(db, expert_id, starts_utc, ends_utc)
    if conflicts_with_bookings(starts_utc, ends_utc, busy_bookings):
        raise ValueError("Selected time conflicts with another booking.")


def iter_local_dates(start: date, days: int) -> list[date]:
    return [start + timedelta(days=offset) for offset in range(days)]


def generate_available_slots(
    db: Session,
    expert_id: int,
    duration_minutes: int,
    days: int,
) -> list[tuple[datetime, datetime]]:
    tz = platform_timezone()
    now_utc = datetime.now(UTC)
    local_today = now_utc.astimezone(tz).date()
    window_end = now_utc + timedelta(days=days + 1)
    busy_bookings = get_busy_bookings(db, expert_id, now_utc, window_end)
    availability = db.scalars(
        select(Availability)
        .where(Availability.expert_id == expert_id, Availability.is_active.is_(True))
        .order_by(Availability.day_of_week, Availability.start_time)
    ).all()

    slots: list[tuple[datetime, datetime]] = []
    for current_date in iter_local_dates(local_today, days):
        day_index = (current_date.weekday() + 1) % 7
        day_availability = [row for row in availability if row.day_of_week == day_index]
        for row in day_availability:
            slot_start = datetime.combine(current_date, row.start_time, tzinfo=tz)
            availability_end = datetime.combine(current_date, row.end_time, tzinfo=tz)
            while slot_start + timedelta(minutes=duration_minutes) <= availability_end:
                slot_end = slot_start + timedelta(minutes=duration_minutes)
                slot_start_utc = slot_start.astimezone(UTC)
                slot_end_utc = slot_end.astimezone(UTC)
                if slot_start_utc > now_utc and not conflicts_with_bookings(slot_start_utc, slot_end_utc, busy_bookings):
                    slots.append((slot_start_utc, slot_end_utc))
                slot_start += timedelta(minutes=SLOT_STEP_MINUTES)

    return sorted(slots, key=lambda item: item[0])[:MAX_RETURNED_SLOTS]
