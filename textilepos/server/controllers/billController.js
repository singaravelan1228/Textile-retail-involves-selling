const Bill     = require('../models/Bill');
const Product  = require('../models/Product');
const Customer = require('../models/Customer');
const generateBillNumber = require('../utils/generateBillNumber');

const getBills = async (req, res, next) => {
  try {
    const { from, to, paymentStatus, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   { const end = new Date(to); end.setHours(23,59,59,999); filter.createdAt.$lte = end; }
    }
    if (search) filter.$or = [
      { billNumber:   { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
    const total = await Bill.countDocuments(filter);
    const bills = await Bill.find(filter)
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ success: true, count: total, page: parseInt(page), data: bills });
  } catch(err) { next(err); }
};

const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer', 'name phone email address gstNumber')
      .populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch(err) { next(err); }
};

const createBill = async (req, res, next) => {
  try {
    const { customerId, items, discountPct = 0, paymentMethod = 'Cash', paymentStatus = 'Paid', notes } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ success: false, message: 'Bill must have at least one item' });

    const resolvedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).populate('category', 'name');
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (available: ${product.stock})` });
      resolvedItems.push({
        product: product._id, productName: product.name, productCode: product.code,
        category: product.category?.name || '', quantity: item.quantity, unit: product.unit,
        pricePerUnit: product.pricePerUnit, gstRate: product.gstRate, amount: item.quantity * product.pricePerUnit,
      });
    }

    const subtotal    = resolvedItems.reduce((s,i) => s + i.amount, 0);
    const gstAmount   = resolvedItems.reduce((s,i) => s + (i.amount * i.gstRate) / 100, 0);
    const discountAmt = ((subtotal + gstAmount) * discountPct) / 100;
    const total       = subtotal + gstAmount - discountAmt;

    let customerName = 'Walk-in Customer', customerPhone = '';
    if (customerId) {
      const cust = await Customer.findById(customerId);
      if (cust) { customerName = cust.name; customerPhone = cust.phone; }
    }

    const bill = await Bill.create({
      billNumber: await generateBillNumber(),
      customer: customerId || null, customerName, customerPhone,
      items: resolvedItems,
      subtotal: Math.round(subtotal*100)/100,
      gstAmount: Math.round(gstAmount*100)/100,
      discountPct, discountAmt: Math.round(discountAmt*100)/100,
      total: Math.round(total*100)/100,
      paidAmount: paymentStatus === 'Paid' ? Math.round(total*100)/100 : 0,
      paymentMethod, paymentStatus, notes, createdBy: req.user._id,
    });

    // Deduct stock
    for (const item of resolvedItems)
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });

    // Update customer stats
    if (customerId)
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalPurchases: 1, totalSpent: bill.total, balance: paymentStatus === 'Pending' ? bill.total : 0 },
      });

    const populated = await bill.populate([{ path:'customer', select:'name phone' }, { path:'createdBy', select:'name' }]);
    res.status(201).json({ success: true, data: populated });
  } catch(err) { next(err); }
};

const updatePayment = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod, paidAmount } = req.body;
    const bill = await Bill.findByIdAndUpdate(req.params.id, { paymentStatus, paymentMethod, paidAmount }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch(err) { next(err); }
};

// Return items — adds stock back to product
const returnItems = async (req, res, next) => {
  try {
    const { items, reason } = req.body; // items: [{ productId, productName, quantity }]
    if (!items || !items.length)
      return res.status(400).json({ success: false, message: 'No items specified for return' });

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const returned = [];
    for (const ri of items) {
      const billItem = bill.items.find(i => i.product.toString() === ri.productId);
      if (!billItem)
        return res.status(400).json({ success: false, message: `Item ${ri.productName} not found in this bill` });
      if (ri.quantity > billItem.quantity)
        return res.status(400).json({ success: false, message: `Return qty (${ri.quantity}) exceeds billed qty (${billItem.quantity})` });

      await Product.findByIdAndUpdate(ri.productId, { $inc: { stock: ri.quantity } });
      const refundAmount = Math.round(ri.quantity * billItem.pricePerUnit * 100) / 100;
      returned.push({ ...ri, refundAmount });
    }

    const totalRefund = returned.reduce((s,i) => s + i.refundAmount, 0);

    // Mark note on bill
    bill.notes = (bill.notes || '') + ` | RETURN: ${reason || 'Customer return'} — ₹${totalRefund} refunded`;
    await bill.save();

    res.json({
      success: true,
      message: `${returned.length} item(s) returned. Total refund: ₹${totalRefund}`,
      data: { returned, totalRefund },
    });
  } catch(err) { next(err); }
};

module.exports = { getBills, getBill, createBill, updatePayment, returnItems };
