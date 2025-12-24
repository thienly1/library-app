import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, updateBook } from '../utils/api';
import BookForm from '../parts/BookForm';
import Loading from '../parts/Loading';
import Message from '../parts/Message';

function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (bookData) => {
    try {
      setSaving(true);
      setError(null);
      await updateBook(id, bookData);
      navigate(`/books/${id}`, { 
        state: { message: 'Book updated successfully!' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to update book');
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !book) {
    return (
      <div className="edit-book-page">
        <Message type="error">{error}</Message>
      </div>
    );
  }

  return (
    <div className="edit-book-page">
      <h1>Edit Book</h1>
      
      {error && (
        <Message type="error">{error}</Message>
      )}

      <div className="card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <BookForm 
          initialData={book}
          onSubmit={handleSubmit} 
          submitLabel="Update Book"
          isLoading={saving}
        />
      </div>
    </div>
  );
}

export default EditBookPage;
