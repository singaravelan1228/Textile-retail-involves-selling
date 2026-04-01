const mongoose = require('mongoose');

const heldBillSchema = new mongoose.Schema({
  label:        { type: String, default: 'Held Bill' },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: '' },
  customerPhone:{ type: String, default: '' },
  items:        [{ type: Object }],   // cart items snapshot
  discount:     { type: Number, default: 0 },
  payMethod:    { type: String, default: 'Cash' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('HeldBill', heldBillSchema);
