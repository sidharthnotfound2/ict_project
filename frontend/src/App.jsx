import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import MovieCard from './components/MovieCard';
import MovieFormModal from './components/MovieFormModal';
import RatingModal from './components/RatingModal';
import WatchNextModal from './components/WatchNextModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { movieService } from './services/api';
import { Search, Filter, ChevronLeft, ChevronRight, Film, RefreshCw } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const STATUSES = ['To Watch', 'Watching', 'Watched'];

function App() {
  // Data States
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingMovie, setRatingMovie] = useState(null);
  const [isEditingExistingRating, setIsEditingExistingRating] = useState(false);

  const [isWatchNextModalOpen, setIsWatchNextModalOpen] = useState(false);
  const [watchNextMovie, setWatchNextMovie] = useState(null);
  const [watchNextError, setWatchNextError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState(null);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const res = await movieService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch movies list
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 6
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedGenre) params.genre = selectedGenre;
      if (selectedStatus) params.status = selectedStatus;

      const res = await movieService.getMovies(params);
      if (res.success) {
        setMovies(res.data.movies || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 0);
        setTotalMovies(res.data.totalMovies || 0);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error fetching movies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedGenre, selectedStatus]);

  // Initial load & when dependencies change
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Helper to trigger both movies and stats refetch
  const refreshAll = () => {
    fetchMovies();
    fetchStats();
  };

  // Handlers for Add / Edit
  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingMovie) {
      await movieService.updateMovie(editingMovie._id, formData);
      showToast(`Updated "${formData.title}" successfully`);
    } else {
      await movieService.createMovie(formData);
      showToast(`Added "${formData.title}" to watchlist`);
    }
    refreshAll();
  };

  // Status Change Logic
  const handleStatusChangeClick = async (movie, nextStatus) => {
    if (nextStatus === 'Watched') {
      // Must prompt for rating 1-10 before moving to Watched
      setRatingMovie(movie);
      setIsEditingExistingRating(false);
      setIsRatingModalOpen(true);
    } else {
      // To Watch -> Watching, or Watching -> To Watch
      try {
        await movieService.updateStatus(movie._id, nextStatus);
        showToast(`Moved "${movie.title}" to ${nextStatus}`);
        refreshAll();
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to update status', 'error');
      }
    }
  };

  // Rating Submit Logic
  const handleRatingSubmit = async (movieId, rating) => {
    if (isEditingExistingRating) {
      await movieService.updateRating(movieId, rating);
      showToast('Rating updated successfully');
    } else {
      await movieService.updateStatus(movieId, 'Watched', rating);
      showToast(`Marked as Watched with rating ${rating}/10!`);
    }
    refreshAll();
  };

  const handleOpenEditRating = (movie) => {
    setRatingMovie(movie);
    setIsEditingExistingRating(true);
    setIsRatingModalOpen(true);
  };

  // Delete Logic
  const handleOpenDeleteModal = (movie) => {
    setDeletingMovie(movie);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (movieId) => {
    try {
      await movieService.deleteMovie(movieId);
      showToast('Movie deleted from watchlist');
      setIsDeleteModalOpen(false);
      setDeletingMovie(null);
      refreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete movie', 'error');
    }
  };

  // Watch Next Logic
  const handleOpenWatchNext = async () => {
    setWatchNextMovie(null);
    setWatchNextError('');
    setIsWatchNextModalOpen(true);

    try {
      const res = await movieService.getWatchNext();
      if (res.success) {
        setWatchNextMovie(res.data);
      }
    } catch (err) {
      setWatchNextError(err.response?.data?.message || 'No movie found in "To Watch" status');
    }
  };

  const handleStartWatchingFromModal = async (movieId) => {
    try {
      await movieService.updateStatus(movieId, 'Watching');
      showToast('Movie status changed to Watching! Enjoy your movie.');
      refreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenWatchNextModal={handleOpenWatchNext}
      />

      {/* Real-time MongoDB Aggregation Stats */}
      <StatsDashboard stats={stats} />

      {/* Search, Filter, and Controls Bar */}
      <section className="filter-bar" aria-label="Search and filter options">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search movies by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-movies-input"
          />
        </div>

        <div className="filter-selects">
          <select
            className="select-input"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            id="filter-status-select"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className="select-input"
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            id="filter-genre-select"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {(selectedGenre || selectedStatus || searchTerm) && (
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
              onClick={() => {
                setSelectedGenre('');
                setSelectedStatus('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              title="Reset all filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="state-container">
          <div className="state-icon">
            <RefreshCw size={36} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
          <h3 className="state-title">Loading Watchlist...</h3>
          <p className="state-desc">Fetching movies from MongoDB Atlas</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="state-container">
          <Film size={48} className="state-icon" />
          <h3 className="state-title">No Movies Found</h3>
          <p className="state-desc">
            {searchTerm || selectedGenre || selectedStatus
              ? 'No movies match your current search or filter criteria.'
              : 'Your watchlist is currently empty. Click "Add Movie" above to add your first movie!'}
          </p>
          {!searchTerm && !selectedGenre && !selectedStatus && (
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenAddModal}
            >
              + Add First Movie
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Movie Cards Grid */}
          <main className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onEditClick={handleOpenEditModal}
                onDeleteClick={handleOpenDeleteModal}
                onStatusChangeClick={handleStatusChangeClick}
                onEditRatingClick={handleOpenEditRating}
              />
            ))}
          </main>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Movies pagination">
              <button
                className="btn btn-secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                id="btn-prev-page"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="page-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalMovies} total movies)
              </span>

              <button
                className="btn btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                id="btn-next-page"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}

      {/* Modals */}
      <MovieFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialMovie={editingMovie}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setRatingMovie(null);
        }}
        onSubmit={handleRatingSubmit}
        movie={ratingMovie}
        isEditingExisting={isEditingExistingRating}
      />

      <WatchNextModal
        isOpen={isWatchNextModalOpen}
        onClose={() => setIsWatchNextModalOpen(false)}
        movie={watchNextMovie}
        error={watchNextError}
        onStartWatching={handleStartWatchingFromModal}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingMovie(null);
        }}
        onConfirm={handleConfirmDelete}
        movie={deletingMovie}
      />
    </div>
  );
}

export default App;
