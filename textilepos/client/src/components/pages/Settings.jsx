import { useState, useEffect } from 'react';
import {
  getSettings, updateSettings,
  getReceiptTemplates, createReceiptTemplate,
  updateReceiptTemplate, deleteReceiptTemplate, setDefaultTemplate,
} from '../../services/api';
import Loader from '../common/Loader';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const FONTS = [
  { v:'sans',      l:'Clean Sans',        css:'system-ui,sans-serif' },
  { v:'serif',     l:'Traditional Serif', css:'Georgia,Times,serif' },
  { v:'mono',      l:'Printer Mono',      css:'Courier New,monospace' },
  { v:'rounded',   l:'Rounded Modern',    css:'"Segoe UI",Tahoma,sans-serif' },
  { v:'humanist',  l:'Humanist',          css:'Verdana,Geneva,sans-serif' },
  { v:'slab',      l:'Slab Serif',        css:'"Rockwell","Courier New",serif' },
];
const FONT_MAP = Object.fromEntries(FONTS.map(f=>[f.v, f.css]));

const LAYOUTS = [
  { v:'modern',  l:'Modern',  desc:'Dark header banner' },
  { v:'classic', l:'Classic', desc:'Center-aligned border' },
  { v:'minimal', l:'Minimal', desc:'Clean no-border' },
];

const BLANK = {
  name:'', layout:'modern', font:'sans', receiptWidth:300,
  showStoreName:true, showTagline:true, showAddress:true,
  showPhone:true, showEmail:false, showWebsite:false, showGST:true,
  showBillNumber:true, showDate:true, showCustomer:true, showCustomerPhone:true,
  showRateQty:true, showGSTBreakdown:true, showDiscount:true,
  showSavings:false, showPaymentMode:true, showThankYou:true,
  footerLine1:'Thank you for shopping with us!', footerLine2:'',
};

