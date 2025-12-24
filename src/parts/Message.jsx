function Message({ type = 'success', children }) {
  return (
    <div className={`message message-${type}`} data-testid={`message-${type}`}>
      {children}
    </div>
  );
}

export default Message;
