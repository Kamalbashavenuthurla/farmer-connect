from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers import auth, users, products, categories, enquiries, messages, wishlists, admin, alerts, market_prices
from database import engine, Base

app = FastAPI(
    title="Farmer Connect Marketplace API",
    description="A platform connecting farmers directly with buyers",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(enquiries.router, prefix="/api/enquiries", tags=["Enquiries"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(wishlists.router, prefix="/api/wishlists", tags=["Wishlists"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(market_prices.router, prefix="/api/market-prices", tags=["Market Prices"])

@app.get("/")
async def root():
    return {"message": "Farmer Connect Marketplace API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
