from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from database import get_db
from models import User, Product, Enquiry
from auth import require_admin

router = APIRouter()

@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    total_farmers = (await db.execute(select(func.count()).where(User.role == "farmer"))).scalar()
    total_buyers = (await db.execute(select(func.count()).where(User.role == "buyer"))).scalar()
    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar()
    total_enquiries = (await db.execute(select(func.count()).select_from(Enquiry))).scalar()
    pending_verification = (await db.execute(select(func.count()).where(User.role == "farmer", User.is_verified == False))).scalar()

    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_products": total_products,
        "total_enquiries": total_enquiries,
        "pending_verification": pending_verification,
    }

@router.get("/users")
async def list_users(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(User).order_by(User.created_at.desc()).offset(skip).limit(limit))
    users = result.scalars().all()
    return {"users": [
        {"id": str(u.id), "name": u.name, "email": u.email, "phone": u.phone, "role": u.role,
         "is_verified": u.is_verified, "is_active": u.is_active, "created_at": str(u.created_at)}
        for u in users
    ]}

@router.put("/users/{user_id}/verify")
async def verify_farmer(user_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await db.execute(update(User).where(User.id == user_id).values(is_verified=True))
    await db.commit()
    return {"message": "Farmer verified"}

@router.put("/users/{user_id}/toggle-active")
async def toggle_active(user_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.is_active = not user.is_active
        await db.commit()
    return {"is_active": user.is_active if user else None}

@router.get("/products")
async def list_all_products(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Product).order_by(Product.created_at.desc()).offset(skip).limit(limit))
    products = result.scalars().all()
    return {"products": [
        {"id": str(p.id), "name": p.name, "farmer_id": str(p.farmer_id),
         "price": p.price, "is_available": p.is_available, "views": p.views, "created_at": str(p.created_at)}
        for p in products
    ]}
