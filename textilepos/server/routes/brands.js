const express = require('express');
const router  = express.Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, adminOnly, cashierOrAdmin } = require('../middleware/authMiddleware');

router.get('/',       protect,            getBrands);
router.post('/',      protect, cashierOrAdmin, createBrand);  // cashier can add brand
router.put('/:id',    protect, adminOnly,      updateBrand);  // only admin edits
router.delete('/:id', protect, adminOnly,      deleteBrand);  // only admin deletes

module.exports = router;
