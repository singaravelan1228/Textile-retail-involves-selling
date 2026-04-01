const PurchaseEntry = require('../models/PurchaseEntry');
const Product       = require('../models/Product');
const mongoose      = require('mongoose');

/* helper: calculate totals */
const calcTotals = (items, d1, d2, gst) => {
  const gross    = items.reduce((s, i) => s + i.purchaseRate * i.qty, 0);
  const d1amt    = gross * d1 / 100;
  const afterD1  = gross - d1amt;
  const d2amt    = afterD1 * d2 / 100;
  const taxable  = afterD1 - d2amt;
  const gstAmt   = taxable * gst / 100;
  const net      = taxable + gstAmt;
  return {
    grossAmount:   +gross.toFixed(2),
    discount1Amt:  +d1amt.toFixed(2),
    discount2Amt:  +d2amt.toFixed(2),
    taxableAmount: +taxable.toFixed(2),
    gstAmount:     +gstAmt.toFixed(2),
    cgst:          +(gstAmt / 2).toFixed(2),
    sgst:          +(gstAmt / 2).toFixed(2),
    netAmount:     +net.toFixed(2),
  };
};

/* GET /api/purchase-entries */
const getPurchaseEntries = async (req, res, next) => {
  try {
    const { from, to, supplier, status, limit = 25, page = 1 } = req.query;
    const filter = {};
    if (from)     filter.invoiceDate = { ...filter.invoiceDate, $gte: new Date(from) };
    if (to)       filter.invoiceDate = { ...filter.invoiceDate, $lte: new Date(to + 'T23:59:59') };
    if (supplier) filter.supplierName = { $regex: supplier, $options: 'i' };
    if (status)   filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await PurchaseEntry.countDocuments(filter);
    const entries = await PurchaseEntry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name');

    res.json({ success: true, total, page: Number(page), limit: Number(limit), data: entries });
  } catch(err) { next(err); }
};

/* GET /api/purchase-entries/:id */
const getPurchaseEntry = async (req, res, next) => {
  try {
    const entry = await PurchaseEntry.findById(req.params.id).populate('supplier').populate('items.product');
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch(err) { next(err); }
};

/* POST /api/purchase-entries */
const createPurchaseEntry = async (req, res, next) => {
  try {
    const { items = [], discount1Pct = 0, discount2Pct = 0, gstPct = 5, status = 'draft' } = req.body;

    // Compute line totals
    const enrichedItems = items.map(i => ({
      ...i,
      totalAmount: +(i.purchaseRate * i.qty).toFixed(2),
    }));

    const totals = calcTotals(enrichedItems, discount1Pct, discount2Pct, gstPct);

    const entry = await PurchaseEntry.create({
      ...req.body,
      items: enrichedItems,
      ...totals,
      createdBy: req.user._id,
    });

    // If saved immediately, update stock
    if (status === 'saved') {
      await updateStock(enrichedItems);
      entry.stockUpdated = true;
      await entry.save();
    }

    res.status(201).json({ success: true, data: entry });
  } catch(err) { next(err); }
};

/* PUT /api/purchase-entries/:id */
const updatePurchaseEntry = async (req, res, next) => {
  try {
    const existing = await PurchaseEntry.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Entry not found' });

    const { items = [], discount1Pct = 0, discount2Pct = 0, gstPct = 5, status } = req.body;
    const enrichedItems = items.map(i => ({ ...i, totalAmount: +(i.purchaseRate * i.qty).toFixed(2) }));
    const totals = calcTotals(enrichedItems, discount1Pct, discount2Pct, gstPct);

    Object.assign(existing, { ...req.body, items: enrichedItems, ...totals });

    // If transitioning from draft → saved, update stock once
    if (status === 'saved' && !existing.stockUpdated) {
      await updateStock(enrichedItems);
      existing.stockUpdated = true;
    }

    await existing.save();
    res.json({ success: true, data: existing });
  } catch(err) { next(err); }
};

/* DELETE /api/purchase-entries/:id (only drafts) */
const deletePurchaseEntry = async (req, res, next) => {
  try {
    const entry = await PurchaseEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    if (entry.status === 'saved') return res.status(400).json({ success: false, message: 'Cannot delete a saved entry. Stock has already been updated.' });
    await entry.deleteOne();
    res.json({ success: true, message: 'Draft deleted' });
  } catch(err) { next(err); }
};

/* Helper — update product stock */
async function updateStock(items) {
  for (const item of items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }
}

/* GET /api/purchase-entries/stats — summary metrics */
const getPurchaseStats = async (req, res, next) => {
  try {
    const [totals, draftCount, thisMonth] = await Promise.all([
      PurchaseEntry.aggregate([
        { $match: { status: 'saved' } },
        { $group: { _id: null, total: { $sum: '$netAmount' }, count: { $sum: 1 } } },
      ]),
      PurchaseEntry.countDocuments({ status: 'draft' }),
      PurchaseEntry.aggregate([
        {
          $match: {
            status: 'saved',
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
        { $group: { _id: null, total: { $sum: '$netAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalPurchases:    totals[0]?.total || 0,
        savedEntries:      totals[0]?.count || 0,
        draftEntries:      draftCount,
        thisMonthPurchases:thisMonth[0]?.total || 0,
        thisMonthEntries:  thisMonth[0]?.count || 0,
      },
    });
  } catch(err) { next(err); }
};

module.exports = {
  getPurchaseEntries, getPurchaseEntry, createPurchaseEntry,
  updatePurchaseEntry, deletePurchaseEntry, getPurchaseStats,
};
