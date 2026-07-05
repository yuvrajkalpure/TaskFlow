const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123456_task_tracker');

      // Get user from the token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.isDeleted) {
        return res.status(401).json({ message: 'Not authorized, account deactivated' });
      }

      // Check if session token is registered in the DB active sessions
      const sessionExists = req.user.sessions.some(s => s.token === token);
      if (!sessionExists) {
        return res.status(401).json({ message: 'Session expired or revoked' });
      }

      // Hide password
      req.user.password = undefined;
      req.token = token;

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
};

module.exports = { protect, admin };
