import React from 'react';
import { Sparkles, X, Clock, Tv, Star, AlertCircle, Film } from 'lucide-react';

const WatchNextModal = ({ isOpen, onClose, movie, error, onStartWatching }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ec4899" />
            Recommended Next Watch
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error ? (
            <div className="state-container" style={{ padding: '30px 16px', margin: 0 }}>
              <AlertCircle size={36} color="#9ca3af" style={{ marginBottom: '10px' }} />
              <h3 className="state-title" style={{ fontSize: '16px' }}>No Movies Found</h3>
              <p className="state-desc">
                {error || 'There are no movies currently in "To Watch" status. Add a movie or add priority to your queue!'}
              </p>
            </div>
          ) : movie ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span className="movie-code">{movie.movieCode}</span>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                  {movie.title}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  {movie.releaseYear} • {movie.genre}
                </span>
              </div>

              <div className="card-details" style={{ marginBottom: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <Star size={14} color="#fbbf24" />
                  <span>Priority: <strong>{movie.priority} / 5</strong></span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>Runtime: <strong>{movie.runtime}m</strong></span>
                </div>
                <div className="detail-item">
                  <Tv size={14} />
                  <span>Platform: <strong>{movie.platform}</strong></span>
                </div>
                <div className="detail-item">
                  <Film size={14} />
                  <span>Genre: <strong>{movie.genre}</strong></span>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                💡 <strong>Why this pick?</strong> Highest priority in your queue (ties broken by shortest runtime for quickest enjoyment).
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {movie && onStartWatching && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onStartWatching(movie._id);
                onClose();
              }}
              id="btn-modal-start-watching"
            >
              Start Watching Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchNextModal;
