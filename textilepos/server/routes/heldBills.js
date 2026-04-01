const express = require('express');
const router  = express.Router();
const { getHeldBills, holdBill, releaseHeldBill } = require('../controllers/heldBillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',        protect, getHeldBills);
router.post('/',       protect, holdBill);
router.delete('/:id',  protect, releaseHeldBill);

module.exports = router;
