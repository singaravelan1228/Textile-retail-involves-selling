const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title:         { type: String, required: true, trim: true },
  description:   { type: String, trim: true },
  type:          { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value:         { type: Number, required: true, min: 0 },  // % or flat ₹ off
  minQty:        { type: Number, default: 1 },              // min qty to unlock offer
  expiresAt:     { type: Date },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: is offer currently valid?
offerSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});
offerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Offer', offerSchema);
