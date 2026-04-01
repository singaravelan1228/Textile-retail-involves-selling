import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Woven fabric SVG pattern (inline, no external) ─── */
const WovenPattern = ({opacity=.07}) => (
  <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity,pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wp" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="8" height="2" fill="white" opacity=".6"/>
        <rect x="8" y="8" width="8" height="2" fill="white" opacity=".6"/>
        <rect x="0" y="0" width="2" height="8" fill="white" opacity=".4"/>
        <rect x="8" y="8" width="2" height="8" fill="white" opacity=".4"/>
        <rect x="8" y="0" width="2" height="8" fill="white" opacity=".2"/>
        <rect x="0" y="8" width="2" height="8" fill="white" opacity=".2"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wp)"/>
  </svg>
);

/* ── Twill diagonal for cashier ────────────────────── */
const TwillPattern = ({opacity=.06}) => (
  <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity,pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="tw" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <line x1="0" y1="10" x2="10" y2="0" stroke="white" strokeWidth="1.8" opacity=".7"/>
        <line x1="-5" y1="10" x2="5" y2="0" stroke="white" strokeWidth="1.8" opacity=".7"/>
        <line x1="5" y1="10" x2="15" y2="0" stroke="white" strokeWidth="1.8" opacity=".7"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tw)"/>
  </svg>
);

