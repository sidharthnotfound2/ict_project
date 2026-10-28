const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  updateMovieRating,
  deleteMovie,
  getWatchNext,
  getMovieStats
} = require('../controllers/movieController');

// 1. Core Collection Routes
router.post('/', createMovie);
router.get('/', getMovies);

// 2. Specific Query Routes (MUST be defined before /:id)
router.get('/watch-next', getWatchNext);
router.get('/stats', getMovieStats);

// 3. Document-specific Routes with ObjectId validation
router.get('/:id', validateObjectId, getMovieById);
router.put('/:id', validateObjectId, updateMovie);
router.patch('/:id/status', validateObjectId, updateMovieStatus);
router.patch('/:id/rating', validateObjectId, updateMovieRating);
router.delete('/:id', validateObjectId, deleteMovie);

module.exports = router;
