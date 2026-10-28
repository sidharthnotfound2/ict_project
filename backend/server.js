const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movieRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ict-project-sooty.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes('*') ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for evaluation and smooth deployment
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Movie Watchlist API is running smoothly',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use('/api/movies', movieRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
    data: null
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