/* ═══════════════════════════════════════════════════════
   LIVE RECEIPT PREVIEW
═══════════════════════════════════════════════════════ */
const LiveReceipt = ({ t, co }) => {
  const font = FONT_MAP[t.font] || 'system-ui,sans-serif';
  const w    = Math.max(220, Math.min(420, Number(t.receiptWidth) || 300));
  const lay  = t.layout || 'modern';

  const Dash  = () => <div style={{borderTop:'1px dashed #ccc',margin:'6px 0'}}/>;
  const Bold2 = () => <div style={{borderTop:'2px solid #222',margin:'6px 0'}}/>;
  const R     = ({l,v,bold}) => (
    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:2.5}}>
      <span style={{color:'#777'}}>{l}</span>
      <span style={{fontWeight:bold?800:500,color:'#111'}}>{v}</span>
    </div>
  );

  const Header = () => {
    if (lay==='modern') return (
      <div style={{background:'#1C1C1C',color:'white',padding:'13px 16px',textAlign:'center'}}>
        {t.showStoreName!==false && <div style={{fontWeight:800,fontSize:14,letterSpacing:.3}}>{co?.companyName||'Store Name'}</div>}
        {t.showTagline!==false && co?.tagline && <div style={{fontSize:9,opacity:.7,marginTop:2}}>{co.tagline}</div>}
        {t.showAddress!==false && co?.address && <div style={{fontSize:9,opacity:.65,marginTop:2}}>{co.address}{co.city?`, ${co.city}`:''}</div>}
        {t.showPhone!==false && co?.phone && <div style={{fontSize:9,opacity:.7,marginTop:3}}>Ph: {co.phone}</div>}
        {t.showGST!==false && co?.gstNumber && <div style={{fontSize:8,opacity:.55,fontFamily:'monospace',marginTop:2}}>GST: {co.gstNumber}</div>}
      </div>
    );
    if (lay==='classic') return (
      <div style={{textAlign:'center',borderBottom:'1.5px solid #222',paddingBottom:8,marginBottom:8}}>
        {t.showStoreName!==false && <div style={{fontWeight:800,fontSize:14}}>{co?.companyName||'Store Name'}</div>}
        {t.showTagline!==false && co?.tagline && <div style={{fontSize:9,color:'#666',marginTop:1}}>{co.tagline}</div>}
        {t.showAddress!==false && co?.address && <div style={{fontSize:9,color:'#666'}}>{co.address}{co.city?`, ${co.city}`:''}</div>}
        {t.showPhone!==false && co?.phone && <div style={{fontSize:9,color:'#555'}}>Ph: {co.phone}</div>}
        {t.showGST!==false && co?.gstNumber && <div style={{fontSize:9,fontFamily:'monospace',color:'#555'}}>GST: {co.gstNumber}</div>}
      </div>
    );
    return (
      <div style={{marginBottom:10}}>
        {t.showStoreName!==false && <div style={{fontWeight:800,fontSize:14}}>{co?.companyName||'Store Name'}</div>}
        {t.showTagline!==false && co?.tagline && <div style={{fontSize:9,color:'#888',marginTop:1}}>{co.tagline}</div>}
        {t.showAddress!==false && co?.address && <div style={{fontSize:9,color:'#888'}}>{co.address}</div>}
        {t.showPhone!==false && co?.phone && <div style={{fontSize:9,color:'#888'}}>Ph: {co.phone}</div>}
        {t.showGST!==false && co?.gstNumber && <div style={{fontSize:9,fontFamily:'monospace',color:'#888'}}>GST: {co.gstNumber}</div>}
      </div>
    );
  };

  const ITEMS = [{n:'Kanjivaram Silk',q:2,u:'m',r:200,a:400},{n:'Khadi Cotton',q:5,u:'m',r:80,a:400}];

  return (
    <div style={{width:w,fontFamily:font,background:'white',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,.14)',overflow:'hidden',border:'1px solid #e5e7eb'}}>
      <Header/>
      <div style={{padding:lay==='modern'?'10px 14px':'14px 18px'}}>
        {t.showBillNumber!==false && <R l="Bill #" v="BL-202603-0001" bold/>}
        {t.showDate!==false && <R l="Date" v={new Date().toLocaleDateString('en-IN')}/>}
        {t.showCustomer!==false && <R l="Customer" v="Priya Sundaram"/>}
        {t.showCustomerPhone!==false && <R l="Phone" v="9876543210"/>}
        <Dash/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,fontWeight:700,color:'#888',marginBottom:4,paddingBottom:3,borderBottom:'1px solid #f0f0f0'}}>
          <span style={{flex:2}}>Item</span><span style={{textAlign:'right',minWidth:28}}>Qty</span>
          <span style={{textAlign:'right',minWidth:32}}>Rate</span><span style={{textAlign:'right',minWidth:36}}>Amt</span>
        </div>
        {ITEMS.map((it,i)=>(
          <div key={i} style={{marginBottom:4}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10}}>
              <span style={{flex:2,fontWeight:600}}>{it.n}</span>
              <span style={{minWidth:28,textAlign:'right',fontFamily:'monospace'}}>{it.q}{it.u}</span>
              <span style={{minWidth:32,textAlign:'right',fontFamily:'monospace'}}>₹{it.r}</span>
              <span style={{minWidth:36,textAlign:'right',fontWeight:700,fontFamily:'monospace'}}>₹{it.a}</span>
            </div>
            {t.showRateQty!==false && <div style={{fontSize:8,color:'#bbb',marginTop:1}}>₹{it.r}/{it.u} × {it.q}{it.u} = ₹{it.a}</div>}
          </div>
        ))}
        <Dash/>
        <R l="Subtotal" v="₹800"/>
        {t.showGSTBreakdown!==false ? <><R l="CGST 2.5%" v="₹20"/><R l="SGST 2.5%" v="₹20"/></> : <R l="GST 5%" v="₹40"/>}
        {t.showDiscount!==false && <R l="Discount 5%" v="-₹42"/>}
        {t.showSavings && <div style={{fontSize:8,color:'#16a34a',textAlign:'right',marginBottom:2}}>🎉 You saved ₹42!</div>}
        <Bold2/>
        <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:14,marginBottom:5}}>
          <span>TOTAL</span><span>₹798</span>
        </div>
        {t.showPaymentMode!==false && <R l="Payment" v="Cash"/>}
        {t.showThankYou!==false && t.footerLine1 && (
          <div style={{textAlign:'center',marginTop:7,paddingTop:7,borderTop:'1px dashed #ddd'}}>
            <div style={{fontSize:9,color:'#888',fontStyle:'italic'}}>{t.footerLine1}</div>
            {t.footerLine2 && <div style={{fontSize:8,color:'#aaa',marginTop:2}}>{t.footerLine2}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TOGGLE SWITCH
═══════════════════════════════════════════════════════ */
const Tog = ({label, name, val, onChange, desc}) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
    <div style={{flex:1,minWidth:0,paddingRight:10}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{label}</div>
      {desc && <div style={{fontSize:10,color:'var(--text-muted)',marginTop:1}}>{desc}</div>}
    </div>
    <label style={{position:'relative',display:'inline-block',width:42,height:24,flexShrink:0,cursor:'pointer'}}>
      <input type="checkbox" checked={!!val} onChange={e=>onChange(name,e.target.checked)} style={{opacity:0,width:0,height:0,position:'absolute'}}/>
      <div style={{position:'absolute',inset:0,borderRadius:24,transition:'.2s',background:val?'#0D5C45':'#CBD5E1'}}/>
      <div style={{position:'absolute',top:4,left:val?20:4,width:16,height:16,borderRadius:'50%',background:'white',transition:'.2s',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
    </label>
  </div>
);

/* ═══════════════════════════════════════════════════════
   TEMPLATE EDITOR (full screen modal)
═══════════════════════════════════════════════════════ */
const TemplateEditor = ({template, co, onSave, onCancel, saving}) => {
  const [t, setT] = useState(() => template ? {...template} : {...BLANK});
  const [err, setErr] = useState('');

  const set = (k,v) => setT(p=>({...p,[k]:v}));
  // Handles text, select, range, number, checkbox
  const ch  = e => {
    const {name, value, type, checked} = e.target;
    if (type==='checkbox') set(name, checked);
    else if (type==='range' || type==='number') set(name, Number(value));
    else set(name, value);
  };

  const handleSave = () => {
    if (!t.name?.trim()) { setErr('Template name is required.'); return; }
    setErr('');
    onSave(t);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)'}}>
      <div style={{background:'var(--bg-card)',borderRadius:18,width:'100%',maxWidth:960,maxHeight:'94vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>

        {/* Modal header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1.5px solid var(--border)',background:'linear-gradient(135deg,#0A1628,#0D1F2D)'}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:'white',letterSpacing:'-.3px'}}>
              {template?'Edit Template':'New Receipt Template'}
            </div>
            <div style={{fontSize:11,color:'#64748B',marginTop:2}}>Customise fields, layout and font — live preview updates instantly</div>
          </div>
          <button onClick={onCancel} style={{width:32,height:32,borderRadius:8,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.08)',color:'#94A3B8',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
        </div>

        {/* Body */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',flex:1,minHeight:0,overflow:'hidden'}}>

          {/* Left: editor */}
          <div style={{overflowY:'auto',padding:'20px 24px'}}>

            {err && <div style={{background:'#FDECEB',border:'1.5px solid #F2A49E',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#C0392B',fontWeight:600,marginBottom:14}}>{err}</div>}

            {/* Name */}
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Template Name *</label>
              <input className="form-control" name="name" value={t.name||''} onChange={ch}
                placeholder="e.g. Standard Bill, GST Invoice, Quick Receipt"
                style={{fontSize:14,fontWeight:600}}/>
            </div>

            {/* Layout picker */}
            <div style={{marginBottom:16}}>
              <label className="form-label">Layout Style</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {LAYOUTS.map(l=>(
                  <div key={l.v} onClick={()=>set('layout',l.v)}
                    style={{padding:'10px 12px',borderRadius:10,cursor:'pointer',transition:'all .15s',
                      border:`2px solid ${t.layout===l.v?'#0D5C45':'var(--border)'}`,
                      background:t.layout===l.v?'#E8F5F0':'var(--bg-hover)'}}>
                    <div style={{fontWeight:700,fontSize:12,color:t.layout===l.v?'#0D5C45':'var(--text-primary)'}}>{l.l}</div>
                    <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font picker */}
            <div style={{marginBottom:16}}>
              <label className="form-label">Font Style</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {FONTS.map(f=>(
                  <div key={f.v} onClick={()=>set('font',f.v)}
                    style={{padding:'9px 12px',borderRadius:10,cursor:'pointer',transition:'all .15s',
                      border:`2px solid ${t.font===f.v?'#0D5C45':'var(--border)'}`,
                      background:t.font===f.v?'#E8F5F0':'var(--bg-hover)'}}>
                    <div style={{fontWeight:700,fontSize:11,color:t.font===f.v?'#0D5C45':'var(--text-primary)',fontFamily:f.css}}>{f.l}</div>
                    <div style={{fontSize:9,color:'var(--text-muted)',marginTop:2,fontFamily:f.css}}>Aa Bb 123</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Width slider */}
            <div style={{marginBottom:20,background:'var(--bg-hover)',borderRadius:10,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <label className="form-label" style={{margin:0}}>Receipt Width</label>
                <span style={{fontWeight:800,fontSize:14,color:'#0D5C45'}}>{Number(t.receiptWidth)||300}px</span>
              </div>
              <input type="range" name="receiptWidth" min="220" max="420" step="10"
                value={Number(t.receiptWidth)||300} onChange={ch}
                style={{width:'100%',accentColor:'#0D5C45',height:4}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-muted)',marginTop:4}}>
                <span>220px · Narrow thermal</span><span>420px · Wide A4</span>
              </div>
            </div>

            {/* Field toggles */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
              <div>
                <div style={{fontSize:10,fontWeight:800,color:'#0D5C45',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:3,height:14,background:'#0D5C45',borderRadius:2}}/>Store Header
                </div>
                <Tog label="Store Name"   name="showStoreName"    val={t.showStoreName}    onChange={set}/>
                <Tog label="Tagline"      name="showTagline"      val={t.showTagline}      onChange={set}/>
                <Tog label="Address"      name="showAddress"      val={t.showAddress}      onChange={set}/>
                <Tog label="Phone"        name="showPhone"        val={t.showPhone}        onChange={set}/>
                <Tog label="Email"        name="showEmail"        val={t.showEmail}        onChange={set}/>
                <Tog label="Website"      name="showWebsite"      val={t.showWebsite}      onChange={set}/>
                <Tog label="GST Number"   name="showGST"          val={t.showGST}          onChange={set}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:800,color:'#C9993A',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:3,height:14,background:'#C9993A',borderRadius:2}}/>Bill Details
                </div>
                <Tog label="Bill Number"     name="showBillNumber"    val={t.showBillNumber}    onChange={set}/>
                <Tog label="Date & Time"     name="showDate"          val={t.showDate}          onChange={set}/>
                <Tog label="Customer Name"   name="showCustomer"      val={t.showCustomer}      onChange={set}/>
                <Tog label="Customer Phone"  name="showCustomerPhone" val={t.showCustomerPhone} onChange={set}/>
                <Tog label="Rate × Qty line" name="showRateQty"       val={t.showRateQty}       onChange={set} desc="₹200/m × 3m = ₹600"/>
                <Tog label="GST Breakdown"   name="showGSTBreakdown"  val={t.showGSTBreakdown}  onChange={set} desc="CGST + SGST separate"/>
                <Tog label="Discount Line"   name="showDiscount"      val={t.showDiscount}      onChange={set}/>
                <Tog label="Savings Message" name="showSavings"       val={t.showSavings}       onChange={set} desc='"You saved ₹X"'/>
                <Tog label="Payment Mode"    name="showPaymentMode"   val={t.showPaymentMode}   onChange={set}/>
                <Tog label="Thank You Note"  name="showThankYou"      val={t.showThankYou}      onChange={set}/>
              </div>
            </div>

            {/* Footer lines */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Footer Line 1</label>
                <input className="form-control" name="footerLine1" value={t.footerLine1||''} onChange={ch} placeholder="Thank you for shopping!"/>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Footer Line 2 (optional)</label>
                <input className="form-control" name="footerLine2" value={t.footerLine2||''} onChange={ch} placeholder="Visit us again!"/>
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div style={{borderLeft:'1.5px solid var(--border)',background:'#F0F4F2',overflowY:'auto',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',background:'var(--bg-hover)'}}>
              <div style={{fontSize:10,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em'}}>Live Preview</div>
              <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>Updates as you change</div>
            </div>
            <div style={{flex:1,padding:16,display:'flex',justifyContent:'center',alignItems:'flex-start',paddingTop:20}}>
              <div style={{maxWidth:'100%',overflow:'hidden'}}>
                <LiveReceipt t={t} co={co}/>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',borderTop:'1.5px solid var(--border)',background:'var(--bg-hover)'}}>
          <div style={{fontSize:12,color:'var(--text-muted)'}}>
            {template ? 'Editing existing template' : 'Creating new template'}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn" onClick={onCancel} style={{fontWeight:600}}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{padding:'9px 22px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:saving?'not-allowed':'pointer',opacity:saving?.7:1,display:'flex',alignItems:'center',gap:8}}>
              {saving
                ? <><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Saving…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>{template?'Save Changes':'Create Template'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TEMPLATE CARD  (in the grid)
═══════════════════════════════════════════════════════ */
const CARD_COLORS = [
  {bg:'#0D5C45',light:'#E8F5F0',text:'#0D5C45'},
  {bg:'#1565C0',light:'#E3F0FF',text:'#1565C0'},
  {bg:'#7C3AED',light:'#EDE9FE',text:'#5B21B6'},
  {bg:'#C9993A',light:'#FDF5E6',text:'#92540A'},
  {bg:'#C0392B',light:'#FDECEB',text:'#991B1B'},
  {bg:'#0E7490',light:'#E0F7FA',text:'#164E63'},
];

const TemplateCard = ({t, co, idx, onEdit, onSetDefault, onDelete, deleting}) => {
  const col = CARD_COLORS[idx % CARD_COLORS.length];
  const layoutLabel = {modern:'Modern',classic:'Classic',minimal:'Minimal'};
  const fontLabel   = {sans:'Sans-serif',serif:'Serif',mono:'Mono',rounded:'Rounded',humanist:'Humanist',slab:'Slab'};

  return (
    <div style={{
      borderRadius:16,overflow:'hidden',
      border:`2px solid ${t.isDefault?col.bg:'var(--border)'}`,
      boxShadow:t.isDefault?`0 8px 32px ${col.bg}30`:'var(--shadow-sm)',
      background:'var(--bg-card)',
      transition:'all .2s',
      display:'flex',flexDirection:'column',
    }}>
      {/* Card top color band */}
      <div style={{height:6,background:t.isDefault?col.bg:'var(--border)',transition:'background .2s'}}/>

      {/* Header */}
      <div style={{padding:'14px 16px 10px',background:t.isDefault?col.light:'var(--bg-hover)'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontWeight:800,fontSize:15,letterSpacing:'-.2px',color:'var(--text-primary)'}}>{t.name}</span>
              {t.isDefault && (
                <span style={{
                  background:col.bg,color:'white',fontSize:9,fontWeight:800,
                  padding:'3px 10px',borderRadius:20,letterSpacing:'.06em',
                  textTransform:'uppercase',flexShrink:0,
                }}>★ Default</span>
              )}
            </div>
            <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
              {[layoutLabel[t.layout]||t.layout, fontLabel[t.font]||t.font, `${t.receiptWidth||300}px`].map((tag,i)=>(
                <span key={i} style={{
                  fontSize:10,fontWeight:600,
                  background:t.isDefault?`${col.bg}18`:'rgba(0,0,0,.06)',
                  color:t.isDefault?col.text:'var(--text-secondary)',
                  padding:'2px 8px',borderRadius:6,
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div style={{background:'#F7F9F8',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'14px 10px',display:'flex',justifyContent:'center',minHeight:180,overflow:'hidden',position:'relative'}}>
        <div style={{transform:'scale(0.52)',transformOrigin:'top center',position:'absolute',top:14}}>
          <LiveReceipt t={t} co={co}/>
        </div>
        {/* fade bottom */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:50,background:'linear-gradient(to bottom,transparent,#F7F9F8)',pointerEvents:'none'}}/>
      </div>

      {/* Actions */}
      <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:8}}>
        <button onClick={onEdit}
          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'1.5px solid var(--border-dark)',background:'var(--bg-card)',color:'var(--text-primary)',cursor:'pointer',fontWeight:600,fontSize:12,transition:'all .15s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#0D5C45';e.currentTarget.style.color='#0D5C45';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-dark)';e.currentTarget.style.color='var(--text-primary)';}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>

        {!t.isDefault && (
          <button onClick={onSetDefault}
            style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:`1.5px solid ${col.bg}`,background:col.light,color:col.text,cursor:'pointer',fontWeight:700,fontSize:12,transition:'all .15s'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Set Default
          </button>
        )}

        {!t.isDefault && (
          <button onClick={onDelete} disabled={deleting}
            style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:8,border:'1.5px solid #FCA5A5',background:'#FFF5F5',color:'#C0392B',cursor:deleting?'wait':'pointer',fontWeight:600,fontSize:12}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            {deleting?'…':'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
═══════════════════════════════════════════════════════ */
const Settings = () => {
  const [company,  setCompany]  = useState(null);
  const [templates,setTemplates]= useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('templates');
  const [savingCo, setSavingCo] = useState(false);
  const [savedCo,  setSavedCo]  = useState(false);
  const [errCo,    setErrCo]    = useState('');
  const [editing,  setEditing]  = useState(null);
  const [showEditor,setShowEditor]=useState(false);
  const [savingTmpl,setSavingTmpl]=useState(false);
  const [deletingId,setDeletingId]=useState(null);

  useEffect(()=>{
    Promise.all([getSettings(), getReceiptTemplates()])
      .then(([s,r])=>{ setCompany(s.data.data); setTemplates(r.data.data||[]); })
      .catch(console.error).finally(()=>setLoading(false));
  },[]);

  const handleSaveCompany = async () => {
    setSavingCo(true); setErrCo(''); setSavedCo(false);
    try {
      const {data} = await updateSettings(company);
      setCompany(data.data); setSavedCo(true);
      setTimeout(()=>setSavedCo(false), 3000);
    } catch(e){ setErrCo(e.response?.data?.message||'Save failed.'); }
    finally { setSavingCo(false); }
  };

  const handleSaveTemplate = async (t) => {
    setSavingTmpl(true);
    try {
      if (t._id) {
        const {data} = await updateReceiptTemplate(t._id, t);
        setTemplates(prev=>prev.map(x=>x._id===t._id?data.data:x));
      } else {
        const {data} = await createReceiptTemplate(t);
        setTemplates(prev=>[...prev, data.data]);
      }
      setShowEditor(false); setEditing(null);
    } catch(e){ alert(e.response?.data?.message||'Save failed.'); }
    finally { setSavingTmpl(false); }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultTemplate(id);
      setTemplates(prev=>prev.map(t=>({...t,isDefault:t._id===id})));
    } catch(e){ alert(e.response?.data?.message||'Failed.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteReceiptTemplate(id);
      setTemplates(prev=>prev.filter(t=>t._id!==id));
    } catch(e){ alert(e.response?.data?.message||'Cannot delete.'); }
    finally { setDeletingId(null); }
  };

  if (loading) return <Loader/>;

  const TABS = [
    {id:'templates',label:'Receipt Templates',icon:'🧾'},
    {id:'company',  label:'Company Info',      icon:'🏪'},
    {id:'tax',      label:'Tax Rates',         icon:'🧮'},
  ];

  const Input = ({label,name,type='text',placeholder}) => (
    <div className="form-group" style={{marginBottom:12}}>
      <label className="form-label">{label}</label>
      <input className="form-control" type={type} name={name} value={company?.[name]||''}
        onChange={e=>setCompany(p=>({...p,[e.target.name]:e.target.value}))} placeholder={placeholder}/>
    </div>
  );

  return (
    <>
      {/* Spinner keyframe */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {showEditor && (
        <TemplateEditor
          template={editing}
          co={company}
          onSave={handleSaveTemplate}
          onCancel={()=>{setShowEditor(false);setEditing(null);}}
          saving={savingTmpl}
        />
      )}

      {/* Page header */}
      <div style={{marginBottom:24}}>
        <div style={{fontWeight:800,fontSize:20,letterSpacing:'-.4px',color:'var(--text-primary)'}}>Settings</div>
        <div style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>Manage receipt templates, company info and tax rates</div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,borderBottom:'2px solid var(--border)'}}>
        {TABS.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{
            padding:'10px 20px',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,
            background:'transparent',borderBottom:`2px solid ${tab===tb.id?'#0D5C45':'transparent'}`,
            color:tab===tb.id?'#0D5C45':'var(--text-secondary)',
            marginBottom:-2,transition:'all .15s',borderRadius:'8px 8px 0 0',
          }}>{tb.icon} {tb.label}</button>
        ))}
      </div>

      {/* ══ TEMPLATES TAB ══ */}
      {tab==='templates' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:'var(--text-primary)'}}>
                {templates.length} template{templates.length!==1?'s':''} · <span style={{color:'#0D5C45'}}>1 default</span>
              </div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                The ★ Default template is printed for every bill. You can add unlimited templates.
              </div>
            </div>
            <button onClick={()=>{setEditing(null);setShowEditor(true);}}
              style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,boxShadow:'0 4px 14px rgba(13,92,69,.3)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              New Template
            </button>
          </div>

          {templates.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'var(--bg-card)',borderRadius:16,border:'2px dashed var(--border)'}}>
              <div style={{fontSize:40,marginBottom:12}}>🧾</div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>No templates yet</div>
              <div style={{color:'var(--text-muted)',fontSize:13,marginBottom:20}}>Create your first receipt template to get started</div>
              <button onClick={()=>{setEditing(null);setShowEditor(true);}}
                style={{padding:'10px 24px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13}}>
                Create First Template
              </button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
              {templates.map((tmpl,idx)=>(
                <TemplateCard
                  key={tmpl._id} t={tmpl} co={company} idx={idx}
                  onEdit={()=>{setEditing(tmpl);setShowEditor(true);}}
                  onSetDefault={()=>handleSetDefault(tmpl._id)}
                  onDelete={()=>handleDelete(tmpl._id)}
                  deleting={deletingId===tmpl._id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ COMPANY TAB ══ */}
      {tab==='company' && company && (
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <div style={{background:'var(--bg-card)',border:'1.5px solid var(--border)',borderRadius:14,padding:'22px 24px'}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:'#E8F5F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏪</div>
              Company Information
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input label="Store / Company Name *" name="companyName" placeholder="Sri Textile Store"/>
              <Input label="Tagline"                name="tagline"     placeholder="Quality Fabrics Since 2000"/>
              <Input label="GST Number"             name="gstNumber"   placeholder="33AABC1234Z1ZV"/>
              <Input label="Primary Phone"          name="phone"       placeholder="9876543210"/>
              <Input label="Secondary Phone"        name="phone2"      placeholder="Optional"/>
              <Input label="Email"                  name="email"       placeholder="store@example.com" type="email"/>
              <Input label="Website"                name="website"     placeholder="www.mystore.com"/>
              <Input label="City"                   name="city"        placeholder="Tirunelveli"/>
            </div>
            <Input label="Full Address" name="address" placeholder="No. 12, Market Street, Near Bus Stand"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input label="State"   name="state"   placeholder="Tamil Nadu"/>
              <Input label="Pincode" name="pincode" placeholder="627001"/>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:12,marginTop:16}}>
            {errCo  && <span style={{fontSize:13,color:'var(--danger)',fontWeight:600}}>{errCo}</span>}
            {savedCo && <span style={{fontSize:13,color:'#0D5C45',fontWeight:700,display:'flex',alignItems:'center',gap:5}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>Saved!
            </span>}
            <button onClick={handleSaveCompany} disabled={savingCo}
              style={{padding:'10px 24px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:savingCo?'wait':'pointer'}}>
              {savingCo?'Saving…':'💾 Save Company Info'}
            </button>
          </div>
        </div>
      )}

      {/* ══ TAX TAB ══ */}
      {tab==='tax' && company && (
        <div style={{maxWidth:500,margin:'0 auto'}}>
          <div style={{background:'var(--bg-card)',border:'1.5px solid var(--border)',borderRadius:14,padding:'22px 24px'}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:'#FDF5E6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🧮</div>
              GST Configuration
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[{l:'CGST Rate (%)',n:'cgstRate'},{l:'SGST Rate (%)',n:'sgstRate'}].map(f=>(
                <div key={f.n} className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" type="number" name={f.n} value={company[f.n]||''} min="0" max="14" step="0.5"
                    onChange={e=>setCompany(p=>({...p,[e.target.name]:Number(e.target.value)}))}/>
                </div>
              ))}
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Total GST</label>
                <div className="form-control" style={{background:'#E8F5F0',fontWeight:800,color:'#0D5C45',fontSize:15}}>
                  {((Number(company.cgstRate)||0)+(Number(company.sgstRate)||0)).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="alert alert-info" style={{marginTop:16,marginBottom:0,fontSize:12}}>
              These rates appear in GST reports. Per-product rates are set individually in Inventory.
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:12,alignItems:'center'}}>
            {savedCo && <span style={{fontSize:13,color:'#0D5C45',fontWeight:700}}>✓ Saved!</span>}
            <button onClick={handleSaveCompany} disabled={savingCo}
              style={{padding:'10px 24px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {savingCo?'Saving…':'💾 Save Tax Rates'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
