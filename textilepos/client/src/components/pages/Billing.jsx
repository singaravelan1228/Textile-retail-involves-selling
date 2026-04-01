// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import {
// //   getProducts, getCategories, getBrands,
// //   createCustomer, createBill, checkPhone,
// //   returnItems, getBills, getBill, getSettings, getReceiptTemplates,
// //   getProductByCode, holdBill, getHeldBills, releaseHeldBill,
// // } from '../../services/api';
// // import { useCart } from '../../context/CartContext';
// // import Loader from '../common/Loader';
// // import Modal from '../common/Modal';
// // import useDebounce from '../../hooks/useDebounce';

// // const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// // const initials = nm => nm?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
// // const IMG = 'http://localhost:5000';

// // /* ═══════════════════════════════════════════════════════════
// //    DYNAMIC RECEIPT — driven by Settings
// // ═══════════════════════════════════════════════════════════ */
// // const DynamicReceipt = ({ bill, s, co: company }) => {
// //   const t = s || {};
// //   const co = company || {};
// //   const w = Math.max(240, Math.min(420, t.receiptWidth || 300));
// //   const tmpl = t.layout || 'modern';
// //   const fontMap = { mono: 'monospace', serif: 'Georgia,serif', sans: 'system-ui,sans-serif' };
// //   const font = fontMap[t.font] || 'system-ui,sans-serif';

// //   const Divider = ({ dashed }) => (
// //     <div style={{ borderTop: dashed ? '1px dashed #ccc' : '2px solid #222', margin: '7px 0' }} />
// //   );
  
// //   const Row = ({ l, v, bold, color }) => (
// //     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
// //       <span style={{ color: '#888' }}>{l}</span>
// //       <span style={{ fontWeight: bold ? 800 : 500, color: color || '#222' }}>{v}</span>
// //     </div>
// //   );

// //   const Header = () => {
// //     if (tmpl === 'modern') return (
// //       <div style={{ background: '#1a1a1a', color: 'white', padding: '14px 18px', textAlign: 'center' }}>
// //         {t.showStoreName !== false && <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.3px' }}>{co.companyName || 'Store Name'}</div>}
// //         {t.showTagline !== false && co.tagline && <div style={{ fontSize: 10, opacity: .85, marginTop: 2 }}>{co.tagline}</div>}
// //         {t.showPhone !== false && co.phone && <div style={{ fontSize: 10, opacity: .8, marginTop: 4 }}>📞 {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
// //         {t.showGST !== false && co.gstNumber && <div style={{ fontSize: 9, opacity: .7, marginTop: 2, fontFamily: 'monospace' }}>GST: {co.gstNumber}</div>}
// //       </div>
// //     );
// //     if (tmpl === 'classic') return (
// //       <div style={{ textAlign: 'center', borderBottom: "2px solid #222", paddingBottom: 8, marginBottom: 10 }}>
// //         {t.showStoreName !== false && <div style={{ fontWeight: 800, fontSize: 16, color: "#222", letterSpacing: .5 }}>{co.companyName || 'Store Name'}</div>}
// //         {t.showTagline !== false && co.tagline && <div style={{ fontSize: 10, color: '#666' }}>{co.tagline}</div>}
// //         {t.showAddress !== false && co.address && <div style={{ fontSize: 10, color: '#666' }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
// //         {t.showPhone !== false && co.phone && <div style={{ fontSize: 10, color: '#555' }}>Ph: {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
// //         {t.showEmail === true && co.email && <div style={{ fontSize: 10, color: '#666' }}>{co.email}</div>}
// //         {t.showWebsite === true && co.website && <div style={{ fontSize: 10, color: '#666' }}>{co.website}</div>}
// //         {t.showGST !== false && co.gstNumber && <div style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>GST: {co.gstNumber}</div>}
// //       </div>
// //     );
// //     return (
// //       <div style={{ marginBottom: 10 }}>
// //         {t.showStoreName !== false && <div style={{ fontWeight: 800, fontSize: 16, color: "#222" }}>{co.companyName || 'Store Name'}</div>}
// //         {t.showTagline !== false && co.tagline && <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{co.tagline}</div>}
// //         {t.showAddress !== false && co.address && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
// //         {t.showPhone !== false && co.phone && <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>📞 {co.phone}</div>}
// //         {t.showGST !== false && co.gstNumber && <div style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', marginTop: 1 }}>GST: {co.gstNumber}</div>}
// //       </div>
// //     );
// //   };

// //   const ItemsTable = () => (
// //     <div style={{ marginBottom: 6 }}>
// //       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4, paddingBottom: 4, borderBottom: "1px solid #eee" }}>
// //         <span style={{ flex: 2 }}>Item</span>
// //         <span style={{ textAlign: 'right', minWidth: 32 }}>Qty</span>
// //         <span style={{ textAlign: 'right', minWidth: 40 }}>Rate</span>
// //         <span style={{ textAlign: 'right', minWidth: 44 }}>Amt</span>
// //       </div>
// //       {bill.items.map((it, i) => (
// //         <div key={i} style={{ marginBottom: 5 }}>
// //           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'flex-start' }}>
// //             <div style={{ flex: 2, paddingRight: 4 }}>
// //               <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{it.productName}</div>
// //             </div>
// //             <span style={{ textAlign: 'right', minWidth: 32, fontFamily: 'monospace', fontSize: 11 }}>{it.quantity}{it.unit?.[0]}</span>
// //             <span style={{ textAlign: 'right', minWidth: 40, fontFamily: 'monospace', fontSize: 11 }}>₹{it.pricePerUnit}</span>
// //             <span style={{ textAlign: 'right', minWidth: 44, fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>₹{it.amount}</span>
// //           </div>
// //           {t.showRateQty !== false && (
// //             <div style={{ fontSize: 9, color: '#999', paddingLeft: 2, marginTop: 1 }}>
// //               ₹{it.pricePerUnit}/{it.unit} × {it.quantity}{it.unit?.[0]} = ₹{it.amount}
// //             </div>
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );

// //   const Totals = () => (
// //     <div style={{ fontSize: 11 }}>
// //       <Row l="Subtotal" v={fmt(bill.subtotal)} />
// //       {t.showGSTBreakdown !== false ? (
// //         <>
// //           <Row l={`CGST ${(bill.gstRate || 2.5)}%`} v={fmt(bill.gstAmount / 2)} />
// //           <Row l={`SGST ${(bill.gstRate || 2.5)}%`} v={fmt(bill.gstAmount / 2)} />
// //         </>
// //       ) : (
// //         <Row l="GST" v={fmt(bill.gstAmount)} />
// //       )}
// //       {t.showDiscount !== false && bill.discountPct > 0 && (
// //         <Row l={`Discount (${bill.discountPct}%)`} v={`-${fmt(bill.discountAmt)}`} color="#C0392B" />
// //       )}
// //       {t.showSavings && bill.discountAmt > 0 && (
// //         <div style={{ fontSize: 10, color: '#16A34A', textAlign: 'right', marginBottom: 2, fontWeight: 600 }}>
// //           🎉 You saved {fmt(bill.discountAmt)}!
// //         </div>
// //       )}
// //     </div>
// //   );

// //   const Footer = () => (
// //     <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #ddd' }}>
// //       {t.showPaymentMode !== false && (
// //         <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
// //           Payment: <strong>{bill.paymentMethod}</strong>
// //         </div>
// //       )}
// //       {t.showThankYou !== false && t.footerLine1 && (
// //         <div style={{ fontSize: 10, color: '#888', fontStyle: 'italic' }}>{t.footerLine1}</div>
// //       )}
// //       {t.footerLine2 && (
// //         <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{t.footerLine2}</div>
// //       )}
// //       {t.showPhone !== false && co.phone && tmpl === 'modern' && (
// //         <div style={{ fontSize: 11, color: "#222", marginTop: 6, fontWeight: 700 }}>📞 {co.phone}</div>
// //       )}
// //     </div>
// //   );

// //   const BillMeta = () => (
// //     <div style={{ marginBottom: 8 }}>
// //       {tmpl === 'modern' ? (
// //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
// //           {t.showBillNumber !== false && <span style={{ fontWeight: 800, fontSize: 12, color: "#222" }}>{bill.billNumber}</span>}
// //           {t.showDate !== false && <span style={{ fontSize: 10, color: '#888' }}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</span>}
// //         </div>
// //       ) : (
// //         <>
// //           {t.showBillNumber !== false && <Row l="Bill #" v={bill.billNumber} bold />}
// //           {t.showDate !== false && <Row l="Date" v={new Date(bill.createdAt).toLocaleString('en-IN')} />}
// //         </>
// //       )}
// //       {t.showCustomer !== false && (
// //         tmpl === 'modern'
// //           ? <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
// //               <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Customer</div>
// //               <div style={{ fontSize: 12 }}>{bill.customerName}</div>
// //               {t.showCustomerPhone !== false && bill.customerPhone && <div style={{ fontSize: 10, color: '#888' }}>{bill.customerPhone}</div>}
// //             </div>
// //           : <>
// //               <Row l="Customer" v={bill.customerName} />
// //               {t.showCustomerPhone !== false && bill.customerPhone && <Row l="Phone" v={bill.customerPhone} />}
// //             </>
// //       )}
// //     </div>
// //   );

// //   const boxShadow = '0 8px 32px rgba(0,0,0,0.14)';
// //   const borderRadius = tmpl === 'minimal' ? 8 : 12;

// //   return (
// //     <div style={{ width: w, fontFamily: font, background: 'white', borderRadius, boxShadow, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
// //       <Header />
// //       <div style={{ padding: tmpl === 'modern' ? '12px 16px' : '18px 20px' }}>
// //         <BillMeta />
// //         {tmpl !== 'modern' && <Divider dashed />}
// //         <ItemsTable />
// //         <Divider dashed />
// //         <Totals />
// //         <Divider />
// //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 16 }}>
// //           <span>TOTAL</span>
// //           <span style={{ fontSize: 20 }}>{fmt(bill.total)}</span>
// //         </div>
// //         <Footer />
// //       </div>
// //     </div>
// //   );
// // };

// // /* ═══════════════════════════════════════════════════════════
// //    RECEIPT WRAPPER
// // ═══════════════════════════════════════════════════════════ */
// // const Receipt = ({ bill, settings, template, onClose, onNewBill }) => {
// //   const ref = useRef();
// //   const co = settings || {};
// //   const tmpl = template || {};

// //   const handlePrint = () => {
// //     const w = window.open('', '_blank', 'width=400,height=600');
// //     const content = ref.current.innerHTML;
// //     w.document.write(`
// //       <html>
// //         <head>
// //           <title>Receipt ${bill.billNumber}</title>
// //           <style>
// //             *{box-sizing:border-box;margin:0;padding:0}
// //             body{font-family:sans-serif;background:#fff;display:flex;justify-content:center;padding:20px}
// //             @media print{body{padding:0}button{display:none!important}}
// //             .no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
// //             .no-print button{padding:8px 20px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}
// //             .print-btn{background:#0D5C45;color:white}
// //             .close-btn{background:#f1f5f9;color:#333}
// //           </style>
// //         </head>
// //         <body>
// //           <div>
// //             ${content}
// //             <div class="no-print">
// //               <button class="print-btn" onclick="window.print()">🖨 Print</button>
// //               <button class="close-btn" onclick="window.close()">Close</button>
// //             </div>
// //           </div>
// //         </body>
// //       </html>
// //     `);
// //     w.document.close();
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxHeight: '90vh', overflowY: 'auto' }}>
// //         <div ref={ref}>
// //           <DynamicReceipt bill={bill} s={tmpl} co={co} />
// //         </div>
// //         <div style={{
// //           display: 'grid',
// //           gridTemplateColumns: '1fr 1fr 1fr',
// //           gap: 10,
// //           width: '100%',
// //           maxWidth: 290,
// //         }}>
// //           <button onClick={handlePrint} style={{
// //             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
// //             gap: 5, padding: '12px 8px',
// //             background: 'var(--primary)', color: 'white',
// //             border: 'none', borderRadius: 10, cursor: 'pointer',
// //             fontWeight: 700, fontSize: 12, lineHeight: 1.2,
// //           }}>
// //             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //               <polyline points="6 9 6 2 18 2 18 9" />
// //               <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
// //               <rect x="6" y="14" width="12" height="8" />
// //             </svg>
// //             Print
// //           </button>
// //           <button onClick={onNewBill} style={{
// //             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
// //             gap: 5, padding: '12px 8px',
// //             background: 'var(--bg-card)', color: 'var(--primary)',
// //             border: '1.5px solid var(--primary)', borderRadius: 10, cursor: 'pointer',
// //             fontWeight: 700, fontSize: 12, lineHeight: 1.2,
// //           }}>
// //             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //               <path d="M12 5v14M5 12h14" />
// //             </svg>
// //             New Bill
// //           </button>
// //           <button onClick={onClose} style={{
// //             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
// //             gap: 5, padding: '12px 8px',
// //             background: 'var(--bg-hover)', color: 'var(--text-secondary)',
// //             border: '1.5px solid var(--border-dark)', borderRadius: 10, cursor: 'pointer',
// //             fontWeight: 700, fontSize: 12, lineHeight: 1.2,
// //           }}>
// //             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //               <path d="M18 6L6 18M6 6l12 12" />
// //             </svg>
// //             Close
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // /* ═══════════════════════════════════════════════════════════
// //    RETURN MODAL
// // ═══════════════════════════════════════════════════════════ */
// // const ReturnModal = ({ open, onClose, bill, onSuccess }) => {
// //   const [qtys, setQtys] = useState({});
// //   const [reason, setReason] = useState('');
// //   const [saving, setSaving] = useState(false);
// //   const [msg, setMsg] = useState({ type: '', text: '' });

// //   useEffect(() => {
// //     if (open && bill) {
// //       const init = {};
// //       bill.items.forEach(it => { init[it.product] = 0; });
// //       setQtys(init);
// //       setReason('');
// //       setMsg({ type: '', text: '' });
// //     }
// //   }, [open, bill]);

// //   const totalRefund = bill?.items.reduce((s, it) => s + (qtys[it.product] || 0) * it.pricePerUnit * (1 + it.gstRate / 100), 0) || 0;

// //   const handleReturn = async () => {
// //     const items = bill.items
// //       .filter(it => qtys[it.product] > 0)
// //       .map(it => ({ productId: it.product, productName: it.productName, quantity: Number(qtys[it.product]) }));
// //     if (!items.length) return setMsg({ type: 'danger', text: 'Enter quantity for at least one item.' });
// //     setSaving(true);
// //     setMsg({ type: '', text: '' });
// //     try {
// //       const { data } = await returnItems(bill._id, { items, reason });
// //       setMsg({ type: 'success', text: data.message });
// //       setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
// //     } catch (err) {
// //       setMsg({ type: 'danger', text: err.response?.data?.message || 'Return failed.' });
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   if (!open || !bill) return null;
  
// //   return (
// //     <Modal open={open} onClose={onClose} title={`Return Items — ${bill.billNumber}`}
// //       footer={
// //         <>
// //           <button className="btn" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-danger" onClick={handleReturn} disabled={saving}>
// //             {saving ? 'Processing…' : 'Confirm Return'}
// //           </button>
// //         </>
// //       }>
// //       <div className="alert alert-warning" style={{ marginBottom: 14, fontSize: 12 }}>
// //         Returned items will be added back to inventory stock automatically.
// //       </div>
// //       {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
// //       <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
// //         <div style={{ fontWeight: 700, fontSize: 13 }}>{bill.customerName}</div>
// //         {bill.customerPhone && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{bill.customerPhone}</div>}
// //       </div>
// //       {bill.items.map(it => {
// //         const canReturn = it.quantity - (it.returnedQty || 0);
// //         const q = qtys[it.product] || 0;
// //         return (
// //           <div key={it.product} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
// //             <div style={{ flex: 1 }}>
// //               <div style={{ fontWeight: 700, fontSize: 13 }}>{it.productName}</div>
// //               <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
// //                 Billed: {it.quantity}{it.unit?.[0]} · Can return: <strong style={{ color: canReturn > 0 ? 'var(--primary)' : 'var(--danger)' }}>{canReturn}{it.unit?.[0]}</strong>
// //               </div>
// //             </div>
// //             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //               <input 
// //                 type="number" 
// //                 min="0" 
// //                 max={canReturn} 
// //                 value={q} 
// //                 disabled={canReturn <= 0}
// //                 onChange={e => setQtys(prev => ({ ...prev, [it.product]: Math.min(canReturn, Math.max(0, Number(e.target.value))) }))}
// //                 style={{ width: 60, padding: '6px 8px', border: '1.5px solid var(--border-dark)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, textAlign: 'center' }} 
// //               />
// //               {q > 0 && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, minWidth: 60 }}>+{fmt(q * it.pricePerUnit * (1 + it.gstRate / 100))}</span>}
// //             </div>
// //           </div>
// //         );
// //       })}
// //       {totalRefund > 0 && (
// //         <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //           <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>Total Refund Amount</span>
// //           <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>{fmt(totalRefund)}</span>
// //         </div>
// //       )}
// //       <div className="form-group" style={{ marginTop: 14 }}>
// //         <label className="form-label">Return Reason (optional)</label>
// //         <input className="form-control" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Damaged fabric, wrong colour, customer changed mind" />
// //       </div>
// //     </Modal>
// //   );
// // };

// // /* ═══════════════════════════════════════════════════════════
// //    MAIN BILLING PAGE
// // ═══════════════════════════════════════════════════════════ */
// // const Billing = () => {
// //   const { items, addItem, changeQty, clearCart, subtotal } = useCart();

// //   const [products, setProducts] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [brands, setBrands] = useState([]);
// //   const [settings, setSettings] = useState(null);
// //   const [defaultTmpl, setDefaultTmpl] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const [search, setSearch] = useState('');
// //   const [catFilter, setCatFilter] = useState('');
// //   const [brandFilter, setBrandFilter] = useState('');

// //   // Customer
// //   const [phone, setPhone] = useState('');
// //   const [phoneStatus, setPhoneStatus] = useState(null);
// //   const [foundCustomer, setFoundCustomer] = useState(null);
// //   const [customerId, setCustomerId] = useState('');
// //   const [newCustName, setNewCustName] = useState('');
// //   const [savingCust, setSavingCust] = useState(false);
// //   const [custError, setCustError] = useState('');

// //   // Bill
// //   const [discount, setDiscount] = useState(0);
// //   const [payMethod, setPayMethod] = useState('Cash');
// //   const [payStatus, setPayStatus] = useState('Paid');
// //   const [submitting, setSubmitting] = useState(false);
// //   const [receipt, setReceipt] = useState(null);
// //   const [billError, setBillError] = useState('');

// //   // Return
// //   const [returnStep, setReturnStep] = useState(0);
// //   const [returnBillNo, setReturnBillNo] = useState('');
// //   const [returnBill, setReturnBill] = useState(null);
// //   const [searchingBill, setSearchingBill] = useState(false);

// //   // QR Scanner
// //   const [qrInput, setQrInput] = useState('');
// //   const [qrError, setQrError] = useState('');
// //   const [qrLoading, setQrLoading] = useState(false);
// //   const qrRef = useRef();
// //   const srchRef = useRef();

// //   // Quick-add quantity modal
// //   const [quickAdd, setQuickAdd] = useState(null);
// //   const [quickQty, setQuickQty] = useState('1');
// //   const quickQtyRef = useRef();

// //   // Hold bill
// //   const [heldBills, setHeldBills] = useState([]);
// //   const [showHeld, setShowHeld] = useState(false);
// //   const [holdingBill, setHoldingBill] = useState(false);

// //   // Bill notes
// //   const [billNote, setBillNote] = useState('');

// //   const debouncedSearch = useDebounce(search);
// //   const debouncedPhone = useDebounce(phone, 600);

// //   // Load initial data
// //   useEffect(() => {
// //     Promise.all([getProducts(), getCategories(), getBrands(), getSettings(), getReceiptTemplates()])
// //       .then(([p, c, b, s, r]) => {
// //         setProducts(p.data.data || []);
// //         setCategories(c.data.data || []);
// //         setBrands(b.data.data || []);
// //         setSettings(s.data.data);
// //         const dflt = (r.data.data || []).find(t => t.isDefault) || (r.data.data || [])[0];
// //         setDefaultTmpl(dflt);
// //       })
// //       .catch(console.error)
// //       .finally(() => setLoading(false));
// //   }, []);

