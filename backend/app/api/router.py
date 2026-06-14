from fastapi import APIRouter

from app.api.routes import admin, auth, bookings, content, experts, profiles, session_types, tracks

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(experts.router)
api_router.include_router(profiles.router)
api_router.include_router(tracks.router)
api_router.include_router(session_types.router)
api_router.include_router(bookings.router)
api_router.include_router(admin.router)
api_router.include_router(content.router)
