const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated' });

    // Re-query without password
    const userData = await User.findById(user._id);
    res.json({ success: true, token: signToken(user._id), user: userData });
  } catch (err) { next(err); }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) { next(err); }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// @desc    Create user (admin)
// @route   POST /api/auth/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @desc    Update user (admin)
// @route   PUT /api/auth/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    if (req.body.password) delete req.body.password; // use separate route for password change
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

module.exports = { login, getMe, getUsers, createUser, updateUser };
