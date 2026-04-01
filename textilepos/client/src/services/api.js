import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login        = (d)      => api.post('/auth/login', d);
export const getMe        = ()       => api.get('/auth/me');
export const getUsers     = ()       => api.get('/auth/users');
export const createUser   = (d)      => api.post('/auth/users', d);
export const updateUser   = (id,d)   => api.put(`/auth/users/${id}`, d);

// Categories
export const getCategories  = ()     => api.get('/categories');
export const createCategory = (d)    => api.post('/categories', d);
export const updateCategory = (id,d) => api.put(`/categories/${id}`, d);
export const deleteCategory = (id)   => api.delete(`/categories/${id}`);

// Brands
export const getBrands    = ()      => api.get('/brands');
export const createBrand  = (d)     => api.post('/brands', d);
export const updateBrand  = (id,d)  => api.put(`/brands/${id}`, d);
export const deleteBrand  = (id)    => api.delete(`/brands/${id}`);

// Products (multipart/form-data for image)
export const getProducts   = (params) => api.get('/products', { params });
export const getProduct    = (id)     => api.get(`/products/${id}`);
export const createProduct = (fd)     => api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id,fd)  => api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const restockProduct= (id,d)   => api.put(`/products/${id}/restock`, d);
export const deleteProduct = (id)     => api.delete(`/products/${id}`);

// Customers
export const checkPhone     = (phone) => api.get('/customers/check-phone', { params: { phone } });
export const getCustomers   = (p)     => api.get('/customers', { params: p });
export const getCustomer    = (id)    => api.get(`/customers/${id}`);
export const createCustomer = (d)     => api.post('/customers', d);
export const updateCustomer = (id,d)  => api.put(`/customers/${id}`, d);
export const deleteCustomer = (id)    => api.delete(`/customers/${id}`);

// Bills
export const getBills       = (p)     => api.get('/bills', { params: p });
export const getBill        = (id)    => api.get(`/bills/${id}`);
export const createBill     = (d)     => api.post('/bills', d);
export const updatePayment  = (id,d)  => api.put(`/bills/${id}/payment`, d);
export const returnItems    = (id,d)  => api.post(`/bills/${id}/return-items`, d);

// Reports
export const getDashboard   = ()      => api.get('/reports/dashboard');
export const getMonthly     = ()      => api.get('/reports/monthly');
export const getGST         = (p)     => api.get('/reports/gst', { params: p });
export const getTopProducts = (p)     => api.get('/reports/top-products', { params: p });

// Settings
export const getSettings    = ()      => api.get('/settings');
export const updateSettings = (d)     => api.put('/settings', d);

// Receipt Templates
export const getReceiptTemplates    = ()      => api.get('/receipt-templates');
export const createReceiptTemplate  = (d)     => api.post('/receipt-templates', d);
export const updateReceiptTemplate  = (id, d) => api.put(`/receipt-templates/${id}`, d);
export const deleteReceiptTemplate  = (id)    => api.delete(`/receipt-templates/${id}`);
export const setDefaultTemplate     = (id)    => api.put(`/receipt-templates/${id}/default`, {});

// Suppliers
export const getSuppliers    = (p)    => api.get('/suppliers', { params: p });
export const createSupplier  = (d)    => api.post('/suppliers', d);
export const updateSupplier  = (id,d) => api.put(`/suppliers/${id}`, d);
export const deleteSupplier  = (id)   => api.delete(`/suppliers/${id}`);

// Purchase Entries
export const getPurchaseEntries = (p)    => api.get('/purchase-entries', { params: p });
export const getPurchaseEntry   = (id)   => api.get(`/purchase-entries/${id}`);
export const getPurchaseStats   = ()     => api.get('/purchase-entries/stats');
export const createPurchaseEntry= (d)    => api.post('/purchase-entries', d);
export const updatePurchaseEntry= (id,d) => api.put(`/purchase-entries/${id}`, d);
export const deletePurchaseEntry= (id)   => api.delete(`/purchase-entries/${id}`);

// QR & Product lookup
export const getProductQR      = (id)      => api.get(`/products/${id}/qr`);
export const getProductByCode  = (code)    => api.get(`/products/by-code/${encodeURIComponent(code)}`);

// Offers
export const getOffers         = (p)       => api.get('/offers', { params: p });
export const createOffer       = (d)       => api.post('/offers', d);
export const updateOffer       = (id,d)    => api.put(`/offers/${id}`, d);
export const deleteOffer       = (id)      => api.delete(`/offers/${id}`);

// Held Bills
export const getHeldBills      = ()        => api.get('/held-bills');
export const holdBill          = (d)       => api.post('/held-bills', d);
export const releaseHeldBill   = (id)      => api.delete(`/held-bills/${id}`);

export default api;
