const express = require('express');
const router = express.Router();
const { login, getMe, getUsers, createUser, updateUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getUsers);
router.post('/users', protect, adminOnly, createUser);
router.put('/users/:id', protect, adminOnly, updateUser);

module.exports = router;
