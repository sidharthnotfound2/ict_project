import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const movieService = {
  // Get movies with search, filter, pagination
  getMovies: async (params = {}) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  // Get single movie by ID
  getMovieById: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  // Create new movie
  createMovie: async (movieData) => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  // Edit movie (title, genre, runtime, platform, priority)
  updateMovie: async (id, movieData) => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  // Update movie status (To Watch -> Watching | Watched, Watching -> Watched | To Watch)
  updateStatus: async (id, status, rating = null) => {
    const payload = { status };
    if (rating !== null && rating !== undefined) {
      payload.rating = Number(rating);
    }
    const response = await api.patch(`/movies/${id}/status`, payload);
    return response.data;
  },

  // Update rating on Watched movie
  updateRating: async (id, rating) => {
    const response = await api.patch(`/movies/${id}/rating`, {
      rating: Number(rating)
    });
    return response.data;
  },

  // Delete movie (forbidden for Watching)
  deleteMovie: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },

  // Watch Next recommendation
  getWatchNext: async () => {
    const response = await api.get('/movies/watch-next');
    return response.data;
  },

  // Statistics dashboard data
  getStats: async () => {
    const response = await api.get('/movies/stats');
    return response.data;
  }
};

export default api;
