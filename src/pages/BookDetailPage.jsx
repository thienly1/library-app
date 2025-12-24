import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getBook, deleteBook } from '../utils/api';
import Loading from '../parts/Loading';
import Message from '../parts/Message';

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBook(id);
        setBook(data);
      } catch (err) {
        setError(err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    // Clear message after 3 seconds
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await deleteBook(id);
        navigate('/books', { 
          state: { message: 'Book deleted successfully!' } 
        });
      } catch (err) {
        setError(err.message || 'Failed to delete book');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <Message type="error">{error}</Message>
        <Link to="/books" className="btn btn-secondary">
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      {message && (
        <Message type="success">{message}</Message>
      )}

      <div className="card book-detail" data-testid="book-detail">
        <h1>{book.title}</h1>
        <p className="author">by {book.author}</p>

        <div className="info-grid">
          {book.isbn && (
            <div className="info-item">
              <span className="label">ISBN</span>
              <span className="value">{book.isbn}</span>
            </div>
          )}
          {book.year && (
            <div className="info-item">
              <span className="label">Published</span>
              <span className="value">{book.year}</span>
            </div>
          )}
          {book.genre && (
            <div className="info-item">
              <span className="label">Genre</span>
              <span className="value">{book.genre}</span>
            </div>
          )}
        </div>

        <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Link to="/books" className="btn btn-secondary">
            Back to Books
          </Link>
          <Link to={`/books/${id}/edit`} className="btn btn-primary" data-testid="edit-btn">
            Edit Book
          </Link>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            data-testid="delete-btn"
          >
            Delete Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
