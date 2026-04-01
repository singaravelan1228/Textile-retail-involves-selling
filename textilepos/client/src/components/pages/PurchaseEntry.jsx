import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getSuppliers, createSupplier,
  getPurchaseEntries, getPurchaseEntry, getPurchaseStats,
  createPurchaseEntry, updatePurchaseEntry, deletePurchaseEntry,
  getProducts,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

/* ── helpers ─────────────────────────────────── */
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];

const calcTotals = (items, d1, d2, gst) => {
  const gross   = items.reduce((s, i) => s + (i.purchaseRate||0) * (i.qty||0), 0);
  const d1amt   = gross * d1 / 100;
  const afterD1 = gross - d1amt;
  const d2amt   = afterD1 * d2 / 100;
  const taxable = afterD1 - d2amt;
  const gstAmt  = taxable * gst / 100;
  return {
    grossAmount:   +gross.toFixed(2),
    discount1Amt:  +d1amt.toFixed(2),
    discount2Amt:  +d2amt.toFixed(2),
    taxableAmount: +taxable.toFixed(2),
    gstAmount:     +gstAmt.toFixed(2),
    cgst:          +(gstAmt/2).toFixed(2),
    sgst:          +(gstAmt/2).toFixed(2),
    netAmount:     +(taxable + gstAmt).toFixed(2),
  };
};

