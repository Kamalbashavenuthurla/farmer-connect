from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

# Auth schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(farmer|buyer)$")
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# User schemas
class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    phone: str
    role: str
    village: Optional[str]
    district: Optional[str]
    state: Optional[str]
    profile_photo: Optional[str]
    is_verified: bool
    rating: float
    rating_count: int
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

# Product schemas
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category_id: int
    description: Optional[str] = None
    quantity: float = Field(..., gt=0)
    quantity_unit: str
    price: float = Field(..., gt=0)
    price_unit: str = "per kg"
    harvest_date: Optional[date] = None
    available_from: Optional[date] = None
    available_until: Optional[date] = None
    is_organic: bool = False
    lat: Optional[float] = None
    lng: Optional[float] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    price: Optional[float] = None
    price_unit: Optional[str] = None
    harvest_date: Optional[date] = None
    available_from: Optional[date] = None
    available_until: Optional[date] = None
    is_organic: Optional[bool] = None
    is_available: Optional[bool] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ProductOut(BaseModel):
    id: UUID
    farmer_id: UUID
    category_id: Optional[int]
    name: str
    description: Optional[str]
    quantity: float
    quantity_unit: str
    price: float
    price_unit: str
    harvest_date: Optional[date]
    available_from: Optional[date]
    available_until: Optional[date]
    images: Optional[List[str]]
    is_organic: bool
    is_available: bool
    views: int
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime
    farmer: Optional[UserOut] = None
    category_name: Optional[str] = None
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

# Enquiry schemas
class EnquiryCreate(BaseModel):
    farmer_id: UUID
    product_id: Optional[UUID] = None
    message: str = Field(..., min_length=5)
    quantity: Optional[float] = None

class EnquiryOut(BaseModel):
    id: UUID
    buyer_id: UUID
    farmer_id: UUID
    product_id: Optional[UUID]
    message: str
    quantity: Optional[float]
    status: str
    created_at: datetime
    buyer: Optional[UserOut] = None
    product: Optional[dict] = None

    class Config:
        from_attributes = True

# Message schemas
class MessageCreate(BaseModel):
    receiver_id: UUID
    content: str = Field(..., min_length=1)
    product_id: Optional[UUID] = None

class MessageOut(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    product_id: Optional[UUID]
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Review schemas
class ReviewCreate(BaseModel):
    reviewed_id: UUID
    product_id: Optional[UUID] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

# Alert schemas
class AlertCreate(BaseModel):
    type: str
    title: str
    message: str
    scheduled_at: Optional[datetime] = None

class AlertOut(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    scheduled_at: Optional[datetime]
    is_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
