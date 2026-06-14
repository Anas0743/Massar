from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.entities import ContactMessage, FAQ, User
from app.models.enums import UserRole
from app.schemas.schemas import ContactMessageCreate, ContactMessageRead, FAQCreate, FAQRead, FAQUpdate

router = APIRouter(tags=["content"])


@router.get("/faqs", response_model=list[FAQRead])
def list_faqs(db: Session = Depends(get_db), include_inactive: bool = False) -> list[FAQRead]:
    statement = select(FAQ).order_by(FAQ.order, FAQ.id)
    if not include_inactive:
        statement = statement.where(FAQ.is_active.is_(True))
    return [FAQRead.model_validate(faq) for faq in db.scalars(statement).all()]


@router.post("/contact", response_model=ContactMessageRead, status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactMessageCreate, db: Session = Depends(get_db)) -> ContactMessageRead:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return ContactMessageRead.model_validate(message)


@router.get("/admin/faqs", response_model=list[FAQRead])
def admin_list_faqs(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[FAQRead]:
    return [FAQRead.model_validate(faq) for faq in db.scalars(select(FAQ).order_by(FAQ.order, FAQ.id)).all()]


@router.post("/admin/faqs", response_model=FAQRead, status_code=status.HTTP_201_CREATED)
def create_faq(
    payload: FAQCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> FAQRead:
    faq = FAQ(**payload.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return FAQRead.model_validate(faq)


@router.put("/admin/faqs/{faq_id}", response_model=FAQRead)
def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> FAQRead:
    faq = db.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(faq, field, value)
    db.commit()
    db.refresh(faq)
    return FAQRead.model_validate(faq)


@router.delete("/admin/faqs/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    faq = db.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()


@router.get("/admin/contact-messages", response_model=list[ContactMessageRead])
def contact_messages(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[ContactMessageRead]:
    rows = db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc())).all()
    return [ContactMessageRead.model_validate(row) for row in rows]