// //   // Fetch products with filters
// //   useEffect(() => {
// //     if (!loading) {
// //       getProducts({ 
// //         search: debouncedSearch || undefined, 
// //         category: catFilter || undefined, 
// //         brand: brandFilter || undefined 
// //       })
// //         .then(({ data }) => setProducts(data.data || []))
// //         .catch(console.error);
// //     }
// //   }, [debouncedSearch, catFilter, brandFilter, loading]);

// //   // Check phone number
// //   useEffect(() => {
// //     if (!debouncedPhone || debouncedPhone.length < 10) {
// //       setPhoneStatus(null);
// //       setFoundCustomer(null);
// //       setCustomerId('');
// //       return;
// //     }
// //     checkPhone(debouncedPhone)
// //       .then(({ data }) => {
// //         if (data.exists) {
// //           setPhoneStatus('found');
// //           setFoundCustomer(data.customer);
// //           setCustomerId(data.customer._id);
// //         } else {
// //           setPhoneStatus('new');
// //           setFoundCustomer(null);
// //           setCustomerId('');
// //         }
// //       })
// //       .catch(console.error);
// //   }, [debouncedPhone]);

// //   // Load held bills on mount
// //   useEffect(() => {
// //     getHeldBills().then(({ data }) => setHeldBills(data.data || [])).catch(() => {});
// //   }, []);

// //   // Keyboard shortcuts
// //   useEffect(() => {
// //     const handler = e => {
// //       // F2 → focus QR scanner
// //       if (e.key === 'F2') {
// //         e.preventDefault();
// //         qrRef.current?.focus();
// //       }
// //       // F3 → focus search
// //       if (e.key === 'F3') {
// //         e.preventDefault();
// //         srchRef.current?.focus();
// //       }
// //       // Ctrl+H → hold bill
// //       if (e.ctrlKey && e.key === 'h') {
// //         e.preventDefault();
// //         handleHoldBill();
// //       }
// //       // Ctrl+N → new bill
// //       if (e.ctrlKey && e.key === 'n') {
// //         e.preventDefault();
// //         handleNewBill();
// //       }
// //     };
// //     window.addEventListener('keydown', handler);
// //     return () => window.removeEventListener('keydown', handler);
// //   }, [items, phone, discount, payMethod, foundCustomer, billNote, customerId]);

// //   // QR Code scan / enter
// //   const handleQrSubmit = async (rawValue) => {
// //     const val = rawValue?.trim();
// //     if (!val) return;
// //     setQrError('');
// //     setQrLoading(true);
// //     try {
// //       let code = val;
// //       try {
// //         const parsed = JSON.parse(val);
// //         code = parsed.code || val;
// //       } catch {}
// //       const { data } = await getProductByCode(code);
// //       if (!data.success) {
// //         setQrError(`Product "${code}" not found`);
// //         return;
// //       }
// //       const product = data.data;
// //       if (product.stock <= 0) {
// //         setQrError(`"${product.name}" is out of stock`);
// //         return;
// //       }
// //       setQuickAdd(product);
// //       setQuickQty('1');
// //       setQrInput('');
// //       setTimeout(() => quickQtyRef.current?.focus(), 60);
// //     } catch (err) {
// //       setQrError(err.response?.data?.message || 'Product not found. Check the code.');
// //     } finally {
// //       setQrLoading(false);
// //     }
// //   };

// //   const handleQrKey = e => {
// //     if (e.key === 'Enter') {
// //       handleQrSubmit(qrInput);
// //     } else if (e.key === 'Escape') {
// //       setQrInput('');
// //       setQrError('');
// //     }
// //   };

// //   // Quick-add confirm
// //   const confirmQuickAdd = () => {
// //     if (!quickAdd) return;
// //     const qty = Math.max(0.5, parseFloat(quickQty) || 1);
// //     if (qty > quickAdd.stock) {
// //       alert(`Only ${quickAdd.stock} ${quickAdd.unit}s in stock`);
// //       return;
// //     }
// //     const offer = (quickAdd.offers || []).find(o => o.isValid && qty >= o.minQty);
// //     const productWithOffer = offer ? { ...quickAdd, _offerDiscount: offer } : quickAdd;
// //     const existing = items.find(i => i._id === quickAdd._id);
// //     if (existing) {
// //       changeQty(quickAdd._id, qty);
// //     } else {
// //       addItem({ ...productWithOffer, qty: qty });
// //     }
// //     setQuickAdd(null);
// //     qrRef.current?.focus();
// //   };

// //   // Hold Bill
// //   const handleHoldBill = async () => {
// //     if (!items.length) return;
// //     setHoldingBill(true);
// //     try {
// //       const label = billNote.trim() || `Hold — ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
// //       await holdBill({
// //         label, 
// //         customerId: customerId || undefined,
// //         customerName: foundCustomer?.name || '',
// //         customerPhone: phone, 
// //         items, 
// //         discount: discount, 
// //         payMethod,
// //       });
// //       const { data } = await getHeldBills();
// //       setHeldBills(data.data || []);
// //       handleNewBill();
// //       alert(`Bill held as "${label}". You can resume it from Hold Bills.`);
// //     } catch (err) {
// //       alert(err.response?.data?.message || 'Failed to hold bill.');
// //     } finally {
// //       setHoldingBill(false);
// //     }
// //   };

// //   const handleResumeHeld = async (held) => {
// //     if (items.length && !window.confirm('Current bill will be cleared. Resume held bill?')) return;
// //     clearCart();
// //     held.items.forEach(item => {
// //       addItem(item);
// //       if (item.qty > 1) {
// //         changeQty(item._id, item.qty);
// //       }
// //     });
// //     if (held.customerPhone) setPhone(held.customerPhone);
// //     setDiscount(held.discount || 0);
// //     setPayMethod(held.payMethod || 'Cash');
// //     setBillNote(held.label || '');
// //     try {
// //       await releaseHeldBill(held._id);
// //       setHeldBills(prev => prev.filter(h => h._id !== held._id));
// //     } catch (err) {
// //       console.error('Failed to release held bill:', err);
// //     }
// //     setShowHeld(false);
// //   };

// //   const saveNewCustomer = async () => {
// //     if (!newCustName.trim()) return setCustError('Enter customer name.');
// //     setCustError('');
// //     setSavingCust(true);
// //     try {
// //       const { data } = await createCustomer({ name: newCustName.trim(), phone: phone.trim() });
// //       setFoundCustomer(data.data);
// //       setCustomerId(data.data._id);
// //       setPhoneStatus('found');
// //       setNewCustName('');
// //     } catch (err) {
// //       setCustError(err.response?.data?.message || 'Failed to save.');
// //     } finally {
// //       setSavingCust(false);
// //     }
// //   };

// //   const clearCustomer = () => {
// //     setPhone('');
// //     setPhoneStatus(null);
// //     setFoundCustomer(null);
// //     setCustomerId('');
// //     setNewCustName('');
// //     setCustError('');
// //   };

// //   const gstAmount = items.reduce((s, i) => s + (i.pricePerUnit || 0) * (i.qty || 0) * ((i.gstRate || 5) / 100), 0);
// //   const discountAmt = (subtotal + gstAmount) * discount / 100;
// //   const total = subtotal + gstAmount - discountAmt;

// //   const handleGenerateBill = async () => {
// //     if (!items.length) return setBillError('Add at least one product.');
// //     setBillError('');
// //     setSubmitting(true);
// //     try {
// //       const { data } = await createBill({
// //         customerId: customerId || undefined,
// //         items: items.map(i => ({ productId: i._id, quantity: i.qty })),
// //         discountPct: Number(discount), 
// //         paymentMethod: payMethod, 
// //         paymentStatus: payStatus,
// //         note: billNote,
// //       });
// //       setReceipt(data.data);
// //     } catch (err) {
// //       setBillError(err.response?.data?.message || 'Failed to generate bill.');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleNewBill = () => {
// //     setReceipt(null);
// //     clearCart();
// //     clearCustomer();
// //     setDiscount(0);
// //     setPayMethod('Cash');
// //     setPayStatus('Paid');
// //     setBillError('');
// //     setBillNote('');
// //   };

// //   const handleSearchBill = async () => {
// //     if (!returnBillNo.trim()) return;
// //     setSearchingBill(true);
// //     try {
// //       const { data: list } = await getBills({ search: returnBillNo.trim(), limit: 5 });
// //       const match = (list.data || []).find(b => b.billNumber.toUpperCase() === returnBillNo.toUpperCase());
// //       if (!match) {
// //         alert('Bill not found. Check the bill number.');
// //         return;
// //       }
// //       const { data: full } = await getBill(match._id);
// //       setReturnBill(full.data);
// //       setReturnStep(2);
// //     } catch {
// //       alert('Error finding bill.');
// //     } finally {
// //       setSearchingBill(false);
// //     }
// //   };

// //   if (loading) return <Loader />;

// //   return (
// //     <>
// //       {receipt && (
// //         <Receipt
// //           bill={receipt}
// //           settings={settings}
// //           template={defaultTmpl}
// //           onClose={handleNewBill}
// //           onNewBill={handleNewBill}
// //         />
// //       )}

// //       {/* Quick-Add Modal */}
// //       {quickAdd && (
// //         <div className="modal-overlay">
// //           <div className="modal" style={{ maxWidth: 420 }}>
// //             <div className="modal-header">
// //               <span className="modal-title">Add to Bill</span>
// //               <button className="btn btn-ghost btn-icon" style={{ fontSize: 20 }} onClick={() => { setQuickAdd(null); qrRef.current?.focus(); }}>×</button>
// //             </div>
// //             <div className="modal-body">
// //               <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 10, marginBottom: 16 }}>
// //                 {quickAdd.imageUrl
// //                   ? <img src={`${IMG}${quickAdd.imageUrl}`} alt={quickAdd.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />
// //                   : <div style={{ width: 56, height: 56, borderRadius: 8, background: quickAdd.swatchColor || '#E8F5F0', flexShrink: 0, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'rgba(0,0,0,.2)' }}>{quickAdd.name.slice(0, 2).toUpperCase()}</div>
// //                 }
// //                 <div style={{ flex: 1 }}>
// //                   <div style={{ fontWeight: 800, fontSize: 15 }}>{quickAdd.name}</div>
// //                   <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{quickAdd.code} · {quickAdd.category?.name}</div>
// //                   <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
// //                     <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>₹{quickAdd.pricePerUnit}/{quickAdd.unit}</span>
// //                     <span style={{ fontSize: 11, color: quickAdd.isLowStock ? 'var(--danger)' : 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
// //                       {quickAdd.stock} {quickAdd.unit}s in stock
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>

// //               {(quickAdd.offers || []).filter(o => o.isValid).length > 0 && (
// //                 <div style={{ marginBottom: 14 }}>
// //                   <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>🏷 Active Offers</div>
// //                   {(quickAdd.offers || []).filter(o => o.isValid).map((offer, i) => (
// //                     <div key={i} style={{ background: 'linear-gradient(135deg,#FDF5E6,#FFF7ED)', border: '1.5px solid #E8B855', borderRadius: 8, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //                       <div>
// //                         <div style={{ fontWeight: 700, fontSize: 13, color: '#92540A' }}>{offer.title}</div>
// //                         <div style={{ fontSize: 11, color: '#B45309', marginTop: 1 }}>
// //                           {offer.type === 'percent' ? `${offer.value}% off` : `₹${offer.value} flat off`}
// //                           {offer.minQty > 1 ? ` · Min ${offer.minQty}${quickAdd.unit}s` : ''}
// //                           {offer.expiresAt ? ` · Expires ${new Date(offer.expiresAt).toLocaleDateString('en-IN')}` : ''}
// //                         </div>
// //                       </div>
// //                       <span style={{ background: '#C9993A', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12 }}>
// //                         {offer.type === 'percent' ? `-${offer.value}%` : `-₹${offer.value}`}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}

// //               <div className="form-group" style={{ marginBottom: 0 }}>
// //                 <label className="form-label">Quantity ({quickAdd.unit}s)</label>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //                   <button onClick={() => setQuickQty(q => String(Math.max(0.5, Number(q) - 1)))}
// //                     style={{ width: 36, height: 36, border: '1.5px solid var(--border-dark)', borderRadius: 8, background: 'var(--bg-hover)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
// //                   <input ref={quickQtyRef} type="number" min="0.5" max={quickAdd.stock} step="0.5" value={quickQty}
// //                     onChange={e => setQuickQty(e.target.value)}
// //                     onKeyDown={e => { if (e.key === 'Enter') confirmQuickAdd(); if (e.key === 'Escape') { setQuickAdd(null); qrRef.current?.focus(); } }}
// //                     style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 800, padding: '8px', border: '1.5px solid var(--border-dark)', borderRadius: 8, fontFamily: 'var(--font-mono)' }}
// //                     autoFocus />
// //                   <button onClick={() => setQuickQty(q => String(Math.min(quickAdd.stock, Number(q) + 1)))}
// //                     style={{ width: 36, height: 36, border: '1.5px solid var(--border-dark)', borderRadius: 8, background: 'var(--bg-hover)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
// //                 </div>
// //                 {Number(quickQty) > 0 && (
// //                   <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--primary-light)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
// //                     <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Total for this item</span>
// //                     <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>{fmt(Number(quickQty) * quickAdd.pricePerUnit)}</span>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //             <div className="modal-footer">
// //               <button className="btn" onClick={() => { setQuickAdd(null); qrRef.current?.focus(); }}>Cancel</button>
// //               <button className="btn btn-primary" onClick={confirmQuickAdd} style={{ fontWeight: 700, gap: 8 }}>
// //                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //                   <path d="M12 5v14M5 12h14" />
// //                 </svg>
// //                 Add {quickQty} {quickAdd.unit}s to Bill
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Held Bills Modal */}
// //       {showHeld && (
// //         <div className="modal-overlay">
// //           <div className="modal" style={{ maxWidth: 480 }}>
// //             <div className="modal-header">
// //               <span className="modal-title">⏸ Held Bills ({heldBills.length})</span>
// //               <button className="btn btn-ghost btn-icon" style={{ fontSize: 20 }} onClick={() => setShowHeld(false)}>×</button>
// //             </div>
// //             <div className="modal-body">
// //               {heldBills.length === 0
// //                 ? <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>No held bills</div>
// //                 : heldBills.map(held => (
// //                   <div key={held._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 10, marginBottom: 8, border: '1.5px solid var(--border)' }}>
// //                     <div style={{ flex: 1 }}>
// //                       <div style={{ fontWeight: 700, fontSize: 13 }}>{held.label}</div>
// //                       <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
// //                         {held.items?.length || 0} items
// //                         {held.customerName ? ` · ${held.customerName}` : ' · Walk-in'}
// //                         {' · '}{new Date(held.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
// //                       </div>
// //                     </div>
// //                     <button className="btn btn-sm btn-primary" onClick={() => handleResumeHeld(held)}>▶ Resume</button>
// //                   </div>
// //                 ))
// //               }
// //             </div>
// //             <div className="modal-footer">
// //               <button className="btn" onClick={() => setShowHeld(false)}>Close</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Return - search step */}
// //       {returnStep === 1 && (
// //         <div className="modal-overlay">
// //           <div className="modal">
// //             <div className="modal-header">
// //               <span className="modal-title">Process Product Return</span>
// //               <button className="btn btn-ghost btn-icon" style={{ fontSize: 20, lineHeight: 1 }} onClick={() => setReturnStep(0)}>×</button>
// //             </div>
// //             <div className="modal-body">
// //               <div className="alert alert-info" style={{ marginBottom: 14, fontSize: 12 }}>
// //                 Enter the original bill number to find the sale and select items to return.
// //               </div>
// //               <div className="form-group">
// //                 <label className="form-label">Bill Number</label>
// //                 <input className="form-control" placeholder="e.g. BL-202603-0001"
// //                   value={returnBillNo} onChange={e => setReturnBillNo(e.target.value.toUpperCase())}
// //                   onKeyDown={e => e.key === 'Enter' && handleSearchBill()} autoFocus
// //                   style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '.05em', fontSize: 15 }} />
// //               </div>
// //             </div>
// //             <div className="modal-footer">
// //               <button className="btn" onClick={() => setReturnStep(0)}>Cancel</button>
// //               <button className="btn btn-danger" onClick={handleSearchBill} disabled={searchingBill || !returnBillNo.trim()}>
// //                 {searchingBill ? 'Searching…' : 'Find Bill →'}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <ReturnModal
// //         open={returnStep === 2}
// //         bill={returnBill}
// //         onClose={() => { setReturnStep(0); setReturnBill(null); setReturnBillNo(''); }}
// //         onSuccess={() => {}}
// //       />

// //       {/* MAIN LAYOUT */}
// //       <div className="pos-layout">

// //         {/* LEFT: Products */}
// //         <div className="pos-products">
// //           <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
// //             <input ref={srchRef} className="form-control" style={{ flex: 1, minWidth: 140 }} placeholder="🔍 Search fabric name or code… (F3)"
// //               value={search} onChange={e => setSearch(e.target.value)} />

// //             <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
// //               <div style={{
// //                 position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
// //                 color: qrLoading ? 'var(--primary)' : qrError ? 'var(--danger)' : '#64748B',
// //                 pointerEvents: 'none', fontSize: 15, lineHeight: 1,
// //               }}>
// //                 {qrLoading
// //                   ? <div style={{ width: 14, height: 14, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
// //                   : '⬛'
// //                 }
// //               </div>
// //               <input
// //                 ref={qrRef}
// //                 type="text"
// //                 value={qrInput}
// //                 onChange={e => { setQrInput(e.target.value); setQrError(''); }}
// //                 onKeyDown={handleQrKey}
// //                 placeholder="Scan QR / enter code (F2)"
// //                 style={{
// //                   paddingLeft: 32, paddingRight: 10,
// //                   width: 210, height: 38,
// //                   border: `1.5px solid ${qrError ? 'var(--danger)' : 'var(--border-dark)'}`,
// //                   borderRadius: 'var(--radius-md)',
// //                   fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
// //                   background: 'var(--bg-card)', color: 'var(--text-primary)',
// //                   outline: 'none',
// //                   boxShadow: qrError ? '0 0 0 3px rgba(192,57,43,.12)' : 'none',
// //                 }}
// //               />
// //               {qrInput && (
// //                 <button onClick={() => handleQrSubmit(qrInput)}
// //                   style={{
// //                     position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
// //                     background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6,
// //                     width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
// //                     cursor: 'pointer', fontSize: 11, fontWeight: 800, lineHeight: 1
// //                   }}>
// //                   ↵
// //                 </button>
// //               )}
// //             </div>
// //             {qrError && <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, width: '100%', marginTop: -4, paddingLeft: 2 }}>{qrError}</div>}

// //             <select className="form-control" style={{ width: 135 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
// //               <option value="">All Categories</option>
// //               {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
// //             </select>
// //             <select className="form-control" style={{ width: 125 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
// //               <option value="">All Brands</option>
// //               {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
// //             </select>
// //             <button className="btn btn-sm"
// //               style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontWeight: 700, whiteSpace: 'nowrap' }}
// //               onClick={() => { setReturnBillNo(''); setReturnBill(null); setReturnStep(1); }}>
// //               ↩ Return
// //             </button>
// //             {heldBills.length > 0 && (
// //               <button className="btn btn-sm" onClick={() => setShowHeld(true)}
// //                 style={{ borderColor: 'var(--gold)', color: 'var(--gold)', fontWeight: 700, position: 'relative', whiteSpace: 'nowrap' }}>
// //                 ⏸ Held
// //                 <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--gold)', color: 'white', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                   {heldBills.length}
// //                 </span>
// //               </button>
// //             )}
// //           </div>

