"""
Library App Backend - FastAPI
A RESTful API for managing a book library.
"""
from typing import Optional
from contextlib import asynccontextmanager, contextmanager
import sqlite3
import os
import uvicorn

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan event handler for startup and shutdown events"""
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Nothing to clean up for SQLite


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Library API",
    description="A simple library management API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "databases", "library.db")


# Pydantic models with validation
class BookCreate(BaseModel):
    """Model for creating a new book"""
    title: str = Field(..., min_length=1, max_length=200, description="Book title")
    author: str = Field(..., min_length=1, max_length=100, description="Author name")
    isbn: Optional[str] = Field(None, max_length=20, description="ISBN number")
    year: Optional[int] = Field(None, ge=1000, le=2100, description="Publication year")
    genre: Optional[str] = Field(None, max_length=50, description="Book genre")

    @field_validator('title', 'author')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip()


class BookUpdate(BaseModel):
    """Model for updating an existing book"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    year: Optional[int] = Field(None, ge=1000, le=2100)
    genre: Optional[str] = Field(None, max_length=50)

    @field_validator('title', 'author')
    @classmethod
    def not_empty_if_provided(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip() if v else v


class Book(BaseModel):
    """Full book model with ID"""
    id: int
    title: str
    author: str
    isbn: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str


@contextmanager
def get_db():
    """Database connection context manager"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def to_native(value):
    """Convert Pydantic types to native Python types for SQLite"""
    if value is None:
        return None
    if isinstance(value, str):
        return str(value)
    if isinstance(value, int):
        return int(value)
    if isinstance(value, float):
        return float(value)
    if isinstance(value, bool):
        return bool(value)
    return value


def init_db():
    """Initialize the database with the books table"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT,
                year INTEGER,
                genre TEXT
            )
        """)
        conn.commit()


# API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "library-api"}


@app.get("/api/books", response_model=list[Book])
async def get_books(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    author: Optional[str] = None
):
    """
    Get all books with optional filtering.
    
    - **search**: Search in title and author
    - **genre**: Filter by genre
    - **author**: Filter by author name
    """
    with get_db() as conn:
        query = "SELECT * FROM books WHERE 1=1"
        params = []
        if search:
            query += " AND (title LIKE ? OR author LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])
        if genre:
            query += " AND genre LIKE ?"
            params.append(f"%{genre}%")
        if author:
            query += " AND author LIKE ?"
            params.append(f"%{author}%")
        query += " ORDER BY title ASC"
        cursor = conn.execute(query, params)
        books = [dict(row) for row in cursor.fetchall()]
        return books


@app.get("/api/books/{book_id}", response_model=Book, responses={404: {"model": ErrorResponse}})
async def get_book(book_id: int):
    """Get a specific book by ID"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        book = cursor.fetchone()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with ID {book_id} not found"
            )
        return dict(book)


@app.post("/api/books", response_model=Book, status_code=status.HTTP_201_CREATED)
async def create_book(book: BookCreate):
    """
    Create a new book.
    
    - **title**: Required, cannot be empty
    - **author**: Required, cannot be empty
    - **isbn**: Optional ISBN number
    - **year**: Optional publication year (1000-2100)
    - **genre**: Optional genre
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO books (title, author, isbn, year, genre)
            VALUES (?, ?, ?, ?, ?)
            """,
            (to_native(book.title), to_native(book.author), to_native(book.isbn),
             to_native(book.year), to_native(book.genre))        )
        conn.commit()
        # Fetch the created book
        new_book = conn.execute(
            "SELECT * FROM books WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return dict(new_book)


@app.put("/api/books/{book_id}", response_model=Book, responses={404: {"model": ErrorResponse}})
async def update_book(book_id: int, book: BookUpdate):
    """
    Update an existing book.
    
    Only provided fields will be updated.
    """
    with get_db() as conn:
        # Check if book exists
        existing = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with ID {book_id} not found"
            )
            # Build update query dynamically
        updates = []
        params = []
        update_data = book.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                updates.append(f"{field} = ?")
                params.append(to_native(value))
        if updates:
            params.append(book_id)
            query = f"UPDATE books SET {', '.join(updates)} WHERE id = ?"
            conn.execute(query, params)
            conn.commit()
        # Return updated book
        updated_book = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
        return dict(updated_book)


@app.delete("/api/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"model": ErrorResponse}})
async def delete_book(book_id: int):
    """Delete a book by ID"""
    with get_db() as conn:
        # Check if book exists
        existing = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with ID {book_id} not found"
            )
        conn.execute("DELETE FROM books WHERE id = ?", (book_id,))
        conn.commit()
        return None


# Run with: uvicorn backend.main:app --reload
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    