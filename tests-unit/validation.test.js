import { describe, it, expect } from 'vitest';
import { validateBook, cleanBookData, formatBook, booksAreEqual } from '../src/utils/validation';

describe('validateBook', () => {
  it('should return valid for complete book data', () => {
    const data = {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      year: '1925',
      genre: 'Fiction',
    };
    const result = validateBook(data);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should return valid for minimal required data', () => {
    const data = { title: 'Test Book', author: 'Test Author' };
    const result = validateBook(data);
    expect(result.isValid).toBe(true);
  });

  it('should return error for empty title', () => {
    const data = { title: '', author: 'Test Author' };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title is required');
  });

  it('should return error for whitespace-only title', () => {
    const data = { title: '   ', author: 'Test Author' };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title is required');
  });

  it('should return error for empty author', () => {
    const data = { title: 'Test Book', author: '' };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.author).toBe('Author is required');
  });

  it('should return error for title over 200 characters', () => {
    const data = { 
      title: 'A'.repeat(201), 
      author: 'Test Author' 
    };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must be less than 200 characters');
  });

  it('should return error for invalid year', () => {
    const data = { 
      title: 'Test Book', 
      author: 'Test Author',
      year: '500' 
    };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.year).toBe('Year must be between 1000 and 2100');
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const data = { title: '', author: '', year: '999' };
    const result = validateBook(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.author).toBeDefined();
    expect(result.errors.year).toBeDefined();
  });
});

describe('cleanBookData', () => {
  it('should trim whitespace from string fields', () => {
    const data = {
      title: '  Test Book  ',
      author: '  Test Author  ',
      isbn: '  123456  ',
      genre: '  Fiction  ',
    };
    const result = cleanBookData(data);
    expect(result.title).toBe('Test Book');
    expect(result.author).toBe('Test Author');
    expect(result.isbn).toBe('123456');
    expect(result.genre).toBe('Fiction');
  });

  it('should convert year to integer', () => {
    const data = { title: 'Test', author: 'Author', year: '2024' };
    const result = cleanBookData(data);
    expect(result.year).toBe(2024);
    expect(typeof result.year).toBe('number');
  });

  it('should return null for empty optional fields', () => {
    const data = { title: 'Test', author: 'Author', isbn: '', genre: '' };
    const result = cleanBookData(data);
    expect(result.isbn).toBeNull();
    expect(result.genre).toBeNull();
  });

  it('should return null for missing year', () => {
    const data = { title: 'Test', author: 'Author', year: '' };
    const result = cleanBookData(data);
    expect(result.year).toBeNull();
  });
});

describe('formatBook', () => {
  it('should format book with all fields', () => {
    const book = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      isbn: '123456',
      year: 2024,
      genre: 'Fiction',
    };
    const result = formatBook(book);
    expect(result.displayYear).toBe('2024');
    expect(result.displayGenre).toBe('Fiction');
    expect(result.displayIsbn).toBe('123456');
  });

  it('should provide defaults for missing fields', () => {
    const book = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
    };
    const result = formatBook(book);
    expect(result.displayYear).toBe('N/A');
    expect(result.displayGenre).toBe('Uncategorized');
    expect(result.displayIsbn).toBe('N/A');
  });
});

describe('booksAreEqual', () => {
  it('should return true for identical books', () => {
    const book1 = { title: 'Test', author: 'Author', isbn: '123', year: 2024, genre: 'Fiction' };
    const book2 = { title: 'Test', author: 'Author', isbn: '123', year: 2024, genre: 'Fiction' };
    expect(booksAreEqual(book1, book2)).toBe(true);
  });

  it('should return false for different titles', () => {
    const book1 = { title: 'Test 1', author: 'Author', isbn: '123', year: 2024, genre: 'Fiction' };
    const book2 = { title: 'Test 2', author: 'Author', isbn: '123', year: 2024, genre: 'Fiction' };
    expect(booksAreEqual(book1, book2)).toBe(false);
  });

  it('should return false for different years', () => {
    const book1 = { title: 'Test', author: 'Author', isbn: '123', year: 2023, genre: 'Fiction' };
    const book2 = { title: 'Test', author: 'Author', isbn: '123', year: 2024, genre: 'Fiction' };
    expect(booksAreEqual(book1, book2)).toBe(false);
  });
});
