from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Masar API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql+psycopg://masar:masar_password@localhost:5432/masar"
    SECRET_KEY: str = "change-this-secret-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    API_DOCS_ENABLED: bool | None = None
    FRONTEND_URL: str = "http://localhost:5173"
    PLATFORM_TIMEZONE: str = "Asia/Amman"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_CLEANUP_INTERVAL_SECONDS: int = 60
    RATE_LIMIT_MAX_KEYS: int = 20000
    LOGIN_RATE_LIMIT: str = "5/minute"
    REGISTER_RATE_LIMIT: str = "3/minute"
    PASSWORD_CHANGE_RATE_LIMIT: str = "5/hour"
    PASSWORD_RESET_RATE_LIMIT: str = "3/hour"
    PASSWORD_RESET_CONFIRM_RATE_LIMIT: str = "5/hour"
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    CONTACT_RATE_LIMIT: str = "3/minute"
    BOOKING_RATE_LIMIT: str = "10/minute"
    BOOKING_CANCELLATION_CUTOFF_HOURS: int = 6
    REQUIRE_PAYMENT_BEFORE_CONFIRMATION: bool = True
    PAYMENT_REFERENCE_REQUIRED: bool = True
    MAIL_ENABLED: bool = False
    MAIL_FROM_EMAIL: str = "no-reply@masar.local"
    MAIL_FROM_NAME: str = "مسار"
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("ENVIRONMENT", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower().strip()

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.is_production:
            if (
                self.SECRET_KEY == "change-this-secret-in-production"
                or self.SECRET_KEY.startswith("replace-with")
                or len(self.SECRET_KEY) < 32
            ):
                raise ValueError("SECRET_KEY must be set to a strong value in production.")
            if not self.cors_origins or "*" in self.cors_origins:
                raise ValueError("BACKEND_CORS_ORIGINS must be explicit in production.")
            if self.MAIL_ENABLED and not self.SMTP_HOST:
                raise ValueError("SMTP_HOST must be set when MAIL_ENABLED=true.")
            if self.MAIL_ENABLED and not self.MAIL_FROM_EMAIL:
                raise ValueError("MAIL_FROM_EMAIL must be set when MAIL_ENABLED=true.")
        return self

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def docs_enabled(self) -> bool:
        if self.API_DOCS_ENABLED is None:
            return not self.is_production
        return self.API_DOCS_ENABLED

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
