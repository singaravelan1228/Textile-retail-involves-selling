require('dotenv').config();
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const connectDB  = require('./config/db');

const User     = require('./models/User');
const Category = require('./models/Category');
const Brand    = require('./models/Brand');
const Product  = require('./models/Product');
const Customer = require('./models/Customer');
const Bill     = require('./models/Bill');
const Settings = require('./models/Settings');
const ReceiptTemplate = require('./models/ReceiptTemplate');
const Supplier        = require('./models/Supplier');
const PurchaseEntry   = require('./models/PurchaseEntry');

const seed = async () => {
  await connectDB();
  console.log('🌱  Seeding TextilePOS v2 database…\n');

  await Promise.all([User.deleteMany(), Category.deleteMany(), Brand.deleteMany(),
                     Product.deleteMany(), Customer.deleteMany(), Bill.deleteMany(), Settings.deleteMany(), ReceiptTemplate.deleteMany(),
                     Supplier.deleteMany(), PurchaseEntry.deleteMany()]);
  console.log('✓  Cleared all collections');

  // ── Users ──────────────────────────────────────────────
  const users = await User.insertMany([
    { name:'Admin User',   email:'admin@textilepos.com',   password:await bcrypt.hash('Admin@123',10), role:'admin' },
    { name:'Cashier Ravi', email:'cashier@textilepos.com', password:await bcrypt.hash('Cash@123',10),  role:'cashier' },
  ]);
  console.log('✓  2 Users created');

  // ── Categories ─────────────────────────────────────────
  const cats = await Category.insertMany([
    { name:'Cotton',    description:'Cotton fabrics',    color:'#10B981' },
    { name:'Silk',      description:'Silk fabrics',      color:'#EF4444' },
    { name:'Synthetic', description:'Synthetic fabrics', color:'#8B5CF6' },
    { name:'Linen',     description:'Linen fabrics',     color:'#F59E0B' },
    { name:'Woolen',    description:'Woolen fabrics',    color:'#3B82F6' },
  ]);
  const [cotton, silk, synthetic, linen, woolen] = cats;
  console.log('✓  5 Categories created');

  // ── Brands ─────────────────────────────────────────────
  const brands = await Brand.insertMany([
    { name:'Arvind Mills'   },
    { name:'Bombay Dyeing'  },
    { name:'Raymond'        },
    { name:'Mafatlal'       },
    { name:'OCM'            },
    { name:'Generic'        },
  ]);
  const [arvind, bombay, raymond, mafatlal, ocm, generic] = brands;
  console.log('✓  6 Brands created');

  // ── Products ───────────────────────────────────────────
  const products = await Product.insertMany([
    { code:'CTN-001', name:'Khadi Cotton',    category:cotton._id,    brand:generic._id,  pricePerUnit:80,  stock:240, reorderLevel:30, swatchColor:'#D1FAE5', gstRate:5 },
    { code:'CTN-002', name:'Cambric White',   category:cotton._id,    brand:arvind._id,   pricePerUnit:55,  stock:310, reorderLevel:40, swatchColor:'#F1F5F9', gstRate:5 },
    { code:'CTN-003', name:'Poplin Stripe',   category:cotton._id,    brand:bombay._id,   pricePerUnit:65,  stock:200, reorderLevel:30, swatchColor:'#BFDBFE', gstRate:5 },
    { code:'CTN-004', name:'Cotton Voile',    category:cotton._id,    brand:generic._id,  pricePerUnit:70,  stock:18,  reorderLevel:30, swatchColor:'#CFFAFE', gstRate:5 },
    { code:'SLK-001', name:'Kanjivaram Silk', category:silk._id,      brand:generic._id,  pricePerUnit:200, stock:45,  reorderLevel:15, swatchColor:'#FCA5A5', gstRate:12 },
    { code:'SLK-002', name:'Banarasi Silk',   category:silk._id,      brand:generic._id,  pricePerUnit:350, stock:28,  reorderLevel:10, swatchColor:'#FBCFE8', gstRate:12 },
    { code:'SLK-003', name:'Crepe Silk',      category:silk._id,      brand:raymond._id,  pricePerUnit:160, stock:12,  reorderLevel:15, swatchColor:'#DDD6FE', gstRate:12 },
    { code:'SYN-001', name:'Georgette Print', category:synthetic._id, brand:bombay._id,   pricePerUnit:70,  stock:180, reorderLevel:30, swatchColor:'#A5B4FC', gstRate:5 },
    { code:'SYN-002', name:'Chiffon Solid',   category:synthetic._id, brand:generic._id,  pricePerUnit:60,  stock:15,  reorderLevel:25, swatchColor:'#BAE6FD', gstRate:5 },
    { code:'SYN-003', name:'Polyester Satin', category:synthetic._id, brand:arvind._id,   pricePerUnit:75,  stock:130, reorderLevel:25, swatchColor:'#C7D2FE', gstRate:5 },
    { code:'LIN-001', name:'Pure Linen',      category:linen._id,     brand:mafatlal._id, pricePerUnit:120, stock:90,  reorderLevel:20, swatchColor:'#FEF3C7', gstRate:5 },
    { code:'LIN-002', name:'Belgium Linen',   category:linen._id,     brand:ocm._id,      pricePerUnit:180, stock:60,  reorderLevel:15, swatchColor:'#FDE68A', gstRate:5 },
    { code:'WOL-001', name:'Merino Wool',     category:woolen._id,    brand:raymond._id,  pricePerUnit:300, stock:8,   reorderLevel:10, swatchColor:'#DDD6FE', gstRate:12 },
    { code:'WOL-002', name:'Cashmere Blend',  category:woolen._id,    brand:ocm._id,      pricePerUnit:450, stock:5,   reorderLevel:8,  swatchColor:'#FECDD3', gstRate:12 },
  ]);
  console.log(`✓  ${products.length} Products created`);

  // ── Customers (unique phones) ───────────────────────────
  const customers = await Customer.insertMany([
    { name:'Priya Sundaram',   phone:'9876543210', email:'priya@gmail.com',    type:'retail',    totalPurchases:28, totalSpent:87400,  balance:0 },
    { name:'Meena Rajan',      phone:'9345678901', email:'meena@gmail.com',    type:'retail',    totalPurchases:15, totalSpent:54200,  balance:0 },
    { name:'Lakshmi Traders',  phone:'9012345678', email:'lakshmi@traders.in', type:'wholesale', totalPurchases:6,  totalSpent:182400, balance:18400, gstNumber:'33AABL1234Z1ZV' },
    { name:'Valli Krishnan',   phone:'8765432109', type:'retail',    totalPurchases:9,  totalSpent:31600, balance:0 },
    { name:'Rani Devi',        phone:'7654321098', type:'retail',    totalPurchases:6,  totalSpent:19800, balance:0 },
    { name:'Saraswathi Mills', phone:'8123456789', email:'sara@mills.in',      type:'wholesale', totalPurchases:4,  totalSpent:96000,  balance:0, gstNumber:'33AABS5678Z1ZV' },
  ]);
  console.log(`✓  ${customers.length} Customers created`);

  // ── Suppliers ──────────────────────────────────────
  await Supplier.insertMany([
    { name:'Kala Niketan Mills',     code:'KNM-001', gstin:'33AAACK1234A1ZX', phone:'9800001111', city:'Coimbatore', state:'Tamil Nadu',  paymentTerms:'Net 30' },
    { name:'Sri Ram Textiles',       code:'SRT-002', gstin:'29AAACS5678B1ZY', phone:'9800002222', city:'Bengaluru',  state:'Karnataka',   paymentTerms:'Net 45' },
    { name:'Bombay Fabric House',    code:'BFH-003', gstin:'27AAACB8765C1ZZ', phone:'9800003333', city:'Mumbai',     state:'Maharashtra', paymentTerms:'Immediate' },
    { name:'Tirupur Jasmine Traders',code:'TJT-004', gstin:'33AAACT4321D1ZW', phone:'9800004444', city:'Tirupur',   state:'Tamil Nadu',  paymentTerms:'Net 30' },
    { name:'Coimbatore Cotton Co.',  code:'CCC-005', gstin:'33AAACE7890E1ZV', phone:'9800005555', city:'Coimbatore',state:'Tamil Nadu',  paymentTerms:'Net 60' },
    { name:'Ahmedabad Silk Depot',   code:'ASD-006', gstin:'24AAACA1111F1ZU', phone:'9800006666', city:'Ahmedabad', state:'Gujarat',     paymentTerms:'Net 30' },
  ]);
  console.log('\u2713  6 Suppliers created');

  // ── Default Settings ────────────────────────────────
  await Settings.create({
    companyName: 'Sri Textile Store',
    tagline: 'Quality Fabrics Since 2000',
    address: 'No. 12, Market Street',
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    pincode: '627001',
    phone: '9876543210',
    email: 'info@sritextile.com',
    gstNumber: '33AASTS1234Z1ZV',
    cgstRate: 2.5,
    sgstRate: 2.5,
  });
  console.log('✓  Default settings created');

  // ── Receipt Templates ─────────────────────────────────
  await ReceiptTemplate.create([
    {
      name: 'Standard Bill',
      isDefault: true,
      layout: 'modern',
      font: 'sans',
      receiptWidth: 300,
      showStoreName: true, showTagline: true, showAddress: true,
      showPhone: true, showGST: true, showBillNumber: true, showDate: true,
      showCustomer: true, showCustomerPhone: true,
      showRateQty: true, showGSTBreakdown: true, showDiscount: true,
      showPaymentMode: true, showThankYou: true,
      footerLine1: 'Thank you for shopping with us!',
      footerLine2: '',
    },
    {
      name: 'GST Invoice',
      isDefault: false,
      layout: 'classic',
      font: 'sans',
      receiptWidth: 340,
      showStoreName: true, showTagline: false, showAddress: true,
      showPhone: true, showEmail: true, showGST: true,
      showBillNumber: true, showDate: true,
      showCustomer: true, showCustomerPhone: true,
      showRateQty: true, showGSTBreakdown: true, showDiscount: true,
      showPaymentMode: true, showThankYou: true,
      footerLine1: 'GST Invoice — goods once sold will not be taken back.',
      footerLine2: 'For queries: call us on the number above.',
    },
  ]);
  console.log('✓  2 Receipt templates created');

  // ── Sample Bills ───────────────────────────────────────
  const [admin, cashier] = users;
  const daysAgo = n => { const d=new Date(); d.setDate(d.getDate()-n); return d; };

  await Bill.insertMany([
    {
      billNumber:'BL-202603-0001', customer:customers[0]._id, customerName:customers[0].name, customerPhone:customers[0].phone,
      items:[
        { product:products[0]._id, productName:'Khadi Cotton',    productCode:'CTN-001', category:'Cotton', brand:'Generic',      quantity:5, unit:'meter', pricePerUnit:80,  gstRate:5,  amount:400 },
        { product:products[4]._id, productName:'Kanjivaram Silk', productCode:'SLK-001', category:'Silk',   brand:'Generic',      quantity:2, unit:'meter', pricePerUnit:200, gstRate:12, amount:400 },
      ],
      subtotal:800, gstAmount:68, discountPct:0, discountAmt:0, total:868, paidAmount:868,
      paymentMethod:'UPI', paymentStatus:'Paid', createdBy:cashier._id, createdAt:daysAgo(1),
    },
    {
      billNumber:'BL-202603-0002', customerName:'Walk-in Customer',
      items:[
        { product:products[1]._id, productName:'Cambric White', productCode:'CTN-002', category:'Cotton', brand:'Arvind Mills', quantity:3, unit:'meter', pricePerUnit:55, gstRate:5, amount:165 },
      ],
      subtotal:165, gstAmount:8.25, discountPct:0, discountAmt:0, total:173.25, paidAmount:173.25,
      paymentMethod:'Cash', paymentStatus:'Paid', createdBy:cashier._id, createdAt:daysAgo(1),
    },
    {
      billNumber:'BL-202603-0003', customer:customers[1]._id, customerName:customers[1].name, customerPhone:customers[1].phone,
      items:[
        { product:products[5]._id, productName:'Banarasi Silk', productCode:'SLK-002', category:'Silk',  brand:'Generic',     quantity:4, unit:'meter', pricePerUnit:350, gstRate:12, amount:1400 },
        { product:products[10]._id,productName:'Pure Linen',    productCode:'LIN-001', category:'Linen', brand:'Mafatlal',    quantity:6, unit:'meter', pricePerUnit:120, gstRate:5,  amount:720 },
      ],
      subtotal:2120, gstAmount:204, discountPct:5, discountAmt:116.2, total:2207.8, paidAmount:2207.8,
      paymentMethod:'Card', paymentStatus:'Paid', createdBy:cashier._id, createdAt:daysAgo(2),
    },
    {
      billNumber:'BL-202603-0004', customer:customers[2]._id, customerName:customers[2].name, customerPhone:customers[2].phone,
      items:[
        { product:products[0]._id, productName:'Khadi Cotton',    productCode:'CTN-001', category:'Cotton',    brand:'Generic',   quantity:50, unit:'meter', pricePerUnit:80, gstRate:5, amount:4000 },
        { product:products[7]._id, productName:'Georgette Print', productCode:'SYN-001', category:'Synthetic', brand:'Bombay Dyeing', quantity:40, unit:'meter', pricePerUnit:70, gstRate:5, amount:2800 },
      ],
      subtotal:6800, gstAmount:340, discountPct:10, discountAmt:714, total:6426, paidAmount:0,
      paymentMethod:'NEFT', paymentStatus:'Pending', createdBy:admin._id, createdAt:daysAgo(3),
    },
    {
      billNumber:'BL-202602-0010', customer:customers[0]._id, customerName:customers[0].name, customerPhone:customers[0].phone,
      items:[
        { product:products[4]._id, productName:'Kanjivaram Silk', productCode:'SLK-001', category:'Silk', brand:'Generic', quantity:6, unit:'meter', pricePerUnit:200, gstRate:12, amount:1200 },
      ],
      subtotal:1200, gstAmount:144, discountPct:0, discountAmt:0, total:1344, paidAmount:1344,
      paymentMethod:'UPI', paymentStatus:'Paid', createdBy:cashier._id, createdAt:daysAgo(20),
    },
  ]);
  console.log('✓  5 Sample bills created');

  console.log('\n✅  Seed complete!\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  TextilePOS v2 — Login Credentials       ║');
  console.log('║  Admin:   admin@textilepos.com           ║');
  console.log('║  Pass:    Admin@123                      ║');
  console.log('║                                          ║');
  console.log('║  Cashier: cashier@textilepos.com         ║');
  console.log('║  Pass:    Cash@123                       ║');
  console.log('╚══════════════════════════════════════════╝\n');
  process.exit(0);
};

seed().catch(err=>{ console.error(err); process.exit(1); });
