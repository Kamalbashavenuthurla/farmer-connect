from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Alert, User
from schemas import AlertCreate
from auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_alerts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.created_at.desc()).limit(20)
    )
    alerts = result.scalars().all()
    return {"alerts": [
        {"id": str(a.id), "type": a.type, "title": a.title, "message": a.message,
         "scheduled_at": str(a.scheduled_at) if a.scheduled_at else None, "created_at": str(a.created_at)}
        for a in alerts
    ]}

@router.post("/")
async def create_alert(
    data: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    alert = Alert(user_id=current_user.id, **data.model_dump())
    db.add(alert)
    await db.commit()
    return {"message": "Alert created"}
