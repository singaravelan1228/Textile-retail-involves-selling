const mongoose = require('mongoose');

const receiptTemplateSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },    // e.g. "Standard Bill", "GST Invoice"
  isDefault:  { type: Boolean, default: false },               // only one can be true at a time
  layout:     { type: String, default: 'modern', enum: ['modern','classic','minimal'] },
  font:       { type: String, default: 'sans',   enum: ['sans','mono','serif'] },
  receiptWidth: { type: Number, default: 300, min: 220, max: 420 },

  // Show/hide fields
  showStoreName:     { type: Boolean, default: true  },
  showTagline:       { type: Boolean, default: true  },
  showAddress:       { type: Boolean, default: true  },
  showPhone:         { type: Boolean, default: true  },
  showEmail:         { type: Boolean, default: false },
  showWebsite:       { type: Boolean, default: false },
  showGST:           { type: Boolean, default: true  },
  showBillNumber:    { type: Boolean, default: true  },
  showDate:          { type: Boolean, default: true  },
  showCustomer:      { type: Boolean, default: true  },
  showCustomerPhone: { type: Boolean, default: true  },
  showRateQty:       { type: Boolean, default: true  }, // show ₹200/m × 3m = ₹600
  showGSTBreakdown:  { type: Boolean, default: true  }, // CGST + SGST separately
  showDiscount:      { type: Boolean, default: true  },
  showSavings:       { type: Boolean, default: false }, // "You saved ₹X"
  showPaymentMode:   { type: Boolean, default: true  },
  showThankYou:      { type: Boolean, default: true  },

  footerLine1: { type: String, default: 'Thank you for shopping with us!' },
  footerLine2: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ReceiptTemplate', receiptTemplateSchema);