// //           {/* Product grid */}
// //           <div style={{
// //             display: 'grid',
// //             gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
// //             gap: 12,
// //             overflowY: 'auto',
// //             flex: 1,
// //             paddingRight: 4,
// //             paddingBottom: 8,
// //             alignContent: 'start',
// //           }}>
// //             {products.length === 0 && (
// //               <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
// //                 No products found.
// //               </div>
// //             )}
// //             {products.map(p => {
// //               const inCart = items.find(i => i._id === p._id);
// //               return (
// //                 <div key={p._id}
// //                   onClick={() => addItem(p)}
// //                   style={{
// //                     background: 'var(--bg-card)',
// //                     border: `2px solid ${inCart ? 'var(--primary)' : 'var(--border)'}`,
// //                     borderRadius: 14,
// //                     overflow: 'visible',
// //                     cursor: 'pointer',
// //                     transition: 'all .15s',
// //                     position: 'relative',
// //                     boxShadow: inCart ? '0 4px 16px rgba(13,92,69,0.18)' : 'var(--shadow-xs)',
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                   }}
// //                   onMouseEnter={e => { if (!inCart) e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
// //                   onMouseLeave={e => { if (!inCart) e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
// //                 >
// //                   {inCart && (
// //                     <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--primary)', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 800, zIndex: 2 }}>
// //                       ×{inCart.qty}
// //                     </div>
// //                   )}
// //                   {p.imageUrl
// //                     ? <img src={`${IMG}${p.imageUrl}`} alt={p.name}
// //                       style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', borderRadius: '12px 12px 0 0' }}
// //                       onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
// //                     />
// //                     : null
// //                   }
// //                   <div style={{
// //                     width: '100%', height: p.imageUrl ? 0 : 120,
// //                     display: p.imageUrl ? 'none' : 'flex',
// //                     alignItems: 'center', justifyContent: 'center',
// //                     background: p.swatchColor || '#E8F5F0',
// //                     borderRadius: '12px 12px 0 0',
// //                   }}>
// //                     <div style={{ textAlign: 'center' }}>
// //                       <div style={{ fontSize: 28, fontWeight: 800, color: 'rgba(0,0,0,0.15)' }}>{p.name.slice(0, 2).toUpperCase()}</div>
// //                       <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>{p.category?.name}</div>
// //                     </div>
// //                   </div>
// //                   <div style={{
// //                     width: '100%', height: 120, display: 'none',
// //                     alignItems: 'center', justifyContent: 'center',
// //                     background: p.swatchColor || '#E8F5F0',
// //                     borderRadius: '12px 12px 0 0',
// //                   }}>
// //                     <div style={{ textAlign: 'center' }}>
// //                       <div style={{ fontSize: 28, fontWeight: 800, color: 'rgba(0,0,0,0.15)' }}>{p.name.slice(0, 2).toUpperCase()}</div>
// //                     </div>
// //                   </div>

// //                   <div style={{ padding: '10px 12px 12px', minHeight: 96 }}>
// //                     <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, lineHeight: 1.2 }}>{p.name}</div>
// //                     {p.brand?.name && <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, marginBottom: 2 }}>{p.brand.name}</div>}
// //                     <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{p.category?.name}</div>
// //                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //                       <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>₹{p.pricePerUnit}</span>
// //                       <span style={{ fontSize: 10, fontWeight: 600, color: p.isLowStock ? 'var(--danger)' : 'var(--text-muted)' }}>
// //                         {p.stock} {p.unit}s
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* RIGHT: Bill Panel */}
// //         <div className="bill-panel">
// //           <div style={{ padding: '14px 16px', borderBottom: '1.5px solid rgba(255,255,255,0.08)', background: 'var(--bg-sidebar)' }}>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
// //               <div style={{ fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-.3px' }}>
// //                 New Bill
// //                 {items.length > 0 && (
// //                   <span style={{ marginLeft: 8, background: 'var(--primary)', color: 'white', fontSize: 11, padding: '1px 8px', borderRadius: 20 }}>
// //                     {items.length} item{items.length > 1 ? 's' : ''}
// //                   </span>
// //                 )}
// //               </div>
// //               {items.length > 0 && (
// //                 <button onClick={clearCart}
// //                   style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,.4)', background: 'rgba(239,68,68,.12)', color: '#FCA5A5', cursor: 'pointer' }}>
// //                   Clear
// //                 </button>
// //               )}
// //             </div>

// //             <div style={{ marginBottom: 6 }}>
// //               <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
// //                 Customer Mobile
// //               </div>
// //               <div style={{ display: 'flex', gap: 6 }}>
// //                 <input type="tel" maxLength={10} value={phone}
// //                   onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneStatus(null); setFoundCustomer(null); setCustomerId(''); }}
// //                   placeholder="10-digit mobile number"
// //                   style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '.06em', fontSize: 13, outline: 'none' }} />
// //                 {phone && (
// //                   <button onClick={clearCustomer}
// //                     style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#94A3B8', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
// //                     ×
// //                   </button>
// //                 )}
// //               </div>
// //             </div>

// //             {phoneStatus === 'found' && foundCustomer && (
// //               <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(13,92,69,.25)', border: '1px solid rgba(13,92,69,.4)', borderRadius: 8, marginTop: 6 }}>
// //                 <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'white', flexShrink: 0 }}>
// //                   {initials(foundCustomer.name)}
// //                 </div>
// //                 <div style={{ flex: 1 }}>
// //                   <div style={{ fontWeight: 700, fontSize: 12, color: '#6EE7B7' }}>{foundCustomer.name}</div>
// //                   <div style={{ fontSize: 10, color: '#94A3B8' }}>{foundCustomer.totalPurchases} purchases · {foundCustomer.type}</div>
// //                 </div>
// //                 <span style={{ fontSize: 9, fontWeight: 800, background: 'rgba(16,185,129,.3)', color: '#6EE7B7', padding: '2px 7px', borderRadius: 12 }}>✓ SAVED</span>
// //               </div>
// //             )}

// //             {phoneStatus === 'new' && (
// //               <div style={{ padding: '8px 10px', background: 'rgba(201,153,58,.15)', border: '1px solid rgba(201,153,58,.3)', borderRadius: 8, marginTop: 6 }}>
// //                 <div style={{ fontSize: 10, color: '#FCD34D', fontWeight: 700, marginBottom: 6 }}>New number — save customer?</div>
// //                 {custError && <div style={{ fontSize: 10, color: '#FCA5A5', marginBottom: 5 }}>{custError}</div>}
// //                 <div style={{ display: 'flex', gap: 6 }}>
// //                   <input className="form-control" placeholder="Customer name" value={newCustName}
// //                     onChange={e => setNewCustName(e.target.value)}
// //                     onKeyDown={e => e.key === 'Enter' && saveNewCustomer()}
// //                     style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} />
// //                   <button className="btn btn-sm btn-primary" onClick={saveNewCustomer}
// //                     disabled={savingCust || !newCustName.trim()} style={{ whiteSpace: 'nowrap' }}>
// //                     {savingCust ? '…' : 'Save'}
// //                   </button>
// //                   <button className="btn btn-sm" onClick={() => setPhoneStatus(null)} style={{ fontSize: 11 }}>Skip</button>
// //                 </div>
// //               </div>
// //             )}

// //             {!phone && <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Leave blank for walk-in customer</div>}
// //           </div>

// //           {/* Cart items */}
// //           <div className="bill-items-list">
// //             {items.length === 0 ? (
// //               <div className="bill-empty">
// //                 <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
// //                   style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }}>
// //                   <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
// //                 </svg>
// //                 Click any product to add it to the bill
// //               </div>
// //             ) : items.map(item => (
// //               <div key={item._id} style={{
// //                 padding: '8px 0',
// //                 borderBottom: '1px solid var(--border)',
// //               }}>
// //                 <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
// //                   <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
// //                     {item.imageUrl
// //                       ? <img src={`${IMG}${item.imageUrl}`} alt={item.name}
// //                         style={{ width: 42, height: 42, objectFit: 'cover', display: 'block' }}
// //                         onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = item.swatchColor || '#E8F5F0'; }} />
// //                       : <div style={{ width: 42, height: 42, background: item.swatchColor || '#E8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                         <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(0,0,0,0.25)' }}>{item.name.slice(0, 2).toUpperCase()}</span>
// //                       </div>
// //                     }
// //                   </div>
// //                   <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
// //                     <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
// //                     <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
// //                       ₹{item.pricePerUnit} / {item.unit} · {item.category?.name}{item.brand?.name ? ` · ${item.brand.name}` : ''}
// //                     </div>
// //                   </div>
// //                   <div style={{ flexShrink: 0, textAlign: 'right', paddingTop: 1 }}>
// //                     <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', lineHeight: 1, marginBottom: 3 }}>
// //                       {fmt(item.pricePerUnit * item.qty)}
// //                     </div>
// //                     <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>
// //                       {item.qty} × ₹{item.pricePerUnit}
// //                     </div>
// //                   </div>
// //                 </div>
// //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 52 }}>
// //                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                     <button className="qty-btn" onClick={e => { e.stopPropagation(); changeQty(item._id, -1); }}>−</button>
// //                     <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{item.qty}</span>
// //                     <button className="qty-btn" onClick={e => { e.stopPropagation(); changeQty(item._id, 1); }}>+</button>
// //                     <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>{item.unit}s</span>
// //                   </div>
// //                   <button onClick={e => { e.stopPropagation(); changeQty(item._id, -item.qty); }}
// //                     style={{ fontSize: 10, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: .2 }}>
// //                     Remove
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Footer */}
// //           <div className="bill-footer">
// //             {billError && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 8, fontWeight: 600 }}>{billError}</div>}

// //             <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
// //               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
// //                 <span>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
// //               </div>
// //               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
// //                 <span>GST</span><span style={{ fontWeight: 600 }}>{fmt(gstAmount)}</span>
// //               </div>
// //               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center' }}>
// //                 <span>Discount %</span>
// //                 <input type="number" min="0" max="100" value={discount}
// //                   onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
// //                   style={{ width: 54, textAlign: 'right', border: '1.5px solid var(--border-dark)', borderRadius: 6, padding: '2px 6px', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
// //               </div>
// //               {discount > 0 && (
// //                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
// //                   <span>Discount Amount</span><span style={{ fontWeight: 600 }}>-{fmt(discountAmt)}</span>
// //                 </div>
// //               )}
// //               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, letterSpacing: '-.5px', marginTop: 8, paddingTop: 8, borderTop: '2px solid var(--border)' }}>
// //                 <span>Total</span>
// //                 <span style={{ color: 'var(--primary)' }}>{fmt(total)}</span>
// //               </div>
// //             </div>

// //             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 8 }}>
// //               {['Cash', 'Card', 'UPI', 'NEFT'].map(m => (
// //                 <button key={m} onClick={() => { setPayMethod(m); setPayStatus(m === 'NEFT' ? 'Pending' : 'Paid'); }}
// //                   style={{ padding: '7px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${payMethod === m ? 'var(--primary-dark)' : 'var(--border-dark)'}`, background: payMethod === m ? 'var(--primary)' : 'var(--bg-hover)', color: payMethod === m ? 'white' : 'var(--text-secondary)', transition: 'all .12s' }}>
// //                   {m}
// //                 </button>
// //               ))}
// //             </div>

// //             <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
// //               {['Paid', 'Pending', 'Partial'].map(s => (
// //                 <button key={s} onClick={() => setPayStatus(s)}
// //                   style={{ flex: 1, padding: '5px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${payStatus === s ? 'var(--primary-dark)' : 'var(--border-dark)'}`, background: payStatus === s ? 'var(--primary)' : 'var(--bg-hover)', color: payStatus === s ? 'white' : 'var(--text-secondary)', transition: 'all .12s' }}>
// //                   {s}
// //                 </button>
// //               ))}
// //             </div>

// //             <input className="form-control" value={billNote} onChange={e => setBillNote(e.target.value)}
// //               placeholder="Bill note (optional)…"
// //               style={{ fontSize: 11, padding: '5px 10px', marginBottom: 8, color: 'var(--text-muted)' }} />

// //             {items.length > 0 && (
// //               <button onClick={handleHoldBill} disabled={holdingBill}
// //                 style={{ width: '100%', padding: '8px 0', marginBottom: 6,
// //                   background: 'transparent', color: 'var(--gold)',
// //                   border: '1.5px solid var(--gold)', borderRadius: 10,
// //                   fontWeight: 700, fontSize: 12, cursor: 'pointer',
// //                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
// //                 ⏸ {holdingBill ? 'Holding…' : 'Hold Bill (Ctrl+H)'}
// //               </button>
// //             )}

// //             <button onClick={handleGenerateBill} disabled={submitting || items.length === 0}
// //               style={{ width: '100%', padding: '12px 0', background: items.length === 0 ? 'var(--border)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: items.length === 0 ? 'not-allowed' : 'pointer', letterSpacing: '-.2px', transition: 'all .15s', boxShadow: items.length > 0 ? '0 4px 16px rgba(13,92,69,0.3)' : 'none' }}>
// //               {submitting ? 'Generating…' : items.length === 0 ? 'Add products to bill' : `Generate Bill · ${fmt(total)}`}
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default Billing;





// import { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   getProducts, getCategories, getBrands,
//   createCustomer, createBill, checkPhone,
//   returnItems, getBills, getBill, getSettings, getReceiptTemplates,
//   getProductByCode, holdBill, getHeldBills, releaseHeldBill,
// } from '../../services/api';
// import { useCart } from '../../context/CartContext';
// import Loader from '../common/Loader';
// import Modal  from '../common/Modal';
// import useDebounce from '../../hooks/useDebounce';

// const fmt     = n  => `₹${Number(n||0).toLocaleString('en-IN')}`;
// const initials= nm => nm?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
// const IMG     = 'http://localhost:5000';

// /* ═══════════════════════════════════════════════════════════
//    DYNAMIC RECEIPT — driven by Settings
// ═══════════════════════════════════════════════════════════ */
// const DynamicReceipt = ({ bill, s, co: company }) => {
//   const t      = s || {};          // template settings
//   const co     = company || {};    // company info (name, address, phone etc.)
//   const w      = Math.max(240, Math.min(420, t.receiptWidth || 300));
//   const tmpl   = t.layout   || 'modern';
//   const fontMap = { mono:'monospace', serif:'Georgia,serif', sans:'system-ui,sans-serif' };
//   const font   = fontMap[t.font] || 'system-ui,sans-serif';

//   const Divider = ({ dashed }) => (
//     <div style={{ borderTop: dashed ? '1px dashed #ccc' : '2px solid #222', margin:'7px 0' }}/>
//   );
//   const Row = ({ l, v, bold, color }) => (
//     <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
//       <span style={{ color:'#888' }}>{l}</span>
//       <span style={{ fontWeight:bold?800:500, color:color||'#222' }}>{v}</span>
//     </div>
//   );

//   /* ── Header ── */
//   const Header = () => {
//     if (tmpl === 'modern') return (
//       <div style={{ background:'#1a1a1a', color:'white', padding:'14px 18px', textAlign:'center' }}>
//         {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:17, letterSpacing:'-.3px' }}>{co.companyName || 'Store Name'}</div>}
//         {t.showTagline   !== false && co.tagline && <div style={{ fontSize:10, opacity:.85, marginTop:2 }}>{co.tagline}</div>}
//         {t.showPhone     !== false && co.phone   && <div style={{ fontSize:10, opacity:.8,  marginTop:4 }}>📞 {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
//         {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:9, opacity:.7, marginTop:2, fontFamily:'monospace' }}>GST: {co.gstNumber}</div>}
//       </div>
//     );
//     if (tmpl === 'classic') return (
//       <div style={{ textAlign:'center', borderBottom:"2px solid #222", paddingBottom:8, marginBottom:10 }}>
//         {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:16, color:"#222", letterSpacing:.5 }}>{co.companyName || 'Store Name'}</div>}
//         {t.showTagline   !== false && co.tagline   && <div style={{ fontSize:10, color:'#666' }}>{co.tagline}</div>}
//         {t.showAddress   !== false && co.address   && <div style={{ fontSize:10, color:'#666' }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
//         {t.showPhone     !== false && co.phone     && <div style={{ fontSize:10, color:'#555' }}>Ph: {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
//         {t.showEmail     === true  && co.email     && <div style={{ fontSize:10, color:'#666' }}>{co.email}</div>}
//         {t.showWebsite   === true  && co.website   && <div style={{ fontSize:10, color:'#666' }}>{co.website}</div>}
//         {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:10, color:'#555', fontFamily:'monospace' }}>GST: {co.gstNumber}</div>}
//       </div>
//     );
//     // minimal
//     return (
//       <div style={{ marginBottom:10 }}>
//         {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:16, color:"#222" }}>{co.companyName || 'Store Name'}</div>}
//         {t.showTagline   !== false && co.tagline && <div style={{ fontSize:10, color:'#888', marginTop:1 }}>{co.tagline}</div>}
//         {t.showAddress   !== false && co.address && <div style={{ fontSize:10, color:'#888', marginTop:2 }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
//         {t.showPhone     !== false && co.phone   && <div style={{ fontSize:10, color:'#888', marginTop:1 }}>📞 {co.phone}</div>}
//         {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:10, color:'#888', fontFamily:'monospace', marginTop:1 }}>GST: {co.gstNumber}</div>}
//       </div>
//     );
//   };

//   /* ── Items table ── */
//   const ItemsTable = () => (
//     <div style={{ marginBottom:6 }}>
//       <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontWeight:700, color:'#888', marginBottom:4, paddingBottom:4, borderBottom:"1px solid #eee" }}>
//         <span style={{ flex:2 }}>Item</span>
//         <span style={{ textAlign:'right', minWidth:32 }}>Qty</span>
//         <span style={{ textAlign:'right', minWidth:40 }}>Rate</span>
//         <span style={{ textAlign:'right', minWidth:44 }}>Amt</span>
//       </div>
//       {bill.items.map((it,i) => (
//         <div key={i} style={{ marginBottom:5 }}>
//           <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, alignItems:'flex-start' }}>
//             <div style={{ flex:2, paddingRight:4 }}>
//               <div style={{ fontWeight:600, lineHeight:1.3 }}>{it.productName}</div>
//             </div>
//             <span style={{ textAlign:'right', minWidth:32, fontFamily:'monospace', fontSize:11 }}>{it.quantity}{it.unit?.[0]}</span>
//             <span style={{ textAlign:'right', minWidth:40, fontFamily:'monospace', fontSize:11 }}>₹{it.pricePerUnit}</span>
//             <span style={{ textAlign:'right', minWidth:44, fontWeight:700, fontFamily:'monospace', fontSize:11 }}>₹{it.amount}</span>
//           </div>
//           {t.showRateQty !== false && (
//             <div style={{ fontSize:9, color:'#999', paddingLeft:2, marginTop:1 }}>
//               ₹{it.pricePerUnit}/{it.unit} × {it.quantity}{it.unit?.[0]} = ₹{it.amount}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   /* ── Totals ── */
//   const Totals = () => (
//     <div style={{ fontSize:11 }}>
//       <Row l="Subtotal" v={fmt(bill.subtotal)}/>
//       {t.showGSTBreakdown !== false ? <>
//         <Row l={`CGST ${2.5}%`} v={fmt(bill.gstAmount/2)}/>
//         <Row l={`SGST ${2.5}%`} v={fmt(bill.gstAmount/2)}/>
//       </> : (
//         <Row l="GST" v={fmt(bill.gstAmount)}/>
//       )}
//       {t.showDiscount !== false && bill.discountPct > 0 && (
//         <Row l={`Discount (${bill.discountPct}%)`} v={`-${fmt(bill.discountAmt)}`} color="#C0392B"/>
//       )}
//       {t.showSavings && bill.discountAmt > 0 && (
//         <div style={{ fontSize:10, color:'#16A34A', textAlign:'right', marginBottom:2, fontWeight:600 }}>
//           🎉 You saved {fmt(bill.discountAmt)}!
//         </div>
//       )}
//     </div>
//   );

//   /* ── Footer ── */
//   const Footer = () => (
//     <div style={{ textAlign:'center', marginTop:8, paddingTop:8, borderTop:'1px dashed #ddd' }}>
//       {t.showPaymentMode !== false && (
//         <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>
//           Payment: <strong>{bill.paymentMethod}</strong>
//         </div>
//       )}
//       {t.showThankYou !== false && t.footerLine1 && (
//         <div style={{ fontSize:10, color:'#888', fontStyle:'italic' }}>{t.footerLine1}</div>
//       )}
//       {t.footerLine2 && (
//         <div style={{ fontSize:10, color:'#aaa', marginTop:3 }}>{t.footerLine2}</div>
//       )}
//       {t.showPhone !== false && co.phone && tmpl === 'modern' && (
//         <div style={{ fontSize:11, color:"#222", marginTop:6, fontWeight:700 }}>📞 {co.phone}</div>
//       )}
//     </div>
//   );

