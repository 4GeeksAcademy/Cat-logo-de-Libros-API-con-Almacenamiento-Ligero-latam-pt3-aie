from fastapi import FastAPI

from app.views.book_view import router as books_router


app = FastAPI(title="Library API", version="1.0.0")
app.include_router(books_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Library API", "docs": "/docs"}