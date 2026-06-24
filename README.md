# 🌾 Farmer Connect Marketplace

A full-stack platform connecting farmers directly with buyers — no middlemen, fair prices, fresh produce.

## Features

### 👨‍🌾 Farmer Module
- Register & login with JWT authentication
- Add/edit/delete products with image uploads
- View dashboard stats (views, enquiries, listings)
- Manage product availability
- Respond to buyer enquiries

### 🛒 Buyer Module
- Browse products with search & category filters
- Filter by location/distance (GPS-based)
- View farmer profiles and contact details
- Save products to wishlist
- Send enquiries to farmers
- Direct chat with farmers

### 🤖 Smart Features
- Location-based product search (distance filter)
- Live market prices from APMC
- Farmer verification by admin
- Direct buyer-farmer chat
- Real-time notifications

### 🛡 Admin Module
- Dashboard with platform statistics
- Verify farmers
- Toggle user active/inactive
- View all products and users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL 15 |
| Auth | JWT (python-jose) |
| Deployment | Docker + Docker Compose |

## Getting Started

### Prerequisites
- Docker & Docker Compose installed

### 1. Clone and setup
```bash
git clone <repo-url>
cd farmer-connect
```

### 2. Run with Docker (Recommended)
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Run Locally (Development)

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Database:**
```bash
psql -U postgres -c "CREATE DATABASE farmer_connect;"
psql -U postgres -d farmer_connect -f database/schema.sql
```

## Default Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@farmerconnect.com | admin123 |

## Project Structure

```
farmer-connect/
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/      # All page components
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth context
│   │   └── utils/      # API client
│   └── Dockerfile
├── backend/            # FastAPI
│   ├── routers/        # API route handlers
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic schemas
│   ├── auth.py         # JWT authentication
│   └── Dockerfile
├── database/
│   └── schema.sql      # PostgreSQL schema + seed data
└── docker-compose.yml
```

## API Documentation

After starting the backend, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/farmer_connect
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_MAPS_API_KEY=your-google-maps-key
UPLOAD_DIR=uploads
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
```