/* ── CSS vars injected once ─────────────────── */
const STYLE = `
.pe-wrap { font-family:var(--font,-apple-system,sans-serif); }

/* filter bar */
.pe-filter {
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  padding:12px 16px; background:var(--bg-card);
  border:1.5px solid var(--border); border-radius:10px; margin-bottom:16px;
}
.pe-filter label { font-size:10px; color:var(--text-muted); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; font-weight:700; }
.pe-filter-sep { width:1px; height:20px; background:var(--border-dark); margin:0 4px; flex-shrink:0; }

/* inputs — match site style */
.pe-inp {
  background:var(--bg-card); border:1.5px solid var(--border-dark); color:var(--text-primary);
  border-radius:var(--radius-md); padding:7px 11px; font-size:13px;
  outline:none; transition:border-color .15s; font-family:var(--font);
}
.pe-inp:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-glow); }
.pe-inp::placeholder { color:var(--text-muted); font-weight:400; }
.pe-inp[readonly] { background:var(--bg-hover); color:var(--text-muted); cursor:default; }
.pe-select {
  background:var(--bg-card); border:1.5px solid var(--border-dark); color:var(--text-primary);
  border-radius:var(--radius-md); padding:7px 11px; font-size:13px; outline:none; cursor:pointer;
  font-family:var(--font); transition:border-color .15s;
}
.pe-select:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-glow); }
.pe-select option { background:var(--bg-card); }

/* metrics */
.pe-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.pe-metric { background:var(--bg-card); border:1.5px solid var(--border); border-radius:var(--radius-lg); padding:16px 18px; position:relative; overflow:hidden; }
.pe-metric::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--primary); border-radius:14px 14px 0 0; opacity:.6; }
.pe-metric-label { font-size:11px; color:var(--text-muted); letter-spacing:.06em; text-transform:uppercase; font-weight:700; margin-bottom:8px; }
.pe-metric-val { font-size:22px; font-weight:800; color:var(--text-primary); letter-spacing:-1px; }
.pe-metric-val.accent { color:var(--primary); }
.pe-metric-sub { font-size:11px; color:var(--primary); margin-top:4px; font-weight:600; }

/* table */
.pe-table-wrap { border:1.5px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
.pe-table { width:100%; border-collapse:collapse; }
.pe-table th { background:var(--bg-hover); padding:9px 12px; text-align:left; font-size:11px; font-weight:700;
  letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); border-bottom:1.5px solid var(--border); white-space:nowrap; }
.pe-table td { padding:11px 12px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
.pe-table tr:last-child td { border-bottom:none; }
.pe-table tr:hover td { background:var(--bg-hover); cursor:pointer; }
.pe-mono { font-family:var(--font-mono,monospace); font-size:11px; color:var(--text-secondary); }
.pe-accent-txt { color:var(--primary); font-family:var(--font-mono,monospace); font-weight:700; }
.pe-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.02em; }
.pe-badge-saved { background:var(--success-light,#E8F6EE); color:var(--success,#1B7A4A); }
.pe-badge-draft { background:var(--gold-light,#FDF5E6); color:var(--gold,#C9993A); }
.pe-ref { display:inline-flex; align-items:center; padding:2px 9px; background:var(--primary-light);
  border-radius:20px; font-family:monospace; font-size:11px; color:var(--primary); font-weight:700; }

/* form cards — NO overflow:hidden so dropdowns show */
.pe-card { background:var(--bg-card); border:1.5px solid var(--border); border-radius:var(--radius-lg); margin-bottom:14px; }
.pe-card-head { display:flex; align-items:center; justify-content:space-between;
  padding:11px 16px; border-bottom:1.5px solid var(--border); background:var(--bg-hover);
  border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
.pe-card-title { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
  color:var(--text-muted); display:flex; align-items:center; gap:7px; }
.pe-card-title .num { color:var(--primary); font-size:13px; }
.pe-body { padding:16px; }
.pe-grid { display:grid; gap:12px 14px; }
.pe-grid.g2 { grid-template-columns:1fr 1fr; }
.pe-grid.g3 { grid-template-columns:1fr 1fr 1fr; }
.pe-grid.g4 { grid-template-columns:1fr 1fr 1fr 1fr; }
.pe-grid.g5 { grid-template-columns:1fr 1fr 1fr 1fr 1fr; }
.pe-grid .span2 { grid-column:span 2; }
.pe-field label { display:block; font-size:11px; font-weight:600; letter-spacing:.02em;
  color:var(--text-secondary); margin-bottom:5px; }
.pe-field label .req { color:var(--primary); }
.pe-divider { height:1px; background:var(--border); margin:10px 0 14px; }

/* product line-items table */
.pe-prod-table { width:100%; border-collapse:collapse; margin-bottom:8px; }
.pe-prod-table th { background:var(--bg-hover); padding:7px 10px; font-size:11px; font-weight:700;
  letter-spacing:.05em; text-transform:uppercase; color:var(--text-muted); border-bottom:1.5px solid var(--border); }
.pe-prod-table td { padding:4px 6px; border-bottom:1px solid var(--border); vertical-align:middle; }
.pe-prod-table tr:last-child td { border-bottom:none; }
.pe-prod-input { background:transparent; border:1.5px solid transparent; padding:5px 8px; font-size:13px;
  width:100%; color:var(--text-primary); outline:none; border-radius:var(--radius-sm); font-family:var(--font); }
.pe-prod-input:focus { background:var(--bg-hover); border-color:var(--primary); }
.pe-prod-total { font-family:monospace; color:var(--primary); font-weight:700; text-align:right; padding-right:10px; }

/* search dropdown — z-index high enough to escape anything */
.pe-search-wrap { position:relative; }
.pe-dd {
  position:absolute; top:calc(100% + 4px); left:0; right:0;
  background:var(--bg-card); border:1.5px solid var(--border-dark);
  border-radius:var(--radius-md); z-index:9000;
  max-height:220px; overflow-y:auto;
  box-shadow:0 8px 32px rgba(0,0,0,.18);
}
.pe-dd-item { padding:9px 12px; cursor:pointer; border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between; font-size:13px; }
.pe-dd-item:last-child { border-bottom:none; }
.pe-dd-item:hover { background:var(--primary-light); }
.pe-dd-code { font-family:monospace; font-size:11px; color:var(--text-muted); }
.pe-dd-empty { padding:12px; text-align:center; color:var(--text-muted); font-size:12px; font-style:italic; }

/* add row button */
.pe-add-row { display:flex; align-items:center; gap:7px; padding:8px 12px; background:transparent;
  border:1.5px dashed var(--border-dark); color:var(--text-muted); cursor:pointer; width:100%;
  font-size:12px; border-radius:var(--radius-md); transition:all .15s; margin-top:4px; font-family:var(--font); }
.pe-add-row:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-light); }

/* summary */
.pe-summary-grid { display:grid; grid-template-columns:1fr 280px; gap:16px; align-items:start; }
.pe-summary-box { background:var(--bg-hover); border:1.5px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
.pe-sum-row { display:flex; justify-content:space-between; align-items:center;
  padding:9px 14px; border-bottom:1px solid var(--border); font-size:13px; }
.pe-sum-row:last-child { border-bottom:none; }
.pe-sum-row .lbl { color:var(--text-secondary); }
.pe-sum-row .val { font-family:monospace; font-weight:600; }
.pe-sum-total { background:var(--primary-light); border-top:1.5px solid var(--border-hover) !important; }
.pe-sum-total .lbl { color:var(--primary); font-weight:700; font-size:14px; }
.pe-sum-total .val { color:var(--primary); font-size:16px; font-weight:800; font-family:monospace; }

/* buttons */
.pe-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:var(--radius-md);
  font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; font-family:var(--font); }
.pe-btn-ghost { background:var(--bg-card); color:var(--text-primary); border:1.5px solid var(--border-dark) !important; }
.pe-btn-ghost:hover { background:var(--bg-hover); border-color:var(--border-hover) !important; }
.pe-btn-accent { background:var(--primary); color:white; font-weight:700; box-shadow:0 2px 8px rgba(13,92,69,.3); }
.pe-btn-accent:hover { background:var(--primary-dark,#09412F); }
.pe-btn-danger { background:transparent; color:var(--danger); border:1.5px solid rgba(192,57,43,.3) !important; }
.pe-btn-danger:hover { background:var(--danger-light); }
.pe-btn-sm { padding:5px 11px; font-size:12px; border-radius:var(--radius-sm); }
.pe-btn-icon { padding:5px 8px; }

/* toast */
.pe-toast { position:fixed; bottom:20px; right:20px; padding:11px 18px; border-radius:var(--radius-md);
  font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px;
  z-index:9999; box-shadow:var(--shadow-lg); animation:pe-slide .25s ease; }
@keyframes pe-slide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* page header */
.pe-page-title { font-size:20px; font-weight:800; letter-spacing:-.4px; color:var(--text-primary); }
.pe-page-sub { font-size:11px; color:var(--text-muted); margin-top:3px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }

/* pagination */
.pe-pag { display:flex; align-items:center; justify-content:space-between; margin-top:12px; }
.pe-pag-info { font-size:12px; color:var(--text-muted); font-weight:600; }

/* form footer */
.pe-form-footer { display:flex; align-items:center; justify-content:space-between; padding-top:14px; }

/* supplier modal */
.pe-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:4000; display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(3px); }
.pe-modal { background:var(--bg-card); border:1.5px solid var(--border); border-radius:var(--radius-xl); width:100%; max-width:500px; overflow:hidden; box-shadow:var(--shadow-lg); }
.pe-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1.5px solid var(--border); background:var(--bg-hover); }
.pe-modal-title { font-size:15px; font-weight:800; color:var(--text-primary); letter-spacing:-.2px; }
.pe-modal-body { padding:18px 20px; }
.pe-modal-foot { display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1.5px solid var(--border); background:var(--bg-hover); }

/* entry status tag */
.pe-status-tag { font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px; letter-spacing:.06em; text-transform:uppercase; }
.pe-status-draft { background:var(--gold-light,#FDF5E6); color:var(--gold,#C9993A); }
.pe-status-saved { background:var(--success-light,#E8F6EE); color:var(--success,#1B7A4A); }

@media (max-width:1024px) {
  .pe-metrics { grid-template-columns:1fr 1fr; }
  .pe-grid.g4, .pe-grid.g5 { grid-template-columns:1fr 1fr; }
  .pe-summary-grid { grid-template-columns:1fr; }
}
@media (max-width:768px) {
  .pe-metrics { grid-template-columns:1fr 1fr; gap:8px; }
  .pe-grid.g2 { grid-template-columns:1fr; }
  .pe-grid .span2 { grid-column:span 1; }
  .pe-grid.g3 { grid-template-columns:1fr 1fr; }
}
@media (max-width:500px) {
  .pe-metrics { grid-template-columns:1fr 1fr; }
  .pe-metric-val { font-size:18px; }
}
`;

