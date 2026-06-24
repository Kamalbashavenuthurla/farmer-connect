from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from database import get_db
from models import Wishlist, Product, User
from auth import get_current_user

router = APIRouter()

@router.post("/{product_id}")
async def toggle_wishlist(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.buyer_id == current_user.id, Wishlist.product_id == product_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
        return {"wishlisted": False}
    else:
        wl = Wishlist(buyer_id=current_user.id, product_id=product_id)
        db.add(wl)
        await db.commit()
        return {"wishlisted": True}

@router.get("/")
async def get_wishlist(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Wishlist).options(selectinload(Wishlist.product))
        .where(Wishlist.buyer_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
    )
    items = result.scalars().all()
    return {"wishlist": [
        {
            "id": str(w.id),
            "product_id": str(w.product_id),
            "product_name": w.product.name if w.product else None,
            "product_price": w.product.price if w.product else None,
            "product_images": w.product.images or [] if w.product else [],
            "created_at": str(w.created_at),
        } for w in items
    ]}
