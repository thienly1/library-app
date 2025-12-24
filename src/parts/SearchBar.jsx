import { useState } from 'react';

function SearchBar({ onSearch, placeholder = 'Search books...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Real-time search as user types
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar" data-testid="search-bar">
      <div className="search-input-wrapper">
        <svg 
          className="search-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          className="search-input"
          placeholder={placeholder}
          data-testid="search-input"
        />
      </div>
      {query && (
        <button 
          type="button" 
          onClick={handleClear} 
          className="btn btn-secondary"
          data-testid="clear-search"
        >
          Clear
        </button>
      )}
    </form>
  );
}

export default SearchBar;
