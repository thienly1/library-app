import { Link } from 'react-router-dom';

function BookCard({ book, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete(book.id);
    }
  };

  return (
    <article className="card book-card" data-testid="book-card">
      <h3>
        <Link to={`/books/${book.id}`}>{book.title}</Link>
      </h3>
      <p className="author">by {book.author}</p>
      
      <div className="meta">
        {book.year && <span>{book.year}</span>}
        {book.genre && <span className="genre-tag">{book.genre}</span>}
      </div>
      
      <div className="actions">
        <Link to={`/books/${book.id}`} className="btn btn-secondary">
          View
        </Link>
        <Link to={`/books/${book.id}/edit`} className="btn btn-secondary">
          Edit
        </Link>
        <button onClick={handleDelete} className="btn btn-danger" data-testid="delete-btn">
          Delete
        </button>
      </div>
    </article>
  );
}

export default BookCard;
