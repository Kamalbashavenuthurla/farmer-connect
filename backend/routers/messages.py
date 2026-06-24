from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, update
from uuid import UUID
from database import get_db
from models import Message, Notification, User
from schemas import MessageCreate
from auth import get_current_user

router = APIRouter()

@router.post("/")
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    msg = Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
        product_id=data.product_id,
    )
    db.add(msg)
    notif = Notification(
        user_id=data.receiver_id,
        title="New Message",
        message=f"Message from {current_user.name}",
        type="message"
    )
    db.add(notif)
    await db.commit()
    return {"message": "Sent", "id": str(msg.id)}

@router.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message).where(
            or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
        ).order_by(Message.created_at.desc())
    )
    messages = result.scalars().all()

    seen = set()
    conversations = []
    for msg in messages:
        other_id = str(msg.receiver_id) if str(msg.sender_id) == str(current_user.id) else str(msg.sender_id)
        if other_id not in seen:
            seen.add(other_id)
            user_r = await db.execute(select(User).where(User.id == other_id))
            other_user = user_r.scalar_one_or_none()
            if other_user:
                conversations.append({
                    "user": {"id": str(other_user.id), "name": other_user.name, "profile_photo": other_user.profile_photo, "role": other_user.role},
                    "last_message": msg.content,
                    "last_time": str(msg.created_at),
                    "is_mine": str(msg.sender_id) == str(current_user.id),
                })
    return {"conversations": conversations}

@router.get("/{other_user_id}")
async def get_chat(
    other_user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Message).where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id),
            )
        ).order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    # Mark as read
    await db.execute(
        update(Message).where(
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id, Message.is_read == False)
        ).values(is_read=True)
    )
    await db.commit()

    return {"messages": [
        {
            "id": str(m.id),
            "sender_id": str(m.sender_id),
            "content": m.content,
            "is_read": m.is_read,
            "created_at": str(m.created_at),
        } for m in messages
    ]}

@router.get("/unread/count")
async def unread_count(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    result = await db.execute(
        select(func.count()).where(Message.receiver_id == current_user.id, Message.is_read == False)
    )
    return {"count": result.scalar()}
