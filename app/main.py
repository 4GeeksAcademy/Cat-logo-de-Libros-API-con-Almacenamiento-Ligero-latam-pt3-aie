from fastapi import FastAPI

from app.views.auth_view import router as auth_router
from app.views.book_view import router as books_router
from app.views.profile_view import router as profile_router
from app.views.user_view import router as users_router


app = FastAPI(title="Library API", version="1.0.0")
app.include_router(books_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(profile_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Library API", "docs": "/docs"}