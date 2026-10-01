import os

from tinydb import TinyDB


DATABASE_PATH = os.getenv("BOOKS_DB_PATH", "db.json")
database = TinyDB(DATABASE_PATH)
books_table = database.table("books")