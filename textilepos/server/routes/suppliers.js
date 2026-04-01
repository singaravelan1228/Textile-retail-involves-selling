const express = require('express');
const router  = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, adminOnly, cashierOrAdmin } = require('../middleware/authMiddleware');

router.get('/',       protect, getSuppliers);
router.post('/',      protect, adminOnly, createSupplier);
router.put('/:id',    protect, adminOnly, updateSupplier);
router.delete('/:id', protect, adminOnly, deleteSupplier);

module.exports = router;
