const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  phone:          { type: String, required: true, unique: true, trim: true },
  email:          { type: String, trim: true, lowercase: true },
  address:        { type: String, trim: true },
  type:           { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
  gstNumber:      { type: String, trim: true, uppercase: true },
  totalPurchases: { type: Number, default: 0 },
  totalSpent:     { type: Number, default: 0 },
  balance:        { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Customer', customerSchema);