/* ── Toast component ─────────────────────────── */
const Toast = ({ msg, type, onHide }) => {
  useEffect(() => { const t = setTimeout(onHide, 2800); return ()=>clearTimeout(t); }, []);
  return (
    <div className="pe-toast" style={{ background: type==='error' ? '#e05555' : '#4caf80', color:'white' }}>
      {type==='error'
        ? <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        : <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      }
      {msg}
    </div>
  );
};

/* ── Supplier Modal ──────────────────────────── */
const SupplierModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name:'', code:'', gstin:'', phone:'', email:'', address:'', city:'', state:'Tamil Nadu', paymentTerms:'Net 30' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const ch = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return setErr('Name and Code are required.');
    setSaving(true); setErr('');
    try {
      const { data } = await createSupplier(form);
      onSaved(data.data);
    } catch(e) { setErr(e.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="pe-modal-overlay">
      <div className="pe-modal">
        <div className="pe-modal-head">
          <span className="pe-modal-title">Add New Supplier</span>
          <button onClick={onClose} className="pe-btn pe-btn-ghost pe-btn-icon" style={{fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div className="pe-modal-body">
          {err && <div style={{background:'rgba(224,85,85,.1)',border:'1px solid rgba(224,85,85,.3)',borderRadius:4,padding:'8px 12px',fontSize:12,color:'#e05555',marginBottom:12}}>{err}</div>}
          <div className="pe-grid g2" style={{marginBottom:12}}>
            <div className="pe-field">
              <label>Supplier Name <span className="req">*</span></label>
              <input className="pe-inp" name="name" value={form.name} onChange={ch} placeholder="e.g. Kala Niketan Mills" style={{width:'100%'}}/>
            </div>
            <div className="pe-field">
              <label>Supplier Code <span className="req">*</span></label>
              <input className="pe-inp" name="code" value={form.code} onChange={ch} placeholder="e.g. KNM-001" style={{width:'100%'}}/>
            </div>
            <div className="pe-field">
              <label>GSTIN</label>
              <input className="pe-inp" name="gstin" value={form.gstin} onChange={ch} placeholder="33AAACK1234A1ZX" style={{width:'100%'}}/>
            </div>
            <div className="pe-field">
              <label>Phone</label>
              <input className="pe-inp" name="phone" value={form.phone} onChange={ch} placeholder="9800001111" style={{width:'100%'}}/>
            </div>
            <div className="pe-field">
              <label>City</label>
              <input className="pe-inp" name="city" value={form.city} onChange={ch} placeholder="Coimbatore" style={{width:'100%'}}/>
            </div>
            <div className="pe-field">
              <label>Payment Terms</label>
              <select className="pe-select" name="paymentTerms" value={form.paymentTerms} onChange={ch} style={{width:'100%'}}>
                {['Immediate','Net 30','Net 45','Net 60'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="pe-modal-foot">
          <button className="pe-btn pe-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="pe-btn pe-btn-accent" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Add Supplier'}</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   PURCHASE ENTRY PAGE
═══════════════════════════════════════════════ */
const PurchaseEntry = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // View: 'list' | 'form'
  const [view,        setView]        = useState('list');
  const [editEntry,   setEditEntry]   = useState(null);

  // List state
  const [entries,     setEntries]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(25);
  const [filter,      setFilter]      = useState({ from:'', to:'', supplier:'' });

  // Form state
  const [suppliers,   setSuppliers]   = useState([]);
  const [products,    setProducts]    = useState([]);
  const [formSaving,  setFormSaving]  = useState(false);

  // Entry header
  const [refNo,       setRefNo]       = useState('INW-NEW');
  const [invoiceNo,   setInvoiceNo]   = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [selSupplier, setSelSupplier] = useState(null);
  const [suppSearch,  setSuppSearch]  = useState('');
  const [suppDdOpen,  setSuppDdOpen]  = useState(false);
  const [discount1,   setDiscount1]   = useState(0);
  const [discount2,   setDiscount2]   = useState(0);
  const [gstPct,      setGstPct]      = useState(5);
  const [payTerms,    setPayTerms]     = useState('Net 30');
  const [transport,   setTransport]   = useState('');
  const [entryStatus, setEntryStatus] = useState('draft'); // current form status

  // Line items
  const [lineItems,   setLineItems]   = useState([]);
  const [prodSearch,  setProdSearch]  = useState('');
  const [prodDdOpen,  setProdDdOpen]  = useState(false);
  const [filteredProds,setFilteredProds]=useState([]);
  const [remarks,     setRemarks]     = useState('');

  // Supplier modal
  const [showSuppModal,setShowSuppModal]=useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => setToast({msg, type});

  const suppSearchRef = useRef();
  const prodInputRef  = useRef();

  /* ── Load list + stats ── */
  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getPurchaseEntries({ ...filter, page, limit }),
        getPurchaseStats(),
      ]);
      setEntries(listRes.data.data || []);
      setTotal(listRes.data.total || 0);
      setStats(statsRes.data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter, page, limit]);

  useEffect(() => { loadList(); }, [loadList]);

  /* ── Load suppliers + products for form ── */
  const loadFormData = async () => {
    try {
      const [s, p] = await Promise.all([getSuppliers(), getProducts()]);
      setSuppliers(s.data.data || []);
      setProducts(p.data.data || []);
    } catch(e) { console.error(e); }
  };

  /* ── Open new entry form ── */
  const openNewEntry = async () => {
    await loadFormData();
    setEditEntry(null);
    setRefNo('INW-NEW'); setInvoiceNo(''); setInvoiceDate(today());
    setSelSupplier(null); setSuppSearch('');
    setDiscount1(0); setDiscount2(0); setGstPct(5);
    setPayTerms('Net 30'); setTransport(''); setRemarks('');
    setLineItems([]); setEntryStatus('draft');
    setView('form');
  };

  /* ── Open edit entry form ── */
  const openEdit = async (id) => {
    await loadFormData();
    try {
      const { data } = await getPurchaseEntry(id);
      const e = data.data;
      setEditEntry(e);
      setRefNo(e.refNo);
      setInvoiceNo(e.invoiceNo);
      setInvoiceDate(e.invoiceDate?.split('T')[0] || today());
      setSelSupplier(e.supplier || { name:e.supplierName, code:e.supplierCode, gstin:e.supplierGstin });
      setSuppSearch(e.supplierName || '');
      setDiscount1(e.discount1Pct || 0);
      setDiscount2(e.discount2Pct || 0);
      setGstPct(e.gstPct || 5);
      setPayTerms(e.paymentTerms || 'Net 30');
      setTransport(e.transportRef || '');
      setRemarks(e.remarks || '');
      setLineItems(e.items || []);
      setEntryStatus(e.status || 'draft');
      setView('form');
    } catch(err) { showToast('Failed to load entry.', 'error'); }
  };

  /* ── Supplier search filter ── */
  const filteredSupps = suppliers.filter(s =>
    s.name.toLowerCase().includes(suppSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(suppSearch.toLowerCase())
  );

  /* ── Product search filter ── */
  useEffect(() => {
    if (!prodSearch.trim()) { setFilteredProds([]); return; }
    setFilteredProds(
      products.filter(p =>
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(prodSearch.toLowerCase())
      ).slice(0, 12)
    );
  }, [prodSearch, products]);

  /* ── Add line item ── */
  const addLineItem = (product) => {
    setLineItems(prev => {
      const exists = prev.find(i => i.product === product._id);
      if (exists) {
        showToast(`${product.name} already in list. Edit quantity below.`);
        return prev;
      }
      return [...prev, {
        product:     product._id,
        productName: product.name,
        productCode: product.code,
        unit:        product.unit,
        purchaseRate:product.pricePerUnit,
        qty:         1,
        totalAmount: product.pricePerUnit,
      }];
    });
    setProdSearch(''); setProdDdOpen(false);
    prodInputRef.current?.focus();
  };

  const updateLineItem = (idx, field, val) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: Number(val) || 0 };
      updated.totalAmount = +(updated.purchaseRate * updated.qty).toFixed(2);
      return updated;
    }));
  };

  const removeLineItem = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  /* ── Computed totals ── */
  const totals = calcTotals(lineItems, discount1, discount2, gstPct);

  /* ── Save entry ── */
  const handleSave = async (status) => {
    if (!invoiceNo.trim())      return showToast('Invoice number is required.', 'error');
    if (!selSupplier)           return showToast('Please select a supplier.', 'error');
    if (lineItems.length === 0) return showToast('Add at least one product.', 'error');

    setFormSaving(true);
    try {
      const payload = {
        invoiceNo, invoiceDate,
        supplier:     selSupplier._id,
        supplierName: selSupplier.name,
        supplierCode: selSupplier.code,
        supplierGstin:selSupplier.gstin || '',
        items: lineItems,
        discount1Pct: Number(discount1), discount2Pct: Number(discount2),
        gstPct: Number(gstPct), paymentTerms: payTerms,
        transportRef: transport, remarks, status,
        ...totals,
      };

      if (editEntry) {
        await updatePurchaseEntry(editEntry._id, payload);
        showToast(`${editEntry.refNo} updated successfully!`);
      } else {
        const { data } = await createPurchaseEntry(payload);
        showToast(`${data.data.refNo} ${status==='saved'?'saved':'saved as draft'}!`);
      }

      await loadList();
      setView('list');
    } catch(err) {
      showToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally { setFormSaving(false); }
  };

  /* ── Delete draft ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft entry?')) return;
    try {
      await deletePurchaseEntry(id);
      showToast('Draft deleted.');
      loadList();
    } catch(err) { showToast(err.response?.data?.message || 'Cannot delete.', 'error'); }
  };

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ═══════ RENDER ═══════ */
  return (
    <>
      <style>{STYLE}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onHide={()=>setToast(null)}/>}
      {showSuppModal && (
        <SupplierModal
          onClose={()=>setShowSuppModal(false)}
          onSaved={s => {
            setSuppliers(prev=>[...prev,s].sort((a,b)=>a.name.localeCompare(b.name)));
            setSelSupplier(s); setSuppSearch(s.name);
            setShowSuppModal(false); showToast(`Supplier "${s.name}" added`);
          }}
        />
      )}

      <div className="pe-wrap">

        {/* ══════ LIST VIEW ══════ */}
        {view === 'list' && (
          <div style={{padding:'22px 24px'}}>

            {/* Page header */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:20,fontWeight:800,letterSpacing:'-.4px',color:'var(--text-primary)'}}>Purchase Entry</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase'}}>Purchase Receipts / Stock Inward</div>
              </div>
              <button className="pe-btn pe-btn-accent" onClick={openNewEntry}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                + New Entry
              </button>
            </div>

            {/* Metrics */}
            {stats && (
              <div className="pe-metrics">
                <div className="pe-metric">
                  <div className="pe-metric-label">Total Purchases</div>
                  <div className="pe-metric-val accent" style={{fontSize:18}}>{fmt(stats.totalPurchases)}</div>
                  <div className="pe-metric-sub">{stats.savedEntries} saved entries</div>
                </div>
                <div className="pe-metric">
                  <div className="pe-metric-label">This Month</div>
                  <div className="pe-metric-val accent" style={{fontSize:18}}>{fmt(stats.thisMonthPurchases)}</div>
                  <div className="pe-metric-sub">{stats.thisMonthEntries} entries</div>
                </div>
                <div className="pe-metric">
                  <div className="pe-metric-label">Saved Entries</div>
                  <div className="pe-metric-val">{stats.savedEntries}</div>
                  <div className="pe-metric-sub">Stock updated</div>
                </div>
                <div className="pe-metric">
                  <div className="pe-metric-label">Draft Entries</div>
                  <div className="pe-metric-val" style={{color:stats.draftEntries>0?'var(--primary)':'inherit'}}>{stats.draftEntries}</div>
                  <div className="pe-metric-sub">Pending save</div>
                </div>
              </div>
            )}

            {/* Filter bar */}
            <div className="pe-filter">
              <span className="pe-filter-sep" style={{display:'none'}}/>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <label>From</label>
                <input type="date" className="pe-inp" value={filter.from}
                  onChange={e=>setFilter(f=>({...f,from:e.target.value}))} style={{width:130}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <label>To</label>
                <input type="date" className="pe-inp" value={filter.to}
                  onChange={e=>setFilter(f=>({...f,to:e.target.value}))} style={{width:130}}/>
              </div>
              <button className="pe-btn pe-btn-ghost pe-btn-sm" onClick={()=>{setPage(1);loadList();}}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Apply
              </button>
              <div className="pe-filter-sep"/>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <label>Supplier</label>
                <input className="pe-inp" placeholder="All suppliers" value={filter.supplier}
                  onChange={e=>setFilter(f=>({...f,supplier:e.target.value}))} style={{width:150}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <label>Show Last</label>
                <select className="pe-select" value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1);}} style={{width:80}}>
                  {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button className="pe-btn pe-btn-ghost pe-btn-sm" style={{marginLeft:'auto'}} onClick={()=>{
                const rows=entries.map(e=>[e.refNo,e.invoiceNo,e.supplierName,e.items?.length,fmt(e.grossAmount),fmt(e.netAmount),e.status].join(','));
                const csv='Ref,Invoice,Supplier,Items,Gross,Net,Status\n'+rows.join('\n');
                const a=document.createElement('a');a.href='data:text/csv,'+encodeURIComponent(csv);a.download='purchases.csv';a.click();
              }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Export
              </button>
            </div>

            {/* Table */}
            {loading ? <Loader/> : (
              <>
                <div className="pe-table-wrap">
                  <table className="pe-table">
                    <thead>
                      <tr>
                        <th>Ref No.</th>
                        <th>Invoice No.</th>
                        <th>Inv Date</th>
                        <th>Supplier</th>
                        <th style={{textAlign:'center'}}>Items</th>
                        <th>Gross Amt</th>
                        <th>Discount</th>
                        <th>GST</th>
                        <th>Net Amount</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 && (
                        <tr><td colSpan={11} style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)',fontStyle:'italic'}}>
                          No entries found. Click + New Entry to create one.
                        </td></tr>
                      )}
                      {entries.map(e => (
                        <tr key={e._id} onClick={()=>openEdit(e._id)}>
                          <td><span className="pe-ref">{e.refNo}</span></td>
                          <td className="pe-mono">{e.invoiceNo}</td>
                          <td className="pe-mono">{new Date(e.invoiceDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                          <td style={{fontWeight:500}}>{e.supplierName}</td>
                          <td className="pe-mono" style={{textAlign:'center'}}>{e.items?.length||0}</td>
                          <td className="pe-mono">{fmt(e.grossAmount)}</td>
                          <td className="pe-mono" style={{color:'var(--success,#1B7A4A)'}}>−{fmt((e.discount1Amt||0)+(e.discount2Amt||0))}</td>
                          <td className="pe-mono">{fmt(e.gstAmount)}</td>
                          <td className="pe-accent-txt" style={{fontWeight:700}}>{fmt(e.netAmount)}</td>
                          <td><span className={`pe-badge ${e.status==='saved'?'pe-badge-saved':'pe-badge-draft'}`}>{e.status}</span></td>
                          <td onClick={ev=>ev.stopPropagation()}>
                            <div style={{display:'flex',gap:4}}>
                              <button className="pe-btn pe-btn-ghost pe-btn-sm pe-btn-icon" onClick={()=>openEdit(e._id)} title="Edit">
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              {e.status==='draft' && isAdmin && (
                                <button className="pe-btn pe-btn-ghost pe-btn-sm pe-btn-icon" onClick={()=>handleDelete(e._id)} title="Delete draft" style={{color:'var(--danger)'}}>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pe-pag">
                  <div className="pe-pag-info">Showing {entries.length} of {total} entries</div>
                  <div style={{display:'flex',gap:5}}>
                    <button className="pe-btn pe-btn-ghost pe-btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                    {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                      <button key={p} className="pe-btn pe-btn-ghost pe-btn-sm"
                        style={page===p?{background:'rgba(13,92,69,.15)',color:'var(--primary)',border:'1px solid rgba(200,169,78,.4)'}:{}}
                        onClick={()=>setPage(p)}>{p}</button>
                    ))}
                    <button className="pe-btn pe-btn-ghost pe-btn-sm" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════ ENTRY FORM ══════ */}
        {view === 'form' && (
          <div style={{padding:'22px 24px'}}>

            {/* Form page header */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <button className="pe-btn pe-btn-ghost pe-btn-sm pe-btn-icon" onClick={()=>setView('list')} style={{padding:'5px 9px'}}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  </button>
                  <div style={{fontSize:18,fontWeight:800,letterSpacing:'-.3px',color:'var(--text-primary)'}}>
                    {editEntry ? `Edit — ${editEntry.refNo}` : 'New Inventory Entry'}
                  </div>
                  <span className={`pe-status-tag ${entryStatus==='saved'?'pe-status-saved':'pe-status-draft'}`}>
                    {entryStatus}
                  </span>
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3,marginLeft:38,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase'}}>
                  Purchase Receipt — {refNo}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="pe-btn pe-btn-ghost" onClick={()=>setView('list')}>Discard</button>
                <button className="pe-btn pe-btn-ghost" onClick={()=>handleSave('draft')} disabled={formSaving}>Save as Draft</button>
                <button className="pe-btn pe-btn-accent" onClick={()=>handleSave('saved')} disabled={formSaving}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                  {formSaving?'Saving…':'Save Entry'}
                </button>
              </div>
            </div>

            {/* ── 01 Entry Header ── */}
            <div className="pe-card">
              <div className="pe-card-head">
                <div className="pe-card-title">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{color:"var(--primary)",fontWeight:800}}>01</span> Entry Header
                </div>
              </div>
              <div className="pe-body">
                <div className="pe-grid g4">
                  <div className="pe-field">
                    <label>Ref No. <span className="req">*</span></label>
                    <input className="pe-inp" value={refNo} readOnly style={{color:'var(--primary)',cursor:'default',width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>Invoice No. <span className="req">*</span></label>
                    <input className="pe-inp" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} placeholder="e.g. SUP/INV/2025-001" style={{width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>Invoice Date <span className="req">*</span></label>
                    <input type="date" className="pe-inp" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} style={{width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>Entry Date</label>
                    <input className="pe-inp" value={today()} readOnly style={{color:'var(--text-muted)',cursor:'default',width:'100%'}}/>
                  </div>
                </div>

                <div className="pe-divider"/>

                {/* Supplier row */}
                <div className="pe-grid g4">
                  <div className="pe-field span2">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                      <label style={{marginBottom:0}}>Supplier <span className="req">*</span></label>
                      <button type="button" onClick={()=>setShowSuppModal(true)}
                        style={{fontSize:10,color:'var(--primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:0}}>
                        + Add New Supplier
                      </button>
                    </div>
                    <div className="pe-search-wrap">
                      <div style={{position:'relative'}}>
                        <input className="pe-inp" ref={suppSearchRef}
                          value={suppSearch} onChange={e=>{setSuppSearch(e.target.value);setSuppDdOpen(true);}}
                          onFocus={()=>setSuppDdOpen(true)}
                          onBlur={()=>setTimeout(()=>setSuppDdOpen(false),200)}
                          placeholder="Search supplier name or code…" style={{width:'100%',paddingRight:30}}/>
                        <span style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',pointerEvents:'none'}}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        </span>
                      </div>
                      {suppDdOpen && (
                        <div className="pe-dd">
                          {filteredSupps.length===0
                            ? <div className="pe-dd-empty">No suppliers found</div>
                            : filteredSupps.map(s=>(
                              <div key={s._id} className="pe-dd-item"
                                onMouseDown={()=>{setSelSupplier(s);setSuppSearch(s.name);setSuppDdOpen(false);}}>
                                <span>{s.name}</span>
                                <span className="pe-dd-code">{s.code}</span>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pe-field">
                    <label>Supplier Code</label>
                    <input className="pe-inp" value={selSupplier?.code||''} readOnly placeholder="Auto-filled" style={{color:'var(--text-muted)',cursor:'default',width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>Supplier GSTIN</label>
                    <input className="pe-inp" value={selSupplier?.gstin||''} readOnly placeholder="Auto-filled" style={{color:'var(--text-muted)',cursor:'default',width:'100%'}}/>
                  </div>
                </div>

                <div className="pe-divider"/>

                {/* Discount / GST / Terms */}
                <div className="pe-grid g5">
                  <div className="pe-field">
                    <label>Discount 1 (%)</label>
                    <input type="number" className="pe-inp" value={discount1} onChange={e=>setDiscount1(e.target.value)} min="0" max="100" step="0.01" style={{width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>Discount 2 (%)</label>
                    <input type="number" className="pe-inp" value={discount2} onChange={e=>setDiscount2(e.target.value)} min="0" max="100" step="0.01" style={{width:'100%'}}/>
                  </div>
                  <div className="pe-field">
                    <label>GST % <span className="req">*</span></label>
                    <select className="pe-select" value={gstPct} onChange={e=>setGstPct(e.target.value)} style={{width:'100%'}}>
                      {[0,5,12,18,28].map(v=><option key={v} value={v}>{v}%</option>)}
                    </select>
                  </div>
                  <div className="pe-field">
                    <label>Payment Terms</label>
                    <select className="pe-select" value={payTerms} onChange={e=>setPayTerms(e.target.value)} style={{width:'100%'}}>
                      {['Immediate','Net 30','Net 45','Net 60'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="pe-field">
                    <label>Transport / Ref</label>
                    <input className="pe-inp" value={transport} onChange={e=>setTransport(e.target.value)} placeholder="Lorry / AWB no." style={{width:'100%'}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 02 Products / Line Items ── */}
            <div className="pe-card">
              <div className="pe-card-head">
                <div className="pe-card-title">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>
                  <span style={{color:"var(--primary)",fontWeight:800}}>02</span> Products / Line Items
                </div>
                <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'monospace'}}>
                  {lineItems.length} item{lineItems.length!==1?'s':''}
                </div>
              </div>
              <div className="pe-body" style={{paddingBottom:10}}>
                <div style={{overflowX:'auto'}}>
                  <table className="pe-prod-table">
                    <thead>
                      <tr>
                        <th style={{width:32}}>#</th>
                        <th style={{minWidth:220}}>Product <span style={{color:'var(--primary)'}}>*</span></th>
                        <th style={{width:90}}>Code</th>
                        <th style={{width:72}}>Unit</th>
                        <th style={{width:120}}>Purchase Rate <span style={{color:'var(--primary)'}}>*</span></th>
                        <th style={{width:90}}>Qty <span style={{color:'var(--primary)'}}>*</span></th>
                        <th style={{width:120,textAlign:'right'}}>Total Amount</th>
                        <th style={{width:32}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.length===0 && (
                        <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',fontStyle:'italic',padding:'20px 0'}}>
                          No products added — search and add items below
                        </td></tr>
                      )}
                      {lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="pe-mono" style={{color:'var(--text-muted)',textAlign:'center'}}>{idx+1}</td>
                          <td>
                            <div style={{fontWeight:500,fontSize:12.5}}>{item.productName}</div>
                            <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'monospace'}}>{item.productCode}</div>
                          </td>
                          <td className="pe-mono">{item.productCode}</td>
                          <td className="pe-mono">{item.unit}</td>
                          <td>
                            <input type="number" className="pe-prod-input" value={item.purchaseRate}
                              onChange={e=>updateLineItem(idx,'purchaseRate',e.target.value)} min="0" step="0.01"
                              style={{textAlign:'right'}}/>
                          </td>
                          <td>
                            <input type="number" className="pe-prod-input" value={item.qty}
                              onChange={e=>updateLineItem(idx,'qty',e.target.value)} min="0.01" step="0.01"
                              style={{textAlign:'right'}}/>
                          </td>
                          <td className="pe-prod-total">{fmt(item.totalAmount)}</td>
                          <td>
                            <button className="pe-btn pe-btn-ghost pe-btn-sm pe-btn-icon" onClick={()=>removeLineItem(idx)} title="Remove">
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Product search */}
                <div className="pe-search-wrap" style={{marginTop:6}}>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',pointerEvents:'none'}}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </span>
                    <input ref={prodInputRef} className="pe-inp" value={prodSearch}
                      onChange={e=>{setProdSearch(e.target.value);setProdDdOpen(true);}}
                      onFocus={()=>{ setProdDdOpen(true); }}
                      onBlur={()=>setTimeout(()=>setProdDdOpen(false),200)}
                      placeholder="Search and add product by name or code…"
                      style={{width:'100%',paddingLeft:34,borderStyle:'dashed'}}
                    />
                  </div>
                  {prodDdOpen && filteredProds.length > 0 && (
                    <div className="pe-dd">
                      {filteredProds.map(p=>(
                        <div key={p._id} className="pe-dd-item" onMouseDown={()=>addLineItem(p)}>
                          <div>
                            <div style={{fontWeight:500}}>{p.name}</div>
                            <div style={{fontSize:10,color:'var(--text-muted)',marginTop:1}}>{p.category?.name} · Stock: {p.stock} {p.unit}s</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                            <div className="pe-dd-code">{p.code}</div>
                            <div style={{fontSize:11,color:'var(--primary)',marginTop:2,fontFamily:'monospace'}}>₹{p.pricePerUnit}/{p.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {prodDdOpen && prodSearch && filteredProds.length===0 && (
                    <div className="pe-dd"><div className="pe-dd-empty">No products match "{prodSearch}"</div></div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 03 Summary ── */}
            <div className="pe-card">
              <div className="pe-card-head">
                <div className="pe-card-title">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
                  <span style={{color:"var(--primary)",fontWeight:800}}>03</span> Summary
                </div>
              </div>
              <div className="pe-body">
                <div className="pe-summary-grid">
                  <div>
                    <div className="pe-field">
                      <label>Remarks / Notes</label>
                      <textarea className="pe-inp" value={remarks} onChange={e=>setRemarks(e.target.value)}
                        placeholder="Any additional notes for this entry…"
                        style={{height:80,resize:'vertical',paddingTop:8,fontFamily:'inherit'}}/>
                    </div>
                    {editEntry?.status==='saved' && (
                      <div style={{marginTop:10,padding:'8px 12px',background:'rgba(76,175,128,.08)',border:'1px solid rgba(76,175,128,.2)',borderRadius:4,fontSize:12,color:'var(--success,#1B7A4A)',display:'flex',alignItems:'center',gap:7}}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Stock has been updated. Saving again updates the difference.
                      </div>
                    )}
                  </div>
                  <div className="pe-summary-box">
                    <div className="pe-sum-row"><span className="lbl">Gross Amount</span><span className="val">{fmt(totals.grossAmount)}</span></div>
                    <div className="pe-sum-row"><span className="lbl">Discount 1 ({Number(discount1)||0}%)</span><span className="val" style={{color:'var(--success,#1B7A4A)'}}>−{fmt(totals.discount1Amt)}</span></div>
                    <div className="pe-sum-row"><span className="lbl">Discount 2 ({Number(discount2)||0}%)</span><span className="val" style={{color:'var(--success,#1B7A4A)'}}>−{fmt(totals.discount2Amt)}</span></div>
                    <div className="pe-sum-row"><span className="lbl">Taxable Amount</span><span className="val">{fmt(totals.taxableAmount)}</span></div>
                    <div className="pe-sum-row"><span className="lbl">CGST ({(Number(gstPct)||0)/2}%)</span><span className="val">{fmt(totals.cgst)}</span></div>
                    <div className="pe-sum-row"><span className="lbl">SGST ({(Number(gstPct)||0)/2}%)</span><span className="val">{fmt(totals.sgst)}</span></div>
                    <div className="pe-sum-row pe-sum-total"><span className="lbl">NET PAYABLE</span><span className="val">{fmt(totals.netAmount)}</span></div>
                  </div>
                </div>

                <div className="pe-form-footer">
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <button className="pe-btn pe-btn-danger" onClick={()=>setView('list')}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      Discard
                    </button>
                    <button className="pe-btn pe-btn-ghost" onClick={()=>handleSave('draft')} disabled={formSaving}>Save as Draft</button>
                  </div>
                  <button className="pe-btn pe-btn-accent" onClick={()=>handleSave('saved')} disabled={formSaving} style={{padding:'10px 24px',fontSize:13}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    {formSaving ? 'Saving…' : 'Save Inventory Entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseEntry;
