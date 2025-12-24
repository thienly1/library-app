/**
 * API utility functions for the Library App
 */

const API_BASE = '/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.detail || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Network error',
      0
    );
  }
}

/**
 * Get all books with optional filters
 * @param {object} filters - Query parameters
 * @returns {Promise<Array>} - List of books
 */
export async function getBooks(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.author) params.append('author', filters.author);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/books?${queryString}` : '/books';
  
  return request(endpoint);
}

/**
 * Get a single book by ID
 * @param {number} id - Book ID
 * @returns {Promise<object>} - Book data
 */
export async function getBook(id) {
  return request(`/books/${id}`);
}

/**
 * Create a new book
 * @param {object} bookData - Book data
 * @returns {Promise<object>} - Created book
 */
export async function createBook(bookData) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
}

/**
 * Update an existing book
 * @param {number} id - Book ID
 * @param {object} bookData - Updated book data
 * @returns {Promise<object>} - Updated book
 */
export async function updateBook(id, bookData) {
  return request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  });
}

/**
 * Delete a book
 * @param {number} id - Book ID
 * @returns {Promise<null>}
 */
export async function deleteBook(id) {
  return request(`/books/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Health check
 * @returns {Promise<object>} - Health status
 */
export async function healthCheck() {
  return request('/health');
}
