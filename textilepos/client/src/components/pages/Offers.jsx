import { useState, useEffect } from 'react';
import { getOffers, createOffer, updateOffer, deleteOffer, getProducts } from '../../services/api';
import Loader from '../common/Loader';
import Modal  from '../common/Modal';

const EMPTY = { product:'', title:'', description:'', type:'percent', value:'', minQty:1, expiresAt:'', isActive:true };
const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;

const Offers = () => {
  const [offers,   setOffers]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editItem, setEditItem] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const load = () => Promise.all([getOffers(), getProducts()])
    .then(([o, p]) => { setOffers(o.data.data||[]); setProducts(p.data.data||[]); });

  useEffect(() => { load().finally(()=>setLoading(false)); }, []);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setError(''); setModal(true); };
  const openEdit   = o  => { setForm({...o, product:o.product?._id||o.product, expiresAt:o.expiresAt?o.expiresAt.slice(0,16):''}); setEditItem(o); setError(''); setModal(true); };
  const ch = e => setForm(f => ({...f, [e.target.name]: e.target.type==='checkbox' ? e.target.checked : e.target.value}));

  const handleSave = async () => {
    if (!form.product||!form.title||!form.value) return setError('Product, title and value are required.');
    setSaving(true); setError('');
    try {
      const payload = {...form, value: Number(form.value), minQty: Number(form.minQty)||1, expiresAt: form.expiresAt||null };
      if (editItem) await updateOffer(editItem._id, payload);
      else          await createOffer(payload);
      await load(); setModal(false);
    } catch(e) { setError(e.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    await deleteOffer(id).catch(console.error);
    setOffers(prev => prev.filter(o => o._id !== id));
  };

  if (loading) return <Loader/>;

  const active  = offers.filter(o => o.isActive && (!o.expiresAt || new Date(o.expiresAt) > new Date()));
  const expired = offers.filter(o => !o.isActive || (o.expiresAt && new Date(o.expiresAt) <= new Date()));

  return (
    <>
      {/* Header metrics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {label:'Total Offers',  value:offers.length,  color:'var(--primary)'},
          {label:'Active Offers', value:active.length,  color:'#10B981'},
          {label:'Expired/Off',   value:expired.length, color:'var(--text-muted)'},
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{color:m.color}}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="section-header">
        <span className="section-title">Product Offers & Discounts</span>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Offer
        </button>
      </div>

      {/* Offers list */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead><tr>
            <th>Product</th><th>Offer</th><th>Discount</th>
            <th>Min Qty</th><th>Expires</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {offers.length===0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>
                No offers yet. Click Add Offer to create one.
              </td></tr>
            ) : offers.map(o => {
              const valid = o.isActive && (!o.expiresAt || new Date(o.expiresAt) > new Date());
              return (
                <tr key={o._id}>
                  <td>
                    <div style={{fontWeight:700}}>{o.product?.name||'—'}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{o.product?.code}</div>
                  </td>
                  <td>
                    <div style={{fontWeight:600}}>{o.title}</div>
                    {o.description && <div style={{fontSize:11,color:'var(--text-muted)'}}>{o.description}</div>}
                  </td>
                  <td>
                    <span style={{background:o.type==='percent'?'#DBEAFE':'#FDF5E6',color:o.type==='percent'?'#1565C0':'#92540A',fontWeight:800,padding:'3px 10px',borderRadius:20,fontSize:12}}>
                      {o.type==='percent' ? `-${o.value}%` : `-₹${o.value}`}
                    </span>
                  </td>
                  <td style={{fontWeight:600}}>{o.minQty} {o.product?.unit||''}s</td>
                  <td style={{fontSize:12,color:o.expiresAt&&new Date(o.expiresAt)<new Date()?'var(--danger)':'var(--text-muted)'}}>
                    {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}
                  </td>
                  <td>
                    <span className={`badge ${valid?'badge-success':'badge-gray'}`}>
                      {valid ? 'Active' : o.isActive ? 'Expired' : 'Off'}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-sm" onClick={()=>openEdit(o)}>✎ Edit</button>
                      <button className="btn btn-sm" onClick={()=>handleDelete(o._id)} style={{color:'var(--danger)'}}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)}
        title={editItem?'Edit Offer':'Add New Offer'}
        footer={<><button className="btn" onClick={()=>setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editItem?'Update':'Create Offer'}</button></>}>
        {error && <div className="alert alert-danger" style={{marginBottom:12}}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Product *</label>
          <select className="form-control" name="product" value={form.product} onChange={ch}>
            <option value="">Select product</option>
            {products.map(p=><option key={p._id} value={p._id}>{p.name} ({p.code}) — ₹{p.pricePerUnit}/{p.unit}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Offer Title *</label>
          <input className="form-control" name="title" value={form.title} onChange={ch} placeholder="e.g. Summer Sale, Bulk Discount"/>
        </div>
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <input className="form-control" name="description" value={form.description} onChange={ch} placeholder="Short description shown on receipt"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="form-group">
            <label className="form-label">Discount Type</label>
            <select className="form-control" name="type" value={form.type} onChange={ch}>
              <option value="percent">Percentage (% off)</option>
              <option value="flat">Flat amount (₹ off)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{form.type==='percent'?'Discount %':'Flat Amount (₹)'} *</label>
            <input className="form-control" type="number" name="value" value={form.value} onChange={ch}
              placeholder={form.type==='percent'?'e.g. 10':'e.g. 50'} min="0" max={form.type==='percent'?100:undefined}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="form-group">
            <label className="form-label">Minimum Quantity to Unlock</label>
            <input className="form-control" type="number" name="minQty" value={form.minQty} onChange={ch} min="1"/>
          </div>
          <div className="form-group">
            <label className="form-label">Expires At (optional)</label>
            <input className="form-control" type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={ch}/>
          </div>
        </div>
        <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,fontWeight:600}}>
          <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={ch} style={{width:16,height:16,accentColor:'var(--primary)'}}/>
          Offer is active
        </label>
      </Modal>
    </>
  );
};

export default Offers;
