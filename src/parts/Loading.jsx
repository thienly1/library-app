function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" data-testid="loading">
      <div className="spinner" aria-label={message}></div>
    </div>
  );
}

export default Loading;
