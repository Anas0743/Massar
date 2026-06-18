from collections.abc import Generator
from datetime import UTC, datetime, time, timedelta
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, insert
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core import database
from app.core.config import settings
from app.core.security import create_access_token
from app.main import app
from app.models.entities import Availability, ExpertProfile, SessionType, User, expert_session_types
from app.models.enums import UserRole


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    database.Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        database.Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    previous_rate_limit = settings.RATE_LIMIT_ENABLED
    settings.RATE_LIMIT_ENABLED = False

    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[database.get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        settings.RATE_LIMIT_ENABLED = previous_rate_limit


def auth_headers(user: User) -> dict[str, str]:
    token = create_access_token(user.id, user.token_version)
    return {"Authorization": f"Bearer {token}"}


def create_user(db: Session, role: UserRole, email: str, name: str) -> User:
    user = User(
        name=name,
        email=email,
        password_hash="test-password-hash",
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture()
def users(db_session: Session) -> dict[str, User]:
    student = create_user(db_session, UserRole.STUDENT, "student@example.com", "Student")
    other_student = create_user(db_session, UserRole.STUDENT, "other@example.com", "Other Student")
    expert = create_user(db_session, UserRole.EXPERT, "expert@example.com", "Expert")
    admin = create_user(db_session, UserRole.ADMIN, "admin@example.com", "Admin")

    profile = ExpertProfile(
        user_id=expert.id,
        title="Career Mentor",
        hourly_price=30,
        session_duration_minutes=45,
        is_approved=True,
    )
    session_type = SessionType(
        name="Career Session",
        slug="career-session",
        description="Career guidance session",
        duration_minutes=45,
        base_price=30,
        is_active=True,
    )
    db_session.add_all([profile, session_type])
    db_session.flush()
    db_session.execute(
        insert(expert_session_types).values(
            expert_id=expert.id,
            session_type_id=session_type.id,
            custom_price=None,
        )
    )
    db_session.commit()
    return {
        "student": student,
        "other_student": other_student,
        "expert": expert,
        "admin": admin,
        "session_type": session_type,
    }


def future_slot(days: int = 7, hour: int = 15) -> datetime:
    tz = ZoneInfo(settings.PLATFORM_TIMEZONE)
    local_date = (datetime.now(UTC) + timedelta(days=days)).astimezone(tz).date()
    return datetime.combine(local_date, time(hour, 0), tzinfo=tz).astimezone(UTC)


def add_availability_for(db: Session, expert_id: int, starts_at: datetime, duration_minutes: int = 120) -> None:
    local = starts_at.astimezone(ZoneInfo(settings.PLATFORM_TIMEZONE))
    day_of_week = (local.weekday() + 1) % 7
    start_time = local.time().replace(second=0, microsecond=0)
    end_local = local + timedelta(minutes=duration_minutes)
    db.add(
        Availability(
            expert_id=expert_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_local.time().replace(second=0, microsecond=0),
            is_active=True,
        )
    )
    db.commit()
