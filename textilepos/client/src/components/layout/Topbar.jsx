import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageMeta = {
  '/':          { title:'Dashboard',       sub:"Today's overview & metrics" },
  '/billing':   { title:'New Bill',        sub:'POS — scan & create bills' },
  '/inventory': { title:'Inventory',       sub:'Products, stock & brands' },
  '/customers': { title:'Customers',       sub:'Customer records & history' },
  '/reports':   { title:'Reports',         sub:'Sales, GST & analytics' },
  '/users':     { title:'User Management', sub:'Manage staff accounts & permissions' },
  '/settings':  { title:'Settings',        sub:'Company info, receipt templates & tax rates' },
  '/offers':    { title:'Offers & Deals',  sub:'Product discounts and special pricing' },
};

const Topbar = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const meta = pageMeta[pathname] || { title:'TextilePOS', sub:'' };
  const now  = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{meta.title}</span>
        <span className="topbar-sub">{meta.sub}</span>
      </div>
      <div className="topbar-right">
        <span style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-hover)', padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)' }}>{now}</span>
        <span className="badge badge-success" style={{ fontSize:12, padding:'5px 12px' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', display:'inline-block', marginRight:6 }}/>
          Store Open
        </span>
        {pathname !== '/billing' && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/billing')} style={{ fontWeight:600 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Bill
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
