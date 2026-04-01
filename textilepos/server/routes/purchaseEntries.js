const express = require('express');
const router  = express.Router();
const {
  getPurchaseEntries, getPurchaseEntry, createPurchaseEntry,
  updatePurchaseEntry, deletePurchaseEntry, getPurchaseStats,
} = require('../controllers/purchaseEntryController');
const { protect, adminOnly, cashierOrAdmin } = require('../middleware/authMiddleware');

router.get('/stats',  protect, getPurchaseStats);
router.get('/',       protect, getPurchaseEntries);
router.get('/:id',    protect, getPurchaseEntry);
router.post('/',      protect, cashierOrAdmin, createPurchaseEntry);
router.put('/:id',    protect, cashierOrAdmin, updatePurchaseEntry);
router.delete('/:id', protect, adminOnly, deletePurchaseEntry);

module.exports = router;
