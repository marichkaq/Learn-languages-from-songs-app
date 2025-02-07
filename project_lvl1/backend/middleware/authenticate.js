const jwt = require('jsonwebtoken');

// middleware to authenticate the token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // extract token from the "Authorization" header
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // attach user info to `req.user`
        console.log("Decoded Token:", decoded); // Debugging
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
};

const authenticateAdmin = (req, res, next) => {
    console.log("Authenticated User in Admin Middleware:", req.user);
    const user = req.user;
    if (user.statusId === 1) {
        next();
    } else {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
};


module.exports = { authenticate, authenticateAdmin };

