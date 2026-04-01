const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const dotenv     = require('dotenv');
const path       = require('path');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
const IS_ELECTRON = process.env.ELECTRON === 'true';

// When running inside Electron, allow localhost only
app.use(cors({
  origin: IS_ELECTRON ? ['http://localhost:5000','http://localhost:5173'] : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/products',         require('./routes/products'));
app.use('/api/categories',       require('./routes/categories'));
app.use('/api/brands',           require('./routes/brands'));
app.use('/api/customers',        require('./routes/customers'));
app.use('/api/bills',            require('./routes/bills'));
app.use('/api/reports',          require('./routes/reports'));
app.use('/api/settings',         require('./routes/settings'));
app.use('/api/receipt-templates',require('./routes/receiptTemplates'));
app.use('/api/offers',            require('./routes/offers'));
app.use('/api/suppliers',         require('./routes/suppliers'));
app.use('/api/purchase-entries',  require('./routes/purchaseEntries'));
app.use('/api/held-bills',       require('./routes/heldBills'));

app.get('/api/health', (req, res) => res.json({ status:'OK', app:'TextilePOS v2', electron: IS_ELECTRON }));

// ── Serve built React app (Electron production mode) ──────
if (IS_ELECTRON) {
  const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
  const fs = require('fs');

  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    // All non-API routes → React
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(CLIENT_DIST, 'index.html'));
      }
    });
  } else {
    app.get('/', (req, res) => res.send('<h2>Build the client first: cd client && npm run build</h2>'));
  }
} else {
  app.use((req, res) => res.status(404).json({ success:false, message:'Route not found' }));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '127.0.0.1', () =>
  console.log(`TextilePOS v2 running on port ${PORT} [${IS_ELECTRON ? 'Electron' : 'Dev'}]`)
);
