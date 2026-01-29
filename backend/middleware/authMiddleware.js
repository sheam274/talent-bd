const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * verifyToken: Checks if the user is logged in via JWT
 * Decodes the token and attaches the User object to the request.
 */
const verifyToken = async (req, res, next) => {
    let token;

    // 1. Check for Bearer token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify Token
            const secret = process.env.JWT_SECRET || 'talentbd_secret_key_2026';
            const decoded = jwt.verify(token, secret);
            
            // 3. Attach user to request (excluding sensitive password field)
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User no longer exists in our system.' 
                });
            }

            // 4. Check if user is active/not banned (Optional but recommended for 2026)
            if (user.isActive === false) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Account is deactivated. Please contact support.' 
                });
            }

            req.user = user;
            return next(); // Proceed to next middleware/route

        } catch (error) {
            console.error("❌ Auth Token Error:", error.message);
            
            // Differentiate between expired and invalid tokens for better UX
            const message = error.name === 'TokenExpiredError' 
                ? 'Session expired. Please login again.' 
                : 'Invalid security token.';

            return res.status(401).json({ success: false, message });
        }
    }

    // 5. If no token was found at all
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access Denied: No authentication token provided.' 
        });
    }
};

/**
 * isAdmin: Checks if the logged-in user has administrative privileges
 * Must be used AFTER verifyToken.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Restricted Access: Administrative privileges required.' 
        });
    }
};

module.exports = { verifyToken, isAdmin };