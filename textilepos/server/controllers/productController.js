const Product = require('../models/Product');
const path    = require('path');
const fs      = require('fs');

const getProducts = async (req, res, next) => {
  try {
    const { category, brand, search, lowStock, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (brand)    filter.brand    = brand;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    else filter.isActive = true;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
    const products = await Product.find(filter)
      .populate('category', 'name color')
      .populate('brand', 'name')
      .sort({ name: 1 });
    const result = lowStock === 'true' ? products.filter(p => p.isLowStock) : products;
    res.json({ success: true, count: result.length, data: result });
  } catch(err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name color')
      .populate('brand', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch(err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/products/${req.file.filename}`;
    const product  = await Product.create(data);
    const populated = await product.populate([
      { path: 'category', select: 'name color' },
      { path: 'brand',    select: 'name' },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch(err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Remove old image file
      const old = await Product.findById(req.params.id);
      if (old?.imageUrl) {
        const oldPath = path.join(__dirname, '..', old.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.imageUrl = `/uploads/products/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('category', 'name color')
      .populate('brand', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch(err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated' });
  } catch(err) { next(err); }
};

const restockProduct = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const previousStock = product.stock;
    product.stock += Number(quantity);
    await product.save();
    const populated = await product.populate([
      { path: 'category', select: 'name color' },
      { path: 'brand',    select: 'name' },
    ]);
    res.json({
      success: true,
      message: `Restocked ${quantity} ${product.unit}s. ${previousStock} → ${product.stock}`,
      data: populated,
    });
  } catch(err) { next(err); }
};



// GET /api/products/:id/qr  — return QR code as SVG data URL
const QRCode = require('qrcode');

const getProductQR = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // QR encodes the product code — unique, scannable, human-readable
    const qrData = JSON.stringify({ code: product.code, id: product._id });
    const svg    = await QRCode.toString(qrData, { type: 'svg', width: 200, margin: 1 });

    res.json({ success: true, data: { svg, code: product.code, productId: product._id } });
  } catch(err) { next(err); }
};

// GET /api/products/by-code/:code  — lookup product by QR code value
const getProductByCode = async (req, res, next) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const product = await Product.findOne({ code, isActive: true })
      .populate('category', 'name color')
      .populate('brand', 'name');
    if (!product) return res.status(404).json({ success: false, message: `Product "${code}" not found` });

    // Include active offers
    const Offer = require('../models/Offer');
    const offers = await Offer.find({
      product: product._id,
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
    });

    res.json({ success: true, data: { ...product.toJSON(), offers } });
  } catch(err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, restockProduct, getProductQR, getProductByCode };
