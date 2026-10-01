from app.database import books_table


BOOKS = [
    {
        "title": "The Pragmatic Programmer",
        "author": "Hunt & Thomas",
        "genre": "non-fiction",
        "pages": 352,
        "status": "available",
    },
    {
        "title": "Dune",
        "author": "Frank Herbert",
        "genre": "sci-fi",
        "pages": 412,
        "status": "available",
    },
    {
        "title": "The Big Sleep",
        "author": "Raymond Chandler",
        "genre": "mystery",
        "pages": 231,
        "status": "checked_out",
    },
    {
        "title": "Nineteen Eighty-Four",
        "author": "George Orwell",
        "genre": "fiction",
        "pages": 328,
        "status": "available",
    },
]


def seed_database() -> None:
    books_table.truncate()
    books_table.insert_multiple(BOOKS)
    print(f"Seed completed: {len(BOOKS)} books inserted.")


if __name__ == "__main__":
    seed_database()