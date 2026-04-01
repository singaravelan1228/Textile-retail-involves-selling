const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  code:        { type: String, required: true, unique: true, trim: true, uppercase: true },
  gstin:       { type: String, trim: true, uppercase: true },
  phone:       { type: String, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  address:     { type: String, trim: true },
  city:        { type: String, trim: true },
  state:       { type: String, trim: true },
  paymentTerms:{ type: String, default: 'Net 30' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