//   /* ── Bill meta ── */
//   const BillMeta = () => (
//     <div style={{ marginBottom:8 }}>
//       {tmpl === 'modern' ? (
//         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
//           {t.showBillNumber !== false && <span style={{ fontWeight:800, fontSize:12, color:"#222" }}>{bill.billNumber}</span>}
//           {t.showDate !== false && <span style={{ fontSize:10, color:'#888' }}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</span>}
//         </div>
//       ) : (
//         <>
//           {t.showBillNumber !== false && <Row l="Bill #" v={bill.billNumber} bold/>}
//           {t.showDate !== false && <Row l="Date" v={new Date(bill.createdAt).toLocaleString('en-IN')}/>}
//         </>
//       )}
//       {t.showCustomer !== false && (
//         tmpl === 'modern'
//           ? <div style={{ background:'#f8f9fa', borderRadius:8, padding:'8px 10px', marginBottom:10 }}>
//               <div style={{ fontSize:11, fontWeight:700, marginBottom:2 }}>Customer</div>
//               <div style={{ fontSize:12 }}>{bill.customerName}</div>
//               {t.showCustomerPhone !== false && bill.customerPhone && <div style={{ fontSize:10, color:'#888' }}>{bill.customerPhone}</div>}
//             </div>
//           : <>
//               <Row l="Customer" v={bill.customerName}/>
//               {t.showCustomerPhone !== false && bill.customerPhone && <Row l="Phone" v={bill.customerPhone}/>}
//             </>
//       )}
//     </div>
//   );

//   const boxShadow = '0 8px 32px rgba(0,0,0,0.14)';
//   const borderRadius = tmpl==='minimal' ? 8 : 12;

//   return (
//     <div style={{ width:w, fontFamily:font, background:'white', borderRadius, boxShadow, overflow:'hidden', border:'1px solid #e5e7eb' }}>
//       <Header/>
//       <div style={{ padding: tmpl==='modern' ? '12px 16px' : '18px 20px' }}>
//         <BillMeta/>
//         {tmpl !== 'modern' && <Divider dashed/>}
//         <ItemsTable/>
//         <Divider dashed/>
//         <Totals/>
//         <Divider/>
//         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:800, fontSize:16 }}>
//           <span>TOTAL</span>
//           <span style={{ fontSize:20 }}>{fmt(bill.total)}</span>
//         </div>
//         <Footer/>
//       </div>
//     </div>
//   );
// };

// /* ═══════════════════════════════════════════════════════════
//    RECEIPT WRAPPER
// ═══════════════════════════════════════════════════════════ */
// const Receipt = ({ bill, settings, template, onClose, onNewBill }) => {
//   const ref    = useRef();
//   const co     = settings || {};
//   const tmpl   = template || {};

//   const handlePrint = () => {
//     const w = window.open('','_blank','width=400,height=600');
//     w.document.write(`
//       <html><head><title>Receipt ${bill.billNumber}</title>
//       <style>
//         *{box-sizing:border-box;margin:0;padding:0}
//         body{font-family:sans-serif;background:#fff;display:flex;justify-content:center;padding:20px}
//         @media print{body{padding:0}button{display:none!important}}
//         .no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
//         .no-print button{padding:8px 20px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}
//         .print-btn{background:#0D5C45;color:white}
//         .close-btn{background:#f1f5f9;color:#333}
//       </style>
//       </head><body>
//       <div>
//         ${ref.current.innerHTML}
//         <div class="no-print">
//           <button class="print-btn" onclick="window.print()">🖨 Print</button>
//           <button class="close-btn" onclick="window.close()">Close</button>
//         </div>
//       </div>
//       </body></html>
//     `);
//     w.document.close();
//   };

//   return (
//     <div className="modal-overlay">
//       <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,maxHeight:'90vh',overflowY:'auto'}}>
//         <div ref={ref}>
//           <DynamicReceipt bill={bill} s={tmpl} co={co}/>
//         </div>
//         {/* Three buttons — same height, bottom of receipt */}
//         <div style={{
//           display:'grid',
//           gridTemplateColumns:'1fr 1fr 1fr',
//           gap:10,
//           width:'100%',
//           maxWidth:290,
//         }}>
//           <button onClick={handlePrint} style={{
//             display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
//             gap:5,padding:'12px 8px',
//             background:'var(--primary)',color:'white',
//             border:'none',borderRadius:10,cursor:'pointer',
//             fontWeight:700,fontSize:12,lineHeight:1.2,
//           }}>
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
//             Print
//           </button>
//           <button onClick={onNewBill} style={{
//             display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
//             gap:5,padding:'12px 8px',
//             background:'var(--bg-card)',color:'var(--primary)',
//             border:'1.5px solid var(--primary)',borderRadius:10,cursor:'pointer',
//             fontWeight:700,fontSize:12,lineHeight:1.2,
//           }}>
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
//             New Bill
//           </button>
//           <button onClick={onClose} style={{
//             display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
//             gap:5,padding:'12px 8px',
//             background:'var(--bg-hover)',color:'var(--text-secondary)',
//             border:'1.5px solid var(--border-dark)',borderRadius:10,cursor:'pointer',
//             fontWeight:700,fontSize:12,lineHeight:1.2,
//           }}>
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ═══════════════════════════════════════════════════════════
//    RETURN MODAL
// ═══════════════════════════════════════════════════════════ */
// const ReturnModal = ({ open, onClose, bill, onSuccess }) => {
//   const [qtys,   setQtys]   = useState({});
//   const [reason, setReason] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [msg,    setMsg]    = useState({ type:'', text:'' });

//   useEffect(() => {
//     if (open && bill) {
//       const init = {};
//       bill.items.forEach(it => { init[it.product] = 0; });
//       setQtys(init); setReason(''); setMsg({type:'',text:''});
//     }
//   }, [open, bill]);

//   const totalRefund = bill?.items.reduce((s,it) => s + (qtys[it.product]||0) * it.pricePerUnit * (1+it.gstRate/100), 0) || 0;

//   const handleReturn = async () => {
//     const items = bill.items
//       .filter(it => qtys[it.product] > 0)
//       .map(it => ({ productId:it.product, productName:it.productName, quantity:Number(qtys[it.product]) }));
//     if (!items.length) return setMsg({type:'danger', text:'Enter quantity for at least one item.'});
//     setSaving(true); setMsg({type:'',text:''});
//     try {
//       const { data } = await returnItems(bill._id, { items, reason });
//       setMsg({type:'success', text: data.message });
//       setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
//     } catch(err) { setMsg({type:'danger', text: err.response?.data?.message||'Return failed.'}); }
//     finally { setSaving(false); }
//   };

//   if (!open || !bill) return null;
//   return (
//     <Modal open={open} onClose={onClose} title={`Return Items — ${bill.billNumber}`}
//       footer={<>
//         <button className="btn" onClick={onClose}>Cancel</button>
//         <button className="btn btn-danger" onClick={handleReturn} disabled={saving}>
//           {saving ? 'Processing…' : 'Confirm Return'}
//         </button>
//       </>}>
//       <div className="alert alert-warning" style={{marginBottom:14,fontSize:12}}>
//         Returned items will be added back to inventory stock automatically.
//       </div>
//       {msg.text && <div className={`alert alert-${msg.type}`} style={{marginBottom:12}}>{msg.text}</div>}
//       <div style={{background:'var(--bg-hover)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
//         <div style={{fontWeight:700,fontSize:13}}>{bill.customerName}</div>
//         {bill.customerPhone && <div style={{fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{bill.customerPhone}</div>}
//       </div>
//       {bill.items.map(it => {
//         const canReturn = it.quantity - (it.returnedQty||0);
//         const q = qtys[it.product]||0;
//         return (
//           <div key={it.product} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
//             <div style={{flex:1}}>
//               <div style={{fontWeight:700,fontSize:13}}>{it.productName}</div>
//               <div style={{fontSize:11,color:'var(--text-muted)'}}>
//                 Billed: {it.quantity}{it.unit?.[0]} · Can return: <strong style={{color:canReturn>0?'var(--primary)':'var(--danger)'}}>{canReturn}{it.unit?.[0]}</strong>
//               </div>
//             </div>
//             <div style={{display:'flex',alignItems:'center',gap:6}}>
//               <input type="number" min="0" max={canReturn} value={q} disabled={canReturn<=0}
//                 onChange={e => setQtys(prev => ({...prev,[it.product]:Math.min(canReturn,Math.max(0,Number(e.target.value)))}))}
//                 style={{width:60,padding:'6px 8px',border:'1.5px solid var(--border-dark)',borderRadius:6,fontFamily:'var(--font-mono)',fontSize:14,fontWeight:800,textAlign:'center'}}/>
//               {q > 0 && <span style={{fontSize:11,color:'var(--primary)',fontWeight:700,minWidth:60}}>+{fmt(q*it.pricePerUnit*(1+it.gstRate/100))}</span>}
//             </div>
//           </div>
//         );
//       })}
//       {totalRefund > 0 && (
//         <div style={{marginTop:14,padding:'10px 14px',background:'var(--primary-light)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//           <span style={{fontWeight:700,fontSize:13,color:'var(--primary)'}}>Total Refund Amount</span>
//           <span style={{fontWeight:800,fontSize:18,color:'var(--primary)'}}>{fmt(totalRefund)}</span>
//         </div>
//       )}
//       <div className="form-group" style={{marginTop:14}}>
//         <label className="form-label">Return Reason (optional)</label>
//         <input className="form-control" value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Damaged fabric, wrong colour, customer changed mind"/>
//       </div>
//     </Modal>
//   );
// };

// /* ═══════════════════════════════════════════════════════════
//    MAIN BILLING PAGE
// ═══════════════════════════════════════════════════════════ */
// const Billing = () => {
//   const { items, addItem, changeQty, clearCart, subtotal } = useCart();

//   const [products,   setProducts]   = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [brands,     setBrands]     = useState([]);
//   const [settings,   setSettings]   = useState(null);
//   const [defaultTmpl,setDefaultTmpl]= useState(null);
//   const [loading,    setLoading]    = useState(true);

//   const [search,      setSearch]      = useState('');
//   const [catFilter,   setCatFilter]   = useState('');
//   const [brandFilter, setBrandFilter] = useState('');

//   // Customer
//   const [phone,          setPhone]          = useState('');
//   const [phoneStatus,    setPhoneStatus]    = useState(null);
//   const [foundCustomer,  setFoundCustomer]  = useState(null);
//   const [customerId,     setCustomerId]     = useState('');
//   const [newCustName,    setNewCustName]    = useState('');
//   const [savingCust,     setSavingCust]     = useState(false);
//   const [custError,      setCustError]      = useState('');

//   // Bill
//   const [discount,   setDiscount]   = useState(0);
//   const [payMethod,  setPayMethod]  = useState('Cash');
//   const [payStatus,  setPayStatus]  = useState('Paid');
//   const [submitting, setSubmitting] = useState(false);
//   const [receipt,    setReceipt]    = useState(null);
//   const [billError,  setBillError]  = useState('');

//   // Return
//   const [returnStep,    setReturnStep]    = useState(0); // 0=hidden,1=search,2=confirm
//   const [returnBillNo,  setReturnBillNo]  = useState('');
//   const [returnBill,    setReturnBill]    = useState(null);
//   const [searchingBill, setSearchingBill] = useState(false);

//   // QR Scanner
//   const [qrInput,     setQrInput]     = useState('');
//   const [qrError,     setQrError]     = useState('');
//   const [qrLoading,   setQrLoading]   = useState(false);
//   const qrRef  = useRef();
//   const srchRef= useRef();

//   // Quick-add quantity modal (shown after QR scan)
//   const [quickAdd,    setQuickAdd]    = useState(null); // { product, offers }
//   const [quickQty,    setQuickQty]    = useState('1');
//   const quickQtyRef = useRef();

//   // Hold bill
//   const [heldBills,   setHeldBills]   = useState([]);
//   const [showHeld,    setShowHeld]    = useState(false);
//   const [holdingBill, setHoldingBill] = useState(false);

//   // Bill notes
//   const [billNote,    setBillNote]    = useState('');

//   const debouncedSearch = useDebounce(search);
//   const debouncedPhone  = useDebounce(phone, 600);

//   useEffect(() => {
//     Promise.all([getProducts(), getCategories(), getBrands(), getSettings(), getReceiptTemplates()])
//       .then(([p,c,b,s,r]) => {
//         setProducts(p.data.data||[]);
//         setCategories(c.data.data||[]);
//         setBrands(b.data.data||[]);
//         setSettings(s.data.data);
//         const dflt = (r.data.data||[]).find(t=>t.isDefault) || (r.data.data||[])[0];
//         setDefaultTmpl(dflt);
//       })
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (!loading)
//       getProducts({ search:debouncedSearch||undefined, category:catFilter||undefined, brand:brandFilter||undefined })
//         .then(({data}) => setProducts(data.data||[])).catch(console.error);
//   }, [debouncedSearch, catFilter, brandFilter]);

//   useEffect(() => {
//     if (!debouncedPhone || debouncedPhone.length < 10) {
//       setPhoneStatus(null); setFoundCustomer(null); setCustomerId(''); return;
//     }
//     checkPhone(debouncedPhone).then(({data}) => {
//       if (data.exists) { setPhoneStatus('found'); setFoundCustomer(data.customer); setCustomerId(data.customer._id); }
//       else             { setPhoneStatus('new');   setFoundCustomer(null);          setCustomerId(''); }
//     }).catch(console.error);
//   }, [debouncedPhone]);

//   // ── QR Code scan / enter ─────────────────────────────────
//   const handleQrSubmit = async (rawValue) => {
//     const val = rawValue?.trim();
//     if (!val) return;
//     setQrError(''); setQrLoading(true);
//     try {
//       // Try to parse JSON QR format first, fall back to raw code
//       let code = val;
//       try { const parsed = JSON.parse(val); code = parsed.code || val; } catch {}
//       const { data } = await getProductByCode(code);
//       if (!data.success) { setQrError(`Product "${code}" not found`); return; }
//       const product = data.data;
//       if (product.stock <= 0) { setQrError(`"${product.name}" is out of stock`); return; }
//       // Show quick-add modal with offers
//       setQuickAdd(product);
//       setQuickQty('1');
//       setQrInput('');
//       setTimeout(() => quickQtyRef.current?.focus(), 60);
//     } catch(err) {
//       setQrError(err.response?.data?.message || 'Product not found. Check the code.');
//     } finally { setQrLoading(false); }
//   };

//   const handleQrKey = e => {
//     if (e.key === 'Enter') { handleQrSubmit(qrInput); }
//     else if (e.key === 'Escape') { setQrInput(''); setQrError(''); }
//   };

//   // ── Quick-add confirm ─────────────────────────────────────
//   const confirmQuickAdd = () => {
//     if (!quickAdd) return;
//     const qty = Math.max(0.5, parseFloat(quickQty) || 1);
//     if (qty > quickAdd.stock) {
//       alert(`Only ${quickAdd.stock} ${quickAdd.unit}s in stock`); return;
//     }
//     // Get offer discount if any
//     const offer = (quickAdd.offers || []).find(o => o.isValid && qty >= o.minQty);
//     const productWithOffer = offer ? { ...quickAdd, _offerDiscount: offer } : quickAdd;
//     // Add item qty times (addItem adds 1 each time, so we use changeQty after)
//     const existing = items.find(i => i._id === quickAdd._id);
//     if (existing) {
//       // Already in cart — increase by qty
//       for (let i = 0; i < qty; i++) changeQty(quickAdd._id, 1);
//     } else {
//       addItem({ ...productWithOffer });
//       // Set to exact qty if > 1
//       if (qty > 1) {
//         for (let i = 1; i < qty; i++) changeQty(quickAdd._id, 1);
//       }
//     }
//     setQuickAdd(null);
//     qrRef.current?.focus();
//   };

//   // ── Hold Bill ─────────────────────────────────────────────
//   const handleHoldBill = async () => {
//     if (!items.length) return;
//     setHoldingBill(true);
//     try {
//       const label = billNote.trim() || `Hold — ${new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}`;
//       await holdBill({
//         label, customerId, customerName: foundCustomer?.name || '',
//         customerPhone: phone, items, discount: discount, payMethod,
//       });
//       const { data } = await getHeldBills();
//       setHeldBills(data.data || []);
//       handleNewBill();
//       alert(`Bill held as "${label}". You can resume it from Hold Bills.`);
//     } catch(err) { alert(err.response?.data?.message || 'Failed to hold bill.'); }
//     finally { setHoldingBill(false); }
//   };

//   const handleResumeHeld = async (held) => {
//     if (items.length && !window.confirm('Current bill will be cleared. Resume held bill?')) return;
//     clearCart();
//     held.items.forEach(item => {
//       addItem(item);
//       for (let i = 1; i < item.qty; i++) changeQty(item._id, 1);
//     });
//     if (held.customerPhone) setPhone(held.customerPhone);
//     setDiscount(held.discount || 0);
//     setPayMethod(held.payMethod || 'Cash');
//     setBillNote(held.label || '');
//     // Delete the held bill
//     await releaseHeldBill(held._id);
//     setHeldBills(prev => prev.filter(h => h._id !== held._id));
//     setShowHeld(false);
//   };

//   // ── Keyboard shortcuts ────────────────────────────────────
//   useEffect(() => {
//     const handler = e => {
//       // F2 → focus QR scanner
//       if (e.key === 'F2') { e.preventDefault(); qrRef.current?.focus(); }
//       // F3 → focus search
//       if (e.key === 'F3') { e.preventDefault(); srchRef.current?.focus(); }
//       // Ctrl+H → hold bill
//       if (e.ctrlKey && e.key === 'h') { e.preventDefault(); handleHoldBill(); }
//       // Ctrl+N → new bill
//       if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleNewBill(); }
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [items, phone, discount, payMethod, foundCustomer, billNote]);

//   // Load held bills on mount
//   useEffect(() => {
//     getHeldBills().then(({data}) => setHeldBills(data.data||[])).catch(()=>{});
//   }, []);

//   const saveNewCustomer = async () => {
//     if (!newCustName.trim()) return setCustError('Enter customer name.');
//     setCustError(''); setSavingCust(true);
//     try {
//       const { data } = await createCustomer({ name:newCustName.trim(), phone:phone.trim() });
//       setFoundCustomer(data.data); setCustomerId(data.data._id);
//       setPhoneStatus('found'); setNewCustName('');
//     } catch(err) { setCustError(err.response?.data?.message||'Failed to save.'); }
//     finally { setSavingCust(false); }
//   };

//   const clearCustomer = () => {
//     setPhone(''); setPhoneStatus(null); setFoundCustomer(null);
//     setCustomerId(''); setNewCustName(''); setCustError('');
//   };

//   const gstAmount   = items.reduce((s,i) => s + i.pricePerUnit*i.qty*(i.gstRate||5)/100, 0);
//   const discountAmt = (subtotal+gstAmount)*discount/100;
//   const total       = subtotal+gstAmount-discountAmt;

//   const handleGenerateBill = async () => {
//     if (!items.length) return setBillError('Add at least one product.');
//     setBillError(''); setSubmitting(true);
//     try {
//       const { data } = await createBill({
//         customerId: customerId||undefined,
//         items: items.map(i => ({ productId:i._id, quantity:i.qty })),
//         discountPct: Number(discount), paymentMethod: payMethod, paymentStatus: payStatus,
//       });
//       setReceipt(data.data);
//     } catch(err) { setBillError(err.response?.data?.message||'Failed to generate bill.'); }
//     finally { setSubmitting(false); }
//   };

//   const handleNewBill = () => {
//     setReceipt(null); clearCart(); clearCustomer();
//     setDiscount(0); setPayMethod('Cash'); setPayStatus('Paid'); setBillError('');
//   };

//   const handleSearchBill = async () => {
//     if (!returnBillNo.trim()) return;
//     setSearchingBill(true);
//     try {
//       const { data:list } = await getBills({ search:returnBillNo.trim(), limit:5 });
//       const match = (list.data||[]).find(b => b.billNumber.toUpperCase()===returnBillNo.toUpperCase());
//       if (!match) return alert('Bill not found. Check the bill number.');
//       const { data:full } = await getBill(match._id);
//       setReturnBill(full.data); setReturnStep(2);
//     } catch { alert('Error finding bill.'); }
//     finally { setSearchingBill(false); }
//   };

//   if (loading) return <Loader/>;

//   return (
//     <>
//       {receipt && (
//         <Receipt
//           bill={receipt}
//           settings={settings}
//           template={defaultTmpl}
//           onClose={handleNewBill}
//           onNewBill={handleNewBill}
//         />
//       )}

