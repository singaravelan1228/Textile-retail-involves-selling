const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Helper: start and end of today
const todayRange = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Dashboard summary metrics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const { start, end } = todayRange();

    const [todayBills, totalProducts, lowStockCount, totalCustomers, recentBills] = await Promise.all([
      Bill.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalSales: { $sum: '$total' }, count: { $sum: 1 }, itemsSold: { $sum: { $sum: '$items.quantity' } } } },
      ]),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$reorderLevel'] } }),
      Customer.countDocuments({ isActive: true }),
      Bill.find({ createdAt: { $gte: start, $lte: end } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'name')
        .select('billNumber customerName total paymentMethod paymentStatus createdAt items'),
    ]);

    const metrics = todayBills[0] || { totalSales: 0, count: 0, itemsSold: 0 };

    // Weekly sales (last 7 days)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0);
    const weeklySales = await Bill.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top categories today
    const topCategories = await Bill.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: '$items.amount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        todaySales: Math.round(metrics.totalSales),
        todayBillCount: metrics.count,
        todayItemsSold: Math.round(metrics.itemsSold),
        lowStockCount,
        totalProducts,
        totalCustomers,
        weeklySales,
        topCategories,
        recentBills,
      },
    });
  } catch (err) { next(err); }
};

// @desc    Monthly revenue for last 12 months
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyRevenue = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date(); twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); twelveMonthsAgo.setDate(1); twelveMonthsAgo.setHours(0, 0, 0, 0);
    const data = await Bill.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, bills: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// @desc    GST summary for a given month
// @route   GET /api/reports/gst?year=2026&month=3
// @access  Private
const getGSTSummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);

    const data = await Bill.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, taxableAmount: { $sum: '$subtotal' }, totalGST: { $sum: '$gstAmount' }, totalBills: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
    ]);
    const summary = data[0] || { taxableAmount: 0, totalGST: 0, totalBills: 0, totalRevenue: 0 };
    res.json({
      success: true,
      data: {
        ...summary,
        cgst: Math.round((summary.totalGST / 2) * 100) / 100,
        sgst: Math.round((summary.totalGST / 2) * 100) / 100,
        month, year,
      },
    });
  } catch (err) { next(err); }
};

// @desc    Top selling products
// @route   GET /api/reports/top-products?from=&to=&limit=10
// @access  Private
const getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setDate(1));
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const data = await Bill.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $unwind: '$items' },
      { $group: { _id: { product: '$items.product', name: '$items.productName', category: '$items.category' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.amount' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getMonthlyRevenue, getGSTSummary, getTopProducts };
