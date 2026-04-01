const express = require('express');
const router  = express.Router();
const { getBills, getBill, createBill, updatePayment, returnItems } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',                  protect, getBills);
router.get('/:id',               protect, getBill);
router.post('/',                 protect, createBill);
router.put('/:id/payment',       protect, updatePayment);
router.post('/:id/return-items', protect, returnItems);

module.exports = router;