//       {/* ── Quick-Add Modal (after QR scan) ── */}
//       {quickAdd && (
//         <div className="modal-overlay">
//           <div className="modal" style={{maxWidth:420}}>
//             <div className="modal-header">
//               <span className="modal-title">Add to Bill</span>
//               <button className="btn btn-ghost btn-icon" style={{fontSize:20}} onClick={()=>{setQuickAdd(null);qrRef.current?.focus();}}>×</button>
//             </div>
//             <div className="modal-body">
//               {/* Product info */}
//               <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 14px',background:'var(--bg-hover)',borderRadius:10,marginBottom:16}}>
//                 {quickAdd.imageUrl
//                   ? <img src={`http://localhost:5000${quickAdd.imageUrl}`} alt={quickAdd.name} style={{width:56,height:56,borderRadius:8,objectFit:'cover',border:'1.5px solid var(--border)',flexShrink:0}}/>
//                   : <div style={{width:56,height:56,borderRadius:8,background:quickAdd.swatchColor||'#E8F5F0',flexShrink:0,border:'1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'rgba(0,0,0,.2)'}}>{quickAdd.name.slice(0,2).toUpperCase()}</div>
//                 }
//                 <div style={{flex:1}}>
//                   <div style={{fontWeight:800,fontSize:15}}>{quickAdd.name}</div>
//                   <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{quickAdd.code} · {quickAdd.category?.name}</div>
//                   <div style={{display:'flex',gap:12,marginTop:4}}>
//                     <span style={{fontWeight:800,fontSize:16,color:'var(--primary)'}}>₹{quickAdd.pricePerUnit}/{quickAdd.unit}</span>
//                     <span style={{fontSize:11,color:quickAdd.isLowStock?'var(--danger)':'var(--text-muted)',alignSelf:'center',fontWeight:600}}>
//                       {quickAdd.stock} {quickAdd.unit}s in stock
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Active offers */}
//               {(quickAdd.offers||[]).filter(o=>o.isValid).length > 0 && (
//                 <div style={{marginBottom:14}}>
//                   <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>🏷 Active Offers</div>
//                   {(quickAdd.offers||[]).filter(o=>o.isValid).map((offer,i) => (
//                     <div key={i} style={{background:'linear-gradient(135deg,#FDF5E6,#FFF7ED)',border:'1.5px solid #E8B855',borderRadius:8,padding:'8px 12px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//                       <div>
//                         <div style={{fontWeight:700,fontSize:13,color:'#92540A'}}>{offer.title}</div>
//                         <div style={{fontSize:11,color:'#B45309',marginTop:1}}>
//                           {offer.type==='percent'?`${offer.value}% off`:`₹${offer.value} flat off`}
//                           {offer.minQty>1 ? ` · Min ${offer.minQty}${quickAdd.unit}s` : ''}
//                           {offer.expiresAt ? ` · Expires ${new Date(offer.expiresAt).toLocaleDateString('en-IN')}` : ''}
//                         </div>
//                       </div>
//                       <span style={{background:'#C9993A',color:'white',fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:12}}>
//                         {offer.type==='percent'?`-${offer.value}%`:`-₹${offer.value}`}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Quantity input */}
//               <div className="form-group" style={{marginBottom:0}}>
//                 <label className="form-label">Quantity ({quickAdd.unit}s)</label>
//                 <div style={{display:'flex',alignItems:'center',gap:10}}>
//                   <button onClick={()=>setQuickQty(q=>String(Math.max(0.5,Number(q)-1)))}
//                     style={{width:36,height:36,border:'1.5px solid var(--border-dark)',borderRadius:8,background:'var(--bg-hover)',fontSize:18,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
//                   <input ref={quickQtyRef} type="number" min="0.5" max={quickAdd.stock} step="0.5" value={quickQty}
//                     onChange={e=>setQuickQty(e.target.value)}
//                     onKeyDown={e=>{ if(e.key==='Enter') confirmQuickAdd(); if(e.key==='Escape'){setQuickAdd(null);qrRef.current?.focus();} }}
//                     style={{flex:1,textAlign:'center',fontSize:22,fontWeight:800,padding:'8px',border:'1.5px solid var(--border-dark)',borderRadius:8,fontFamily:'var(--font-mono)'}}
//                     autoFocus/>
//                   <button onClick={()=>setQuickQty(q=>String(Math.min(quickAdd.stock,Number(q)+1)))}
//                     style={{width:36,height:36,border:'1.5px solid var(--border-dark)',borderRadius:8,background:'var(--bg-hover)',fontSize:18,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
//                 </div>
//                 {Number(quickQty) > 0 && (
//                   <div style={{marginTop:8,padding:'8px 12px',background:'var(--primary-light)',borderRadius:8,display:'flex',justifyContent:'space-between',fontSize:13}}>
//                     <span style={{fontWeight:600,color:'var(--primary)'}}>Total for this item</span>
//                     <span style={{fontWeight:800,fontSize:15,color:'var(--primary)'}}>{fmt(Number(quickQty)*quickAdd.pricePerUnit)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="btn" onClick={()=>{setQuickAdd(null);qrRef.current?.focus();}}>Cancel</button>
//               <button className="btn btn-primary" onClick={confirmQuickAdd} style={{fontWeight:700,gap:8}}>
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
//                 Add {quickQty} {quickAdd.unit}s to Bill
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Held Bills Modal ── */}
//       {showHeld && (
//         <div className="modal-overlay">
//           <div className="modal" style={{maxWidth:480}}>
//             <div className="modal-header">
//               <span className="modal-title">⏸ Held Bills ({heldBills.length})</span>
//               <button className="btn btn-ghost btn-icon" style={{fontSize:20}} onClick={()=>setShowHeld(false)}>×</button>
//             </div>
//             <div className="modal-body">
//               {heldBills.length===0
//                 ? <div style={{textAlign:'center',padding:'30px 0',color:'var(--text-muted)'}}>No held bills</div>
//                 : heldBills.map(held => (
//                   <div key={held._id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg-hover)',borderRadius:10,marginBottom:8,border:'1.5px solid var(--border)'}}>
//                     <div style={{flex:1}}>
//                       <div style={{fontWeight:700,fontSize:13}}>{held.label}</div>
//                       <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>
//                         {held.items?.length||0} items
//                         {held.customerName ? ` · ${held.customerName}` : ' · Walk-in'}
//                         {' · '}{new Date(held.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
//                       </div>
//                     </div>
//                     <button className="btn btn-sm btn-primary" onClick={()=>handleResumeHeld(held)}>▶ Resume</button>
//                   </div>
//                 ))
//               }
//             </div>
//             <div className="modal-footer">
//               <button className="btn" onClick={()=>setShowHeld(false)}>Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Return — search step */}
//       {returnStep === 1 && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <span className="modal-title">Process Product Return</span>
//               <button className="btn btn-ghost btn-icon" style={{fontSize:20,lineHeight:1}} onClick={()=>setReturnStep(0)}>×</button>
//             </div>
//             <div className="modal-body">
//               <div className="alert alert-info" style={{marginBottom:14,fontSize:12}}>
//                 Enter the original bill number to find the sale and select items to return.
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Bill Number</label>
//                 <input className="form-control" placeholder="e.g. BL-202603-0001"
//                   value={returnBillNo} onChange={e=>setReturnBillNo(e.target.value.toUpperCase())}
//                   onKeyDown={e=>e.key==='Enter'&&handleSearchBill()} autoFocus
//                   style={{fontFamily:'var(--font-mono)',fontWeight:700,letterSpacing:'.05em',fontSize:15}}/>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="btn" onClick={()=>setReturnStep(0)}>Cancel</button>
//               <button className="btn btn-danger" onClick={handleSearchBill} disabled={searchingBill||!returnBillNo.trim()}>
//                 {searchingBill?'Searching…':'Find Bill →'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <ReturnModal
//         open={returnStep===2}
//         bill={returnBill}
//         onClose={()=>{ setReturnStep(0); setReturnBill(null); setReturnBillNo(''); }}
//         onSuccess={()=>{}}
//       />

//       {/* ══ MAIN LAYOUT ══ */}
//       <div className="pos-layout">

//         {/* ── LEFT: Products ── */}
//         <div className="pos-products">
//           {/* Search + QR scanner + filters row */}
//           <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
//             {/* Search */}
//             <input ref={srchRef} className="form-control" style={{flex:1,minWidth:140}} placeholder="🔍 Search fabric name or code… (F3)"
//               value={search} onChange={e=>setSearch(e.target.value)}/>

//             {/* ── QR Scanner field ── */}
//             <div style={{position:'relative',display:'flex',alignItems:'center',flexShrink:0}}>
//               <div style={{
//                 position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
//                 color:qrLoading?'var(--primary)':qrError?'var(--danger)':'#64748B',
//                 pointerEvents:'none',fontSize:15,lineHeight:1,
//               }}>
//                 {qrLoading
//                   ? <div style={{width:14,height:14,border:'2px solid var(--primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
//                   : '⬛'
//                 }
//               </div>
//               <input
//                 ref={qrRef}
//                 type="text"
//                 value={qrInput}
//                 onChange={e=>{setQrInput(e.target.value);setQrError('');}}
//                 onKeyDown={handleQrKey}
//                 placeholder="Scan QR / enter code (F2)"
//                 style={{
//                   paddingLeft:32,paddingRight:10,
//                   width:210,height:38,
//                   border:`1.5px solid ${qrError?'var(--danger)':'var(--border-dark)'}`,
//                   borderRadius:'var(--radius-md)',
//                   fontSize:12,fontFamily:'var(--font-mono)',fontWeight:600,
//                   background:'var(--bg-card)',color:'var(--text-primary)',
//                   outline:'none',
//                   boxShadow: qrError?'0 0 0 3px rgba(192,57,43,.12)':'none',
//                 }}
//               />
//               {qrInput && (
//                 <button onClick={()=>handleQrSubmit(qrInput)}
//                   style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',
//                     background:'var(--primary)',color:'white',border:'none',borderRadius:6,
//                     width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',
//                     cursor:'pointer',fontSize:11,fontWeight:800,lineHeight:1}}>
//                   ↵
//                 </button>
//               )}
//             </div>
//             {qrError && <div style={{fontSize:11,color:'var(--danger)',fontWeight:600,width:'100%',marginTop:-4,paddingLeft:2}}>{qrError}</div>}

//             <select className="form-control" style={{width:135}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
//               <option value="">All Categories</option>
//               {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
//             </select>
//             <select className="form-control" style={{width:125}} value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}>
//               <option value="">All Brands</option>
//               {brands.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
//             </select>
//             <button className="btn btn-sm"
//               style={{borderColor:'var(--danger)',color:'var(--danger)',fontWeight:700,whiteSpace:'nowrap'}}
//               onClick={()=>{ setReturnBillNo(''); setReturnBill(null); setReturnStep(1); }}>
//               ↩ Return
//             </button>
//             {/* Hold Bills button */}
//             {heldBills.length > 0 && (
//               <button className="btn btn-sm" onClick={()=>setShowHeld(true)}
//                 style={{borderColor:'var(--gold)',color:'var(--gold)',fontWeight:700,position:'relative',whiteSpace:'nowrap'}}>
//                 ⏸ Held
//                 <span style={{position:'absolute',top:-6,right:-6,background:'var(--gold)',color:'white',fontSize:9,fontWeight:800,width:16,height:16,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
//                   {heldBills.length}
//                 </span>
//               </button>
//             )}
//           </div>

//           {/* Product grid */}
//           <div style={{
//             display:'grid',
//             gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',
//             gap:10,
//             overflowY:'auto',
//             flex:1,
//             paddingRight:2,
//             paddingBottom:8,
//             paddingTop:2,
//             alignContent:'start',
//           }}>
//             {products.length===0 && (
//               <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
//                 <div style={{fontSize:32,marginBottom:8}}>🔍</div>
//                 No products found matching your search.
//               </div>
//             )}
//             {products.map(p => {
//               const inCart = items.find(i=>i._id===p._id);
//               const swatchBg = p.swatchColor || '#E8F5F0';
//               // Derive a readable text color from swatch
//               return (
//                 <div key={p._id}
//                   onClick={()=>addItem(p)}
//                   style={{
//                     background:'var(--bg-card)',
//                     border:`1.5px solid ${inCart?'var(--primary)':'var(--border)'}`,
//                     borderRadius:12,
//                     overflow:'hidden',
//                     cursor:'pointer',
//                     transition:'box-shadow .15s, border-color .15s, transform .12s',
//                     position:'relative',
//                     boxShadow: inCart ? '0 0 0 3px var(--primary-glow), var(--shadow-sm)' : 'var(--shadow-xs)',
//                     display:'flex',
//                     flexDirection:'column',
//                   }}
//                   onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=inCart?'0 0 0 3px var(--primary-glow), var(--shadow-md)':'var(--shadow-md)';e.currentTarget.style.borderColor='var(--primary)';}}
//                   onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=inCart?'0 0 0 3px var(--primary-glow), var(--shadow-sm)':'var(--shadow-xs)';e.currentTarget.style.borderColor=inCart?'var(--primary)':'var(--border)';}}
//                 >
//                   {/* In-cart badge */}
//                   {inCart && (
//                     <div style={{position:'absolute',top:7,right:7,background:'var(--primary)',color:'white',borderRadius:20,padding:'2px 7px',fontSize:10,fontWeight:800,zIndex:3,boxShadow:'0 2px 6px rgba(13,92,69,.4)'}}>
//                       ×{inCart.qty}
//                     </div>
//                   )}
//                   {/* Low stock badge */}
//                   {p.isLowStock && !inCart && (
//                     <div style={{position:'absolute',top:7,right:7,background:'var(--danger)',color:'white',borderRadius:20,padding:'2px 7px',fontSize:9,fontWeight:800,zIndex:3}}>
//                       Low
//                     </div>
//                   )}

//                   {/* Swatch / Image area */}
//                   {p.imageUrl
//                     ? <img src={`${IMG}${p.imageUrl}`} alt={p.name}
//                         style={{width:'100%',height:110,objectFit:'cover',display:'block',flexShrink:0}}
//                         onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
//                       />
//                     : null
//                   }
//                   {/* Swatch placeholder */}
//                   <div style={{
//                     width:'100%', height: p.imageUrl ? 0 : 110,
//                     display: p.imageUrl ? 'none' : 'flex',
//                     alignItems:'center', justifyContent:'center',
//                     background: swatchBg,
//                     flexShrink:0, position:'relative', overflow:'hidden',
//                   }}>
//                     {/* Subtle weave pattern */}
//                     <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.08}} xmlns="http://www.w3.org/2000/svg">
//                       <pattern id={`w${p._id}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
//                         <rect x="0" y="0" width="6" height="2" fill="#000"/><rect x="6" y="6" width="6" height="2" fill="#000"/>
//                         <rect x="0" y="0" width="2" height="6" fill="#000"/><rect x="6" y="6" width="2" height="6" fill="#000"/>
//                       </pattern>
//                       <rect width="100%" height="100%" fill={`url(#w${p._id})`}/>
//                     </svg>
//                     <div style={{textAlign:'center',zIndex:1,padding:'0 8px'}}>
//                       <div style={{fontSize:11,fontWeight:800,color:'rgba(0,0,0,0.35)',textTransform:'uppercase',letterSpacing:'.1em',lineHeight:1.2,wordBreak:'break-word'}}>
//                         {p.category?.name || 'Fabric'}
//                       </div>
//                     </div>
//                   </div>
//                   {/* Fallback when img errors */}
//                   <div style={{width:'100%',height:110,display:'none',alignItems:'center',justifyContent:'center',background:swatchBg,flexShrink:0}}>
//                     <div style={{fontSize:11,fontWeight:800,color:'rgba(0,0,0,0.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>{p.category?.name||'Fabric'}</div>
//                   </div>

//                   {/* Card body */}
//                   <div style={{padding:'9px 11px 11px',flex:1,display:'flex',flexDirection:'column',gap:3}}>
//                     <div style={{fontWeight:700,fontSize:12.5,lineHeight:1.25,color:'var(--text-primary)',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{p.name}</div>
//                     <div style={{fontSize:10,fontWeight:700,color:'var(--gold)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.brand?.name||'Generic'}</div>
//                     <div style={{fontSize:9.5,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>{p.category?.name}</div>
//                     <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:'auto',paddingTop:5}}>
//                       <span style={{fontWeight:800,fontSize:15,color:'var(--primary)',letterSpacing:'-.3px'}}>₹{p.pricePerUnit}<span style={{fontSize:9,fontWeight:600,color:'var(--text-muted)'}}>/{p.unit}</span></span>
//                       <span style={{fontSize:9.5,fontWeight:600,color:p.isLowStock?'var(--danger)':'var(--text-muted)'}}>
//                         {p.stock} {p.unit}s
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* ── RIGHT: Bill Panel ── */}
//         <div className="bill-panel">
//           {/* Header — dark */}
//           <div style={{padding:'14px 16px',borderBottom:'1.5px solid rgba(255,255,255,0.08)',background:'var(--bg-sidebar)'}}>
//             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
//               <div style={{fontWeight:800,fontSize:15,color:'white',letterSpacing:'-.3px',display:'flex',alignItems:'center',gap:8}}>
//                 New Bill
//                 {items.length>0 && (
//                   <span style={{background:'rgba(255,255,255,.2)',color:'white',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700}}>
//                     {items.length} item{items.length>1?'s':''}
//                   </span>
//                 )}
//               </div>
//               {items.length>0 && (
//                 <button onClick={clearCart}
//                   style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:6,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.12)',color:'#FCA5A5',cursor:'pointer'}}>
//                   Clear
//                 </button>
//               )}
//             </div>

//             {/* Phone input */}
//             <div style={{marginBottom:6}}>
//               <div style={{fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5}}>
//                 Customer Mobile
//               </div>
//               <div style={{display:'flex',gap:6}}>
//                 <input type="tel" maxLength={10} value={phone}
//                   onChange={e=>{ setPhone(e.target.value.replace(/\D/g,'')); setPhoneStatus(null); setFoundCustomer(null); setCustomerId(''); }}
//                   placeholder="10-digit mobile number"
//                   style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'white',fontFamily:'var(--font-mono)',fontWeight:700,letterSpacing:'.06em',fontSize:13,outline:'none'}}/>
//                 {phone && (
//                   <button onClick={clearCustomer}
//                     style={{width:34,height:34,borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'#94A3B8',cursor:'pointer',fontSize:18,lineHeight:1,flexShrink:0}}>
//                     ×
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Found customer */}
//             {phoneStatus==='found' && foundCustomer && (
//               <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(13,92,69,.25)',border:'1px solid rgba(13,92,69,.4)',borderRadius:8,marginTop:6}}>
//                 <div style={{width:30,height:30,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'white',flexShrink:0}}>
//                   {initials(foundCustomer.name)}
//                 </div>
//                 <div style={{flex:1}}>
//                   <div style={{fontWeight:700,fontSize:12,color:'#6EE7B7'}}>{foundCustomer.name}</div>
//                   <div style={{fontSize:10,color:'#94A3B8'}}>{foundCustomer.totalPurchases} purchases · {foundCustomer.type}</div>
//                 </div>
//                 <span style={{fontSize:9,fontWeight:800,background:'rgba(16,185,129,.3)',color:'#6EE7B7',padding:'2px 7px',borderRadius:12}}>✓ SAVED</span>
//               </div>
//             )}

//             {/* New customer form */}
//             {phoneStatus==='new' && (
//               <div style={{padding:'8px 10px',background:'rgba(201,153,58,.15)',border:'1px solid rgba(201,153,58,.3)',borderRadius:8,marginTop:6}}>
//                 <div style={{fontSize:10,color:'#FCD34D',fontWeight:700,marginBottom:6}}>New number — save customer?</div>
//                 {custError && <div style={{fontSize:10,color:'#FCA5A5',marginBottom:5}}>{custError}</div>}
//                 <div style={{display:'flex',gap:6}}>
//                   <input className="form-control" placeholder="Customer name" value={newCustName}
//                     onChange={e=>setNewCustName(e.target.value)}
//                     onKeyDown={e=>e.key==='Enter'&&saveNewCustomer()}
//                     style={{flex:1,fontSize:12,padding:'6px 10px'}}/>
//                   <button className="btn btn-sm btn-primary" onClick={saveNewCustomer}
//                     disabled={savingCust||!newCustName.trim()} style={{whiteSpace:'nowrap'}}>
//                     {savingCust?'…':'Save'}
//                   </button>
//                   <button className="btn btn-sm" onClick={()=>setPhoneStatus(null)} style={{fontSize:11}}>Skip</button>
//                 </div>
//               </div>
//             )}

