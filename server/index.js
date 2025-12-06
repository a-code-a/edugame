const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const gamesRoutes = require('./routes/games');
const https = require('https');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for dev and production
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite default port
  process.env.FRONTEND_URL // Production frontend URL from Render
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // For debugging/fixing production issues, we'll log but allow it for now
      // In a strict production environment, you should uncomment the error callback
      console.log('Origin not in allowed list, but allowing for now:', origin);
      callback(null, true);
      // callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'userId', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'edugame'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Routes
app.use('/api/games', gamesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EduGame API Server',
    version: '1.0.0',
    endpoints: {
      games: '/api/games',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Self-ping mechanism to keep Render free tier awake
    // Runs every 14 minutes (render sleeps after 15m inactivity)
    if (process.env.NODE_ENV === 'production') {
      const pingInterval = 14 * 60 * 1000; // 14 minutes
      console.log(`Setting up keep-alive ping every ${pingInterval / 60000} minutes`);

      setInterval(() => {
        const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
        if (baseUrl) {
          console.log(`Sending keep-alive ping to ${baseUrl}/api/health`);
          https.get(`${baseUrl}/api/health`, (res) => {
            console.log(`Ping status: ${res.statusCode}`);
          }).on('error', (err) => {
            console.error(`Ping failed: ${err.message}`);
          });
        } else {
          console.log('Keep-alive skipped: No RENDER_EXTERNAL_URL defined');
        }
      }, pingInterval);
    }
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});