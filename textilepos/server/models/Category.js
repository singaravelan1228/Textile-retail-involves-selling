const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    color:       { type: String, default: '#1D9E75' },
    icon:        { type: String, default: '🧵' },
    isActive:    { type: Boolean, default: true },

    // Fabric type  — e.g. woven, knit, non-woven
    fabricType:  { type: String, default: '' },

    // Size system this category supports
    sizeSystem:  {
      type: String,
      enum: ['none', 'clothing_intl', 'clothing_uk', 'clothing_india', 'kids', 'footwear_uk', 'custom'],
      default: 'none',
    },

    // Custom sizes — only used when sizeSystem === 'custom'
    customSizes: [{ type: String, trim: true }],

    // GST default for products in this category
    defaultGstRate: { type: Number, default: 5 },

    // Default unit for products in this category
    defaultUnit: {
      type: String,
      enum: ['meter', 'piece', 'kg', 'yard', ''],
      default: 'meter',
    },

    // Extra attributes specific to this category (e.g. "Thread Count", "Weave Pattern")
    attributes: [
      {
        name:     { type: String, trim: true },     // "Thread Count"
        type:     { type: String, enum: ['text','number','select'], default: 'text' },
        options:  [{ type: String }],               // for select type
        required: { type: Boolean, default: false },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
