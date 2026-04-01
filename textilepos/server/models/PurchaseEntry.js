const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName:  { type: String, required: true },
  productCode:  { type: String, required: true },
  unit:         { type: String, default: 'meter' },
  purchaseRate: { type: Number, required: true, min: 0 },
  qty:          { type: Number, required: true, min: 0 },
  totalAmount:  { type: Number, default: 0 },
}, { _id: false });

const purchaseEntrySchema = new mongoose.Schema({
  refNo:          { type: String, unique: true },          // INW-0042
  invoiceNo:      { type: String, required: true, trim: true },
  invoiceDate:    { type: Date, required: true },
  entryDate:      { type: Date, default: Date.now },
  supplier:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName:   { type: String, default: '' },
  supplierCode:   { type: String, default: '' },
  supplierGstin:  { type: String, default: '' },
  items:          [lineItemSchema],
  discount1Pct:   { type: Number, default: 0 },
  discount2Pct:   { type: Number, default: 0 },
  gstPct:         { type: Number, default: 5 },
  paymentTerms:   { type: String, default: 'Net 30' },
  transportRef:   { type: String, default: '' },
  grossAmount:    { type: Number, default: 0 },
  discount1Amt:   { type: Number, default: 0 },
  discount2Amt:   { type: Number, default: 0 },
  taxableAmount:  { type: Number, default: 0 },
  gstAmount:      { type: Number, default: 0 },
  cgst:           { type: Number, default: 0 },
  sgst:           { type: Number, default: 0 },
  netAmount:      { type: Number, default: 0 },
  remarks:        { type: String, default: '' },
  status:         { type: String, enum: ['draft','saved'], default: 'draft' },
  stockUpdated:   { type: Boolean, default: false },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate refNo before save
purchaseEntrySchema.pre('save', async function(next) {
  if (!this.refNo) {
    const last = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let seq = 1;
    if (last?.refNo) {
      const n = parseInt(last.refNo.replace('INW-', ''), 10);
      if (!isNaN(n)) seq = n + 1;
    }
    this.refNo = `INW-${String(seq).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseEntry', purchaseEntrySchema);
