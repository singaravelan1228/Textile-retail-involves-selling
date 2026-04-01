const Supplier = require('../models/Supplier');

const getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
    const suppliers = await Supplier.find(filter).sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch(err) { next(err); }
};

const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch(err) { next(err); }
};

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch(err) { next(err); }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deactivated' });
  } catch(err) { next(err); }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
