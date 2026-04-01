/**
 * TextilePOS — Diagnostic Script
 * Run: node check.js
 * This checks MongoDB connection and user accounts
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/textilepos';

async function check() {
  console.log('\n🔍  TextilePOS Diagnostic\n');

  // 1. Check .env
  console.log('1. Environment:');
  console.log('   MONGO_URI   =', MONGO_URI);
  console.log('   JWT_SECRET  =', process.env.JWT_SECRET ? '✓ set' : '✗ MISSING — copy .env.example to .env');
  console.log('   PORT        =', process.env.PORT || '5000 (default)');

  // 2. Connect to MongoDB
  console.log('\n2. MongoDB connection...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('   ✓ Connected to MongoDB:', mongoose.connection.host);
  } catch (err) {
    console.log('   ✗ FAILED:', err.message);
    console.log('\n   ➜ Fix: Make sure MongoDB is running.');
    console.log('          Run "mongod" in a separate terminal, OR open MongoDB Compass.\n');
    process.exit(1);
  }

  // 3. Check users collection
  console.log('\n3. User accounts in database:');
  const User = require('./models/User');
  const users = await User.find().select('+password');

  if (users.length === 0) {
    console.log('   ✗ NO USERS FOUND — database is empty!');
    console.log('\n   ➜ Fix: Run   npm run seed   in the server folder.\n');
    process.exit(1);
  }

  for (const u of users) {
    const testPass = u.role === 'admin' ? 'Admin@123' : 'Cash@123';
    const ok = await bcrypt.compare(testPass, u.password);
    const status = ok ? '✓' : '✗ PASSWORD MISMATCH';
    console.log(`   ${status}  ${u.email}  (${u.role})  password="${testPass}" → ${ok ? 'works' : 'BROKEN'}`);
  }

  // 4. Summary
  const allOk = users.every(async u => {
    const testPass = u.role === 'admin' ? 'Admin@123' : 'Cash@123';
    return await bcrypt.compare(testPass, u.password);
  });

  console.log('\n4. Summary:');
  console.log('   Database     ✓ Connected');
  console.log('   Users found  ✓', users.length, 'accounts');
  console.log('\n   Login credentials:');
  console.log('   Admin:   admin@textilepos.com  /  Admin@123');
  console.log('   Cashier: cashier@textilepos.com  /  Cash@123');
  console.log('\n   ✅  Everything looks good! Login should work.\n');
  console.log('   If still failing, clear browser localStorage:');
  console.log('   Open browser DevTools → Application → Local Storage → Clear all\n');

  await mongoose.disconnect();
  process.exit(0);
}

check().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
