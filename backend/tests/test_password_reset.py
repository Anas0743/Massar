from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.routes import auth as auth_routes
from app.core.security import get_password_hash, verify_password
from app.models.entities import PasswordResetToken, User
from app.models.enums import UserRole
from tests.conftest import auth_headers


def create_password_user(db: Session) -> User:
    user = User(
        name="Reset User",
        email="reset@example.com",
        password_hash=get_password_hash("OldPassword123!"),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def extract_token(reset_url: str) -> str:
    parsed = urlparse(reset_url)
    token = parse_qs(parsed.query).get("token", [""])[0]
    assert token
    return token


def test_password_reset_updates_password_and_revokes_old_tokens(
    client: TestClient,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = create_password_user(db_session)
    old_headers = auth_headers(user)
    sent_urls: list[str] = []

    def fake_send_password_reset_email(to_email: str, name: str, reset_url: str) -> bool:
        sent_urls.append(reset_url)
        assert to_email == user.email
        assert name == user.name
        return True

    monkeypatch.setattr(auth_routes, "send_password_reset_email", fake_send_password_reset_email)

    request_response = client.post("/auth/password-reset/request", json={"email": "RESET@example.com"})
    assert request_response.status_code == 200
    assert len(sent_urls) == 1
    first_reset_token = extract_token(sent_urls[0])

    second_request_response = client.post("/auth/password-reset/request", json={"email": user.email})
    assert second_request_response.status_code == 200
    assert len(sent_urls) == 2

    tokens = db_session.scalars(
        select(PasswordResetToken).where(PasswordResetToken.user_id == user.id).order_by(PasswordResetToken.id)
    ).all()
    assert len(tokens) == 2
    assert tokens[0].used_at is not None
    assert tokens[1].used_at is None

    old_link_response = client.post(
        "/auth/password-reset/confirm",
        json={"token": first_reset_token, "new_password": "IgnoredPassword123!"},
    )
    assert old_link_response.status_code == 400

    reset_token = extract_token(sent_urls[1])
    confirm_response = client.post(
        "/auth/password-reset/confirm",
        json={"token": reset_token, "new_password": "NewPassword123!"},
    )
    assert confirm_response.status_code == 200

    db_session.refresh(user)
    db_session.refresh(tokens[1])
    assert verify_password("NewPassword123!", user.password_hash)
    assert user.token_version == 1
    assert tokens[1].used_at is not None

    stale_session = client.get("/auth/me", headers=old_headers)
    assert stale_session.status_code == 401

    login_response = client.post("/auth/login", json={"email": user.email, "password": "NewPassword123!"})
    assert login_response.status_code == 200

    replay_response = client.post(
        "/auth/password-reset/confirm",
        json={"token": reset_token, "new_password": "AnotherPassword123!"},
    )
    assert replay_response.status_code == 400


def test_password_reset_request_does_not_reveal_unknown_email(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sent_urls: list[str] = []

    def fake_send_password_reset_email(to_email: str, name: str, reset_url: str) -> bool:
        sent_urls.append(reset_url)
        return True

    monkeypatch.setattr(auth_routes, "send_password_reset_email", fake_send_password_reset_email)

    response = client.post("/auth/password-reset/request", json={"email": "missing@example.com"})
    assert response.status_code == 200
    assert sent_urls == []
