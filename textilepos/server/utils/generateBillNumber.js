const Bill = require('../models/Bill');

const generateBillNumber = async () => {
  const today = new Date();
  const prefix = `BL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  const last = await Bill.findOne({ billNumber: new RegExp(`^${prefix}`) }).sort({ billNumber: -1 });
  if (!last) return `${prefix}-0001`;
  const lastSeq = parseInt(last.billNumber.split('-').pop(), 10);
  return `${prefix}-${String(lastSeq + 1).padStart(4, '0')}`;
};

module.exports = generateBillNumber;
