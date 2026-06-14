from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    EXPERT = "expert"
    ADMIN = "admin"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    MANUAL = "manual"
    CLIQ = "cliq"
    ZAINCASH = "zaincash"
    STRIPE = "stripe"
    PAYPAL = "paypal"


class ContactStatus(str, Enum):
    NEW = "new"
    READ = "read"
    CLOSED = "closed"
