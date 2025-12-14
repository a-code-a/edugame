const admin = require('firebase-admin');

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists and starts with Bearer
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided or invalid format');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            // Verify the token with Firebase Admin
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Attach user info to request object
            req.user = decodedToken;

            // Legacy support: ensure userId header matches token (optional, but good for consistency during migration)
            // or simply override it to ensure we accept TRUTH from token
            req.headers.userid = decodedToken.uid;

            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Optional: Middleware that helps but doesn't block (for optional auth routes)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            req.headers.userid = decodedToken.uid;
        } catch (error) {
            console.log('Optional auth failed (ignoring):', error.message);
        }
    }
    next();
};

module.exports = { verifyToken, optionalAuth };
