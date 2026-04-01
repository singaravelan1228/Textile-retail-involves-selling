const Offer   = require('../models/Offer');
const Product = require('../models/Product');

// GET /api/offers  — all active offers (optionally filtered by product)
const getOffers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.active === 'true') {
      filter.isActive = true;
      filter.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];
    }
    const offers = await Offer.find(filter)
      .populate('product', 'name code pricePerUnit unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch(err) { next(err); }
};

// POST /api/offers
const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    const populated = await offer.populate('product', 'name code pricePerUnit unit');
    res.status(201).json({ success: true, data: populated });
  } catch(err) { next(err); }
};

// PUT /api/offers/:id
const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('product', 'name code pricePerUnit unit');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: offer });
  } catch(err) { next(err); }
};

// DELETE /api/offers/:id
const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer deleted' });
  } catch(err) { next(err); }
};

module.exports = { getOffers, createOffer, updateOffer, deleteOffer };
