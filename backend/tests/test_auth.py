from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.entities import User
from app.models.enums import UserRole
from tests.conftest import auth_headers


def create_auth_user(
    db: Session,
    *,
    email: str,
    password: str = "Password123!",
    role: UserRole = UserRole.STUDENT,
    is_active: bool = True,
) -> User:
    user = User(
        name="Auth User",
        email=email,
        password_hash=get_password_hash(password),
        role=role,
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_register_login_me_and_logout_flow(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Student User",
            "email": "student-register@example.com",
            "password": "Password123!",
            "role": "student",
        },
    )
    assert register_response.status_code == 201
    token = register_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_response = client.get("/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["user"]["email"] == "student-register@example.com"

    logout_response = client.post("/auth/logout", headers=headers)
    assert logout_response.status_code == 200

    stale_me_response = client.get("/auth/me", headers=headers)
    assert stale_me_response.status_code == 401

    login_response = client.post(
        "/auth/login",
        json={"email": "student-register@example.com", "password": "Password123!"},
    )
    assert login_response.status_code == 200


def test_public_register_allows_students_only(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "name": "Expert User",
            "email": "public-expert@example.com",
            "password": "Password123!",
            "role": "expert",
        },
    )
    assert response.status_code == 400


def test_login_rejects_invalid_and_disabled_accounts(client: TestClient, db_session: Session) -> None:
    create_auth_user(db_session, email="active@example.com")
    create_auth_user(db_session, email="disabled@example.com", is_active=False)

    invalid_response = client.post("/auth/login", json={"email": "active@example.com", "password": "Wrong123!"})
    assert invalid_response.status_code == 401

    disabled_response = client.post(
        "/auth/login",
        json={"email": "disabled@example.com", "password": "Password123!"},
    )
    assert disabled_response.status_code == 403


def test_change_password_revokes_existing_token(client: TestClient, db_session: Session) -> None:
    user = create_auth_user(db_session, email="change-password@example.com")
    old_headers = auth_headers(user)

    wrong_current_response = client.post(
        "/auth/change-password",
        headers=old_headers,
        json={"current_password": "Wrong123!", "new_password": "NewPassword123!"},
    )
    assert wrong_current_response.status_code == 400

    change_response = client.post(
        "/auth/change-password",
        headers=old_headers,
        json={"current_password": "Password123!", "new_password": "NewPassword123!"},
    )
    assert change_response.status_code == 200

    stale_me_response = client.get("/auth/me", headers=old_headers)
    assert stale_me_response.status_code == 401

    old_login_response = client.post(
        "/auth/login",
        json={"email": "change-password@example.com", "password": "Password123!"},
    )
    assert old_login_response.status_code == 401

    new_login_response = client.post(
        "/auth/login",
        json={"email": "change-password@example.com", "password": "NewPassword123!"},
    )
    assert new_login_response.status_code == 200


def test_admin_check_requires_admin_role(client: TestClient, db_session: Session) -> None:
    student = create_auth_user(db_session, email="student-role@example.com", role=UserRole.STUDENT)
    admin = create_auth_user(db_session, email="admin-role@example.com", role=UserRole.ADMIN)

    student_response = client.get("/auth/admin-check", headers=auth_headers(student))
    assert student_response.status_code == 403

    admin_response = client.get("/auth/admin-check", headers=auth_headers(admin))
    assert admin_response.status_code == 200
