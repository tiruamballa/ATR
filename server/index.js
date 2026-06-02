const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const Phase = require('./models/Phase');
    const count = await Phase.countDocuments();
    if (count === 0) {
      console.log('Database is empty! Triggering automatic seeding...');
      const seedDatabase = require('./seeds/roadmapSeed');
      await seedDatabase({ closeConnection: false });
    }
  } catch (err) {
    console.error('Failed to run automatic seeding check:', err);
  }
});

const app = express();

// CORS configurations
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Standard Middleware
app.use(express.json());
app.use(cookieParser());

// Define API Route Handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/phases', require('./routes/phases'));
app.use('/api/daily', require('./routes/daily'));
app.use('/api/dsa', require('./routes/dsa'));
app.use('/api/english', require('./routes/english'));
app.use('/api/aptitude', require('./routes/aptitude'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/profile', require('./routes/profile'));

// Fallback for undefined routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on this server: ${req.originalUrl}`,
  });
});

// Centralized Custom Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
