import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser } from '../../services/api';
import Loader from '../common/Loader';
import Modal  from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EMPTY = { name:'', email:'', password:'', role:'cashier', phone:'' };

const Users = () => {
  const { user: me, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editItem,setEditItem]= useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Redirect cashiers away
  useEffect(() => { if (!isAdmin) navigate('/'); }, [isAdmin]);

  const load = () => getUsers().then(({data})=>setUsers(data.data)).catch(console.error);
  useEffect(() => { load().finally(()=>setLoading(false)); }, []);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setError(''); setShowPwd(false); setModal(true); };
  const openEdit   = u  => { setForm({...u, password:''}); setEditItem(u); setError(''); setShowPwd(false); setModal(true); };
  const closeModal = () => setModal(false);
  const handleChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      const payload = {...form};
      if (editItem && !payload.password) delete payload.password; // don't clear password if blank on edit
      if (editItem) await updateUser(editItem._id, payload);
      else          await createUser(payload);
      await load(); closeModal();
    } catch(err) { setError(err.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    if (u._id === me._id) return alert("You can't deactivate your own account.");
    try {
      await updateUser(u._id, { isActive: !u.isActive });
      await load();
    } catch(err) { alert(err.response?.data?.message||'Failed.'); }
  };

  if (loading) return <Loader/>;

  const admins   = users.filter(u=>u.role==='admin');
  const cashiers = users.filter(u=>u.role==='cashier');

  return (
    <>
      {/* Header metrics */}
      <div className="metrics-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:20}}>
        <div className="metric-card">
          <div className="metric-label">Total Users</div>
          <div className="metric-value">{users.length}</div>
          <div className="metric-sub">All system users</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Admins</div>
          <div className="metric-value">{admins.length}</div>
          <div className="metric-sub">Full access</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Cashiers</div>
          <div className="metric-value">{cashiers.length}</div>
          <div className="metric-sub">Billing + add products</div>
        </div>
      </div>

      {/* Permission info card */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'14px 18px',marginBottom:18,boxShadow:'var(--shadow-sm)'}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Role Permissions</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[
            { role:'Admin', color:'#8B5CF6', bg:'#EDE9FE', perms:['Full system access','Manage users','Edit / delete products','View all reports','Edit categories & brands','Delete customers'] },
            { role:'Cashier', color:'#3B82F6', bg:'#DBEAFE', perms:['Create bills & receipts','Add new products','Restock products','Add new brands','Process returns','View customers'] },
          ].map(r=>(
            <div key={r.role} style={{background:r.bg,borderRadius:'var(--radius-md)',padding:'12px 14px'}}>
              <div style={{fontWeight:700,fontSize:13,color:r.color,marginBottom:8}}>{r.role}</div>
              {r.perms.map(p=>(
                <div key={p} style={{fontSize:12,color:r.color,display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontWeight:700}}>✓</span>{p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="section-header">
        <span className="section-title">All Users</span>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add User
        </button>
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Phone</th><th>Role</th>
              <th>Status</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length===0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)'}}>No users found.</td></tr>
            ) : users.map(u=>(
              <tr key={u._id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:u.role==='admin'?'linear-gradient(135deg,#8B5CF6,#6D28D9)':'linear-gradient(135deg,#3B82F6,#1D4ED8)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'white',flexShrink:0}}>
                      {u.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <span className="td-bold">{u.name} {u._id===me._id && <span style={{fontSize:10,color:'var(--primary)',fontWeight:700}}>(You)</span>}</span>
                  </div>
                </td>
                <td style={{fontFamily:'var(--font-mono)',fontSize:12}}>{u.email}</td>
                <td style={{fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{u.phone||'—'}</td>
                <td>
                  <span className={`badge ${u.role==='admin'?'badge-purple':'badge-info'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.isActive
                    ? <span className="badge badge-success">Active</span>
                    : <span className="badge badge-danger">Inactive</span>}
                </td>
                <td style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-sm" onClick={()=>openEdit(u)}>Edit</button>
                    <button className="btn btn-sm" onClick={()=>toggleActive(u)}
                      style={{color:u.isActive?'var(--danger)':'var(--primary)',borderColor:u.isActive?'var(--danger)':'var(--primary)'}}
                      disabled={u._id===me._id}>
                      {u.isActive?'Deactivate':'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={closeModal}
        title={editItem ? `Edit — ${editItem.name}` : 'Add New User'}
        footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editItem?'Update User':'Create User'}</button></>}>
        {error && <div className="alert alert-danger" style={{marginBottom:12}}>{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ravi Kumar"/>
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-control" name="role" value={form.role} onChange={handleChange}>
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="user@textilepos.com"/>
        </div>
        <div className="form-group">
          <label className="form-label">{editItem ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
          <div style={{position:'relative'}}>
            <input className="form-control" type={showPwd?'text':'password'} name="password" value={form.password}
              onChange={handleChange} placeholder={editItem?'Leave blank to keep unchanged':'Min 6 characters'}
              style={{paddingRight:60}}/>
            <button type="button" onClick={()=>setShowPwd(v=>!v)}
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:12,fontWeight:600}}>
              {showPwd?'Hide':'Show'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Phone (optional)</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10}/>
        </div>

        {/* Role info box */}
        <div style={{background:form.role==='admin'?'#EDE9FE':'#DBEAFE',borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:12,color:form.role==='admin'?'#5B21B6':'#1E40AF',fontWeight:500}}>
          {form.role==='admin'
            ? '⚠ Admin has full access including user management and deleting records.'
            : '✓ Cashier can create bills, add products, restock, and process returns.'}
        </div>
      </Modal>
    </>
  );
};

export default Users;
