"""
Backend API Tests using pytest and httpx
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os


# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app, init_db, DB_PATH
import sqlite3


@pytest.fixture(autouse=True)
def setup_test_db(tmp_path):
    """Setup a fresh test database before each test"""
    import main as main_module
    # Use temporary database
    test_db = str(tmp_path / "test_library.db")
    main_module.DB_PATH = test_db
    
    # Initialize database
    os.makedirs(os.path.dirname(test_db), exist_ok=True)
    conn = sqlite3.connect(test_db)
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
    conn.close()
    
    yield
    
    # Cleanup
    if os.path.exists(test_db):
        os.remove(test_db)


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for the health check endpoint"""
    
    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
    
    def test_health_returns_correct_status(self, client):
        response = client.get("/api/health")
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_health_returns_service_name(self, client):
        response = client.get("/api/health")
        data = response.json()
        assert data["service"] == "library-api"


class TestGetBooks:
    """Tests for GET /api/books endpoint"""
    
    def test_get_books_returns_empty_list(self, client):
        response = client.get("/api/books")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_books_returns_created_books(self, client):
        # Create a book first
        client.post("/api/books", json={
            "title": "Test Book",
            "author": "Test Author"
        })
        
        response = client.get("/api/books")
        assert response.status_code == 200
        assert len(response.json()) == 1
    
    def test_get_books_with_search_filter(self, client):
        # Create books
        client.post("/api/books", json={"title": "Python Guide", "author": "John"})
        client.post("/api/books", json={"title": "Java Guide", "author": "Jane"})
        
        response = client.get("/api/books?search=Python")
        assert response.status_code == 200
        books = response.json()
        assert len(books) == 1
        assert books[0]["title"] == "Python Guide"


class TestCreateBook:
    """Tests for POST /api/books endpoint"""
    
    def test_create_book_with_valid_data(self, client):
        response = client.post("/api/books", json={
            "title": "New Book",
            "author": "New Author",
            "isbn": "978-1234567890",
            "year": 2024,
            "genre": "Fiction"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Book"
        assert data["author"] == "New Author"
        assert data["id"] is not None
    
    def test_create_book_with_minimal_data(self, client):
        response = client.post("/api/books", json={
            "title": "Minimal Book",
            "author": "Minimal Author"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["isbn"] is None
        assert data["year"] is None
    
    def test_create_book_fails_with_empty_title(self, client):
        response = client.post("/api/books", json={
            "title": "",
            "author": "Test Author"
        })
        
        assert response.status_code == 422
    
    def test_create_book_fails_with_empty_author(self, client):
        response = client.post("/api/books", json={
            "title": "Test Book",
            "author": ""
        })
        
        assert response.status_code == 422
    
    def test_create_book_fails_with_invalid_year(self, client):
        response = client.post("/api/books", json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 500
        })
        
        assert response.status_code == 422


class TestGetSingleBook:
    """Tests for GET /api/books/{id} endpoint"""
    
    def test_get_existing_book(self, client):
        # Create a book
        create_response = client.post("/api/books", json={
            "title": "Test Book",
            "author": "Test Author"
        })
        book_id = create_response.json()["id"]
        
        response = client.get(f"/api/books/{book_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Test Book"
    
    def test_get_nonexistent_book_returns_404(self, client):
        response = client.get("/api/books/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestUpdateBook:
    """Tests for PUT /api/books/{id} endpoint"""
    
    def test_update_book_title(self, client):
        # Create a book
        create_response = client.post("/api/books", json={
            "title": "Original Title",
            "author": "Test Author"
        })
        book_id = create_response.json()["id"]
        
        response = client.put(f"/api/books/{book_id}", json={
            "title": "Updated Title"
        })
        
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"
        assert response.json()["author"] == "Test Author"
    
    def test_update_multiple_fields(self, client):
        # Create a book
        create_response = client.post("/api/books", json={
            "title": "Original",
            "author": "Original Author"
        })
        book_id = create_response.json()["id"]
        
        response = client.put(f"/api/books/{book_id}", json={
            "title": "New Title",
            "genre": "New Genre",
            "year": 2025
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["genre"] == "New Genre"
        assert data["year"] == 2025
    
    def test_update_nonexistent_book_returns_404(self, client):
        response = client.put("/api/books/99999", json={
            "title": "Will Not Work"
        })
        assert response.status_code == 404


class TestDeleteBook:
    """Tests for DELETE /api/books/{id} endpoint"""
    
    def test_delete_existing_book(self, client):
        # Create a book
        create_response = client.post("/api/books", json={
            "title": "To Delete",
            "author": "Delete Author"
        })
        book_id = create_response.json()["id"]
        
        response = client.delete(f"/api/books/{book_id}")
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/books/{book_id}")
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_book_returns_404(self, client):
        response = client.delete("/api/books/99999")
        assert response.status_code == 404


class TestInputValidation:
    """Tests for input validation"""
    
    def test_whitespace_only_title_rejected(self, client):
        response = client.post("/api/books", json={
            "title": "   ",
            "author": "Valid Author"
        })
        assert response.status_code == 422
    
    def test_title_exceeds_max_length(self, client):
        response = client.post("/api/books", json={
            "title": "A" * 201,
            "author": "Test Author"
        })
        assert response.status_code == 422
    
    def test_year_below_minimum(self, client):
        response = client.post("/api/books", json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 999
        })
        assert response.status_code == 422
    
    def test_year_above_maximum(self, client):
        response = client.post("/api/books", json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 2101
        })
        assert response.status_code == 422
