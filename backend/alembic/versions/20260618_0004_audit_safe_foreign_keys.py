"""protect audit records and add hot-path indexes

Revision ID: 20260618_0004
Revises: 20260617_0003
Create Date: 2026-06-18
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260618_0004"
down_revision: str | None = "20260617_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("bookings_student_id_fkey", "bookings", type_="foreignkey")
    op.drop_constraint("bookings_expert_id_fkey", "bookings", type_="foreignkey")
    op.alter_column("bookings", "student_id", nullable=True)
    op.alter_column("bookings", "expert_id", nullable=True)
    op.create_foreign_key(
        "bookings_student_id_fkey",
        "bookings",
        "users",
        ["student_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "bookings_expert_id_fkey",
        "bookings",
        "users",
        ["expert_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_constraint("reviews_booking_id_fkey", "reviews", type_="foreignkey")
    op.drop_constraint("reviews_student_id_fkey", "reviews", type_="foreignkey")
    op.drop_constraint("reviews_expert_id_fkey", "reviews", type_="foreignkey")
    op.alter_column("reviews", "student_id", nullable=True)
    op.alter_column("reviews", "expert_id", nullable=True)
    op.create_foreign_key(
        "reviews_booking_id_fkey",
        "reviews",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "reviews_student_id_fkey",
        "reviews",
        "users",
        ["student_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "reviews_expert_id_fkey",
        "reviews",
        "users",
        ["expert_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_constraint("session_notes_booking_id_fkey", "session_notes", type_="foreignkey")
    op.create_foreign_key(
        "session_notes_booking_id_fkey",
        "session_notes",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.drop_constraint("payments_booking_id_fkey", "payments", type_="foreignkey")
    op.create_foreign_key(
        "payments_booking_id_fkey",
        "payments",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_bookings_scheduled_at", "bookings", ["scheduled_at"])
    op.create_index("ix_bookings_expert_scheduled_at", "bookings", ["expert_id", "scheduled_at"])
    op.create_index("ix_bookings_student_scheduled_at", "bookings", ["student_id", "scheduled_at"])
    op.create_index("ix_payments_status", "payments", ["status"])


def downgrade() -> None:
    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_bookings_student_scheduled_at", table_name="bookings")
    op.drop_index("ix_bookings_expert_scheduled_at", table_name="bookings")
    op.drop_index("ix_bookings_scheduled_at", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")

    op.drop_constraint("payments_booking_id_fkey", "payments", type_="foreignkey")
    op.create_foreign_key(
        "payments_booking_id_fkey",
        "payments",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("session_notes_booking_id_fkey", "session_notes", type_="foreignkey")
    op.create_foreign_key(
        "session_notes_booking_id_fkey",
        "session_notes",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("reviews_expert_id_fkey", "reviews", type_="foreignkey")
    op.drop_constraint("reviews_student_id_fkey", "reviews", type_="foreignkey")
    op.drop_constraint("reviews_booking_id_fkey", "reviews", type_="foreignkey")
    op.create_foreign_key(
        "reviews_expert_id_fkey",
        "reviews",
        "users",
        ["expert_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "reviews_student_id_fkey",
        "reviews",
        "users",
        ["student_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "reviews_booking_id_fkey",
        "reviews",
        "bookings",
        ["booking_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.alter_column("reviews", "expert_id", nullable=False)
    op.alter_column("reviews", "student_id", nullable=False)

    op.drop_constraint("bookings_expert_id_fkey", "bookings", type_="foreignkey")
    op.drop_constraint("bookings_student_id_fkey", "bookings", type_="foreignkey")
    op.create_foreign_key(
        "bookings_expert_id_fkey",
        "bookings",
        "users",
        ["expert_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "bookings_student_id_fkey",
        "bookings",
        "users",
        ["student_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.alter_column("bookings", "expert_id", nullable=False)
    op.alter_column("bookings", "student_id", nullable=False)
