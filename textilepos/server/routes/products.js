const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, restockProduct,
  getProductQR, getProductByCode,
} = require('../controllers/productController');
const { protect, adminOnly, cashierOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/by-code/:code', protect, getProductByCode);  // MUST be before /:id
router.get('/',              protect, getProducts);
router.get('/:id',           protect, getProduct);
router.get('/:id/qr',        protect, getProductQR);

router.post('/',             protect, cashierOrAdmin, upload.single('image'), createProduct);
router.put('/:id/restock',   protect, cashierOrAdmin, restockProduct);
router.put('/:id',           protect, cashierOrAdmin, upload.single('image'), updateProduct);
router.delete('/:id',        protect, adminOnly, deleteProduct);

module.exports = router;
