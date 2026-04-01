const express = require('express');
const router  = express.Router();
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',       protect, getOffers);
router.post('/',      protect, adminOnly, createOffer);
router.put('/:id',    protect, adminOnly, updateOffer);
router.delete('/:id', protect, adminOnly, deleteOffer);

module.exports = router;
