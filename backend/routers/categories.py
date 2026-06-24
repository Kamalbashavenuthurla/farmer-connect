from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Category

router = APIRouter()

@router.get("/")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.id))
    categories = result.scalars().all()
    return [{"id": c.id, "name": c.name, "icon": c.icon, "description": c.description} for c in categories]
