import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, deleteBook } from '../utils/api';
import BookCard from '../parts/BookCard';
import SearchBar from '../parts/SearchBar';
import Loading from '../parts/Loading';
import Message from '../parts/Message';

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.genre && book.genre.toLowerCase().includes(searchTerm))
    );
    setFilteredBooks(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      setBooks(prev => prev.filter(book => book.id !== id));
      setFilteredBooks(prev => prev.filter(book => book.id !== id));
      setMessage({ type: 'success', text: 'Book deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete book');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="books-page">
      <div className="page-header">
        <h1>All Books</h1>
        <Link to="/books/add" className="btn btn-primary" data-testid="add-book-btn">
          + Add Book
        </Link>
      </div>

      {message && (
        <Message type={message.type}>{message.text}</Message>
      )}

      {error && (
        <Message type="error">{error}</Message>
      )}

      <SearchBar onSearch={handleSearch} />

      {filteredBooks.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          <h3>No books found</h3>
          <p>Start building your library by adding your first book!</p>
          <Link to="/books/add" className="btn btn-primary">
            Add Your First Book
          </Link>
        </div>
      ) : (
        <div className="books-grid" data-testid="books-grid">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BooksPage;
