const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  { type: String, required: true },
  productCode:  { type: String },
  category:     { type: String },
  brand:        { type: String },
  quantity:     { type: Number, required: true, min: 0.01 },
  unit:         { type: String },
  pricePerUnit: { type: Number, required: true },
  gstRate:      { type: Number, default: 5 },
  amount:       { type: Number, required: true },
  returnedQty:  { type: Number, default: 0 },
});

const billSchema = new mongoose.Schema(
  {
    billNumber:    { type: String, required: true, unique: true },
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName:  { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String },
    items:         [billItemSchema],
    subtotal:      { type: Number, required: true },
    gstAmount:     { type: Number, required: true },
    discountPct:   { type: Number, default: 0 },
    discountAmt:   { type: Number, default: 0 },
    total:         { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'NEFT'], default: 'Cash' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Paid' },
    paidAmount:    { type: Number, default: 0 },
    hasReturn:     { type: Boolean, default: false },
    returnAmount:  { type: Number, default: 0 },
    notes:         { type: String },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
