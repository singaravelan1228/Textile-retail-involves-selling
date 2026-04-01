const express = require('express');
const router  = express.Router();
const { getCustomers, checkPhone, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/check-phone', protect, checkPhone);
router.get('/',            protect, getCustomers);
router.get('/:id',         protect, getCustomer);
router.post('/',           protect, createCustomer);
router.put('/:id',         protect, updateCustomer);
router.delete('/:id',      protect, adminOnly, deleteCustomer);

module.exports = router;
