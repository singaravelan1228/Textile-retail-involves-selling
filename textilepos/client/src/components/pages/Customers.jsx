import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomer } from '../../services/api';
import Loader from '../common/Loader';
import Modal  from '../common/Modal';
import { paymentStatusBadge } from '../common/Badge';
import useDebounce from '../../hooks/useDebounce';

const EMPTY = { name:'', phone:'', email:'', address:'', type:'retail', gstNumber:'' };
const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
const initials = name => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [typeFilter,setTypeFilter]= useState('');

  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [formError,setFormError]= useState('');

  const [detailCust, setDetailCust] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoad, setDetailLoad] = useState(false);

  const debouncedSearch = useDebounce(search);

  const load = () =>
    getCustomers({ search:debouncedSearch||undefined, type:typeFilter||undefined })
      .then(({data})=>setCustomers(data.data))
      .catch(console.error);

  useEffect(()=>{ load().finally(()=>setLoading(false)); },[]);
  useEffect(()=>{ if(!loading) load(); },[debouncedSearch,typeFilter]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setFormError(''); setModal(true); };
  const openEdit   = (c) => { setForm({...c}); setEditItem(c); setFormError(''); setModal(true); };
  const closeModal = ()  => setModal(false);
  const handleChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const handleSave = async () => {
    if (!/^\d{10}$/.test(form.phone)) { setFormError('Phone must be exactly 10 digits.'); return; }
    setFormError(''); setSaving(true);
    try {
      if (editItem) await updateCustomer(editItem._id, form);
      else          await createCustomer(form);
      await load(); closeModal();
    } catch (err) { setFormError(err.response?.data?.message||'Save failed. Phone may already exist.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Deactivate this customer?')) return;
    await deleteCustomer(id);
    setCustomers(prev=>prev.filter(c=>c._id!==id));
  };

  const openDetail = async c => {
    setDetailOpen(true); setDetailLoad(true);
    try {
      const {data} = await getCustomer(c._id);
      setDetailCust(data.data);
    } catch { setDetailCust(c); }
    finally { setDetailLoad(false); }
  };

  const totalSpent = customers.reduce((s,c)=>s+(c.totalSpent||0),0);
  const totalDue   = customers.reduce((s,c)=>s+(c.balance||0),0);

  if (loading) return <Loader/>;

  return (
    <>
      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{customers.length}</div>
          <div className="metric-sub">All registered</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">With Purchases</div>
          <div className="metric-value">{customers.filter(c=>c.totalPurchases>0).length}</div>
          <div className="metric-sub">Active customers</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value" style={{fontSize:20}}>{fmt(totalSpent)}</div>
          <div className="metric-sub">All-time lifetime</div>
        </div>
        <div className={`metric-card ${totalDue>0?'danger':''}`}>
          <div className="metric-label">Outstanding Dues</div>
          <div className="metric-value" style={{fontSize:20,color:totalDue>0?'var(--danger)':'inherit'}}>{fmt(totalDue)}</div>
          <div className={`metric-sub ${totalDue>0?'danger':''}`}>{totalDue>0?'Pending collection':'All clear'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <input className="form-control" placeholder="Search by name or phone…" style={{width:260}} value={search} onChange={e=>setSearch(e.target.value)}/>
        {['','retail','wholesale'].map(t=>(
          <div key={t} className={`chip ${typeFilter===t?'active':''}`} onClick={()=>setTypeFilter(t)}>
            {t===''?`All (${customers.length})`:t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
        <div style={{flex:1}}/>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Customer
        </button>
      </div>

      {/* Customer list */}
      {customers.length===0?(
        <div style={{textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{opacity:.3,display:'block',margin:'0 auto 12px'}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          No customers found.
        </div>
      ):customers.map(c=>(
        <div key={c._id} className="customer-card" style={{cursor:'pointer'}} onClick={()=>openDetail(c)}>
          <div className="cust-avatar" style={c.balance>0?{background:'linear-gradient(135deg,#EF4444,#DC2626)'}:{}}>
            {initials(c.name)}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="cust-name">{c.name}</div>
            <div className="cust-meta">
              <span style={{fontFamily:'var(--font-mono)'}}>{c.phone}</span>
              {c.email&&` · ${c.email}`}
              {' · '}
              <span className={`badge ${c.type==='wholesale'?'badge-purple':'badge-info'}`} style={{fontSize:10}}>{c.type}</span>
              {' · '}{c.totalPurchases} purchases
            </div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div className="cust-amount" style={{color:c.balance>0?'var(--danger)':c.totalSpent>0?'var(--primary)':'var(--text-muted)'}}>
              {c.balance>0?`${fmt(c.balance)} due`:fmt(c.totalSpent)}
            </div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>{c.balance>0?'outstanding':'lifetime spent'}</div>
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
            <button className="btn btn-sm" onClick={()=>openEdit(c)}>Edit</button>
            <button className="btn btn-sm btn-ghost" style={{color:'var(--danger)'}} onClick={()=>handleDelete(c._id)}>✕</button>
          </div>
        </div>
      ))}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editItem?'Edit Customer':'Add New Customer'}
        footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editItem?'Update':'Add Customer'}</button></>}>
        {formError && <div className="alert alert-danger" style={{marginBottom:12}}>{formError}</div>}

        <div className="alert alert-info" style={{marginBottom:14,fontSize:12}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          Phone number must be <strong>unique</strong> — no two customers can share the same number.
        </div>

        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sundaram"/></div>
          <div className="form-group">
            <label className="form-label">Phone * (10 digits)</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10}
              style={{fontFamily:'var(--font-mono)',letterSpacing:'.05em'}}/>
            {form.phone&&!/^\d{10}$/.test(form.phone)&&(
              <div className="form-error">Must be exactly 10 digits</div>
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="optional"/></div>
          <div className="form-group"><label className="form-label">Customer Type</label>
            <select className="form-control" name="type" value={form.type} onChange={handleChange}>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" name="address" value={form.address} onChange={handleChange} placeholder="Street, City"/></div>
        {form.type==='wholesale'&&(
          <div className="form-group"><label className="form-label">GST Number</label><input className="form-control" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="33AABC1234Z1ZV"/></div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={()=>setDetailOpen(false)} title="Customer Profile">
        {detailLoad ? <Loader/> : detailCust && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:16,padding:'14px 0',borderBottom:'1px solid var(--border)',marginBottom:18}}>
              <div className="cust-avatar" style={{width:54,height:54,fontSize:18,flexShrink:0}}>
                {initials(detailCust.name)}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:17,letterSpacing:'-.3px'}}>{detailCust.name}</div>
                <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>
                  <span style={{fontFamily:'var(--font-mono)'}}>{detailCust.phone}</span>
                  {detailCust.email&&<span> · {detailCust.email}</span>}
                </div>
                {detailCust.address&&<div style={{fontSize:12,color:'var(--text-muted)'}}>{detailCust.address}</div>}
              </div>
              <span className={`badge ${detailCust.type==='wholesale'?'badge-purple':'badge-info'}`} style={{marginLeft:'auto'}}>{detailCust.type}</span>
            </div>

            <div className="grid-3" style={{marginBottom:18}}>
              {[
                {label:'Purchases',    value:detailCust.totalPurchases},
                {label:'Total Spent',  value:fmt(detailCust.totalSpent), color:'var(--primary)'},
                {label:'Balance Due',  value:fmt(detailCust.balance),    color:detailCust.balance>0?'var(--danger)':'inherit'},
              ].map(s=>(
                <div key={s.label} style={{background:'var(--bg-hover)',borderRadius:10,padding:'12px 14px',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:20,fontWeight:800,color:s.color||'var(--text-primary)'}}>{s.value}</div>
                </div>
              ))}
            </div>

            {detailCust.gstNumber&&(
              <div style={{marginBottom:16,padding:'10px 14px',background:'var(--bg-hover)',borderRadius:10,fontSize:13}}>
                <span style={{color:'var(--text-muted)'}}>GST: </span>
                <span style={{fontFamily:'var(--font-mono)',fontWeight:600}}>{detailCust.gstNumber}</span>
              </div>
            )}

            {detailCust.bills?.length>0&&(
              <>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Purchase History</div>
                <div className="table-wrap" style={{borderRadius:10,border:'1px solid var(--border)',overflow:'hidden'}}>
                  <table>
                    <thead><tr><th>Bill No</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {detailCust.bills.map(b=>(
                        <tr key={b._id}>
                          <td className="td-mono">{b.billNumber}</td>
                          <td className="td-bold" style={{color:'var(--primary)'}}>{fmt(b.total)}</td>
                          <td><span className="badge badge-info">{b.paymentMethod}</span></td>
                          <td>{paymentStatusBadge(b.paymentStatus)}</td>
                          <td style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default Customers;
