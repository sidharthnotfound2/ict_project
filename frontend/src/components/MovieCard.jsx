import React from 'react';
import { Star, Clock, Tv, Film, Edit3, Trash2 } from 'lucide-react';

const MovieCard = ({
  movie,
  onEditClick,
  onDeleteClick,
  onStatusChangeClick,
  onEditRatingClick
}) => {
  const {
    _id,
    movieCode,
    title,
    genre,
    releaseYear,
    runtime,
    platform,
    priority,
    status,
    rating
  } = movie;

  // Status badge styling
  const getBadgeClass = (st) => {
    switch (st) {
      case 'To Watch':
        return 'status-badge status-to-watch';
      case 'Watching':
        return 'status-badge status-watching';
      case 'Watched':
        return 'status-badge status-watched';
      default:
        return 'status-badge';
    }
  };

  // Determine allowed transitions:
  // To Watch -> Watching or Watched
  // Watching -> Watched or To Watch
  // Watched -> final (no options)
  const renderStatusDropdown = () => {
    if (status === 'Watched') {
      return (
        <select className="form-select" disabled style={{ padding: '5px 8px', fontSize: '12px', width: 'auto' }}>
          <option value="Watched">Watched (Final)</option>
        </select>
      );
    }

    const availableNextOptions =
      status === 'To Watch'
        ? ['Watching', 'Watched']
        : status === 'Watching'
        ? ['Watched', 'To Watch']
        : [];

    const handleSelectChange = (e) => {
      const nextStatus = e.target.value;
      if (nextStatus && nextStatus !== status) {
        onStatusChangeClick(movie, nextStatus);
      }
    };

    return (
      <select
        value={status}
        onChange={handleSelectChange}
        className="form-select"
        style={{ padding: '5px 8px', fontSize: '12px', width: 'auto', cursor: 'pointer' }}
        id={`select-status-${movieCode}`}
      >
        <option value={status} disabled>
          {status} (Current)
        </option>
        {availableNextOptions.map((opt) => (
          <option key={opt} value={opt}>
            Mark as {opt}
          </option>
        ))}
      </select>
    );
  };

  const isWatching = status === 'Watching';
  const isWatched = status === 'Watched';

  return (
    <article className="movie-card" id={`movie-card-${movieCode}`}>
      <div>
        <div className="card-header">
          <div className="card-title-group">
            <span className="movie-code">{movieCode}</span>
            <h3 className="movie-title">{title}</h3>
            <span className="movie-meta-year">
              {releaseYear} • {genre}
            </span>
          </div>
          <span className={getBadgeClass(status)}>
            ● {status}
          </span>
        </div>

        <div className="card-details" style={{ marginTop: '12px' }}>
          <div className="detail-item">
            <Star size={13} color="#fbbf24" />
            <span>Priority: <strong>{priority}/5</strong></span>
          </div>
          <div className="detail-item">
            <Clock size={13} />
            <span>Runtime: <strong>{runtime}m</strong></span>
          </div>
          <div className="detail-item">
            <Tv size={13} />
            <span>Platform: <strong>{platform}</strong></span>
          </div>
          <div className="detail-item">
            <Film size={13} />
            <span>Genre: <strong>{genre}</strong></span>
          </div>
          {isWatched && (
            <div className="detail-item" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="rating-badge">
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <span>Rating: <strong>{rating ?? 'N/A'}/10</strong></span>
              </div>
              <button
                type="button"
                className="btn-icon"
                style={{ width: '24px', height: '24px', fontSize: '11px' }}
                onClick={() => onEditRatingClick(movie)}
                title="Edit Rating"
                id={`btn-edit-rating-${movieCode}`}
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-actions">
        <div className="status-selector">
          {renderStatusDropdown()}
        </div>

        <div className="action-buttons">
          {/* Edit movie button */}
          <button
            type="button"
            className="btn-icon"
            onClick={() => onEditClick(movie)}
            title="Edit movie info"
            id={`btn-edit-${movieCode}`}
          >
            <Edit3 size={15} />
          </button>

          {/* Delete movie with rule: disabled with tooltip if Watching */}
          {isWatching ? (
            <div className="tooltip-wrapper">
              <button
                type="button"
                className="btn-icon btn-icon-danger"
                disabled
                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                id={`btn-delete-disabled-${movieCode}`}
              >
                <Trash2 size={15} />
              </button>
              <span className="tooltip-text">
                A movie in Watching status cannot be deleted
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="btn-icon btn-icon-danger"
              onClick={() => onDeleteClick(movie)}
              title="Delete movie"
              id={`btn-delete-${movieCode}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
