import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();

const MovieFormModal = ({ isOpen, onClose, onSubmit, initialMovie = null }) => {
  const isEditMode = Boolean(initialMovie && initialMovie._id);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    releaseYear: CURRENT_YEAR,
    runtime: 120,
    platform: 'Netflix',
    priority: 3
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMovie) {
      setFormData({
        movieCode: initialMovie.movieCode || '',
        title: initialMovie.title || '',
        genre: initialMovie.genre || 'Action',
        releaseYear: initialMovie.releaseYear || CURRENT_YEAR,
        runtime: initialMovie.runtime || 120,
        platform: initialMovie.platform || 'Netflix',
        priority: initialMovie.priority || 3
      });
    } else {
      setFormData({
        title: '',
        genre: 'Action',
        releaseYear: CURRENT_YEAR,
        runtime: 120,
        platform: 'Netflix',
        priority: 3
      });
    }
    setErrors({});
    setServerError('');
  }, [initialMovie, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }

    const year = Number(formData.releaseYear);
    if (!year || year < 1950 || year > CURRENT_YEAR) {
      errs.releaseYear = `Release year must be between 1950 and ${CURRENT_YEAR}`;
    }

    const run = Number(formData.runtime);
    if (!run || run < 30 || run > 300) {
      errs.runtime = 'Runtime must be between 30 and 300 minutes';
    }

    const prio = Number(formData.priority);
    if (!prio || prio < 1 || prio > 5) {
      errs.priority = 'Priority must be between 1 and 5';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'releaseYear' || name === 'runtime' || name === 'priority' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Backend error response handling (including 409 duplicate or 400 validation)
      const message = err.response?.data?.message || err.message || 'An error occurred while saving the movie';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Movie Details' : 'Add New Movie to Watchlist'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="error-banner" role="alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {isEditMode && (
              <div className="form-group">
                <label className="form-label">Movie Code (Immutable)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.movieCode || ''}
                  disabled
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title-input">
                Movie Title *
              </label>
              <input
                id="title-input"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Inception"
                value={formData.title}
                onChange={handleChange}
                autoFocus
              />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="genre-select">
                  Genre *
                </label>
                <select
                  id="genre-select"
                  name="genre"
                  className="form-select"
                  value={formData.genre}
                  onChange={handleChange}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="year-input">
                  Release Year (1950 - {CURRENT_YEAR}) *
                </label>
                <input
                  id="year-input"
                  name="releaseYear"
                  type="number"
                  min="1950"
                  max={CURRENT_YEAR}
                  className="form-input"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  disabled={isEditMode} // Release Year immutable on edit
                />
                {errors.releaseYear && <p className="field-error">{errors.releaseYear}</p>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="runtime-input">
                  Runtime (30 - 300 mins) *
                </label>
                <input
                  id="runtime-input"
                  name="runtime"
                  type="number"
                  min="30"
                  max="300"
                  className="form-input"
                  value={formData.runtime}
                  onChange={handleChange}
                />
                {errors.runtime && <p className="field-error">{errors.runtime}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="platform-select">
                  Platform *
                </label>
                <select
                  id="platform-select"
                  name="platform"
                  className="form-select"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority-select">
                Priority (1 = Lowest, 5 = Highest) *
              </label>
              <select
                id="priority-select"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value={5}>5 - Must Watch Immediately</option>
                <option value={4}>4 - High Priority</option>
                <option value={3}>3 - Medium Priority</option>
                <option value={2}>2 - Low Priority</option>
                <option value={1}>1 - Lowest Priority</option>
              </select>
              {errors.priority && <p className="field-error">{errors.priority}</p>}
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
              id="btn-submit-movie"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieFormModal;
