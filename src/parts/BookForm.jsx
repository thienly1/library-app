import { useState, useEffect } from 'react';
import { validateBook, cleanBookData } from '../utils/validation';

function BookForm({ initialData, onSubmit, submitLabel = 'Save', isLoading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    year: '',
    genre: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        year: initialData.year ? String(initialData.year) : '',
        genre: initialData.genre || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateBook(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const cleanedData = cleanBookData(formData);
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="book-form" data-testid="book-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter book title"
          disabled={isLoading}
          data-testid="title-input"
        />
        {errors.title && <p className="form-error" data-testid="title-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="author" className="form-label">
          Author <span className="required">*</span>
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter author name"
          disabled={isLoading}
          data-testid="author-input"
        />
        {errors.author && <p className="form-error" data-testid="author-error">{errors.author}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="isbn" className="form-label">
          ISBN
        </label>
        <input
          type="text"
          id="isbn"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter ISBN (optional)"
          disabled={isLoading}
          data-testid="isbn-input"
        />
        {errors.isbn && <p className="form-error">{errors.isbn}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="year" className="form-label">
          Publication Year
        </label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g., 2024"
          min="1000"
          max="2100"
          disabled={isLoading}
          data-testid="year-input"
        />
        {errors.year && <p className="form-error">{errors.year}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="genre" className="form-label">
          Genre
        </label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g., Fiction, Science, History"
          disabled={isLoading}
          data-testid="genre-input"
        />
        {errors.genre && <p className="form-error">{errors.genre}</p>}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isLoading}
        data-testid="submit-btn"
      >
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default BookForm;
