import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../utils/api';
import BookForm from '../parts/BookForm';
import Message from '../parts/Message';

function AddBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (bookData) => {
    try {
      setLoading(true);
      setError(null);
      const newBook = await createBook(bookData);
      navigate(`/books/${newBook.id}`, { 
        state: { message: 'Book created successfully!' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to create book');
      setLoading(false);
    }
  };

  return (
    <div className="add-book-page">
      <h1>Add New Book</h1>
      
      {error && (
        <Message type="error">{error}</Message>
      )}

      <div className="card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <BookForm 
          onSubmit={handleSubmit} 
          submitLabel="Add Book"
          isLoading={loading}
        />
      </div>
    </div>
  );
}

export default AddBookPage;
