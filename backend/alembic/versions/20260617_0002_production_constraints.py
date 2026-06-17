"""add production data constraints

Revision ID: 20260617_0002
Revises: 20260613_0001
Create Date: 2026-06-17
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260617_0002"
down_revision: str | None = "20260613_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_expert_profiles_years_nonnegative",
        "expert_profiles",
        "years_of_experience >= 0",
    )
    op.create_check_constraint(
        "ck_expert_profiles_hourly_price_nonnegative",
        "expert_profiles",
        "hourly_price >= 0",
    )
    op.create_check_constraint(
        "ck_expert_profiles_session_duration_positive",
        "expert_profiles",
        "session_duration_minutes > 0",
    )
    op.create_check_constraint(
        "ck_session_types_duration_minimum",
        "session_types",
        "duration_minutes >= 15",
    )
    op.create_check_constraint(
        "ck_session_types_base_price_nonnegative",
        "session_types",
        "base_price >= 0",
    )
    op.create_check_constraint(
        "ck_availability_day_of_week_range",
        "availability",
        "day_of_week >= 0 AND day_of_week <= 6",
    )
    op.create_check_constraint(
        "ck_availability_time_order",
        "availability",
        "end_time > start_time",
    )
    op.create_check_constraint(
        "ck_bookings_duration_positive",
        "bookings",
        "duration_minutes > 0",
    )
    op.create_check_constraint(
        "ck_bookings_price_nonnegative",
        "bookings",
        "price >= 0",
    )
    op.create_check_constraint(
        "ck_reviews_rating_range",
        "reviews",
        "rating >= 1 AND rating <= 5",
    )
    op.create_check_constraint(
        "ck_faqs_order_nonnegative",
        "faqs",
        '"order" >= 0',
    )
    op.create_check_constraint(
        "ck_payments_amount_nonnegative",
        "payments",
        "amount >= 0",
    )


def downgrade() -> None:
    op.drop_constraint("ck_payments_amount_nonnegative", "payments", type_="check")
    op.drop_constraint("ck_faqs_order_nonnegative", "faqs", type_="check")
    op.drop_constraint("ck_reviews_rating_range", "reviews", type_="check")
    op.drop_constraint("ck_bookings_price_nonnegative", "bookings", type_="check")
    op.drop_constraint("ck_bookings_duration_positive", "bookings", type_="check")
    op.drop_constraint("ck_availability_time_order", "availability", type_="check")
    op.drop_constraint("ck_availability_day_of_week_range", "availability", type_="check")
    op.drop_constraint("ck_session_types_base_price_nonnegative", "session_types", type_="check")
    op.drop_constraint("ck_session_types_duration_minimum", "session_types", type_="check")
    op.drop_constraint("ck_expert_profiles_session_duration_positive", "expert_profiles", type_="check")
    op.drop_constraint("ck_expert_profiles_hourly_price_nonnegative", "expert_profiles", type_="check")
    op.drop_constraint("ck_expert_profiles_years_nonnegative", "expert_profiles", type_="check")
