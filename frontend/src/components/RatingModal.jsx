import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, onSubmit, movie, isEditingExisting = false }) => {
  const [rating, setRating] = useState(movie?.rating || 8);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setRating(movie.rating || 8);
    }
    setError('');
  }, [movie, isOpen]);

  if (!isOpen || !movie) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(rating);
    if (!parsed || parsed < 1 || parsed > 10) {
      setError('Please provide a valid rating between 1 and 10');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(movie._id, parsed);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditingExisting ? 'Edit Movie Rating' : 'Rate Finished Movie'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {isEditingExisting
                ? `Update your rating for "${movie.title}".`
                : `You've marked "${movie.title}" as Watched! Please give it a mandatory rating from 1 to 10.`}
            </p>

            {error && (
              <div className="error-banner" role="alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Star size={32} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>
                  {rating}
                </span>
                <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ 10</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                <span>1 (Awful)</span>
                <span>5 (Average)</span>
                <span>10 (Masterpiece)</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="btn-confirm-rating"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
