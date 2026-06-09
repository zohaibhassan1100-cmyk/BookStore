// middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return fail(res, 'No token provided', 401);

    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return fail(res, 'User not found', 401);

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return fail(res, msg, 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return fail(res, 'Admin access required', 403);
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token   = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {}
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
