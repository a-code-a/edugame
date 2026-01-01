const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const gamesRoutes = require('./routes/games');
const playlistRoutes = require('./routes/playlists');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const admin = require('firebase-admin');

// Load environment variables first so we can use them for Firebase
dotenv.config();

// Initialize Firebase Admin
try {
  // Check for environment variables (production) or fall back to local file (development)
  let firebaseCredential;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables (Render deployment)
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
    };
    firebaseCredential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin: Using environment variables');
  } else {
    // Fall back to local JSON file (development)
    const serviceAccount = require('./service-account-key.json');
    firebaseCredential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin: Using local service account file');
  }

  admin.initializeApp({
    credential: firebaseCredential
  });
  console.log('Firebase Admin Initialized');
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiter to all api routes
app.use('/api/', limiter);

// Middleware - CORS configuration for dev and production
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite default port
  process.env.FRONTEND_URL, // Production frontend URL from Render
  'https://edugame-frontend-gt3e.onrender.com', // Explicit Render production URL
  'https://edugamer-81de7.firebaseapp.com', // Firebase Hosting
  'https://edugamer-81de7.web.app' // Firebase Hosting alternate domain
].filter(Boolean);

// Log CORS configuration on startup
console.log('CORS Configuration:');
console.log('Allowed Origins:', allowedOrigins);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Request with no origin allowed');
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed:', origin);
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('CORS: Non-production mode - allowing origin:', origin);
      callback(null, true);
    } else {
      console.error('CORS: Origin NOT allowed:', origin);
      console.error('CORS: Allowed origins are:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
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
app.use('/api/playlists', playlistRoutes);

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
    console.log(`========================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Health check: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}/api/health`);
    console.log(`========================================`);
    console.log(`Keep-alive: Using external GitHub Actions workflow`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});