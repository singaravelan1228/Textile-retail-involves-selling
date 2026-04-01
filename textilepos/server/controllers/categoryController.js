const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!cat) return res.status(404).json({ success: false, message: 'Category deactivated' });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
