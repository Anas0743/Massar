"""initial Masar schema

Revision ID: 20260613_0001
Revises:
Create Date: 2026-06-13
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260613_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("STUDENT", "EXPERT", "ADMIN", native_enum=False), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "student_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True),
        sa.Column("university", sa.String(length=180), nullable=True),
        sa.Column("major", sa.String(length=180), nullable=True),
        sa.Column("academic_year", sa.String(length=80), nullable=True),
        sa.Column("current_skills", sa.JSON(), nullable=True),
        sa.Column("interested_tracks", sa.JSON(), nullable=True),
        sa.Column("github_url", sa.String(length=500), nullable=True),
        sa.Column("linkedin_url", sa.String(length=500), nullable=True),
        sa.Column("cv_url", sa.String(length=500), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
    )

    op.create_table(
        "expert_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True),
        sa.Column("title", sa.String(length=180), nullable=True),
        sa.Column("company", sa.String(length=180), nullable=True),
        sa.Column("years_of_experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("hourly_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("session_duration_minutes", sa.Integer(), nullable=False, server_default="45"),
        sa.Column("linkedin_url", sa.String(length=500), nullable=True),
        sa.Column("github_url", sa.String(length=500), nullable=True),
        sa.Column("portfolio_url", sa.String(length=500), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("rating_average", sa.Float(), nullable=False, server_default="0"),
        sa.Column("rating_count", sa.Integer(), nullable=False, server_default="0"),
    )

    op.create_table(
        "tracks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("icon", sa.String(length=80), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_tracks_slug", "tracks", ["slug"], unique=True)

    op.create_table(
        "session_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=140), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="45"),
        sa.Column("base_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_session_types_slug", "session_types", ["slug"], unique=True)

    op.create_table(
        "expert_tracks",
        sa.Column("expert_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("track_id", sa.Integer(), sa.ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "expert_session_types",
        sa.Column("expert_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("session_type_id", sa.Integer(), sa.ForeignKey("session_types.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("custom_price", sa.Float(), nullable=True),
    )

    op.create_table(
        "availability",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("expert_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("expert_id", "day_of_week", "start_time", "end_time", name="uq_expert_availability"),
    )
    op.create_index("ix_availability_expert_id", "availability", ["expert_id"])

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("expert_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_type_id", sa.Integer(), sa.ForeignKey("session_types.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED", native_enum=False),
            nullable=False,
        ),
        sa.Column("meeting_url", sa.String(length=700), nullable=True),
        sa.Column("student_message", sa.Text(), nullable=True),
        sa.Column("expert_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_bookings_student_id", "bookings", ["student_id"])
    op.create_index("ix_bookings_expert_id", "bookings", ["expert_id"])

    op.create_table(
        "session_notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), unique=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("strengths", sa.Text(), nullable=True),
        sa.Column("weaknesses", sa.Text(), nullable=True),
        sa.Column("action_plan_30_days", sa.Text(), nullable=True),
        sa.Column("resources", sa.Text(), nullable=True),
        sa.Column("next_steps", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), unique=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("expert_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_reviews_student_id", "reviews", ["student_id"])
    op.create_index("ix_reviews_expert_id", "reviews", ["expert_id"])

    op.create_table(
        "faqs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question", sa.String(length=300), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("NEW", "READ", "CLOSED", native_enum=False), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), unique=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="JOD"),
        sa.Column("status", sa.Enum("UNPAID", "PAID", "REFUNDED", native_enum=False), nullable=False),
        sa.Column("payment_method", sa.Enum("MANUAL", "CLIQ", "ZAINCASH", "STRIPE", "PAYPAL", native_enum=False), nullable=False),
        sa.Column("transaction_reference", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("payments")
    op.drop_table("contact_messages")
    op.drop_table("faqs")
    op.drop_index("ix_reviews_expert_id", table_name="reviews")
    op.drop_index("ix_reviews_student_id", table_name="reviews")
    op.drop_table("reviews")
    op.drop_table("session_notes")
    op.drop_index("ix_bookings_expert_id", table_name="bookings")
    op.drop_index("ix_bookings_student_id", table_name="bookings")
    op.drop_table("bookings")
    op.drop_index("ix_availability_expert_id", table_name="availability")
    op.drop_table("availability")
    op.drop_table("expert_session_types")
    op.drop_table("expert_tracks")
    op.drop_index("ix_session_types_slug", table_name="session_types")
    op.drop_table("session_types")
    op.drop_index("ix_tracks_slug", table_name="tracks")
    op.drop_table("tracks")
    op.drop_table("expert_profiles")
    op.drop_table("student_profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
