import html
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> bool:
    if not settings.MAIL_ENABLED:
        logger.info("Mail is disabled; skipped email to %s with subject %s", to_email, subject)
        return False

    if not settings.SMTP_HOST:
        logger.error("Mail is enabled but SMTP_HOST is not configured")
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM_EMAIL}>"
    message["To"] = to_email
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("Failed to send email to %s", to_email)
        return False

    return True


def send_password_reset_email(to_email: str, name: str, reset_url: str) -> bool:
    safe_name = html.escape(name)
    safe_url = html.escape(reset_url, quote=True)
    text_body = (
        f"مرحبا {name},\n\n"
        "وصلنا طلبا لاستعادة كلمة مرور حسابك في مسار.\n"
        f"استخدم الرابط التالي خلال {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} دقيقة:\n"
        f"{reset_url}\n\n"
        "إذا لم تطلب استعادة كلمة المرور يمكنك تجاهل هذه الرسالة."
    )
    html_body = f"""
    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;color:#172033">
      <p>مرحبا {safe_name},</p>
      <p>وصلنا طلبا لاستعادة كلمة مرور حسابك في مسار.</p>
      <p>
        <a href="{safe_url}" style="display:inline-block;background:#107b72;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
          تعيين كلمة مرور جديدة
        </a>
      </p>
      <p>ينتهي الرابط خلال {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} دقيقة.</p>
      <p>إذا لم تطلب استعادة كلمة المرور يمكنك تجاهل هذه الرسالة.</p>
    </div>
    """
    return send_email(to_email, "استعادة كلمة مرور مسار", text_body, html_body)