/* ── Nav items with textile-shop colors ─────────────── */
const NAV = [
  { to:'/', exact:true, label:'Dashboard',
    clr:'#34D399', bg:'rgba(52,211,153,.15)', glow:'rgba(52,211,153,.3)',
    icon:<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"/> },
  { to:'/billing', label:'New Bill',
    clr:'#60A5FA', bg:'rgba(96,165,250,.15)', glow:'rgba(96,165,250,.3)',
    icon:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
  { to:'/inventory', label:'Inventory',
    clr:'#C084FC', bg:'rgba(192,132,252,.15)', glow:'rgba(192,132,252,.3)',
    icon:<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
  { to:'/customers', label:'Customers',
    clr:'#F9A8D4', bg:'rgba(249,168,212,.15)', glow:'rgba(249,168,212,.3)',
    icon:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></> },
  { to:'/reports', label:'Reports',
    clr:'#FCD34D', bg:'rgba(252,211,77,.15)', glow:'rgba(252,211,77,.3)',
    icon:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></> },
];

const ADMIN_NAV = [
  { to:'/users', label:'Users',
    clr:'#FB923C', bg:'rgba(251,146,60,.15)', glow:'rgba(251,146,60,.3)',
    icon:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></> },
  { to:'/settings', label:'Settings',
    clr:'#94A3B8', bg:'rgba(148,163,184,.12)', glow:'rgba(148,163,184,.2)',
    icon:<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></> },
];

const NavItem = ({item}) => (
  <NavLink to={item.to} end={item.exact}
    style={({isActive})=>({
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 10px', borderRadius:10, marginBottom:1,
      textDecoration:'none', cursor:'pointer',
      transition:'all .18s',
      background: isActive ? item.bg : 'transparent',
      borderLeft: `3px solid ${isActive ? item.clr : 'transparent'}`,
      color: isActive ? item.clr : '#64748B',
    })}>
    {({isActive})=>(
      <>
        <div style={{
          width:32, height:32, borderRadius:9, flexShrink:0,
          background: isActive ? `${item.clr}22` : 'rgba(255,255,255,.04)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: isActive ? `0 0 12px ${item.glow}` : 'none',
          transition:'all .18s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isActive ? item.clr : '#4B5563'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {item.icon}
          </svg>
        </div>
        <span style={{fontSize:13,fontWeight:isActive?700:500,letterSpacing:'-.1px'}}>{item.label}</span>
        {isActive && <div style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:item.clr,boxShadow:`0 0 8px ${item.clr}`}}/>}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const abbr = user?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'U';

  /* Admin: deep maroon-navy (silk fabric feel)
     Cashier: deep forest-green (cotton fabric feel) */
  const bg = isAdmin
    ? 'linear-gradient(175deg, #1A0A2E 0%, #1E1035 40%, #130E28 100%)'
    : 'linear-gradient(175deg, #071510 0%, #0D2018 40%, #071812 100%)';

  const accentGrad = isAdmin
    ? 'linear-gradient(135deg,#7C3AED,#4F46E5)'
    : 'linear-gradient(135deg,#0D5C45,#059669)';

  const roleColor   = isAdmin ? '#A78BFA' : '#6EE7B7';
  const roleBg      = isAdmin ? 'rgba(124,58,237,.15)' : 'rgba(13,92,69,.15)';
  const roleBorder  = isAdmin ? 'rgba(124,58,237,.3)' : 'rgba(13,92,69,.3)';
  const roleDot     = isAdmin ? '#7C3AED' : '#10B981';
  const roleLabel   = isAdmin ? 'Administrator' : 'Cashier';

  return (
    <aside style={{
      width:'var(--sidebar-w)', background:bg,
      display:'flex', flexDirection:'column',
      flexShrink:0, position:'relative', overflow:'hidden',
    }}>
      {/* Fabric texture */}
      {isAdmin ? <WovenPattern opacity={.065}/> : <TwillPattern opacity={.06}/>}

      {/* Top accent bar */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:accentGrad,zIndex:2}}/>

      {/* ── Brand ── */}
      <div style={{padding:'22px 16px 16px',borderBottom:'1px solid rgba(255,255,255,.06)',position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{
            width:42,height:42,borderRadius:12,flexShrink:0,
            background:accentGrad,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:`0 4px 16px ${isAdmin?'rgba(124,58,237,.45)':'rgba(13,92,69,.45)'}`,
          }}>
            {/* Fabric/weave icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#F1F5F9',letterSpacing:'-.4px',lineHeight:1.1}}>TextilePOS</div>
            <div style={{fontSize:10,color:'#475569',marginTop:2,fontWeight:500}}>Retail Billing v2.0</div>
          </div>
        </div>
      </div>

      {/* ── Role badge ── */}
      <div style={{padding:'10px 16px 2px',zIndex:1,position:'relative'}}>
        <div style={{
          display:'inline-flex',alignItems:'center',gap:7,
          padding:'4px 12px',borderRadius:20,
          background:roleBg, border:`1px solid ${roleBorder}`,
          fontSize:9,fontWeight:800,letterSpacing:'.08em',
          textTransform:'uppercase', color:roleColor,
        }}>
          <div style={{width:6,height:6,borderRadius:'50%',background:roleDot,boxShadow:`0 0 6px ${roleDot}`}}/>
          {roleLabel}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{flex:1,padding:'8px 8px',overflowY:'auto',position:'relative',zIndex:1}}>
        <div style={{fontSize:9,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'.1em',padding:'8px 10px 5px'}}>
          Main Menu
        </div>
        {NAV.map(item=><NavItem key={item.to} item={item}/>)}

        {isAdmin && (
          <>
            <div style={{fontSize:9,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'.1em',padding:'12px 10px 5px'}}>
              Admin Panel
            </div>
            {ADMIN_NAV.map(item=><NavItem key={item.to} item={item}/>)}
          </>
        )}
      </nav>

      {/* ── Fabric quality tags ── */}
      <div style={{
        margin:'0 12px 10px',padding:'8px 12px',
        background:'rgba(255,255,255,.03)',
        border:'1px solid rgba(255,255,255,.06)',
        borderRadius:10,position:'relative',zIndex:1,
      }}>
        <div style={{fontSize:8,color:'#374151',fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>
          Quality Certified
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {['Silk','Cotton','Linen','Woolen'].map(tag=>(
            <span key={tag} style={{
              fontSize:8,padding:'2px 7px',borderRadius:10,fontWeight:700,
              background:isAdmin?'rgba(124,58,237,.1)':'rgba(13,92,69,.12)',
              color:isAdmin?'#A78BFA':'#6EE7B7',
              border:`1px solid ${isAdmin?'rgba(124,58,237,.2)':'rgba(13,92,69,.2)'}`,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ── User card ── */}
      <div style={{padding:'0 8px 12px',position:'relative',zIndex:1}}>
        <div
          onClick={()=>{logout();navigate('/login');}}
          style={{
            display:'flex',alignItems:'center',gap:11,
            padding:'10px 12px',borderRadius:10,cursor:'pointer',
            border:'1px solid rgba(255,255,255,.07)',
            background:'rgba(255,255,255,.03)',transition:'background .15s',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
        >
          <div style={{
            width:36,height:36,borderRadius:10,flexShrink:0,
            background:accentGrad,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:800,fontSize:13,color:'white',
            boxShadow:`0 3px 10px ${isAdmin?'rgba(124,58,237,.4)':'rgba(13,92,69,.4)'}`,
          }}>{abbr}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:'#CBD5E1',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
            <div style={{fontSize:9,color:'#475569',marginTop:1,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>Tap to logout</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
