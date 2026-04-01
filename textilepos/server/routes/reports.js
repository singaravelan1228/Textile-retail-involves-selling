const express = require('express');
const router = express.Router();
const { getDashboard, getMonthlyRevenue, getGSTSummary, getTopProducts } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard',    protect, getDashboard);
router.get('/monthly',      protect, getMonthlyRevenue);
router.get('/gst',          protect, getGSTSummary);
router.get('/top-products', protect, getTopProducts);

module.exports = router;
