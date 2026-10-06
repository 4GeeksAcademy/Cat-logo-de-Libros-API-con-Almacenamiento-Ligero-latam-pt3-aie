from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.views.auth_view import router as auth_router
from app.views.book_view import router as books_router
from app.views.profile_view import router as profile_router
from app.views.user_view import router as users_router


app = FastAPI(title="Library API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.FRONTEND_ORIGINS.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(books_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(profile_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Library API", "docs": "/docs"}