import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form,    setForm]    = useState({ email: 'admin@textilepos.com', password: 'Admin@123' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [show,    setShow]    = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid email or password'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 25% 25%,rgba(16,185,129,.08) 0%,transparent 50%),radial-gradient(circle at 75% 75%,rgba(59,130,246,.06) 0%,transparent 50%)',pointerEvents:'none'}}/>

      <div className="login-card" style={{position:'relative',zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div className="login-icon">
            <svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          </div>
          <div className="login-title">TextilePOS</div>
          <div className="login-sub">Retail Textiles Billing System</div>
        </div>

        {error && (
          <div className="login-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',marginRight:6}}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" name="email" value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})} required autoFocus
              style={{fontSize:14,padding:'10px 14px'}}/>
          </div>
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">Password</label>
            <div style={{position:'relative'}}>
              <input className="form-control" type={show?'text':'password'} name="password" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required
                style={{fontSize:14,padding:'10px 44px 10px 14px'}}/>
              <button type="button" onClick={()=>setShow(v=>!v)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:13}}>
                {show?'Hide':'Show'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}
            style={{borderRadius:10,fontSize:14,fontWeight:700}}>
            {loading ? (
              <span style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                <span className="spinner" style={{width:18,height:18,borderWidth:2}}/>Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{marginTop:24,padding:14,background:'#F8FAFC',borderRadius:10,border:'1px solid var(--border)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Demo Credentials</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[
              {role:'Admin',email:'admin@textilepos.com',pass:'Admin@123',color:'#10B981'},
              {role:'Cashier',email:'cashier@textilepos.com',pass:'Cash@123',color:'#3B82F6'},
            ].map(c=>(
              <div key={c.role} onClick={()=>setForm({email:c.email,password:c.pass})}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'white',borderRadius:8,border:'1px solid var(--border)',cursor:'pointer',transition:'border-color .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=c.color}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{width:28,height:28,borderRadius:8,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'white',flexShrink:0}}>{c.role[0]}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{c.role}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{c.email}</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{c.pass}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:'var(--text-muted)',marginTop:8,textAlign:'center'}}>Click a row to auto-fill credentials</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
