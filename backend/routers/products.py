from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
import os, uuid, shutil
from math import radians, cos, sin, asin, sqrt

from database import get_db
from models import Product, Category, User
from schemas import ProductCreate, ProductUpdate, ProductOut
from auth import get_current_user, require_farmer

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))

@router.get("/")
async def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(selectinload(Product.farmer), selectinload(Product.category)).where(Product.is_available == True)

    if category_id:
        query = query.where(Product.category_id == category_id)
    if search:
        query = query.where(or_(Product.name.ilike(f"%{search}%"), Product.description.ilike(f"%{search}%")))
    if is_organic is not None:
        query = query.where(Product.is_organic == is_organic)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    query = query.order_by(Product.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    output = []
    for p in products:
        item = {
            "id": str(p.id),
            "farmer_id": str(p.farmer_id),
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else None,
            "name": p.name,
            "description": p.description,
            "quantity": p.quantity,
            "quantity_unit": p.quantity_unit,
            "price": p.price,
            "price_unit": p.price_unit,
            "harvest_date": str(p.harvest_date) if p.harvest_date else None,
            "images": p.images or [],
            "is_organic": p.is_organic,
            "is_available": p.is_available,
            "views": p.views,
            "lat": p.lat,
            "lng": p.lng,
            "created_at": str(p.created_at),
            "farmer": {
                "id": str(p.farmer.id),
                "name": p.farmer.name,
                "phone": p.farmer.phone,
                "village": p.farmer.village,
                "district": p.farmer.district,
                "profile_photo": p.farmer.profile_photo,
                "is_verified": p.farmer.is_verified,
                "rating": p.farmer.rating,
            } if p.farmer else None,
            "distance_km": None
        }
        if lat and lng and p.lat and p.lng:
            item["distance_km"] = round(haversine(lat, lng, p.lat, p.lng), 1)
        output.append(item)

    if lat and lng and radius_km:
        output = [p for p in output if p["distance_km"] is not None and p["distance_km"] <= radius_km]
        output.sort(key=lambda x: x["distance_km"] or 9999)

    return {"products": output, "total": len(output)}

@router.get("/{product_id}")
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.farmer), selectinload(Product.category))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Increment views
    product.views += 1
    await db.commit()

    return {
        "id": str(product.id),
        "farmer_id": str(product.farmer_id),
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
        "name": product.name,
        "description": product.description,
        "quantity": product.quantity,
        "quantity_unit": product.quantity_unit,
        "price": product.price,
        "price_unit": product.price_unit,
        "harvest_date": str(product.harvest_date) if product.harvest_date else None,
        "available_from": str(product.available_from) if product.available_from else None,
        "available_until": str(product.available_until) if product.available_until else None,
        "images": product.images or [],
        "is_organic": product.is_organic,
        "is_available": product.is_available,
        "views": product.views,
        "lat": product.lat,
        "lng": product.lng,
        "created_at": str(product.created_at),
        "farmer": {
            "id": str(product.farmer.id),
            "name": product.farmer.name,
            "phone": product.farmer.phone,
            "email": product.farmer.email,
            "village": product.farmer.village,
            "district": product.farmer.district,
            "state": product.farmer.state,
            "profile_photo": product.farmer.profile_photo,
            "is_verified": product.farmer.is_verified,
            "rating": product.farmer.rating,
            "rating_count": product.farmer.rating_count,
            "lat": product.farmer.lat,
            "lng": product.farmer.lng,
        } if product.farmer else None
    }

@router.post("/")
async def create_product(
    name: str = Form(...),
    category_id: int = Form(...),
    quantity: float = Form(...),
    quantity_unit: str = Form(...),
    price: float = Form(...),
    price_unit: str = Form("per kg"),
    description: str = Form(None),
    harvest_date: str = Form(None),
    is_organic: bool = Form(False),
    lat: float = Form(None),
    lng: float = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    image_paths = []
    upload_dir = "uploads/products"
    os.makedirs(upload_dir, exist_ok=True)

    for img in images:
        if img.filename:
            ext = img.filename.rsplit(".", 1)[-1].lower()
            filename = f"{uuid.uuid4()}.{ext}"
            path = f"{upload_dir}/{filename}"
            with open(path, "wb") as f:
                shutil.copyfileobj(img.file, f)
            image_paths.append(f"/uploads/products/{filename}")

    from datetime import date
    hd = None
    if harvest_date:
        try:
            hd = date.fromisoformat(harvest_date)
        except:
            pass

    product = Product(
        farmer_id=current_user.id,
        name=name,
        category_id=category_id,
        description=description,
        quantity=quantity,
        quantity_unit=quantity_unit,
        price=price,
        price_unit=price_unit,
        harvest_date=hd,
        is_organic=is_organic,
        images=image_paths if image_paths else None,
        lat=lat or current_user.lat,
        lng=lng or current_user.lng,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return {"message": "Product created", "product_id": str(product.id)}

@router.put("/{product_id}")
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    current_user: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if str(product.farmer_id) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    await db.commit()
    return {"message": "Product updated"}

@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if str(product.farmer_id) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}

@router.get("/farmer/my-products")
async def my_products(
    current_user: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).options(selectinload(Product.category))
        .where(Product.farmer_id == current_user.id)
        .order_by(Product.created_at.desc())
    )
    products = result.scalars().all()
    return {"products": [
        {
            "id": str(p.id),
            "name": p.name,
            "category_name": p.category.name if p.category else None,
            "quantity": p.quantity,
            "quantity_unit": p.quantity_unit,
            "price": p.price,
            "price_unit": p.price_unit,
            "images": p.images or [],
            "is_available": p.is_available,
            "is_organic": p.is_organic,
            "views": p.views,
            "created_at": str(p.created_at),
        } for p in products
    ]}
