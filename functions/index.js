const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const gamesRoutes = require('./routes/games');
const playlistRoutes = require('./routes/playlists');

// Initialize Firebase Admin (Auto-discovery)
admin.initializeApp();

// --- MongoDB Connection Pattern (Cached) ---
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb && cachedDb.readyState === 1) {
        return cachedDb;
    }

    // Use MONGODB_URI from secret or env
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined');
    }

    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'edugame'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        cachedDb = conn.connection;
        return cachedDb;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};

// --- Express App Setup ---
const app = express();

// Security Middleware
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// CORS Config
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://edugamer-81de7.firebaseapp.com',
    'https://edugamer-81de7.web.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all same-origin requests (implicit in Firebase Hosting rewrites)
        // but if hitting function URL directly, check origin
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // For development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        console.log('CORS blocked:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected for every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// Routes
app.use('/api/games', gamesRoutes);
app.use('/api/playlists', playlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: process.env.NODE_ENV
    });
});

// Root
app.get('/api', (req, res) => {
    res.json({
        message: 'EduGame Firebase Functions API',
        version: '1.0.0'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// --- Export Function ---
exports.api = onRequest(
    {
        region: 'europe-west1',
        secrets: ['MONGODB_URI'],
        minInstances: 0,
        maxInstances: 10
    },
    app
);
