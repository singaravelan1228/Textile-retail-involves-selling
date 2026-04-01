import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getMonthly, getGST, getTopProducts, getBills } from '../../services/api';
import Loader from '../common/Loader';
import { paymentStatusBadge } from '../common/Badge';

const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'10px 14px',fontSize:12,boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
      <div style={{color:'#6b7280',marginBottom:4,fontWeight:600}}>{label}</div>
      <div style={{color:'var(--primary)',fontWeight:800,fontSize:15}}>{fmt(payload[0]?.value||0)}</div>
      {payload[1] && <div style={{color:'#6b7280',fontSize:11}}>{payload[1].value} bills</div>}
    </div>
  );
};

const Reports = () => {
  const [monthly,      setMonthly]      = useState([]);
  const [gst,          setGst]          = useState(null);
  const [topProducts,  setTopProducts]  = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const now = new Date();
  const [gstYear,  setGstYear]  = useState(now.getFullYear());
  const [gstMonth, setGstMonth] = useState(now.getMonth() + 1);

  const loadGST = (year, month) =>
    getGST({ year, month })
      .then(({ data }) => setGst(data.data))
      .catch(err => console.error('GST error:', err));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMonthly(),
      getTopProducts({ limit: 8 }),
      getBills({ limit: 20 }),
    ])
      .then(([m, tp, b]) => {
        const raw = m.data.data || [];
        setMonthly(raw.map(r => ({
          label: `${MONTHS[(r._id?.month || 1) - 1]} '${String(r._id?.year || now.getFullYear()).slice(-2)}`,
          revenue: Math.round(r.revenue || 0),
          bills:   r.bills || 0,
        })));
        setTopProducts(tp.data.data || []);
        setBills(b.data.data || []);
      })
      .catch(err => { console.error('Reports error:', err); setError('Could not load reports. Is the server running?'); })
      .finally(() => {
        setLoading(false);
        loadGST(now.getFullYear(), now.getMonth() + 1);
      });
  }, []);

  useEffect(() => { loadGST(gstYear, gstMonth); }, [gstYear, gstMonth]);

  if (loading) return <Loader />;

  if (error) return (
    <div className="alert alert-danger" style={{ marginTop: 20 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
      {error}
    </div>
  );

  const barColors = ['#0D5C45','#1A8060','#C9993A','#1565C0','#C0392B','#8B5CF6'];

  return (
    <>
      {/* Monthly Revenue */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <span className="card-title">Monthly Revenue — Last 12 Months</span>
          <span className="badge badge-success">
            {fmt(monthly.reduce((s, m) => s + m.revenue, 0))} total
          </span>
        </div>
        {monthly.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 0', color:'var(--text-muted)', fontSize:13 }}>
            No billing data yet. Generate some bills first!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barSize={20} margin={{ top:4, right:4, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-muted)', fontFamily:'var(--font)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="revenue" fill="var(--primary)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        {/* GST Summary */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">GST Summary</span>
            <div style={{ display:'flex', gap:6 }}>
              <select className="form-control" style={{ width:80, fontSize:12, padding:'4px 8px' }}
                value={gstMonth} onChange={e => setGstMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
              <select className="form-control" style={{ width:72, fontSize:12, padding:'4px 8px' }}
                value={gstYear} onChange={e => setGstYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {!gst ? <Loader /> : (
            <div>
              {[
                { label: 'Total Bills',    value: gst.totalBills,         mono: true },
                { label: 'Taxable Amount', value: fmt(gst.taxableAmount || 0) },
                { label: 'CGST (2.5%)',    value: fmt(gst.cgst || 0) },
                { label: 'SGST (2.5%)',    value: fmt(gst.sgst || 0) },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{row.label}</span>
                  <span style={{ fontWeight:700, fontSize:13, fontFamily: row.mono ? 'var(--font-mono)' : 'inherit' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 4px', borderTop:'2px solid var(--border)', marginTop:4 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Total GST</span>
                <span style={{ fontWeight:800, fontSize:16, color:'var(--primary)' }}>{fmt(gst.totalGST || 0)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:6 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Net Revenue</span>
                <span style={{ fontWeight:800, fontSize:16 }}>{fmt(gst.totalRevenue || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Products This Month</span>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'30px 0', fontSize:13 }}>
              No sales data yet.
            </div>
          ) : topProducts.slice(0, 6).map((p, i) => {
            const pct = Math.round((p.totalRevenue / topProducts[0].totalRevenue) * 100);
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:barColors[i%barColors.length], flexShrink:0, display:'inline-block' }}/>
                    {p._id?.name || 'Unknown'}
                  </span>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ color:'var(--text-muted)' }}>{Math.round(p.totalQty || 0)}m</span>
                    <span style={{ fontWeight:800, color:barColors[i%barColors.length] }}>{fmt(p.totalRevenue)}</span>
                  </div>
                </div>
                <div style={{ width:'100%', height:5, background:'var(--bg-hover)', borderRadius:4 }}>
                  <div style={{ width:`${pct}%`, height:5, background:barColors[i%barColors.length], borderRadius:4, transition:'width .4s' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bills Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span className="card-title">Recent Bills</span>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Last 20 transactions</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill No</th><th>Date</th><th>Customer</th><th>Phone</th>
                <th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th>
                <th>Payment</th><th>Status</th><th>Return</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>No bills found. Start billing!</td></tr>
              ) : bills.map(b => (
                <tr key={b._id}>
                  <td className="td-mono">{b.billNumber}</td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="td-bold">{b.customerName}</td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)' }}>{b.customerPhone || '—'}</td>
                  <td style={{ textAlign:'center' }}><span className="badge badge-gray">{b.items?.length || 0}</span></td>
                  <td>{fmt(b.subtotal)}</td>
                  <td>{fmt(b.gstAmount)}</td>
                  <td className="td-bold" style={{ color:'var(--primary)' }}>{fmt(b.total)}</td>
                  <td><span className="badge badge-info">{b.paymentMethod}</span></td>
                  <td>{paymentStatusBadge(b.paymentStatus)}</td>
                  <td>
                    {b.hasReturn
                      ? <span className="badge badge-warning">Returned</span>
                      : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                    }
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

export default Reports;
