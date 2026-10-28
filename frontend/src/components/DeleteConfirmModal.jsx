import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, movie }) => {
  if (!isOpen || !movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            Delete Movie
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>
            Are you sure you want to remove <strong>"{movie.title}"</strong> ({movie.releaseYear}) from your watchlist?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            This action cannot be undone. Movie code: <code>{movie.movieCode}</code>.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(movie._id)}
            id="btn-confirm-delete"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
