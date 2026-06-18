from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.entities import Booking, Payment, User
from app.models.enums import BookingStatus, PaymentMethod, PaymentStatus
from tests.conftest import add_availability_for, auth_headers, future_slot


def create_booking(client: TestClient, student: User, expert: User, session_type_id: int, starts_at: datetime):
    return client.post(
        "/bookings",
        headers=auth_headers(student),
        json={
            "expert_id": expert.id,
            "session_type_id": session_type_id,
            "scheduled_at": starts_at.isoformat(),
            "student_message": "I need guidance.",
            "payment_method": "manual",
        },
    )


def test_booking_slot_rejects_overlap(client: TestClient, db_session: Session, users: dict[str, User]) -> None:
    starts_at = future_slot()
    add_availability_for(db_session, users["expert"].id, starts_at)

    first = create_booking(client, users["student"], users["expert"], users["session_type"].id, starts_at)
    assert first.status_code == 201

    second = create_booking(client, users["other_student"], users["expert"], users["session_type"].id, starts_at)
    assert second.status_code == 400
    assert "conflicts" in second.json()["detail"]


def test_payment_required_before_confirmation_and_completion(
    client: TestClient,
    db_session: Session,
    users: dict[str, User],
) -> None:
    starts_at = future_slot()
    add_availability_for(db_session, users["expert"].id, starts_at)

    response = create_booking(client, users["student"], users["expert"], users["session_type"].id, starts_at)
    assert response.status_code == 201
    booking_id = response.json()["id"]

    unpaid_confirmation = client.put(
        f"/bookings/{booking_id}/status",
        headers=auth_headers(users["admin"]),
        json={"status": "confirmed"},
    )
    assert unpaid_confirmation.status_code == 400

    paid_without_reference = client.put(
        f"/admin/bookings/{booking_id}/payment-status",
        headers=auth_headers(users["admin"]),
        json={"status": "paid"},
    )
    assert paid_without_reference.status_code == 400

    paid = client.put(
        f"/admin/bookings/{booking_id}/payment-status",
        headers=auth_headers(users["admin"]),
        json={"status": "paid", "transaction_reference": "manual-test-001"},
    )
    assert paid.status_code == 200
    assert paid.json()["payment"]["status"] == "paid"

    confirmed = client.put(
        f"/bookings/{booking_id}/status",
        headers=auth_headers(users["expert"]),
        json={"status": "confirmed"},
    )
    assert confirmed.status_code == 200

    early_completion = client.put(
        f"/bookings/{booking_id}/status",
        headers=auth_headers(users["expert"]),
        json={"status": "completed"},
    )
    assert early_completion.status_code == 400


def test_session_note_completes_ended_paid_booking(
    client: TestClient,
    db_session: Session,
    users: dict[str, User],
) -> None:
    booking = Booking(
        student_id=users["student"].id,
        expert_id=users["expert"].id,
        session_type_id=users["session_type"].id,
        scheduled_at=datetime.now(UTC) - timedelta(days=1),
        duration_minutes=45,
        price=30,
        status=BookingStatus.CONFIRMED,
    )
    db_session.add(booking)
    db_session.flush()
    db_session.add(
        Payment(
            booking_id=booking.id,
            amount=30,
            currency="JOD",
            status=PaymentStatus.PAID,
            payment_method=PaymentMethod.MANUAL,
            transaction_reference="manual-test-002",
        )
    )
    db_session.commit()

    response = client.post(
        f"/bookings/{booking.id}/session-note",
        headers=auth_headers(users["expert"]),
        json={"summary": "The session was completed and the student received a clear action plan."},
    )
    assert response.status_code == 200
    db_session.refresh(booking)
    assert booking.status == BookingStatus.COMPLETED


def test_rbac_blocks_student_from_admin_and_other_student_booking(
    client: TestClient,
    db_session: Session,
    users: dict[str, User],
) -> None:
    starts_at = future_slot()
    add_availability_for(db_session, users["expert"].id, starts_at)
    response = create_booking(client, users["student"], users["expert"], users["session_type"].id, starts_at)
    assert response.status_code == 201
    booking_id = response.json()["id"]

    admin_stats = client.get("/admin/stats", headers=auth_headers(users["student"]))
    assert admin_stats.status_code == 403

    other_student_booking = client.get(f"/bookings/{booking_id}", headers=auth_headers(users["other_student"]))
    assert other_student_booking.status_code == 403


def test_user_delete_preserves_booking_and_payment(db_session: Session, users: dict[str, User]) -> None:
    booking = Booking(
        student_id=users["student"].id,
        expert_id=users["expert"].id,
        session_type_id=users["session_type"].id,
        scheduled_at=future_slot(),
        duration_minutes=45,
        price=30,
        status=BookingStatus.PENDING,
    )
    db_session.add(booking)
    db_session.flush()
    payment = Payment(
        booking_id=booking.id,
        amount=30,
        currency="JOD",
        status=PaymentStatus.UNPAID,
        payment_method=PaymentMethod.MANUAL,
    )
    db_session.add(payment)
    db_session.commit()

    db_session.delete(users["student"])
    db_session.commit()
    db_session.refresh(booking)

    assert booking.student_id is None
    assert db_session.get(Payment, payment.id) is not None

    db_session.delete(booking)
    with pytest.raises(IntegrityError):
        db_session.commit()
