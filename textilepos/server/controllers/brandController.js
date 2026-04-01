const Brand = require('../models/Brand');

const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch(err) { next(err); }
};

const createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, data: brand });
  } catch(err) { next(err); }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: brand });
  } catch(err) { next(err); }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand removed' });
  } catch(err) { next(err); }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
