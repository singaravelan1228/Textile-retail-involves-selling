# TextilePOS v2 — Retail Textiles Billing System

> Production-grade MERN full-stack application with advanced UI, product photos, brand management, unique customer phone, live phone lookup, stock return/refund, and more.

---

## What's New in v2

| Feature | Details |
|---|---|
| **Premium dark sidebar UI** | Emerald green + slate dark theme, glassmorphism cards |
| **Product images** | Upload JPG/PNG photos, shown in POS grid & inventory |
| **Brand management** | Add brands inline while adding products, filter by brand |
| **Unique customer phone** | MongoDB enforces no duplicate phone numbers |
| **Live phone lookup** | Type phone in billing — auto-suggests existing customer |
| **New customer on the fly** | Add new customer from within the billing screen |
| **Stock return / refund** | Enter bill ID, select items & qty, stock refills automatically |
| **Table + Card view** | Inventory toggles between table list and visual card grid |
| **Search by category + brand** | Both filters work in POS and Inventory |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + React Router v6 + Recharts |
| Backend  | Node.js + Express.js + Multer (image upload) |
| Database | MongoDB + Mongoose |
| Auth     | JWT + bcryptjs |

---

## Project Structure

```
textilepos/
├── server/
│   ├── config/db.js
│   ├── controllers/       authController, productController,
│   │                      brandController, categoryController,
│   │                      customerController, billController,
│   │                      reportController
│   ├── middleware/        authMiddleware, errorHandler, upload (multer)
│   ├── models/            User, Category, Brand, Product, Customer, Bill
│   ├── routes/            auth, brands, categories, products,
│   │                      customers, bills, reports
│   ├── uploads/           product images stored here
│   ├── utils/generateBillNumber.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
└── client/
    └── src/
        ├── components/
        │   ├── common/     Badge, Loader, Modal
        │   ├── layout/     Sidebar, Topbar, Layout
        │   └── pages/      Login, Dashboard, Billing, Inventory,
        │                   Customers, Reports
        ├── context/        AuthContext, CartContext
        ├── hooks/          useDebounce
        ├── services/api.js
        ├── index.css       (full design system)
        └── App.jsx
```

---

## Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
mkdir uploads          # image storage folder
npm run seed           # loads demo data
npm run dev            # starts on :5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev            # starts on :5173
```

### 3. Open app
```
http://localhost:5173
```

---

## Login Credentials (after seed)

| Role    | Email                   | Password  |
|---------|-------------------------|-----------|
| Admin   | admin@textilepos.com    | Admin@123 |
| Cashier | cashier@textilepos.com  | Cash@123  |

---

## API Reference

### Auth
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/auth/login       | Public  |
| GET    | /api/auth/me          | Private |

### Products
| Method | Endpoint                    | Access |
|--------|-----------------------------|--------|
| GET    | /api/products?search=&category=&brand=&lowStock= | Private |
| POST   | /api/products               | Admin  |
| PUT    | /api/products/:id           | Admin  |
| PUT    | /api/products/:id/restock   | Admin  |
| DELETE | /api/products/:id           | Admin  |

### Brands
| Method | Endpoint        | Access |
|--------|-----------------|--------|
| GET    | /api/brands     | Private |
| POST   | /api/brands     | Admin  |
| PUT    | /api/brands/:id | Admin  |

### Bills
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| GET    | /api/bills/lookup-phone?phone= | Private |
| GET    | /api/bills                  | Private |
| POST   | /api/bills                  | Private |
| POST   | /api/bills/:id/return       | Private |
| PUT    | /api/bills/:id/payment      | Private |

### Reports
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| GET    | /api/reports/dashboard      | Private |
| GET    | /api/reports/monthly        | Private |
| GET    | /api/reports/gst?year=&month= | Private |
| GET    | /api/reports/top-products   | Private |

---

## .env Configuration

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/textilepos
JWT_SECRET=change_this_to_something_long_and_random
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## Key Business Rules

- Product images stored in `server/uploads/`, served at `/uploads/filename`
- Customer phone is UNIQUE — duplicate phones rejected at DB level
- Bill generation deducts stock automatically
- Returns add stock back to the product automatically
- JWT is stateless — logged-in status tracked via token in browser localStorage
- Low stock = stock ≤ reorderLevel (virtual field on Product model)
- Bill numbering format: `BL-YYYYMM-NNNN` (auto-generated)

---

## License
MIT — Free to use and modify for commercial and personal projects.
