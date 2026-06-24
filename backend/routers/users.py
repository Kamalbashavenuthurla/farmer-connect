from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os, uuid, shutil
from database import get_db
from models import User, Product, Enquiry
from schemas import UserUpdate, UserOut
from auth import get_current_user

router = APIRouter()

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "village": current_user.village,
        "district": current_user.district,
        "state": current_user.state,
        "profile_photo": current_user.profile_photo,
        "is_verified": current_user.is_verified,
        "rating": current_user.rating,
        "rating_count": current_user.rating_count,
        "lat": current_user.lat,
        "lng": current_user.lng,
        "created_at": str(current_user.created_at),
    }

@router.put("/me")
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    await db.commit()
    return {"message": "Profile updated"}

@router.post("/me/photo")
async def upload_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    upload_dir = "uploads/profiles"
    os.makedirs(upload_dir, exist_ok=True)
    ext = photo.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"{upload_dir}/{filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(photo.file, f)
    current_user.profile_photo = f"/uploads/profiles/{filename}"
    await db.commit()
    return {"profile_photo": current_user.profile_photo}

@router.get("/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "village": user.village,
        "district": user.district,
        "state": user.state,
        "profile_photo": user.profile_photo,
        "is_verified": user.is_verified,
        "rating": user.rating,
        "rating_count": user.rating_count,
        "lat": user.lat,
        "lng": user.lng,
        "created_at": str(user.created_at),
    }

@router.get("/farmer/{farmer_id}/stats")
async def farmer_stats(farmer_id: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    products_result = await db.execute(
        select(func.count()).where(Product.farmer_id == farmer_id)
    )
    total_products = products_result.scalar()

    active_result = await db.execute(
        select(func.count()).where(Product.farmer_id == farmer_id, Product.is_available == True)
    )
    active_products = active_result.scalar()

    views_result = await db.execute(
        select(func.sum(Product.views)).where(Product.farmer_id == farmer_id)
    )
    total_views = views_result.scalar() or 0

    enquiries_result = await db.execute(
        select(func.count()).where(Enquiry.farmer_id == farmer_id)
    )
    total_enquiries = enquiries_result.scalar()

    return {
        "total_products": total_products,
        "active_products": active_products,
        "total_views": total_views,
        "total_enquiries": total_enquiries,
    }
