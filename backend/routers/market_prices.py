from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import MarketPrice

router = APIRouter()

@router.get("/")
async def get_prices(district: str = None, db: AsyncSession = Depends(get_db)):
    query = select(MarketPrice).order_by(MarketPrice.price_date.desc()).limit(50)
    if district:
        query = query.where(MarketPrice.district.ilike(f"%{district}%"))
    result = await db.execute(query)
    prices = result.scalars().all()
    return {"prices": [
        {"id": p.id, "crop_name": p.crop_name, "price": p.price, "unit": p.unit,
         "market_name": p.market_name, "district": p.district, "price_date": str(p.price_date)}
        for p in prices
    ]}
