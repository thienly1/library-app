import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../utils/api';

function HomePage() {
  const [stats, setStats] = useState({ total: 0, genres: 0, authors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const books = await getBooks();
        const uniqueGenres = new Set(books.map(b => b.genre).filter(Boolean));
        const uniqueAuthors = new Set(books.map(b => b.author));
        
        setStats({
          total: books.length,
          genres: uniqueGenres.size,
          authors: uniqueAuthors.size,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Your Personal Library</h1>
        <p>Organize, discover, and manage your book collection with ease.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/books" className="btn btn-primary" data-testid="browse-btn">
            Browse Books
          </Link>
          <Link to="/books/add" className="btn btn-secondary" data-testid="add-btn">
            Add New Book
          </Link>
        </div>
      </section>

      {!loading && (
        <section className="stats" data-testid="stats">
          <div className="stat">
            <div className="stat-number" data-testid="total-books">{stats.total}</div>
            <div className="stat-label">Books</div>
          </div>
          <div className="stat">
            <div className="stat-number" data-testid="total-authors">{stats.authors}</div>
            <div className="stat-label">Authors</div>
          </div>
          <div className="stat">
            <div className="stat-number" data-testid="total-genres">{stats.genres}</div>
            <div className="stat-label">Genres</div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
