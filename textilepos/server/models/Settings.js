const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Company information
  companyName:  { type: String, default: 'My Textile Store' },
  tagline:      { type: String, default: 'Quality Fabrics Since 2000' },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },
  state:        { type: String, default: 'Tamil Nadu' },
  pincode:      { type: String, default: '' },
  phone:        { type: String, default: '' },
  phone2:       { type: String, default: '' },
  email:        { type: String, default: '' },
  website:      { type: String, default: '' },
  gstNumber:    { type: String, default: '' },

  // Tax rates (used in GST reports)
  cgstRate: { type: Number, default: 2.5 },
  sgstRate: { type: Number, default: 2.5 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