//             {!phone && <div style={{fontSize:10,color:'#475569',marginTop:4}}>Leave blank for walk-in customer</div>}
//           </div>

//           {/* Cart items */}
//           <div className="bill-items-list">
//             {items.length===0 ? (
//               <div className="bill-empty" style={{flexDirection:'column',gap:10}}>
//                 <div style={{width:56,height:56,borderRadius:16,background:'var(--bg-hover)',display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid var(--border)'}}>
//                   <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
//                     <path d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16"/>
//                   </svg>
//                 </div>
//                 <div style={{textAlign:'center'}}>
//                   <div style={{fontWeight:700,fontSize:13,color:'var(--text-secondary)',marginBottom:3}}>Cart is empty</div>
//                   <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.4}}>Click any fabric card<br/>or scan a QR code to add</div>
//                 </div>
//               </div>
//             ) : items.map(item => (
//               <div key={item._id} style={{
//                 padding:'9px 0',
//                 borderBottom:'1px solid var(--border)',
//               }}>
//                 {/* Top row: swatch · name · total price */}
//                 <div style={{display:'flex',gap:9,alignItems:'center',marginBottom:7}}>
//                   {/* Swatch */}
//                   <div style={{flexShrink:0,width:38,height:38,borderRadius:8,overflow:'hidden',border:'1.5px solid var(--border)',position:'relative'}}>
//                     {item.imageUrl
//                       ? <img src={`${IMG}${item.imageUrl}`} alt={item.name}
//                           style={{width:38,height:38,objectFit:'cover',display:'block'}}
//                           onError={e=>{ e.target.style.display='none'; e.target.parentNode.style.background=item.swatchColor||'var(--primary-light)'; }}/>
//                       : <div style={{width:38,height:38,background:item.swatchColor||'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center'}}>
//                           <svg style={{opacity:.25,width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16"/></svg>
//                         </div>
//                     }
//                   </div>
//                   {/* Name + meta */}
//                   <div style={{flex:1,minWidth:0}}>
//                     <div style={{fontWeight:700,fontSize:12.5,color:'var(--text-primary)',lineHeight:1.25,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
//                     <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>
//                       {item.category?.name}{item.brand?.name?` · ${item.brand.name}`:''}
//                     </div>
//                   </div>
//                   {/* Line total */}
//                   <div style={{flexShrink:0,textAlign:'right'}}>
//                     <div style={{fontWeight:800,fontSize:14,color:'var(--primary)',letterSpacing:'-.3px'}}>{fmt(item.pricePerUnit*item.qty)}</div>
//                     <div style={{fontSize:9.5,color:'var(--text-muted)',fontWeight:500,marginTop:1}}>₹{item.pricePerUnit}/{item.unit}</div>
//                   </div>
//                 </div>
//                 {/* Bottom row: qty stepper · remove */}
//                 <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingLeft:47}}>
//                   <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg-hover)',borderRadius:8,border:'1.5px solid var(--border)',overflow:'hidden'}}>
//                     <button onClick={e=>{e.stopPropagation();changeQty(item._id,-1);}}
//                       style={{width:28,height:26,border:'none',background:'none',cursor:'pointer',fontWeight:800,fontSize:16,color:'var(--text-secondary)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .1s'}}
//                       onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
//                       onMouseLeave={e=>e.currentTarget.style.background='none'}>−</button>
//                     <span style={{minWidth:30,textAlign:'center',fontWeight:800,fontSize:12.5,color:'var(--text-primary)',borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)',height:26,display:'flex',alignItems:'center',justifyContent:'center'}}>{item.qty}</span>
//                     <button onClick={e=>{e.stopPropagation();changeQty(item._id,1);}}
//                       style={{width:28,height:26,border:'none',background:'none',cursor:'pointer',fontWeight:800,fontSize:16,color:'var(--text-secondary)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .1s'}}
//                       onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
//                       onMouseLeave={e=>e.currentTarget.style.background='none'}>+</button>
//                   </div>
//                   <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>{item.qty} {item.unit}{item.qty>1?'s':''}</span>
//                   <button onClick={e=>{e.stopPropagation();changeQty(item._id,-item.qty);}}
//                     style={{fontSize:10,color:'var(--danger)',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:'3px 7px',borderRadius:6,letterSpacing:.1,transition:'background .12s'}}
//                     onMouseEnter={e=>e.currentTarget.style.background='var(--danger-light)'}
//                     onMouseLeave={e=>e.currentTarget.style.background='none'}>
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="bill-footer" style={{padding:'10px 14px',background:'var(--bg-card)'}}>
//             {billError && <div style={{fontSize:11,color:'var(--danger)',marginBottom:8,fontWeight:700,padding:'6px 10px',background:'var(--danger-light)',borderRadius:6}}>{billError}</div>}

//             {/* Totals summary */}
//             <div style={{background:'var(--bg-hover)',borderRadius:10,padding:'10px 12px',marginBottom:10,border:'1px solid var(--border)'}}>
//               {/* Subtotal */}
//               <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:5}}>
//                 <span>Subtotal</span><span style={{fontWeight:600,fontFamily:'var(--font-mono)'}}>{fmt(subtotal)}</span>
//               </div>
//               {/* GST */}
//               <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:5}}>
//                 <span>GST</span><span style={{fontWeight:600,fontFamily:'var(--font-mono)'}}>{fmt(gstAmount)}</span>
//               </div>
//               {/* Discount inline */}
//               <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'var(--text-secondary)',marginBottom: discount>0?5:0}}>
//                 <span>Discount</span>
//                 <div style={{display:'flex',alignItems:'center',gap:5}}>
//                   <input type="number" min="0" max="100" value={discount}
//                     onChange={e=>setDiscount(Math.min(100,Math.max(0,Number(e.target.value))))}
//                     style={{width:42,textAlign:'right',border:'1.5px solid var(--border-dark)',borderRadius:6,padding:'2px 6px',fontSize:12,fontFamily:'var(--font-mono)',fontWeight:700,background:'var(--bg-card)',color:'var(--text-primary)',outline:'none'}}/>
//                   <span style={{fontSize:11,color:'var(--text-muted)'}}>%</span>
//                 </div>
//               </div>
//               {discount>0 && (
//                 <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--danger)',marginBottom:5}}>
//                   <span>Discount Amount</span><span style={{fontWeight:700,fontFamily:'var(--font-mono)'}}>− {fmt(discountAmt)}</span>
//                 </div>
//               )}
//               {/* Total */}
//               <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:800,fontSize:18,letterSpacing:'-.5px',marginTop:8,paddingTop:8,borderTop:'2px solid var(--border)'}}>
//                 <span style={{color:'var(--text-primary)'}}>Total</span>
//                 <span style={{color:'var(--primary)',fontFamily:'var(--font-mono)'}}>{fmt(total)}</span>
//               </div>
//             </div>

//             {/* Payment method */}
//             <div style={{marginBottom:6}}>
//               <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Payment Method</div>
//               <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
//                 {['Cash','Card','UPI','NEFT'].map(m=>(
//                   <button key={m} onClick={()=>{setPayMethod(m);setPayStatus(m==='NEFT'?'Pending':'Paid');}}
//                     style={{padding:'7px 4px',textAlign:'center',fontSize:11,fontWeight:700,borderRadius:8,cursor:'pointer',border:`1.5px solid ${payMethod===m?'var(--primary)':'var(--border-dark)'}`,background:payMethod===m?'var(--primary)':'var(--bg-card)',color:payMethod===m?'white':'var(--text-secondary)',transition:'all .12s',boxShadow:payMethod===m?'0 2px 8px rgba(13,92,69,.25)':'none'}}>
//                     {m}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Payment status */}
//             <div style={{marginBottom:8}}>
//               <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Status</div>
//               <div style={{display:'flex',gap:5}}>
//                 {['Paid','Pending','Partial'].map(s=>(
//                   <button key={s} onClick={()=>setPayStatus(s)}
//                     style={{flex:1,padding:'5px 4px',textAlign:'center',fontSize:10.5,fontWeight:700,borderRadius:8,cursor:'pointer',border:`1.5px solid ${payStatus===s?'var(--primary)':'var(--border-dark)'}`,background:payStatus===s?'var(--primary)':'var(--bg-card)',color:payStatus===s?'white':'var(--text-secondary)',transition:'all .12s'}}>
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Bill Note */}
//             <input className="form-control" value={billNote} onChange={e=>setBillNote(e.target.value)}
//               placeholder="Bill note (optional)…"
//               style={{fontSize:11,padding:'5px 10px',marginBottom:8,color:'var(--text-secondary)',background:'var(--bg-hover)'}}/>

//             {/* Hold Bill */}
//             {items.length>0 && (
//               <button onClick={handleHoldBill} disabled={holdingBill}
//                 style={{width:'100%',padding:'7px 0',marginBottom:6,background:'var(--gold-light)',color:'var(--gold)',border:'1.5px solid var(--gold)',borderRadius:8,fontWeight:700,fontSize:11.5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .12s'}}>
//                 ⏸ {holdingBill?'Holding…':'Hold Bill  ·  Ctrl+H'}
//               </button>
//             )}

//             {/* Generate button */}
//             <button onClick={handleGenerateBill} disabled={submitting||items.length===0}
//               style={{width:'100%',padding:'12px 0',background:items.length===0?'var(--border)':'var(--primary)',color:'white',border:'none',borderRadius:10,fontWeight:800,fontSize:14,cursor:items.length===0?'not-allowed':'pointer',letterSpacing:'-.2px',transition:'all .15s',boxShadow:items.length>0?'0 4px 16px rgba(13,92,69,0.3)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
//               {submitting
//                 ? <><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Generating…</>
//                 : items.length===0
//                   ? 'Add products to bill'
//                   : <>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
//                       Generate Bill · {fmt(total)}
//                     </>
//               }
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Billing;




import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getProducts, getCategories, getBrands,
  createCustomer, createBill, checkPhone,
  returnItems, getBills, getBill, getSettings, getReceiptTemplates,
  getProductByCode, holdBill, getHeldBills, releaseHeldBill,
} from '../../services/api';
import { useCart } from '../../context/CartContext';
import Loader from '../common/Loader';
import Modal  from '../common/Modal';
import useDebounce from '../../hooks/useDebounce';

const fmt     = n  => `₹${Number(n||0).toLocaleString('en-IN')}`;
const initials= nm => nm?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
const IMG     = 'http://localhost:5000';

