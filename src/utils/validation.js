/**
 * Validation utility functions
 */

/**
 * Validate book form data
 * @param {object} data - Form data
 * @returns {object} - { isValid, errors }
 */
export function validateBook(data) {
  const errors = {};

  // Title validation
  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  // Author validation
  if (!data.author || !data.author.trim()) {
    errors.author = 'Author is required';
  } else if (data.author.length > 100) {
    errors.author = 'Author must be less than 100 characters';
  }

  // ISBN validation (optional but must be valid if provided)
  if (data.isbn && data.isbn.length > 20) {
    errors.isbn = 'ISBN must be less than 20 characters';
  }

  // Year validation
  if (data.year) {
    const year = parseInt(data.year, 10);
    if (isNaN(year) || year < 1000 || year > 2100) {
      errors.year = 'Year must be between 1000 and 2100';
    }
  }

  // Genre validation
  if (data.genre && data.genre.length > 50) {
    errors.genre = 'Genre must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format a book object for display
 * @param {object} book - Book data
 * @returns {object} - Formatted book
 */
export function formatBook(book) {
  return {
    ...book,
    displayYear: book.year ? String(book.year) : 'N/A',
    displayGenre: book.genre || 'Uncategorized',
    displayIsbn: book.isbn || 'N/A',
  };
}

/**
 * Clean form data before submission
 * @param {object} data - Form data
 * @returns {object} - Cleaned data
 */
export function cleanBookData(data) {
  return {
    title: data.title?.trim() || '',
    author: data.author?.trim() || '',
    isbn: data.isbn?.trim() || null,
    year: data.year ? parseInt(data.year, 10) : null,
    genre: data.genre?.trim() || null,
  };
}

/**
 * Check if two book objects are equal
 * @param {object} book1 - First book
 * @param {object} book2 - Second book
 * @returns {boolean}
 */
export function booksAreEqual(book1, book2) {
  const fields = ['title', 'author', 'isbn', 'year', 'genre'];
  return fields.every(field => book1[field] === book2[field]);
}
