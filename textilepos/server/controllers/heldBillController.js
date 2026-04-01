const HeldBill = require('../models/HeldBill');

const getHeldBills = async (req, res, next) => {
  try {
    const bills = await HeldBill.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch(err) { next(err); }
};

const holdBill = async (req, res, next) => {
  try {
    const held = await HeldBill.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: held });
  } catch(err) { next(err); }
};

const releaseHeldBill = async (req, res, next) => {
  try {
    const held = await HeldBill.findByIdAndDelete(req.params.id);
    if (!held) return res.status(404).json({ success: false, message: 'Held bill not found' });
    res.json({ success: true, data: held, message: 'Bill released' });
  } catch(err) { next(err); }
};

module.exports = { getHeldBills, holdBill, releaseHeldBill };