/* ═══════════════════════════════════════════════════════════
   DYNAMIC RECEIPT — driven by Settings
═══════════════════════════════════════════════════════════ */
const DynamicReceipt = ({ bill, s, co: company }) => {
  const t      = s || {};          // template settings
  const co     = company || {};    // company info (name, address, phone etc.)
  const w      = Math.max(240, Math.min(420, t.receiptWidth || 300));
  const tmpl   = t.layout   || 'modern';
  const fontMap = { mono:'monospace', serif:'Georgia,serif', sans:'system-ui,sans-serif' };
  const font   = fontMap[t.font] || 'system-ui,sans-serif';

  const Divider = ({ dashed }) => (
    <div style={{ borderTop: dashed ? '1px dashed #ccc' : '2px solid #222', margin:'7px 0' }}/>
  );
  const Row = ({ l, v, bold, color }) => (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
      <span style={{ color:'#888' }}>{l}</span>
      <span style={{ fontWeight:bold?800:500, color:color||'#222' }}>{v}</span>
    </div>
  );

  /* ── Header ── */
  const Header = () => {
    if (tmpl === 'modern') return (
      <div style={{ background:'#1a1a1a', color:'white', padding:'14px 18px', textAlign:'center' }}>
        {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:17, letterSpacing:'-.3px' }}>{co.companyName || 'Store Name'}</div>}
        {t.showTagline   !== false && co.tagline && <div style={{ fontSize:10, opacity:.85, marginTop:2 }}>{co.tagline}</div>}
        {t.showPhone     !== false && co.phone   && <div style={{ fontSize:10, opacity:.8,  marginTop:4 }}>📞 {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
        {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:9, opacity:.7, marginTop:2, fontFamily:'monospace' }}>GST: {co.gstNumber}</div>}
      </div>
    );
    if (tmpl === 'classic') return (
      <div style={{ textAlign:'center', borderBottom:"2px solid #222", paddingBottom:8, marginBottom:10 }}>
        {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:16, color:"#222", letterSpacing:.5 }}>{co.companyName || 'Store Name'}</div>}
        {t.showTagline   !== false && co.tagline   && <div style={{ fontSize:10, color:'#666' }}>{co.tagline}</div>}
        {t.showAddress   !== false && co.address   && <div style={{ fontSize:10, color:'#666' }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
        {t.showPhone     !== false && co.phone     && <div style={{ fontSize:10, color:'#555' }}>Ph: {co.phone}{co.phone2 ? ` / ${co.phone2}` : ''}</div>}
        {t.showEmail     === true  && co.email     && <div style={{ fontSize:10, color:'#666' }}>{co.email}</div>}
        {t.showWebsite   === true  && co.website   && <div style={{ fontSize:10, color:'#666' }}>{co.website}</div>}
        {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:10, color:'#555', fontFamily:'monospace' }}>GST: {co.gstNumber}</div>}
      </div>
    );
    // minimal
    return (
      <div style={{ marginBottom:10 }}>
        {t.showStoreName !== false && <div style={{ fontWeight:800, fontSize:16, color:"#222" }}>{co.companyName || 'Store Name'}</div>}
        {t.showTagline   !== false && co.tagline && <div style={{ fontSize:10, color:'#888', marginTop:1 }}>{co.tagline}</div>}
        {t.showAddress   !== false && co.address && <div style={{ fontSize:10, color:'#888', marginTop:2 }}>{co.address}{co.city ? `, ${co.city}` : ''}</div>}
        {t.showPhone     !== false && co.phone   && <div style={{ fontSize:10, color:'#888', marginTop:1 }}>📞 {co.phone}</div>}
        {t.showGST       !== false && co.gstNumber && <div style={{ fontSize:10, color:'#888', fontFamily:'monospace', marginTop:1 }}>GST: {co.gstNumber}</div>}
      </div>
    );
  };

  /* ── Items table ── */
  const ItemsTable = () => (
    <div style={{ marginBottom:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontWeight:700, color:'#888', marginBottom:4, paddingBottom:4, borderBottom:"1px solid #eee" }}>
        <span style={{ flex:2 }}>Item</span>
        <span style={{ textAlign:'right', minWidth:32 }}>Qty</span>
        <span style={{ textAlign:'right', minWidth:40 }}>Rate</span>
        <span style={{ textAlign:'right', minWidth:44 }}>Amt</span>
      </div>
      {bill.items.map((it,i) => (
        <div key={i} style={{ marginBottom:5 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, alignItems:'flex-start' }}>
            <div style={{ flex:2, paddingRight:4 }}>
              <div style={{ fontWeight:600, lineHeight:1.3 }}>{it.productName}</div>
            </div>
            <span style={{ textAlign:'right', minWidth:32, fontFamily:'monospace', fontSize:11 }}>{it.quantity}{it.unit?.[0]}</span>
            <span style={{ textAlign:'right', minWidth:40, fontFamily:'monospace', fontSize:11 }}>₹{it.pricePerUnit}</span>
            <span style={{ textAlign:'right', minWidth:44, fontWeight:700, fontFamily:'monospace', fontSize:11 }}>₹{it.amount}</span>
          </div>
          {t.showRateQty !== false && (
            <div style={{ fontSize:9, color:'#999', paddingLeft:2, marginTop:1 }}>
              ₹{it.pricePerUnit}/{it.unit} × {it.quantity}{it.unit?.[0]} = ₹{it.amount}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  /* ── Totals ── */
  const Totals = () => (
    <div style={{ fontSize:11 }}>
      <Row l="Subtotal" v={fmt(bill.subtotal)}/>
      {t.showGSTBreakdown !== false ? <>
        <Row l={`CGST ${2.5}%`} v={fmt(bill.gstAmount/2)}/>
        <Row l={`SGST ${2.5}%`} v={fmt(bill.gstAmount/2)}/>
      </> : (
        <Row l="GST" v={fmt(bill.gstAmount)}/>
      )}
      {t.showDiscount !== false && bill.discountPct > 0 && (
        <Row l={`Discount (${bill.discountPct}%)`} v={`-${fmt(bill.discountAmt)}`} color="#C0392B"/>
      )}
      {t.showSavings && bill.discountAmt > 0 && (
        <div style={{ fontSize:10, color:'#16A34A', textAlign:'right', marginBottom:2, fontWeight:600 }}>
          🎉 You saved {fmt(bill.discountAmt)}!
        </div>
      )}
    </div>
  );

  /* ── Footer ── */
  const Footer = () => (
    <div style={{ textAlign:'center', marginTop:8, paddingTop:8, borderTop:'1px dashed #ddd' }}>
      {t.showPaymentMode !== false && (
        <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>
          Payment: <strong>{bill.paymentMethod}</strong>
        </div>
      )}
      {t.showThankYou !== false && t.footerLine1 && (
        <div style={{ fontSize:10, color:'#888', fontStyle:'italic' }}>{t.footerLine1}</div>
      )}
      {t.footerLine2 && (
        <div style={{ fontSize:10, color:'#aaa', marginTop:3 }}>{t.footerLine2}</div>
      )}
      {t.showPhone !== false && co.phone && tmpl === 'modern' && (
        <div style={{ fontSize:11, color:"#222", marginTop:6, fontWeight:700 }}>📞 {co.phone}</div>
      )}
    </div>
  );

  /* ── Bill meta ── */
  const BillMeta = () => (
    <div style={{ marginBottom:8 }}>
      {tmpl === 'modern' ? (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          {t.showBillNumber !== false && <span style={{ fontWeight:800, fontSize:12, color:"#222" }}>{bill.billNumber}</span>}
          {t.showDate !== false && <span style={{ fontSize:10, color:'#888' }}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</span>}
        </div>
      ) : (
        <>
          {t.showBillNumber !== false && <Row l="Bill #" v={bill.billNumber} bold/>}
          {t.showDate !== false && <Row l="Date" v={new Date(bill.createdAt).toLocaleString('en-IN')}/>}
        </>
      )}
      {t.showCustomer !== false && (
        tmpl === 'modern'
          ? <div style={{ background:'#f8f9fa', borderRadius:8, padding:'8px 10px', marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, marginBottom:2 }}>Customer</div>
              <div style={{ fontSize:12 }}>{bill.customerName}</div>
              {t.showCustomerPhone !== false && bill.customerPhone && <div style={{ fontSize:10, color:'#888' }}>{bill.customerPhone}</div>}
            </div>
          : <>
              <Row l="Customer" v={bill.customerName}/>
              {t.showCustomerPhone !== false && bill.customerPhone && <Row l="Phone" v={bill.customerPhone}/>}
            </>
      )}
    </div>
  );

  const boxShadow = '0 8px 32px rgba(0,0,0,0.14)';
  const borderRadius = tmpl==='minimal' ? 8 : 12;

  return (
    <div style={{ width:w, fontFamily:font, background:'white', borderRadius, boxShadow, overflow:'hidden', border:'1px solid #e5e7eb' }}>
      <Header/>
      <div style={{ padding: tmpl==='modern' ? '12px 16px' : '18px 20px' }}>
        <BillMeta/>
        {tmpl !== 'modern' && <Divider dashed/>}
        <ItemsTable/>
        <Divider dashed/>
        <Totals/>
        <Divider/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:800, fontSize:16 }}>
          <span>TOTAL</span>
          <span style={{ fontSize:20 }}>{fmt(bill.total)}</span>
        </div>
        <Footer/>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   RECEIPT WRAPPER
═══════════════════════════════════════════════════════════ */
const Receipt = ({ bill, settings, template, onClose, onNewBill }) => {
  const ref    = useRef();
  const co     = settings || {};
  const tmpl   = template || {};

  const handlePrint = () => {
    const w = window.open('','_blank','width=400,height=600');
    w.document.write(`
      <html><head><title>Receipt ${bill.billNumber}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:sans-serif;background:#fff;display:flex;justify-content:center;padding:20px}
        @media print{body{padding:0}button{display:none!important}}
        .no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
        .no-print button{padding:8px 20px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}
        .print-btn{background:#0D5C45;color:white}
        .close-btn{background:#f1f5f9;color:#333}
      </style>
      </head><body>
      <div>
        ${ref.current.innerHTML}
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨 Print</button>
          <button class="close-btn" onclick="window.close()">Close</button>
        </div>
      </div>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="modal-overlay">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,maxHeight:'90vh',overflowY:'auto'}}>
        <div ref={ref}>
          <DynamicReceipt bill={bill} s={tmpl} co={co}/>
        </div>
        {/* Three buttons — same height, bottom of receipt */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 1fr 1fr',
          gap:10,
          width:'100%',
          maxWidth:290,
        }}>
          <button onClick={handlePrint} style={{
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            gap:5,padding:'12px 8px',
            background:'var(--primary)',color:'white',
            border:'none',borderRadius:10,cursor:'pointer',
            fontWeight:700,fontSize:12,lineHeight:1.2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          <button onClick={onNewBill} style={{
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            gap:5,padding:'12px 8px',
            background:'var(--bg-card)',color:'var(--primary)',
            border:'1.5px solid var(--primary)',borderRadius:10,cursor:'pointer',
            fontWeight:700,fontSize:12,lineHeight:1.2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Bill
          </button>
          <button onClick={onClose} style={{
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            gap:5,padding:'12px 8px',
            background:'var(--bg-hover)',color:'var(--text-secondary)',
            border:'1.5px solid var(--border-dark)',borderRadius:10,cursor:'pointer',
            fontWeight:700,fontSize:12,lineHeight:1.2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   RETURN MODAL
═══════════════════════════════════════════════════════════ */
const ReturnModal = ({ open, onClose, bill, onSuccess }) => {
  const [qtys,   setQtys]   = useState({});
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState({ type:'', text:'' });

  useEffect(() => {
    if (open && bill) {
      const init = {};
      bill.items.forEach(it => { init[it.product] = 0; });
      setQtys(init); setReason(''); setMsg({type:'',text:''});
    }
  }, [open, bill]);

  const totalRefund = bill?.items.reduce((s,it) => s + (qtys[it.product]||0) * it.pricePerUnit * (1+it.gstRate/100), 0) || 0;

  const handleReturn = async () => {
    const items = bill.items
      .filter(it => qtys[it.product] > 0)
      .map(it => ({ productId:it.product, productName:it.productName, quantity:Number(qtys[it.product]) }));
    if (!items.length) return setMsg({type:'danger', text:'Enter quantity for at least one item.'});
    setSaving(true); setMsg({type:'',text:''});
    try {
      const { data } = await returnItems(bill._id, { items, reason });
      setMsg({type:'success', text: data.message });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
    } catch(err) { setMsg({type:'danger', text: err.response?.data?.message||'Return failed.'}); }
    finally { setSaving(false); }
  };

  if (!open || !bill) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Return Items — ${bill.billNumber}`}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={handleReturn} disabled={saving}>
          {saving ? 'Processing…' : 'Confirm Return'}
        </button>
      </>}>
      <div className="alert alert-warning" style={{marginBottom:14,fontSize:12}}>
        Returned items will be added back to inventory stock automatically.
      </div>
      {msg.text && <div className={`alert alert-${msg.type}`} style={{marginBottom:12}}>{msg.text}</div>}
      <div style={{background:'var(--bg-hover)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:13}}>{bill.customerName}</div>
        {bill.customerPhone && <div style={{fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{bill.customerPhone}</div>}
      </div>
      {bill.items.map(it => {
        const canReturn = it.quantity - (it.returnedQty||0);
        const q = qtys[it.product]||0;
        return (
          <div key={it.product} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13}}>{it.productName}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>
                Billed: {it.quantity}{it.unit?.[0]} · Can return: <strong style={{color:canReturn>0?'var(--primary)':'var(--danger)'}}>{canReturn}{it.unit?.[0]}</strong>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <input type="number" min="0" max={canReturn} value={q} disabled={canReturn<=0}
                onChange={e => setQtys(prev => ({...prev,[it.product]:Math.min(canReturn,Math.max(0,Number(e.target.value)))}))}
                style={{width:60,padding:'6px 8px',border:'1.5px solid var(--border-dark)',borderRadius:6,fontFamily:'var(--font-mono)',fontSize:14,fontWeight:800,textAlign:'center'}}/>
              {q > 0 && <span style={{fontSize:11,color:'var(--primary)',fontWeight:700,minWidth:60}}>+{fmt(q*it.pricePerUnit*(1+it.gstRate/100))}</span>}
            </div>
          </div>
        );
      })}
      {totalRefund > 0 && (
        <div style={{marginTop:14,padding:'10px 14px',background:'var(--primary-light)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,fontSize:13,color:'var(--primary)'}}>Total Refund Amount</span>
          <span style={{fontWeight:800,fontSize:18,color:'var(--primary)'}}>{fmt(totalRefund)}</span>
        </div>
      )}
      <div className="form-group" style={{marginTop:14}}>
        <label className="form-label">Return Reason (optional)</label>
        <input className="form-control" value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Damaged fabric, wrong colour, customer changed mind"/>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN BILLING PAGE
═══════════════════════════════════════════════════════════ */
const Billing = () => {
  const { items, addItem, changeQty, clearCart, subtotal } = useCart();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [settings,   setSettings]   = useState(null);
  const [defaultTmpl,setDefaultTmpl]= useState(null);
  const [loading,    setLoading]    = useState(true);

  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Customer
  const [phone,          setPhone]          = useState('');
  const [phoneStatus,    setPhoneStatus]    = useState(null);
  const [foundCustomer,  setFoundCustomer]  = useState(null);
  const [customerId,     setCustomerId]     = useState('');
  const [newCustName,    setNewCustName]    = useState('');
  const [savingCust,     setSavingCust]     = useState(false);
  const [custError,      setCustError]      = useState('');

  // Bill
  const [discount,   setDiscount]   = useState(0);
  const [payMethod,  setPayMethod]  = useState('Cash');
  const [payStatus,  setPayStatus]  = useState('Paid');
  const [submitting, setSubmitting] = useState(false);
  const [receipt,    setReceipt]    = useState(null);
  const [billError,  setBillError]  = useState('');

  // Return
  const [returnStep,    setReturnStep]    = useState(0); // 0=hidden,1=search,2=confirm
  const [returnBillNo,  setReturnBillNo]  = useState('');
  const [returnBill,    setReturnBill]    = useState(null);
  const [searchingBill, setSearchingBill] = useState(false);

  // QR Scanner
  const [qrInput,     setQrInput]     = useState('');
  const [qrError,     setQrError]     = useState('');
  const [qrLoading,   setQrLoading]   = useState(false);
  const qrRef  = useRef();
  const srchRef= useRef();

  // Quick-add quantity modal (shown after QR scan)
  const [quickAdd,    setQuickAdd]    = useState(null); // { product, offers }
  const [quickQty,    setQuickQty]    = useState('1');
  const quickQtyRef = useRef();

  // Hold bill
  const [heldBills,   setHeldBills]   = useState([]);
  const [showHeld,    setShowHeld]    = useState(false);
  const [holdingBill, setHoldingBill] = useState(false);

  // Bill notes
  const [billNote,    setBillNote]    = useState('');

  const debouncedSearch = useDebounce(search);
  const debouncedPhone  = useDebounce(phone, 600);

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getBrands(), getSettings(), getReceiptTemplates()])
      .then(([p,c,b,s,r]) => {
        setProducts(p.data.data||[]);
        setCategories(c.data.data||[]);
        setBrands(b.data.data||[]);
        setSettings(s.data.data);
        const dflt = (r.data.data||[]).find(t=>t.isDefault) || (r.data.data||[])[0];
        setDefaultTmpl(dflt);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading)
      getProducts({ search:debouncedSearch||undefined, category:catFilter||undefined, brand:brandFilter||undefined })
        .then(({data}) => setProducts(data.data||[])).catch(console.error);
  }, [debouncedSearch, catFilter, brandFilter]);

  useEffect(() => {
    if (!debouncedPhone || debouncedPhone.length < 10) {
      setPhoneStatus(null); setFoundCustomer(null); setCustomerId(''); return;
    }
    checkPhone(debouncedPhone).then(({data}) => {
      if (data.exists) { setPhoneStatus('found'); setFoundCustomer(data.customer); setCustomerId(data.customer._id); }
      else             { setPhoneStatus('new');   setFoundCustomer(null);          setCustomerId(''); }
    }).catch(console.error);
  }, [debouncedPhone]);

  // ── QR Code scan / enter ─────────────────────────────────
  const handleQrSubmit = async (rawValue) => {
    const val = rawValue?.trim();
    if (!val) return;
    setQrError(''); setQrLoading(true);
    try {
      // Try to parse JSON QR format first, fall back to raw code
      let code = val;
      try { const parsed = JSON.parse(val); code = parsed.code || val; } catch {}
      const { data } = await getProductByCode(code);
      if (!data.success) { setQrError(`Product "${code}" not found`); return; }
      const product = data.data;
      if (product.stock <= 0) { setQrError(`"${product.name}" is out of stock`); return; }
      // Show quick-add modal with offers
      setQuickAdd(product);
      setQuickQty('1');
      setQrInput('');
      setTimeout(() => quickQtyRef.current?.focus(), 60);
    } catch(err) {
      setQrError(err.response?.data?.message || 'Product not found. Check the code.');
    } finally { setQrLoading(false); }
  };

  const handleQrKey = e => {
    if (e.key === 'Enter') { handleQrSubmit(qrInput); }
    else if (e.key === 'Escape') { setQrInput(''); setQrError(''); }
  };

  // ── Quick-add confirm ─────────────────────────────────────
  const confirmQuickAdd = () => {
    if (!quickAdd) return;
    const qty = Math.max(0.5, parseFloat(quickQty) || 1);
    if (qty > quickAdd.stock) {
      alert(`Only ${quickAdd.stock} ${quickAdd.unit}s in stock`); return;
    }
    // Get offer discount if any
    const offer = (quickAdd.offers || []).find(o => o.isValid && qty >= o.minQty);
    const productWithOffer = offer ? { ...quickAdd, _offerDiscount: offer } : quickAdd;
    // Add item qty times (addItem adds 1 each time, so we use changeQty after)
    const existing = items.find(i => i._id === quickAdd._id);
    if (existing) {
      // Already in cart — increase by qty
      for (let i = 0; i < qty; i++) changeQty(quickAdd._id, 1);
    } else {
      addItem({ ...productWithOffer });
      // Set to exact qty if > 1
      if (qty > 1) {
        for (let i = 1; i < qty; i++) changeQty(quickAdd._id, 1);
      }
    }
    setQuickAdd(null);
    qrRef.current?.focus();
  };

  // ── Hold Bill ─────────────────────────────────────────────
  const handleHoldBill = async () => {
    if (!items.length) return;
    setHoldingBill(true);
    try {
      const label = billNote.trim() || `Hold — ${new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}`;
      await holdBill({
        label, customerId, customerName: foundCustomer?.name || '',
        customerPhone: phone, items, discount: discount, payMethod,
      });
      const { data } = await getHeldBills();
      setHeldBills(data.data || []);
      handleNewBill();
      alert(`Bill held as "${label}". You can resume it from Hold Bills.`);
    } catch(err) { alert(err.response?.data?.message || 'Failed to hold bill.'); }
    finally { setHoldingBill(false); }
  };

  const handleResumeHeld = async (held) => {
    if (items.length && !window.confirm('Current bill will be cleared. Resume held bill?')) return;
    clearCart();
    held.items.forEach(item => {
      addItem(item);
      for (let i = 1; i < item.qty; i++) changeQty(item._id, 1);
    });
    if (held.customerPhone) setPhone(held.customerPhone);
    setDiscount(held.discount || 0);
    setPayMethod(held.payMethod || 'Cash');
    setBillNote(held.label || '');
    // Delete the held bill
    await releaseHeldBill(held._id);
    setHeldBills(prev => prev.filter(h => h._id !== held._id));
    setShowHeld(false);
  };

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      // F2 → focus QR scanner
      if (e.key === 'F2') { e.preventDefault(); qrRef.current?.focus(); }
      // F3 → focus search
      if (e.key === 'F3') { e.preventDefault(); srchRef.current?.focus(); }
      // Ctrl+H → hold bill
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); handleHoldBill(); }
      // Ctrl+N → new bill
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleNewBill(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, phone, discount, payMethod, foundCustomer, billNote]);

  // Load held bills on mount
  useEffect(() => {
    getHeldBills().then(({data}) => setHeldBills(data.data||[])).catch(()=>{});
  }, []);

  const saveNewCustomer = async () => {
    if (!newCustName.trim()) return setCustError('Enter customer name.');
    setCustError(''); setSavingCust(true);
    try {
      const { data } = await createCustomer({ name:newCustName.trim(), phone:phone.trim() });
      setFoundCustomer(data.data); setCustomerId(data.data._id);
      setPhoneStatus('found'); setNewCustName('');
    } catch(err) { setCustError(err.response?.data?.message||'Failed to save.'); }
    finally { setSavingCust(false); }
  };

  const clearCustomer = () => {
    setPhone(''); setPhoneStatus(null); setFoundCustomer(null);
    setCustomerId(''); setNewCustName(''); setCustError('');
  };

  const gstAmount   = items.reduce((s,i) => s + i.pricePerUnit*i.qty*(i.gstRate||5)/100, 0);
  const discountAmt = (subtotal+gstAmount)*discount/100;
  const total       = subtotal+gstAmount-discountAmt;

  const handleGenerateBill = async () => {
    if (!items.length) return setBillError('Add at least one product.');
    setBillError(''); setSubmitting(true);
    try {
      const { data } = await createBill({
        customerId: customerId||undefined,
        items: items.map(i => ({ productId:i._id, quantity:i.qty })),
        discountPct: Number(discount), paymentMethod: payMethod, paymentStatus: payStatus,
      });
      setReceipt(data.data);
    } catch(err) { setBillError(err.response?.data?.message||'Failed to generate bill.'); }
    finally { setSubmitting(false); }
  };

  const handleNewBill = () => {
    setReceipt(null); clearCart(); clearCustomer();
    setDiscount(0); setPayMethod('Cash'); setPayStatus('Paid'); setBillError('');
  };

  const handleSearchBill = async () => {
    if (!returnBillNo.trim()) return;
    setSearchingBill(true);
    try {
      const { data:list } = await getBills({ search:returnBillNo.trim(), limit:5 });
      const match = (list.data||[]).find(b => b.billNumber.toUpperCase()===returnBillNo.toUpperCase());
      if (!match) return alert('Bill not found. Check the bill number.');
      const { data:full } = await getBill(match._id);
      setReturnBill(full.data); setReturnStep(2);
    } catch { alert('Error finding bill.'); }
    finally { setSearchingBill(false); }
  };

  if (loading) return <Loader/>;

  return (
    <>
      {receipt && (
        <Receipt
          bill={receipt}
          settings={settings}
          template={defaultTmpl}
          onClose={handleNewBill}
          onNewBill={handleNewBill}
        />
      )}

      {/* ── Quick-Add Modal (after QR scan) ── */}
      {quickAdd && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:420}}>
            <div className="modal-header">
              <span className="modal-title">Add to Bill</span>
              <button className="btn btn-ghost btn-icon" style={{fontSize:20}} onClick={()=>{setQuickAdd(null);qrRef.current?.focus();}}>×</button>
            </div>
            <div className="modal-body">
              {/* Product info */}
              <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 14px',background:'var(--bg-hover)',borderRadius:10,marginBottom:16}}>
                {quickAdd.imageUrl
                  ? <img src={`http://localhost:5000${quickAdd.imageUrl}`} alt={quickAdd.name} style={{width:56,height:56,borderRadius:8,objectFit:'cover',border:'1.5px solid var(--border)',flexShrink:0}}/>
                  : <div style={{width:56,height:56,borderRadius:8,background:quickAdd.swatchColor||'#E8F5F0',flexShrink:0,border:'1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'rgba(0,0,0,.2)'}}>{quickAdd.name.slice(0,2).toUpperCase()}</div>
                }
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:15}}>{quickAdd.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{quickAdd.code} · {quickAdd.category?.name}</div>
                  <div style={{display:'flex',gap:12,marginTop:4}}>
                    <span style={{fontWeight:800,fontSize:16,color:'var(--primary)'}}>₹{quickAdd.pricePerUnit}/{quickAdd.unit}</span>
                    <span style={{fontSize:11,color:quickAdd.isLowStock?'var(--danger)':'var(--text-muted)',alignSelf:'center',fontWeight:600}}>
                      {quickAdd.stock} {quickAdd.unit}s in stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Active offers */}
              {(quickAdd.offers||[]).filter(o=>o.isValid).length > 0 && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>🏷 Active Offers</div>
                  {(quickAdd.offers||[]).filter(o=>o.isValid).map((offer,i) => (
                    <div key={i} style={{background:'linear-gradient(135deg,#FDF5E6,#FFF7ED)',border:'1.5px solid #E8B855',borderRadius:8,padding:'8px 12px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:'#92540A'}}>{offer.title}</div>
                        <div style={{fontSize:11,color:'#B45309',marginTop:1}}>
                          {offer.type==='percent'?`${offer.value}% off`:`₹${offer.value} flat off`}
                          {offer.minQty>1 ? ` · Min ${offer.minQty}${quickAdd.unit}s` : ''}
                          {offer.expiresAt ? ` · Expires ${new Date(offer.expiresAt).toLocaleDateString('en-IN')}` : ''}
                        </div>
                      </div>
                      <span style={{background:'#C9993A',color:'white',fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:12}}>
                        {offer.type==='percent'?`-${offer.value}%`:`-₹${offer.value}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity input */}
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Quantity ({quickAdd.unit}s)</label>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <button onClick={()=>setQuickQty(q=>String(Math.max(0.5,Number(q)-1)))}
                    style={{width:36,height:36,border:'1.5px solid var(--border-dark)',borderRadius:8,background:'var(--bg-hover)',fontSize:18,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                  <input ref={quickQtyRef} type="number" min="0.5" max={quickAdd.stock} step="0.5" value={quickQty}
                    onChange={e=>setQuickQty(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter') confirmQuickAdd(); if(e.key==='Escape'){setQuickAdd(null);qrRef.current?.focus();} }}
                    style={{flex:1,textAlign:'center',fontSize:22,fontWeight:800,padding:'8px',border:'1.5px solid var(--border-dark)',borderRadius:8,fontFamily:'var(--font-mono)'}}
                    autoFocus/>
                  <button onClick={()=>setQuickQty(q=>String(Math.min(quickAdd.stock,Number(q)+1)))}
                    style={{width:36,height:36,border:'1.5px solid var(--border-dark)',borderRadius:8,background:'var(--bg-hover)',fontSize:18,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                </div>
                {Number(quickQty) > 0 && (
                  <div style={{marginTop:8,padding:'8px 12px',background:'var(--primary-light)',borderRadius:8,display:'flex',justifyContent:'space-between',fontSize:13}}>
                    <span style={{fontWeight:600,color:'var(--primary)'}}>Total for this item</span>
                    <span style={{fontWeight:800,fontSize:15,color:'var(--primary)'}}>{fmt(Number(quickQty)*quickAdd.pricePerUnit)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={()=>{setQuickAdd(null);qrRef.current?.focus();}}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmQuickAdd} style={{fontWeight:700,gap:8}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Add {quickQty} {quickAdd.unit}s to Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Held Bills Modal ── */}
      {showHeld && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:480}}>
            <div className="modal-header">
              <span className="modal-title">⏸ Held Bills ({heldBills.length})</span>
              <button className="btn btn-ghost btn-icon" style={{fontSize:20}} onClick={()=>setShowHeld(false)}>×</button>
            </div>
            <div className="modal-body">
              {heldBills.length===0
                ? <div style={{textAlign:'center',padding:'30px 0',color:'var(--text-muted)'}}>No held bills</div>
                : heldBills.map(held => (
                  <div key={held._id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg-hover)',borderRadius:10,marginBottom:8,border:'1.5px solid var(--border)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{held.label}</div>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>
                        {held.items?.length||0} items
                        {held.customerName ? ` · ${held.customerName}` : ' · Walk-in'}
                        {' · '}{new Date(held.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={()=>handleResumeHeld(held)}>▶ Resume</button>
                  </div>
                ))
              }
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={()=>setShowHeld(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Return — search step */}
      {returnStep === 1 && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Process Product Return</span>
              <button className="btn btn-ghost btn-icon" style={{fontSize:20,lineHeight:1}} onClick={()=>setReturnStep(0)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info" style={{marginBottom:14,fontSize:12}}>
                Enter the original bill number to find the sale and select items to return.
              </div>
              <div className="form-group">
                <label className="form-label">Bill Number</label>
                <input className="form-control" placeholder="e.g. BL-202603-0001"
                  value={returnBillNo} onChange={e=>setReturnBillNo(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==='Enter'&&handleSearchBill()} autoFocus
                  style={{fontFamily:'var(--font-mono)',fontWeight:700,letterSpacing:'.05em',fontSize:15}}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={()=>setReturnStep(0)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleSearchBill} disabled={searchingBill||!returnBillNo.trim()}>
                {searchingBill?'Searching…':'Find Bill →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReturnModal
        open={returnStep===2}
        bill={returnBill}
        onClose={()=>{ setReturnStep(0); setReturnBill(null); setReturnBillNo(''); }}
        onSuccess={()=>{}}
      />

      {/* ══ MAIN LAYOUT ══ */}
      <div className="pos-layout">

        {/* ── LEFT: Products ── */}
        <div className="pos-products">
          {/* Search + QR scanner + filters row */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            {/* Search */}
            <input ref={srchRef} className="form-control" style={{flex:1,minWidth:140}} placeholder="🔍 Search fabric name or code… (F3)"
              value={search} onChange={e=>setSearch(e.target.value)}/>

            {/* ── QR Scanner field ── */}
            <div style={{position:'relative',display:'flex',alignItems:'center',flexShrink:0}}>
              <div style={{
                position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
                color:qrLoading?'var(--primary)':qrError?'var(--danger)':'#64748B',
                pointerEvents:'none',fontSize:15,lineHeight:1,
              }}>
                {qrLoading
                  ? <div style={{width:14,height:14,border:'2px solid var(--primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
                  : '⬛'
                }
              </div>
              <input
                ref={qrRef}
                type="text"
                value={qrInput}
                onChange={e=>{setQrInput(e.target.value);setQrError('');}}
                onKeyDown={handleQrKey}
                placeholder="Scan QR / enter code (F2)"
                style={{
                  paddingLeft:32,paddingRight:10,
                  width:210,height:38,
                  border:`1.5px solid ${qrError?'var(--danger)':'var(--border-dark)'}`,
                  borderRadius:'var(--radius-md)',
                  fontSize:12,fontFamily:'var(--font-mono)',fontWeight:600,
                  background:'var(--bg-card)',color:'var(--text-primary)',
                  outline:'none',
                  boxShadow: qrError?'0 0 0 3px rgba(192,57,43,.12)':'none',
                }}
              />
              {qrInput && (
                <button onClick={()=>handleQrSubmit(qrInput)}
                  style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',
                    background:'var(--primary)',color:'white',border:'none',borderRadius:6,
                    width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',
                    cursor:'pointer',fontSize:11,fontWeight:800,lineHeight:1}}>
                  ↵
                </button>
              )}
            </div>
            {qrError && <div style={{fontSize:11,color:'var(--danger)',fontWeight:600,width:'100%',marginTop:-4,paddingLeft:2}}>{qrError}</div>}

            <select className="form-control" style={{width:135}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="form-control" style={{width:125}} value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}>
              <option value="">All Brands</option>
              {brands.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <button className="btn btn-sm"
              style={{borderColor:'var(--danger)',color:'var(--danger)',fontWeight:700,whiteSpace:'nowrap'}}
              onClick={()=>{ setReturnBillNo(''); setReturnBill(null); setReturnStep(1); }}>
              ↩ Return
            </button>
            {/* Hold Bills button */}
            {heldBills.length > 0 && (
              <button className="btn btn-sm" onClick={()=>setShowHeld(true)}
                style={{borderColor:'var(--gold)',color:'var(--gold)',fontWeight:700,position:'relative',whiteSpace:'nowrap'}}>
                ⏸ Held
                <span style={{position:'absolute',top:-6,right:-6,background:'var(--gold)',color:'white',fontSize:9,fontWeight:800,width:16,height:16,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {heldBills.length}
                </span>
              </button>
            )}
          </div>

          {/* Product grid */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',
            gap:10,
            overflowY:'auto',
            flex:1,
            paddingRight:2,
            paddingBottom:8,
            paddingTop:2,
            alignContent:'start',
          }}>
            {products.length===0 && (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                No products found matching your search.
              </div>
            )}
            {products.map(p => {
              const inCart = items.find(i=>i._id===p._id);
              const swatchBg = p.swatchColor || '#E8F5F0';
              return (
                <div key={p._id}
                  onClick={()=>addItem(p)}
                  style={{
                    background:'var(--bg-card)',
                    border:`1.5px solid ${inCart?'var(--primary)':'var(--border)'}`,
                    borderRadius:12,
                    overflow:'hidden',
                    cursor:'pointer',
                    transition:'box-shadow .15s, border-color .15s, transform .12s',
                    position:'relative',
                    boxShadow: inCart?'0 0 0 3px var(--primary-glow),var(--shadow-sm)':'var(--shadow-xs)',
                    /* FIXED total height = 100px swatch + 96px body = 196px always */
                    height:196,
                    display:'flex',
                    flexDirection:'column',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=inCart?'0 0 0 3px var(--primary-glow),var(--shadow-md)':'var(--shadow-md)';e.currentTarget.style.borderColor='var(--primary)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=inCart?'0 0 0 3px var(--primary-glow),var(--shadow-sm)':'var(--shadow-xs)';e.currentTarget.style.borderColor=inCart?'var(--primary)':'var(--border)';}}
                >
                  {/* Badge — always top-right */}
                  {(inCart || p.isLowStock) && (
                    <div style={{position:'absolute',top:7,right:7,borderRadius:20,padding:'2px 7px',fontSize:9,fontWeight:800,zIndex:3,background:inCart?'var(--primary)':'var(--danger)',color:'white',boxShadow:inCart?'0 2px 6px rgba(13,92,69,.4)':'none'}}>
                      {inCart ? `×${inCart.qty}` : 'Low'}
                    </div>
                  )}

                  {/* TOP AREA — fixed 100px, always same height */}
                  <div style={{
                    width:'100%', height:100, flexShrink:0,
                    position:'relative', overflow:'hidden',
                    background: swatchBg,
                  }}>
                    {/* Always render swatch pattern behind */}
                    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.1,pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`w${p._id}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                          <rect x="0" y="0" width="7" height="2" fill="rgba(0,0,0,.8)"/>
                          <rect x="7" y="7" width="7" height="2" fill="rgba(0,0,0,.8)"/>
                          <rect x="0" y="0" width="2" height="7" fill="rgba(0,0,0,.5)"/>
                          <rect x="7" y="7" width="2" height="7" fill="rgba(0,0,0,.5)"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#w${p._id})`}/>
                    </svg>
                    {/* Image on top of swatch — covers pattern when loaded */}
                    {p.imageUrl && (
                      <img src={`${IMG}${p.imageUrl}`} alt={p.name}
                        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block',zIndex:1}}
                        onError={e=>e.target.style.display='none'}
                      />
                    )}
                  </div>

                  {/* BODY — fixed 96px, always same height */}
                  <div style={{
                    height:96, flexShrink:0,
                    padding:'8px 10px 8px',
                    display:'flex', flexDirection:'column',
                    justifyContent:'space-between',
                    borderTop:'1px solid var(--border)',
                  }}>
                    {/* Row 1: product name — always 1 line truncated */}
                    <div style={{fontWeight:700,fontSize:12.5,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.3}}>
                      {p.name}
                    </div>
                    {/* Row 2: brand */}
                    <div style={{fontSize:10,fontWeight:700,color:'var(--gold)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {p.brand?.name || 'Generic'}
                    </div>
                    {/* Row 3: category */}
                    <div style={{fontSize:9.5,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {p.category?.name}
                    </div>
                    {/* Row 4: price + stock */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:800,fontSize:14.5,color:'var(--primary)',letterSpacing:'-.3px',lineHeight:1}}>
                        ₹{p.pricePerUnit}
                        <span style={{fontSize:9,fontWeight:500,color:'var(--text-muted)',marginLeft:1}}>/{p.unit}</span>
                      </span>
                      <span style={{fontSize:9.5,fontWeight:600,color:p.isLowStock?'var(--danger)':'var(--text-muted)'}}>
                        {p.stock} {p.unit}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Bill Panel ── */}
        <div className="bill-panel">
          {/* Header — dark */}
          <div style={{padding:'14px 16px',borderBottom:'1.5px solid rgba(255,255,255,0.08)',background:'var(--bg-sidebar)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:15,color:'white',letterSpacing:'-.3px',display:'flex',alignItems:'center',gap:8}}>
                New Bill
                {items.length>0 && (
                  <span style={{background:'rgba(255,255,255,.2)',color:'white',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700}}>
                    {items.length} item{items.length>1?'s':''}
                  </span>
                )}
              </div>
              {items.length>0 && (
                <button onClick={clearCart}
                  style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:6,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.12)',color:'#FCA5A5',cursor:'pointer'}}>
                  Clear
                </button>
              )}
            </div>

            {/* Phone input */}
            <div style={{marginBottom:6}}>
              <div style={{fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5}}>
                Customer Mobile
              </div>
              <div style={{display:'flex',gap:6}}>
                <input type="tel" maxLength={10} value={phone}
                  onChange={e=>{ setPhone(e.target.value.replace(/\D/g,'')); setPhoneStatus(null); setFoundCustomer(null); setCustomerId(''); }}
                  placeholder="10-digit mobile number"
                  style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'white',fontFamily:'var(--font-mono)',fontWeight:700,letterSpacing:'.06em',fontSize:13,outline:'none'}}/>
                {phone && (
                  <button onClick={clearCustomer}
                    style={{width:34,height:34,borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'#94A3B8',cursor:'pointer',fontSize:18,lineHeight:1,flexShrink:0}}>
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Found customer */}
            {phoneStatus==='found' && foundCustomer && (
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(13,92,69,.25)',border:'1px solid rgba(13,92,69,.4)',borderRadius:8,marginTop:6}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'white',flexShrink:0}}>
                  {initials(foundCustomer.name)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:12,color:'#6EE7B7'}}>{foundCustomer.name}</div>
                  <div style={{fontSize:10,color:'#94A3B8'}}>{foundCustomer.totalPurchases} purchases · {foundCustomer.type}</div>
                </div>
                <span style={{fontSize:9,fontWeight:800,background:'rgba(16,185,129,.3)',color:'#6EE7B7',padding:'2px 7px',borderRadius:12}}>✓ SAVED</span>
              </div>
            )}

            {/* New customer form */}
            {phoneStatus==='new' && (
              <div style={{padding:'8px 10px',background:'rgba(201,153,58,.15)',border:'1px solid rgba(201,153,58,.3)',borderRadius:8,marginTop:6}}>
                <div style={{fontSize:10,color:'#FCD34D',fontWeight:700,marginBottom:6}}>New number — save customer?</div>
                {custError && <div style={{fontSize:10,color:'#FCA5A5',marginBottom:5}}>{custError}</div>}
                <div style={{display:'flex',gap:6}}>
                  <input className="form-control" placeholder="Customer name" value={newCustName}
                    onChange={e=>setNewCustName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&saveNewCustomer()}
                    style={{flex:1,fontSize:12,padding:'6px 10px'}}/>
                  <button className="btn btn-sm btn-primary" onClick={saveNewCustomer}
                    disabled={savingCust||!newCustName.trim()} style={{whiteSpace:'nowrap'}}>
                    {savingCust?'…':'Save'}
                  </button>
                  <button className="btn btn-sm" onClick={()=>setPhoneStatus(null)} style={{fontSize:11}}>Skip</button>
                </div>
              </div>
            )}

            {!phone && <div style={{fontSize:10,color:'#475569',marginTop:4}}>Leave blank for walk-in customer</div>}
          </div>

          {/* Cart items */}
          <div className="bill-items-list">
            {items.length===0 ? (
              <div className="bill-empty" style={{flexDirection:'column',gap:10}}>
                <div style={{width:56,height:56,borderRadius:16,background:'var(--bg-hover)',display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid var(--border)'}}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                    <path d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16"/>
                  </svg>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontWeight:700,fontSize:13,color:'var(--text-secondary)',marginBottom:3}}>Cart is empty</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.4}}>Click any fabric card<br/>or scan a QR code to add</div>
                </div>
              </div>
            ) : items.map(item => (
              <div key={item._id} style={{
                padding:'9px 0',
                borderBottom:'1px solid var(--border)',
              }}>
                {/* Top row: swatch · name · total price */}
                <div style={{display:'flex',gap:9,alignItems:'center',marginBottom:7}}>
                  {/* Swatch */}
                  <div style={{flexShrink:0,width:38,height:38,borderRadius:8,overflow:'hidden',border:'1.5px solid var(--border)',position:'relative'}}>
                    {item.imageUrl
                      ? <img src={`${IMG}${item.imageUrl}`} alt={item.name}
                          style={{width:38,height:38,objectFit:'cover',display:'block'}}
                          onError={e=>{ e.target.style.display='none'; e.target.parentNode.style.background=item.swatchColor||'var(--primary-light)'; }}/>
                      : <div style={{width:38,height:38,background:item.swatchColor||'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <svg style={{opacity:.25,width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16"/></svg>
                        </div>
                    }
                  </div>
                  {/* Name + meta */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12.5,color:'var(--text-primary)',lineHeight:1.25,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                    <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>
                      {item.category?.name}{item.brand?.name?` · ${item.brand.name}`:''}
                    </div>
                  </div>
                  {/* Line total */}
                  <div style={{flexShrink:0,textAlign:'right'}}>
                    <div style={{fontWeight:800,fontSize:14,color:'var(--primary)',letterSpacing:'-.3px'}}>{fmt(item.pricePerUnit*item.qty)}</div>
                    <div style={{fontSize:9.5,color:'var(--text-muted)',fontWeight:500,marginTop:1}}>₹{item.pricePerUnit}/{item.unit}</div>
                  </div>
                </div>
                {/* Bottom row: qty stepper · remove */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingLeft:47}}>
                  <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg-hover)',borderRadius:8,border:'1.5px solid var(--border)',overflow:'hidden'}}>
                    <button onClick={e=>{e.stopPropagation();changeQty(item._id,-1);}}
                      style={{width:28,height:26,border:'none',background:'none',cursor:'pointer',fontWeight:800,fontSize:16,color:'var(--text-secondary)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .1s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>−</button>
                    <span style={{minWidth:30,textAlign:'center',fontWeight:800,fontSize:12.5,color:'var(--text-primary)',borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)',height:26,display:'flex',alignItems:'center',justifyContent:'center'}}>{item.qty}</span>
                    <button onClick={e=>{e.stopPropagation();changeQty(item._id,1);}}
                      style={{width:28,height:26,border:'none',background:'none',cursor:'pointer',fontWeight:800,fontSize:16,color:'var(--text-secondary)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .1s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>+</button>
                  </div>
                  <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>{item.qty} {item.unit}{item.qty>1?'s':''}</span>
                  <button onClick={e=>{e.stopPropagation();changeQty(item._id,-item.qty);}}
                    style={{fontSize:10,color:'var(--danger)',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:'3px 7px',borderRadius:6,letterSpacing:.1,transition:'background .12s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--danger-light)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bill-footer" style={{padding:'10px 14px',background:'var(--bg-card)'}}>
            {billError && <div style={{fontSize:11,color:'var(--danger)',marginBottom:8,fontWeight:700,padding:'6px 10px',background:'var(--danger-light)',borderRadius:6}}>{billError}</div>}

            {/* Totals summary */}
            <div style={{background:'var(--bg-hover)',borderRadius:10,padding:'10px 12px',marginBottom:10,border:'1px solid var(--border)'}}>
              {/* Subtotal */}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:5}}>
                <span>Subtotal</span><span style={{fontWeight:600,fontFamily:'var(--font-mono)'}}>{fmt(subtotal)}</span>
              </div>
              {/* GST */}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:5}}>
                <span>GST</span><span style={{fontWeight:600,fontFamily:'var(--font-mono)'}}>{fmt(gstAmount)}</span>
              </div>
              {/* Discount inline */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'var(--text-secondary)',marginBottom: discount>0?5:0}}>
                <span>Discount</span>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <input type="number" min="0" max="100" value={discount}
                    onChange={e=>setDiscount(Math.min(100,Math.max(0,Number(e.target.value))))}
                    style={{width:42,textAlign:'right',border:'1.5px solid var(--border-dark)',borderRadius:6,padding:'2px 6px',fontSize:12,fontFamily:'var(--font-mono)',fontWeight:700,background:'var(--bg-card)',color:'var(--text-primary)',outline:'none'}}/>
                  <span style={{fontSize:11,color:'var(--text-muted)'}}>%</span>
                </div>
              </div>
              {discount>0 && (
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--danger)',marginBottom:5}}>
                  <span>Discount Amount</span><span style={{fontWeight:700,fontFamily:'var(--font-mono)'}}>− {fmt(discountAmt)}</span>
                </div>
              )}
              {/* Total */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:800,fontSize:18,letterSpacing:'-.5px',marginTop:8,paddingTop:8,borderTop:'2px solid var(--border)'}}>
                <span style={{color:'var(--text-primary)'}}>Total</span>
                <span style={{color:'var(--primary)',fontFamily:'var(--font-mono)'}}>{fmt(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div style={{marginBottom:6}}>
              <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Payment Method</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
                {['Cash','Card','UPI','NEFT'].map(m=>(
                  <button key={m} onClick={()=>{setPayMethod(m);setPayStatus(m==='NEFT'?'Pending':'Paid');}}
                    style={{padding:'7px 4px',textAlign:'center',fontSize:11,fontWeight:700,borderRadius:8,cursor:'pointer',border:`1.5px solid ${payMethod===m?'var(--primary)':'var(--border-dark)'}`,background:payMethod===m?'var(--primary)':'var(--bg-card)',color:payMethod===m?'white':'var(--text-secondary)',transition:'all .12s',boxShadow:payMethod===m?'0 2px 8px rgba(13,92,69,.25)':'none'}}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment status */}
            <div style={{marginBottom:8}}>
              <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Status</div>
              <div style={{display:'flex',gap:5}}>
                {['Paid','Pending','Partial'].map(s=>(
                  <button key={s} onClick={()=>setPayStatus(s)}
                    style={{flex:1,padding:'5px 4px',textAlign:'center',fontSize:10.5,fontWeight:700,borderRadius:8,cursor:'pointer',border:`1.5px solid ${payStatus===s?'var(--primary)':'var(--border-dark)'}`,background:payStatus===s?'var(--primary)':'var(--bg-card)',color:payStatus===s?'white':'var(--text-secondary)',transition:'all .12s'}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Note */}
            <input className="form-control" value={billNote} onChange={e=>setBillNote(e.target.value)}
              placeholder="Bill note (optional)…"
              style={{fontSize:11,padding:'5px 10px',marginBottom:8,color:'var(--text-secondary)',background:'var(--bg-hover)'}}/>

            {/* Hold Bill */}
            {items.length>0 && (
              <button onClick={handleHoldBill} disabled={holdingBill}
                style={{width:'100%',padding:'7px 0',marginBottom:6,background:'var(--gold-light)',color:'var(--gold)',border:'1.5px solid var(--gold)',borderRadius:8,fontWeight:700,fontSize:11.5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .12s'}}>
                ⏸ {holdingBill?'Holding…':'Hold Bill  ·  Ctrl+H'}
              </button>
            )}

            {/* Generate button */}
            <button onClick={handleGenerateBill} disabled={submitting||items.length===0}
              style={{width:'100%',padding:'12px 0',background:items.length===0?'var(--border)':'var(--primary)',color:'white',border:'none',borderRadius:10,fontWeight:800,fontSize:14,cursor:items.length===0?'not-allowed':'pointer',letterSpacing:'-.2px',transition:'all .15s',boxShadow:items.length>0?'0 4px 16px rgba(13,92,69,0.3)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {submitting
                ? <><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Generating…</>
                : items.length===0
                  ? 'Add products to bill'
                  : <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      Generate Bill · {fmt(total)}
                    </>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Billing;
