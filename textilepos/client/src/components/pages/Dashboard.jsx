import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboard } from '../../services/api';
import Loader from '../common/Loader';
import { paymentStatusBadge } from '../common/Badge';

const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
const PIE_COLORS = ['#0D5C45','#C9993A','#1565C0','#C0392B','#7C3AED'];

const buildWeekly = (api) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { weekday:'short' });
    const found = (api||[]).find(x => x._id === key);
    days.push({ label, total: found?.total || 0 });
  }
  return days;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'10px 14px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ color:'#6b7280', marginBottom:4, fontWeight:600 }}>{label}</div>
      <div style={{ color:'var(--primary)', fontWeight:800, fontSize:14 }}>{fmt(payload[0]?.value || 0)}</div>
    </div>
  );
};

const Dashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(({ data: r }) => setData(r.data))
      .catch(err => { console.error(err); setError('Could not load dashboard. Is the server running?'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) return (
    <div className="alert alert-danger" style={{ marginTop:20 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
      {error}
    </div>
  );

  if (!data) return null;

  const weeklyData = buildWeekly(data.weeklySales);
  const pieData    = (data.topCategories || []).map(c => ({ name: c._id || 'Other', value: Math.round(c.revenue || 0) }));

  return (
    <>
      {/* ── Metrics ── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Today's Revenue</div>
          <div className="metric-value">{fmt(data.todaySales)}</div>
          <div className="metric-sub">Live · store open</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Bills Today</div>
          <div className="metric-value">{data.todayBillCount || 0}</div>
          <div className="metric-sub">Transactions generated</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Units Sold</div>
          <div className="metric-value">{Math.round(data.todayItemsSold || 0)}</div>
          <div className="metric-sub">Meters / pieces today</div>
        </div>
        <div className={`metric-card ${(data.lowStockCount||0) > 0 ? 'danger' : ''}`}>
          <div className="metric-label">Low Stock Alerts</div>
          <div className="metric-value" style={{ color:(data.lowStockCount||0)>0?'var(--danger)':'inherit' }}>
            {data.lowStockCount || 0}
          </div>
          <div className={`metric-sub ${(data.lowStockCount||0)>0?'danger':'muted'}`}>
            {(data.lowStockCount||0) > 0 ? 'Need reorder now' : 'All stock healthy'}
          </div>
        </div>
      </div>

      {/* ── Low-stock alert ── */}
      {(data.lowStockCount||0) > 0 && (
        <div className="alert alert-warning" style={{ cursor:'pointer' }} onClick={() => navigate('/inventory')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          <span><strong>{data.lowStockCount} products</strong> are below reorder level. <u>Go to Inventory →</u></span>
        </div>
      )}

      {/* ── Charts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
        {/* Weekly bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weekly Sales</span>
            <span className="badge badge-success">{fmt(weeklyData.reduce((s,d) => s+d.total, 0))}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={22} margin={{ top:4, right:4, left:-22, bottom:0 }}>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="total" fill="var(--primary)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue by Category</span></div>
          {pieData.length === 0 ? (
            <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:13 }}>
              No sales today yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="45%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize:12, borderRadius:10, border:'1px solid var(--border)' }}/>
                <Legend iconSize={9} wrapperStyle={{ fontSize:11 }}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:18 }}>
        {[
          { label:'Total Products', value: data.totalProducts||0, color:'#0D5C45', bg:'#E8F5F0', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
          { label:'Total Customers', value: data.totalCustomers||0, color:'#1565C0', bg:'#E3F0FF', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { label:'Low Stock Items', value: data.lowStockCount||0, color: (data.lowStockCount||0)>0?'#C0392B':'#0D5C45', bg: (data.lowStockCount||0)>0?'#FDECEB':'#E8F5F0', icon:'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">
                <path d={s.icon}/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-1px', color:s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
          <span className="card-title">Recent Transactions</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/billing')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Bill
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {!(data.recentBills?.length) ? (
                <tr>
                  <td colSpan={8} style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>
                    No bills generated today yet.
                  </td>
                </tr>
              ) : data.recentBills.map(b => (
                <tr key={b._id}>
                  <td className="td-mono">{b.billNumber}</td>
                  <td className="td-bold">{b.customerName}</td>
                  <td style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{b.customerPhone || '—'}</td>
                  <td style={{ textAlign:'center' }}>
                    <span className="badge badge-gray">{b.items?.length || 0}</span>
                  </td>
                  <td className="td-bold" style={{ color:'var(--primary)' }}>{fmt(b.total)}</td>
                  <td><span className="badge badge-gold">{b.paymentMethod}</span></td>
                  <td>{paymentStatusBadge(b.paymentStatus)}</td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {new Date(b.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
