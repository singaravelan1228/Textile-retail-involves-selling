const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, trim: true, uppercase: true },
    name:         { type: String, required: true, trim: true },
    category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:        { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    pricePerUnit: { type: Number, required: true, min: 0 },
    unit:         { type: String, default: 'meter', enum: ['meter', 'piece', 'kg', 'yard'] },
    stock:        { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 20 },
    description:  { type: String, trim: true },
    swatchColor:  { type: String, default: '#1A8060' },
    imageUrl:     { type: String, default: '' },   // ← unified field name
    isActive:     { type: Boolean, default: true },
    gstRate:      { type: Number, default: 5 },
  },
  { timestamps: true }
);

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.reorderLevel;
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
