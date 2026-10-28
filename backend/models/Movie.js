const mongoose = require('mongoose');

const allowedGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const allowedPlatforms = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const allowedStatuses = ['To Watch', 'Watching', 'Watched'];

const movieSchema = new mongoose.Schema(
  {
    movieCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    titleLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: allowedGenres,
        message: '{VALUE} is not a valid genre'
      }
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1950, 'Release year must be at least 1950'],
      max: [new Date().getFullYear(), `Release year cannot exceed ${new Date().getFullYear()}`]
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime in minutes is required'],
      min: [30, 'Runtime must be at least 30 minutes'],
      max: [300, 'Runtime cannot exceed 300 minutes']
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: allowedPlatforms,
        message: '{VALUE} is not a valid platform'
      }
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be at least 1'],
      max: [5, 'Priority cannot exceed 5']
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: allowedStatuses,
        message: '{VALUE} is not a valid status'
      },
      default: 'To Watch'
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 10'],
      max: [10, 'Rating must be between 1 and 10'],
      default: null
    },
    watchedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index for title (case-insensitive) + releaseYear
movieSchema.index({ titleLower: 1, releaseYear: 1 }, { unique: true });

module.exports = {
  Movie: mongoose.model('Movie', movieSchema),
  allowedGenres,
  allowedPlatforms,
  allowedStatuses
};
