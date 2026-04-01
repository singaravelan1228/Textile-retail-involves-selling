const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Protect route — verify JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorised. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive)
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Admin only — full access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

// Cashier OR Admin — allowed for product add, restock, brand add
const cashierOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'cashier')) return next();
  return res.status(403).json({ success: false, message: 'Access denied.' });
};

module.exports = { protect, adminOnly, cashierOrAdmin };
