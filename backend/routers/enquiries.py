from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from uuid import UUID
from database import get_db
from models import Enquiry, Notification
from schemas import EnquiryCreate
from auth import get_current_user
from models import User

router = APIRouter()

@router.post("/")
async def create_enquiry(
    data: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "farmer" and str(current_user.id) == str(data.farmer_id):
        raise HTTPException(status_code=400, detail="Cannot enquire your own product")

    enquiry = Enquiry(
        buyer_id=current_user.id,
        farmer_id=data.farmer_id,
        product_id=data.product_id,
        message=data.message,
        quantity=data.quantity,
    )
    db.add(enquiry)

    notif = Notification(
        user_id=data.farmer_id,
        title="New Enquiry",
        message=f"{current_user.name} sent you an enquiry",
        type="enquiry"
    )
    db.add(notif)
    await db.commit()
    return {"message": "Enquiry sent", "enquiry_id": str(enquiry.id)}

@router.get("/my")
async def my_enquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role in ("farmer", "admin"):
        query = select(Enquiry).where(Enquiry.farmer_id == current_user.id)
    else:
        query = select(Enquiry).where(Enquiry.buyer_id == current_user.id)

    result = await db.execute(query.order_by(Enquiry.created_at.desc()))
    enquiries = result.scalars().all()

    out = []
    for e in enquiries:
        buyer_r = await db.execute(select(User).where(User.id == e.buyer_id))
        buyer = buyer_r.scalar_one_or_none()
        out.append({
            "id": str(e.id),
            "message": e.message,
            "quantity": e.quantity,
            "status": e.status,
            "created_at": str(e.created_at),
            "buyer": {"id": str(buyer.id), "name": buyer.name, "phone": buyer.phone} if buyer else None,
            "product_id": str(e.product_id) if e.product_id else None,
        })
    return {"enquiries": out}

@router.put("/{enquiry_id}/status")
async def update_status(
    enquiry_id: UUID,
    status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))
    enquiry = result.scalar_one_or_none()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.status = status
    await db.commit()
    return {"message": "Status updated"}
