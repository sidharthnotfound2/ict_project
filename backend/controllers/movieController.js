const { Movie, allowedGenres, allowedPlatforms, allowedStatuses } = require('../models/Movie');
const { generateMovieCode } = require('../utils/codeGenerator');

/**
 * Escape special regex characters in search query
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// ==========================================
// 1. ADD MOVIE (POST /api/movies)
// ==========================================
const createMovie = async (req, res, next) => {
  try {
    const { title, genre, releaseYear, runtime, platform, priority, rating } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
        data: null
      });
    }

    const currentYear = new Date().getFullYear();
    const parsedYear = Number(releaseYear);
    if (!parsedYear || parsedYear < 1950 || parsedYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Release year must be between 1950 and ${currentYear}`,
        data: null
      });
    }

    const parsedRuntime = Number(runtime);
    if (!parsedRuntime || parsedRuntime < 30 || parsedRuntime > 300) {
      return res.status(400).json({
        success: false,
        message: 'Runtime must be between 30 and 300 minutes',
        data: null
      });
    }

    if (!genre || !allowedGenres.includes(genre)) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre. Allowed genres: ${allowedGenres.join(', ')}`,
        data: null
      });
    }

    if (!platform || !allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Allowed platforms: ${allowedPlatforms.join(', ')}`,
        data: null
      });
    }

    const parsedPriority = Number(priority);
    if (!parsedPriority || parsedPriority < 1 || parsedPriority > 5) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be between 1 and 5',
        data: null
      });
    }

    // Rating rule: New movie always starts at 'To Watch'. Rating cannot be set on creation.
    if (rating !== undefined && rating !== null && rating !== '') {
      return res.status(400).json({
        success: false,
        message: 'Rating cannot be set for a movie in To Watch status',
        data: null
      });
    }

    const trimmedTitle = title.trim();
    const titleLower = trimmedTitle.toLowerCase();

    // Check duplicate (case-insensitive title + releaseYear)
    const existingMovie = await Movie.findOne({
      titleLower,
      releaseYear: parsedYear
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: `A movie with title "${trimmedTitle}" and release year ${parsedYear} already exists.`,
        data: null
      });
    }

    // Generate atomic sequence code: MV-<releaseYear>-<3-digit sequence>
    const movieCode = await generateMovieCode(parsedYear);

    const newMovie = new Movie({
      movieCode,
      title: trimmedTitle,
      titleLower,
      genre,
      releaseYear: parsedYear,
      runtime: parsedRuntime,
      platform,
      priority: parsedPriority,
      status: 'To Watch',
      rating: null,
      watchedDate: null
    });

    const savedMovie = await newMovie.save();

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      data: savedMovie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. GET ALL MOVIES with filter, search, pagination, custom sort (GET /api/movies)
// ==========================================
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, search, page = 1, limit = 6 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const skip = (pageNum - 1) * limitNum;

    // Build match conditions
    const matchStage = {};

    if (status && allowedStatuses.includes(status)) {
      matchStage.status = status;
    }

    if (genre && allowedGenres.includes(genre)) {
      matchStage.genre = genre;
    }

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      matchStage.title = { $regex: escaped, $options: 'i' };
    }

    // MongoDB Aggregation for sorting, count, and pagination
    // Sorting rule: "To Watch movies come first sorted by priority high->low, then the rest by newest first"
    const aggregationPipeline = [
      { $match: matchStage },
      {
        $addFields: {
          isToWatch: {
            $cond: [{ $eq: ['$status', 'To Watch'] }, 1, 0]
          },
          sortPriority: {
            $cond: [{ $eq: ['$status', 'To Watch'] }, '$priority', 0]
          }
        }
      },
      {
        $sort: {
          isToWatch: -1,     // To Watch (1) comes before others (0)
          sortPriority: -1,  // For To Watch: priority 5 down to 1
          createdAt: -1      // For others (and tied To Watch): newest first
        }
      },
      {
        $facet: {
          movies: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Movie.aggregate(aggregationPipeline);

    const movies = result[0].movies || [];
    const totalMovies = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    const totalPages = totalMovies === 0 ? 0 : Math.ceil(totalMovies / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Movies retrieved successfully',
      data: {
        movies,
        currentPage: pageNum,
        totalPages,
        totalMovies
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. GET SINGLE MOVIE (GET /api/movies/:id)
// ==========================================
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie fetched successfully',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. EDIT MOVIE (PUT /api/movies/:id)
// ==========================================
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    const { title, genre, runtime, platform, priority } = req.body;

    // Fields title, genre, runtime, platform, priority only
    // movieCode and releaseYear are immutable
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
          data: null
        });
      }
      const trimmedTitle = title.trim();
      const titleLower = trimmedTitle.toLowerCase();

      // Check duplicate title + releaseYear against other movies
      if (titleLower !== movie.titleLower) {
        const duplicate = await Movie.findOne({
          _id: { $ne: movie._id },
          titleLower,
          releaseYear: movie.releaseYear
        });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: `A movie with title "${trimmedTitle}" and release year ${movie.releaseYear} already exists.`,
            data: null
          });
        }
      }

      movie.title = trimmedTitle;
      movie.titleLower = titleLower;
    }

    if (genre !== undefined) {
      if (!allowedGenres.includes(genre)) {
        return res.status(400).json({
          success: false,
          message: `Invalid genre. Allowed genres: ${allowedGenres.join(', ')}`,
          data: null
        });
      }
      movie.genre = genre;
    }

    if (runtime !== undefined) {
      const parsedRuntime = Number(runtime);
      if (!parsedRuntime || parsedRuntime < 30 || parsedRuntime > 300) {
        return res.status(400).json({
          success: false,
          message: 'Runtime must be between 30 and 300 minutes',
          data: null
        });
      }
      movie.runtime = parsedRuntime;
    }

    if (platform !== undefined) {
      if (!allowedPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: `Invalid platform. Allowed platforms: ${allowedPlatforms.join(', ')}`,
          data: null
        });
      }
      movie.platform = platform;
    }

    if (priority !== undefined) {
      const parsedPriority = Number(priority);
      if (!parsedPriority || parsedPriority < 1 || parsedPriority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be between 1 and 5',
          data: null
        });
      }
      movie.priority = parsedPriority;
    }

    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. UPDATE STATUS (PATCH /api/movies/:id/status)
// ==========================================
const updateMovieStatus = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    const { status, rating } = req.body;
    const currentStatus = movie.status;
    const nextStatus = status;

    if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`,
        data: null
      });
    }

    // Watched is final
    if (currentStatus === 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Watched status is final and cannot be changed',
        data: null
      });
    }

    // Allowed transitions:
    // To Watch -> Watching or Watched
    // Watching -> Watched or To Watch
    const isValidTransition =
      (currentStatus === 'To Watch' && (nextStatus === 'Watching' || nextStatus === 'Watched')) ||
      (currentStatus === 'Watching' && (nextStatus === 'Watched' || nextStatus === 'To Watch'));

    if (!isValidTransition) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${nextStatus}"`,
        data: null
      });
    }

    // Transitioning to 'Watched'
    if (nextStatus === 'Watched') {
      const parsedRating = Number(rating);
      if (!parsedRating || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'A mandatory rating between 1 and 10 is required when moving to Watched',
          data: null
        });
      }
      movie.status = 'Watched';
      movie.rating = parsedRating;
      movie.watchedDate = new Date();
    } else {
      // Transitioning to 'Watching' or back to 'To Watch'
      if (rating !== undefined && rating !== null && rating !== '') {
        return res.status(400).json({
          success: false,
          message: 'Rating is rejected for movies not in Watched status',
          data: null
        });
      }
      movie.status = nextStatus;
      movie.rating = null;
      movie.watchedDate = null;
    }

    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${nextStatus} successfully`,
      data: updatedMovie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. UPDATE RATING (PATCH /api/movies/:id/rating)
// ==========================================
const updateMovieRating = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    if (movie.status !== 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Rating can only be edited for movies in Watched status',
        data: null
      });
    }

    const { rating } = req.body;
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 10',
        data: null
      });
    }

    movie.rating = parsedRating;
    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedMovie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. DELETE MOVIE (DELETE /api/movies/:id)
// ==========================================
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    // A movie in Watching status cannot be deleted
    if (movie.status === 'Watching') {
      return res.status(400).json({
        success: false,
        message: 'A movie in "Watching" status cannot be deleted',
        data: null
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. WATCH NEXT (GET /api/movies/watch-next)
// ==========================================
const getWatchNext = async (req, res, next) => {
  try {
    // "To Watch movie with highest priority; ties -> shortest runtime; none -> 404 with message"
    const nextMovie = await Movie.findOne({ status: 'To Watch' })
      .sort({ priority: -1, runtime: 1, createdAt: -1 });

    if (!nextMovie) {
      return res.status(404).json({
        success: false,
        message: 'No movie found in "To Watch" status',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Watch next movie retrieved successfully',
      data: nextMovie
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. STATS (GET /api/movies/stats)
// ==========================================
const getMovieStats = async (req, res, next) => {
  try {
    // Aggregation 1: Status counts (including zeros for all 3 statuses)
    const statusCountsAgg = await Movie.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      'To Watch': 0,
      'Watching': 0,
      'Watched': 0
    };
    statusCountsAgg.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Aggregation 2: Watched movies runtime and average rating
    const watchedStatsAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: null,
          totalRuntime: { $sum: '$runtime' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalHoursWatched = 0;
    let avgRating = 0;

    if (watchedStatsAgg.length > 0) {
      const watched = watchedStatsAgg[0];
      totalHoursWatched = Number((watched.totalRuntime / 60).toFixed(1));
      avgRating = watched.avgRating ? Number(watched.avgRating.toFixed(1)) : 0;
    }

    // Aggregation 3: Genre with most Watched movies (null-safe)
    const genreStatsAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topWatchedGenre = genreStatsAgg.length > 0 ? genreStatsAgg[0]._id : null;

    return res.status(200).json({
      success: true,
      message: 'Movie statistics retrieved successfully',
      data: {
        statusCounts,
        totalHoursWatched,
        averageRating: avgRating,
        topWatchedGenre
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateMovieStatus,
  updateMovieRating,
  deleteMovie,
  getWatchNext,
  getMovieStats
};
