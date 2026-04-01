const Customer = require('../models/Customer');
const Bill     = require('../models/Bill');

const getCustomers = async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (search) filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const customers = await Customer.find(filter).sort({ name: 1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch(err) { next(err); }
};

// Check if phone exists — used for uniqueness check while typing
const checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.json({ success: true, exists: false, customer: null });
    const customer = await Customer.findOne({ phone: phone.trim(), isActive: true });
    res.json({ success: true, exists: !!customer, customer: customer || null });
  } catch(err) { next(err); }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const bills = await Bill.find({ customer: req.params.id })
      .sort({ createdAt: -1 }).limit(10)
      .select('billNumber total paymentMethod paymentStatus createdAt items');
    res.json({ success: true, data: { ...customer.toJSON(), bills } });
  } catch(err) { next(err); }
};

const createCustomer = async (req, res, next) => {
  try {
    // Check unique phone before create
    const exists = await Customer.findOne({ phone: req.body.phone });
    if (exists) return res.status(400).json({ success: false, message: `Phone ${req.body.phone} is already registered to ${exists.name}` });
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch(err) { next(err); }
};

const updateCustomer = async (req, res, next) => {
  try {
    // If phone is being changed, check it's not taken by another customer
    if (req.body.phone) {
      const exists = await Customer.findOne({ phone: req.body.phone, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: `Phone ${req.body.phone} is already registered to ${exists.name}` });
    }
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch(err) { next(err); }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deactivated' });
  } catch(err) { next(err); }
};

module.exports = { getCustomers, checkPhone, getCustomer, createCustomer, updateCustomer, deleteCustomer };
