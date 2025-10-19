// Toast.jsx
import React from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, visible }) => {
  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Toast;