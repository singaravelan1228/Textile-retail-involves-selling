import { useState, useEffect, useRef } from 'react';
import PurchaseEntry from './PurchaseEntry';
import {
  getProducts, getCategories, getBrands,
  createProduct, updateProduct, deleteProduct, restockProduct,
  createBrand, createCategory, updateCategory, deleteCategory,
  getProductQR,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Modal  from '../common/Modal';
import useDebounce from '../../hooks/useDebounce';

const EMPTY_PRODUCT = {
  code:'', name:'', category:'', brand:'',
  pricePerUnit:'', unit:'meter', stock:'', reorderLevel:20,
  description:'', swatchColor:'#1A8060', gstRate:5,
};
const IMG_BASE = 'http://localhost:5000';

const SIZE_PRESETS = {
  none:          { label:'No Sizes',            sizes:[] },
  clothing_intl: { label:'International Sizes', sizes:['XS','S','M','L','XL','XXL','3XL'] },
  clothing_uk:   { label:'UK Clothing',         sizes:['UK 6','UK 8','UK 10','UK 12','UK 14','UK 16','UK 18','UK 20'] },
  clothing_india:{ label:'India Clothing',      sizes:['28','30','32','34','36','38','40','42','44'] },
  kids:          { label:'Kids Sizes',          sizes:['0-6M','6-12M','1Y','2Y','3Y','4Y','6Y','8Y','10Y','12Y'] },
  footwear_uk:   { label:'Footwear UK',         sizes:['UK 3','UK 4','UK 5','UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'] },
  custom:        { label:'Custom Sizes',        sizes:[] },
};
const FABRIC_TYPES = ['','Woven','Knit','Non-woven','Lace','Embroidered','Printed','Dyed','Blended'];
const CAT_ICONS = ['🧵','🧶','👔','👗','🧣','🧤','🧦','👒','👟','👜','🎀','🌸','🍃','🌿','💎','⭐'];
const CAT_COLORS = ['#0D5C45','#1565C0','#7C3AED','#C9993A','#C0392B','#0E7490','#059669','#D97706','#DC2626','#0284C7','#16A34A','#9333EA'];
const EMPTY_CAT = { name:'', description:'', color:'#0D5C45', icon:'🧵', fabricType:'', sizeSystem:'none', customSizes:[], defaultGstRate:5, defaultUnit:'meter', attributes:[] };

/* ── StockBar ── */
const StockBar = ({ stock, reorderLevel }) => {
  const max = Math.max(stock, reorderLevel*3, 60);
  const pct = Math.min(100, Math.round((stock/max)*100));
  const low = stock <= reorderLevel;
  return <span className="stock-bar-wrap"><span className="stock-bar-fill" style={{ width:`${pct}%`, background:low?'var(--danger)':'var(--primary)' }}/></span>;
};

/* ── ProductThumb ── */
const ProductThumb = ({ product, height=120, className='inv-card-img' }) => {
  const [failed, setFailed] = useState(false);
  if (product.imageUrl && !failed)
    return <img src={`${IMG_BASE}${product.imageUrl}`} alt={product.name} className={className} style={{ height }} onError={()=>setFailed(true)}/>;
  return <div className="inv-card-swatch" style={{ background:product.swatchColor||'#E8F5F0', height }}/>;
};

/* ── QR Label Modal ── */
const QRLabelModal = ({ product, onClose }) => {
  const [svg, setSvg] = useState('');
  const [loading, setLoad] = useState(true);
  useEffect(() => {
    getProductQR(product._id).then(({data})=>setSvg(data.data?.svg||'')).catch(console.error).finally(()=>setLoad(false));
  }, [product._id]);

  const handlePrint = () => {
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>QR — ${product.code}</title>
    <style>body{font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5}
    .label{background:white;border:2px solid #ddd;border-radius:12px;padding:20px 24px;text-align:center;width:220px;box-shadow:0 4px 16px rgba(0,0,0,.1)}
    .label svg{width:160px;height:160px}.code{font-family:monospace;font-size:13px;font-weight:700;letter-spacing:2px;margin:8px 0 4px;color:#111}
    .name{font-size:12px;color:#555;margin-bottom:4px}.price{font-size:16px;font-weight:800;color:#0D5C45}
    .store{font-size:9px;color:#aaa;margin-top:6px;text-transform:uppercase;letter-spacing:1px}
    @media print{body{background:white}.label{border:1px solid #ccc;box-shadow:none}}</style></head><body>
    <div class="label">${svg}<div class="code">${product.code}</div><div class="name">${product.name}</div>
    <div class="price">₹${product.pricePerUnit}/${product.unit}</div>
    <div class="store">TextilePOS · Scan to add to bill</div></div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script></body></html>`);
    win.document.close();
  };

  return (
    <Modal open onClose={onClose} title={`QR Label — ${product.name}`}
      footer={<><button className="btn" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={handlePrint} disabled={loading}>🖨 Print Label</button></>}>
      {loading
        ? <div style={{textAlign:'center',padding:'40px 0'}}><Loader/></div>
        : <div style={{textAlign:'center',padding:'10px 0'}}>
            <div style={{display:'inline-block',background:'white',border:'2px solid var(--border)',borderRadius:12,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,.08)'}}
              dangerouslySetInnerHTML={{__html:svg.replace('<svg','<svg width="180" height="180"')}}/>
            <div style={{marginTop:14}}>
              <div style={{fontFamily:'monospace',fontWeight:800,fontSize:16,letterSpacing:2}}>{product.code}</div>
              <div style={{fontWeight:700,fontSize:14,marginTop:3}}>{product.name}</div>
              <div style={{color:'var(--primary)',fontWeight:800,fontSize:18,marginTop:4}}>₹{product.pricePerUnit}/{product.unit}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6,padding:'4px 10px',background:'var(--bg-hover)',borderRadius:20,display:'inline-block'}}>
                Scan on Billing page to add instantly
              </div>
            </div>
          </div>
      }
    </Modal>
  );
};

/* ── Category Builder Modal ── */
const CategoryBuilder = ({ cat, onSave, onClose, saving }) => {
  const isEdit = !!cat?._id;
  const [form, setForm] = useState(() => cat ? {...EMPTY_CAT,...cat,customSizes:cat.customSizes||[],attributes:cat.attributes||[]} : {...EMPTY_CAT});
  const [customInput, setCustomInput] = useState('');
  const [attrInput, setAttrInput] = useState({name:'',type:'text',options:''});
  const [error, setError] = useState('');

  const ch = e => setForm(f => ({...f,[e.target.name]:e.target.type==='number'?Number(e.target.value):e.target.value}));
  const addCustomSize = () => {
    const s = customInput.trim().toUpperCase();
    if (!s||form.customSizes.includes(s)) return;
    setForm(f=>({...f,customSizes:[...f.customSizes,s]}));
    setCustomInput('');
  };
  const removeSize = s => setForm(f=>({...f,customSizes:f.customSizes.filter(x=>x!==s)}));
  const applyPreset = sys => setForm(f=>({...f,sizeSystem:sys,customSizes:sys==='custom'?f.customSizes:[]}));
  const addAttr = () => {
    if (!attrInput.name.trim()) return;
    setForm(f=>({...f,attributes:[...f.attributes,{name:attrInput.name.trim(),type:attrInput.type,options:attrInput.options?attrInput.options.split(',').map(s=>s.trim()).filter(Boolean):[],required:false}]}));
    setAttrInput({name:'',type:'text',options:''});
  };
  const removeAttr = i => setForm(f=>({...f,attributes:f.attributes.filter((_,j)=>j!==i)}));
  const toggleRequired = i => setForm(f=>({...f,attributes:f.attributes.map((a,j)=>j===i?{...a,required:!a.required}:a)}));
  const handleSave = () => { if(!form.name.trim()){setError('Name required.');return;} setError(''); onSave(form); };

  const activeSizes = form.sizeSystem==='custom' ? form.customSizes : SIZE_PRESETS[form.sizeSystem]?.sizes||[];

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)'}}>
      <div style={{background:'var(--bg-card)',borderRadius:18,width:'100%',maxWidth:700,maxHeight:'93vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',background:'linear-gradient(135deg,#0A1628,#0D2018)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:'white',letterSpacing:'-.3px'}}>{isEdit?`Edit — ${cat.name}`:'Create New Category'}</div>
            <div style={{fontSize:11,color:'#64748B',marginTop:2}}>Define sizes, fabric type, and custom attributes</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.08)',color:'#94A3B8',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>

        <div style={{overflowY:'auto',padding:'20px 24px',flex:1}}>
          {error && <div style={{background:'#FDECEB',border:'1.5px solid #F2A49E',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#C0392B',fontWeight:600,marginBottom:14}}>{error}</div>}

          {/* Section: Basic */}
          <div style={{fontSize:10,fontWeight:800,color:'#0D5C45',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:3,height:14,background:'#0D5C45',borderRadius:2}}/>Basic Information
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Category Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={ch} placeholder="e.g. Silk, Cotton, Woolen"/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Fabric Type</label>
              <select className="form-control" name="fabricType" value={form.fabricType} onChange={ch}>
                {FABRIC_TYPES.map(t=><option key={t} value={t}>{t||'— Select fabric type —'}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Description</label>
            <input className="form-control" name="description" value={form.description} onChange={ch} placeholder="Short description"/>
          </div>

          {/* Icon */}
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Category Icon</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {CAT_ICONS.map(icon=>(
                <button key={icon} type="button" onClick={()=>setForm(f=>({...f,icon}))}
                  style={{width:36,height:36,fontSize:18,borderRadius:8,cursor:'pointer',border:`2px solid ${form.icon===icon?'var(--primary)':'var(--border)'}`,background:form.icon===icon?'var(--primary-light)':'var(--bg-hover)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .12s'}}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">Category Color</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              {CAT_COLORS.map(col=>(
                <button key={col} type="button" onClick={()=>setForm(f=>({...f,color:col}))}
                  style={{width:28,height:28,borderRadius:6,background:col,cursor:'pointer',border:form.color===col?'3px solid var(--text-primary)':'2px solid transparent',transition:'border .12s',flexShrink:0}}/>
              ))}
              <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:4}}>
                <input type="color" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}
                  style={{width:32,height:32,border:'none',background:'none',cursor:'pointer',borderRadius:6,padding:2}}/>
                <span style={{fontSize:11,color:'var(--text-muted)',fontFamily:'monospace'}}>{form.color}</span>
              </div>
            </div>
          </div>

          {/* Section: Sizes */}
          <div style={{fontSize:10,fontWeight:800,color:'#C9993A',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:3,height:14,background:'#C9993A',borderRadius:2}}/>Size System
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
            {Object.entries(SIZE_PRESETS).map(([key,preset])=>(
              <button key={key} type="button" onClick={()=>applyPreset(key)}
                style={{padding:'8px 10px',borderRadius:10,cursor:'pointer',textAlign:'left',transition:'all .12s',border:`2px solid ${form.sizeSystem===key?'#C9993A':'var(--border)'}`,background:form.sizeSystem===key?'#FDF5E6':'var(--bg-hover)'}}>
                <div style={{fontWeight:700,fontSize:11,color:form.sizeSystem===key?'#92540A':'var(--text-primary)'}}>{preset.label}</div>
                {preset.sizes.length>0 && <div style={{fontSize:9,color:'var(--text-muted)',marginTop:2}}>{preset.sizes.slice(0,4).join(', ')}{preset.sizes.length>4?'…':''}</div>}
              </button>
            ))}
          </div>
          {activeSizes.length>0 && (
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
              {activeSizes.map(s=>(
                <span key={s} style={{padding:'3px 10px',background:'#FDF5E6',border:'1px solid #E8B855',borderRadius:20,fontSize:12,fontWeight:700,color:'#92540A',display:'flex',alignItems:'center',gap:5}}>
                  {s}
                  {form.sizeSystem==='custom' && <button type="button" onClick={()=>removeSize(s)} style={{background:'none',border:'none',color:'#C0392B',cursor:'pointer',fontWeight:800,fontSize:12,lineHeight:1,padding:0}}>×</button>}
                </span>
              ))}
            </div>
          )}
          {form.sizeSystem==='custom' && (
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <input className="form-control" placeholder="Type a size (e.g. 38, UK 10, 2XL) and press Add…" value={customInput}
                onChange={e=>setCustomInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&addCustomSize()} style={{fontSize:12}}/>
              <button type="button" className="btn btn-sm btn-gold" onClick={addCustomSize} style={{whiteSpace:'nowrap'}}>+ Add Size</button>
            </div>
          )}

          {/* Section: Defaults */}
          <div style={{fontSize:10,fontWeight:800,color:'#1565C0',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:3,height:14,background:'#1565C0',borderRadius:2}}/>Product Defaults
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Default Unit for Products</label>
              <select className="form-control" name="defaultUnit" value={form.defaultUnit} onChange={ch}>
                <option value="meter">Meter</option><option value="piece">Piece</option>
                <option value="kg">Kg</option><option value="yard">Yard</option>
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Default GST Rate (%)</label>
              <select className="form-control" name="defaultGstRate" value={form.defaultGstRate} onChange={ch}>
                {[0,5,12,18].map(r=><option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>

          {/* Section: Attributes */}
          <div style={{fontSize:10,fontWeight:800,color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:3,height:14,background:'#7C3AED',borderRadius:2}}/>Extra Attributes
            <span style={{fontSize:9,color:'var(--text-muted)',textTransform:'none',fontWeight:500,letterSpacing:0}}>— custom fields per product (Thread Count, Weave Pattern…)</span>
          </div>
          {form.attributes.length>0 && (
            <div style={{marginBottom:10}}>
              {form.attributes.map((attr,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--bg-hover)',borderRadius:8,marginBottom:5,border:'1px solid var(--border)'}}>
                  <div style={{flex:1}}>
                    <span style={{fontWeight:700,fontSize:13}}>{attr.name}</span>
                    <span style={{fontSize:11,color:'var(--text-muted)',marginLeft:8}}>{attr.type}</span>
                    {attr.options?.length>0 && <span style={{fontSize:10,color:'var(--text-muted)',marginLeft:6}}>Options: {attr.options.join(', ')}</span>}
                  </div>
                  <label style={{display:'flex',alignItems:'center',gap:4,fontSize:11,cursor:'pointer'}}>
                    <input type="checkbox" checked={!!attr.required} onChange={()=>toggleRequired(i)} style={{accentColor:'var(--primary)'}}/>Required
                  </label>
                  <button type="button" onClick={()=>removeAttr(i)} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer',fontWeight:800,fontSize:16}}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,marginBottom:8}}>
            <input className="form-control" placeholder="Attribute name (e.g. Thread Count, Weave Pattern)…" value={attrInput.name}
              onChange={e=>setAttrInput(a=>({...a,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addAttr()} style={{fontSize:12}}/>
            <select className="form-control" value={attrInput.type} onChange={e=>setAttrInput(a=>({...a,type:e.target.value}))} style={{width:100}}>
              <option value="text">Text</option><option value="number">Number</option><option value="select">Select</option>
            </select>
            <button type="button" className="btn btn-sm" onClick={addAttr} style={{whiteSpace:'nowrap',borderColor:'#7C3AED',color:'#7C3AED'}}>+ Add</button>
          </div>
          {attrInput.type==='select' && (
            <input className="form-control" placeholder="Options (comma separated): Fine, Medium, Coarse…" value={attrInput.options}
              onChange={e=>setAttrInput(a=>({...a,options:e.target.value}))} style={{fontSize:12,marginBottom:8}}/>
          )}

          {/* Preview */}
          <div style={{marginTop:16,padding:'12px 14px',background:'var(--bg-hover)',borderRadius:10,border:'1.5px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:form.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,boxShadow:`0 3px 10px ${form.color}55`}}>
              {form.icon}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:14}}>{form.name||'Category Name'}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>
                {form.fabricType||'—'} · {SIZE_PRESETS[form.sizeSystem]?.label} · {form.defaultUnit} · GST {form.defaultGstRate}%
                {form.attributes.length>0 ? ` · ${form.attributes.length} attr` : ''}
              </div>
              {activeSizes.length>0 && (
                <div style={{display:'flex',gap:4,marginTop:4,flexWrap:'wrap'}}>
                  {activeSizes.slice(0,8).map(s=>(
                    <span key={s} style={{fontSize:9,padding:'1px 6px',background:form.color+'22',border:`1px solid ${form.color}55`,borderRadius:8,fontWeight:700,color:form.color}}>{s}</span>
                  ))}
                  {activeSizes.length>8 && <span style={{fontSize:9,color:'var(--text-muted)'}}>+{activeSizes.length-8}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',borderTop:'1.5px solid var(--border)',background:'var(--bg-hover)'}}>
          <div style={{fontSize:12,color:'var(--text-muted)'}}>{isEdit?'Editing existing category':'Creating new category'}</div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{padding:'9px 22px',background:'#0D5C45',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:saving?'not-allowed':'pointer',opacity:saving?.7:1,display:'flex',alignItems:'center',gap:8}}>
              {saving
                ? <><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Saving…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>{isEdit?'Save Changes':'Create Category'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN INVENTORY PAGE
═══════════════════════════════════════════════════ */
const Inventory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role==='admin';
  const canAdd  = user?.role==='admin'||user?.role==='cashier';

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [viewMode,   setViewMode]   = useState('grid');
  const [activeTab,  setActiveTab]  = useState('purchase');

  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [lowFilter,   setLowFilter]   = useState(false);

  // Product modal
  const [modal,      setModal]     = useState(false);
  const [editItem,   setEditItem]  = useState(null);
  const [form,       setForm]      = useState(EMPTY_PRODUCT);
  const [saving,     setSaving]    = useState(false);
  const [formError,  setFormError] = useState('');
  const [imgFile,    setImgFile]   = useState(null);
  const [imgPreview, setImgPreview]= useState('');
  const fileRef = useRef();

  // Quick-add inside product modal
  const [newBrandName,setNewBrandName]=useState(''); const [addingBrand,setAddingBrand]=useState(false); const [brandMsg,setBrandMsg]=useState('');
  const [newCatName,  setNewCatName]  =useState(''); const [addingCat,  setAddingCat]  =useState(false); const [catMsg,  setCatMsg]  =useState('');

  // Restock
  const [restockModal, setRestockModal] = useState(false);
  const [restockItem,  setRestockItem]  = useState(null);
  const [restockQty,   setRestockQty]   = useState('');
  const [restockNote,  setRestockNote]  = useState('');
  const [restockSaving,setRestockSaving]= useState(false);
  const [restockMsg,   setRestockMsg]   = useState('');

  // QR + Category Builder
  const [qrProduct,      setQrProduct]      = useState(null);
  const [catBuilderOpen, setCatBuilderOpen] = useState(false);
  const [editCat,        setEditCat]        = useState(null);
  const [catSaving,      setCatSaving]      = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadAll = () => Promise.all([
    getProducts({search:debouncedSearch||undefined,category:catFilter||undefined,brand:brandFilter||undefined,lowStock:lowFilter||undefined}),
    getCategories(), getBrands(),
  ]).then(([p,c,b])=>{ setProducts(p.data.data||[]); setCategories(c.data.data||[]); setBrands(b.data.data||[]); }).catch(console.error);

  useEffect(()=>{ loadAll().finally(()=>setLoading(false)); },[]);
  useEffect(()=>{ if(!loading) loadAll(); },[debouncedSearch,catFilter,brandFilter,lowFilter]);

  // Product CRUD
  const openCreate = () => {
    const selCat = categories.find(c=>c._id===catFilter);
    setForm({...EMPTY_PRODUCT,unit:selCat?.defaultUnit||'meter',gstRate:selCat?.defaultGstRate||5});
    setEditItem(null); setFormError(''); setImgFile(null); setImgPreview('');
    setNewBrandName(''); setBrandMsg(''); setNewCatName(''); setCatMsg(''); setModal(true);
  };
  const openEdit = p => {
    setForm({...p,category:p.category?._id||p.category||'',brand:p.brand?._id||p.brand||''});
    setEditItem(p); setFormError(''); setImgFile(null);
    setImgPreview(p.imageUrl?`${IMG_BASE}${p.imageUrl}`:'');
    setNewBrandName(''); setBrandMsg(''); setNewCatName(''); setCatMsg(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setImgFile(null); setImgPreview(''); };
  const handleChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const handleCatChange = e => {
    const id = e.target.value;
    const cat = categories.find(c=>c._id===id);
    setForm(f=>({...f,category:id,unit:cat?.defaultUnit||f.unit,gstRate:cat?.defaultGstRate??f.gstRate}));
  };
  const handleImgChange = e => { const file=e.target.files[0]; if(!file)return; setImgFile(file); setImgPreview(URL.createObjectURL(file)); };
  const handleSave = async () => {
    if(!form.code||!form.name||!form.category||!form.pricePerUnit||form.stock==='') return setFormError('Code, Name, Category, Price and Stock are required.');
    setFormError(''); setSaving(true);
    try {
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>{ if(v!==''&&v!==null&&v!==undefined) fd.append(k,v); });
      if(imgFile) fd.append('image',imgFile);
      if(editItem) await updateProduct(editItem._id,fd); else await createProduct(fd);
      await loadAll(); closeModal();
    } catch(err){ setFormError(err.response?.data?.message||'Save failed.'); }
    finally{ setSaving(false); }
  };
  const handleDelete = async id => {
    if(!window.confirm('Deactivate this product?')) return;
    await deleteProduct(id).catch(console.error);
    setProducts(prev=>prev.filter(p=>p._id!==id));
  };

  // Brand quick-add
  const handleAddBrand = async () => {
    if(!newBrandName.trim()) return; setAddingBrand(true); setBrandMsg('');
    try { const{data}=await createBrand({name:newBrandName.trim()}); setBrands(prev=>[...prev,data.data].sort((a,b)=>a.name.localeCompare(b.name))); setForm(f=>({...f,brand:data.data._id})); setNewBrandName(''); setBrandMsg(`✓ "${data.data.name}" added`); setTimeout(()=>setBrandMsg(''),2500); }
    catch(err){ setBrandMsg(err.response?.data?.message||'Already exists'); } finally{ setAddingBrand(false); }
  };
  // Category quick-add (simple, inside product modal)
  const handleAddCat = async () => {
    if(!newCatName.trim()) return; setAddingCat(true); setCatMsg('');
    try { const{data}=await createCategory({name:newCatName.trim()}); setCategories(prev=>[...prev,data.data].sort((a,b)=>a.name.localeCompare(b.name))); setForm(f=>({...f,category:data.data._id})); setNewCatName(''); setCatMsg(`✓ "${data.data.name}" added`); setTimeout(()=>setCatMsg(''),2500); }
    catch(err){ setCatMsg(err.response?.data?.message||'Already exists'); } finally{ setAddingCat(false); }
  };

  // Category Builder
  const openCatBuilder = (cat=null) => { setEditCat(cat); setCatBuilderOpen(true); };
  const closeCatBuilder = () => { setCatBuilderOpen(false); setEditCat(null); };
  const handleSaveCat = async formData => {
    setCatSaving(true);
    try { if(editCat?._id) await updateCategory(editCat._id,formData); else await createCategory(formData); await loadAll(); closeCatBuilder(); }
    catch(err){ alert(err.response?.data?.message||'Save failed.'); } finally{ setCatSaving(false); }
  };
  const handleDeleteCat = async id => {
    if(!window.confirm('Deactivate this category?')) return;
    await deleteCategory(id).catch(console.error); setCategories(prev=>prev.filter(c=>c._id!==id));
  };

  // Restock
  const openRestock  = p => { setRestockItem(p); setRestockQty(''); setRestockNote(''); setRestockMsg(''); setRestockModal(true); };
  const closeRestock = () => { setRestockModal(false); setRestockItem(null); };
  const handleRestock = async () => {
    if(!restockQty||Number(restockQty)<=0) return setRestockMsg('Enter a quantity greater than 0.');
    setRestockMsg(''); setRestockSaving(true);
    try { const{data}=await restockProduct(restockItem._id,{quantity:Number(restockQty),note:restockNote}); setRestockMsg(data.message); await loadAll(); setTimeout(closeRestock,1600); }
    catch(err){ setRestockMsg(err.response?.data?.message||'Restock failed.'); } finally{ setRestockSaving(false); }
  };

  const lowCount = products.filter(p=>p.isLowStock).length;
  if (loading) return <Loader/>;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {qrProduct && <QRLabelModal product={qrProduct} onClose={()=>setQrProduct(null)}/>}
      {catBuilderOpen && <CategoryBuilder cat={editCat} onSave={handleSaveCat} onClose={closeCatBuilder} saving={catSaving}/>}

      {lowCount>0 && (
        <div className="alert alert-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          <span><strong>{lowCount} product{lowCount>1?'s':''}</strong> below reorder level — use <strong>+ Restock</strong> to refill.</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{display:'flex',gap:4,marginBottom:18,borderBottom:'2px solid var(--border)'}}>
        {[
          {id:'purchase',  label:'🛒 Purchase',    count:null},
          {id:'products',  label:'📦 Products',    count:products.length},
          {id:'categories',label:'🏷 Categories',  count:categories.length},
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            padding:'9px 18px', border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
            background:'transparent',
            borderBottom:`2px solid ${activeTab===tab.id?'var(--primary)':'transparent'}`,
            color:activeTab===tab.id?'var(--primary)':'var(--text-secondary)',
            marginBottom:-2, transition:'all .15s', borderRadius:'8px 8px 0 0',
            display:'flex', alignItems:'center', gap:7,
          }}>
            {tab.label}
            {tab.count !== null && (
              <span style={{background:activeTab===tab.id?'var(--primary)':'var(--bg-hover)',color:activeTab===tab.id?'white':'var(--text-muted)',fontSize:10,fontWeight:800,padding:'1px 7px',borderRadius:12,minWidth:22,textAlign:'center'}}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ PURCHASE TAB ══ */}
      {activeTab==='purchase' && (
        <div style={{minHeight:'60vh'}}>
          <PurchaseEntry/>
        </div>
      )}

      {/* ══ PRODUCTS TAB ══ */}
      {activeTab==='products' && (
        <>
          <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
            <input className="form-control" style={{width:220}} placeholder="Search name or code…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="form-control" style={{width:160}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c._id} value={c._id}>{c.icon||''} {c.name}</option>)}
            </select>
            <select className="form-control" style={{width:140}} value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}>
              <option value="">All Brands</option>
              {brands.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <button className={`btn btn-sm ${lowFilter?'btn-danger':''}`} style={!lowFilter?{borderColor:'var(--danger)',color:'var(--danger)'}:{}} onClick={()=>setLowFilter(v=>!v)}>
              ⚠ Low Stock{lowFilter?` (${lowCount})`:''}
            </button>
            <div style={{marginLeft:'auto',display:'flex',gap:6}}>
              {['grid','table'].map(m=>(
                <button key={m} className={`btn btn-sm ${viewMode===m?'btn-primary':''}`} onClick={()=>setViewMode(m)}>{m==='grid'?'⊞ Grid':'☰ Table'}</button>
              ))}
              {canAdd && <button className="btn btn-primary btn-sm" onClick={openCreate}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Add Product
              </button>}
            </div>
          </div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:10,fontWeight:600}}>
            {products.length} product{products.length!==1?'s':''}{catFilter&&` in ${categories.find(c=>c._id===catFilter)?.name||''}`}{lowFilter&&' · Low stock only'}
          </div>

          {/* Grid */}
          {viewMode==='grid' && (
            <div className="inv-grid">
              {products.length===0 && (
                <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
                  <div style={{fontSize:36,marginBottom:10}}>📦</div>
                  No products found. {canAdd && <span style={{color:'var(--primary)',cursor:'pointer',fontWeight:700}} onClick={openCreate}>Add the first one →</span>}
                </div>
              )}
              {products.map(p=>(
                <div key={p._id} className={`inv-card${p.isLowStock?' low':''}`}>
                  <ProductThumb product={p}/>
                  <div className="inv-card-body">
                    <div className="inv-card-code">{p.code}</div>
                    <div className="inv-card-name">{p.name}</div>
                    <div className="inv-card-brand" style={{color:p.brand?'var(--gold)':'var(--text-muted)'}}>{p.brand?.name||'Generic'}</div>
                    <div className="inv-card-price">₹{p.pricePerUnit}/{p.unit}</div>
                    <div className="inv-card-stock">
                      <span style={{fontSize:12,fontWeight:600,color:p.isLowStock?'var(--danger)':'var(--text-secondary)'}}>{p.stock} {p.unit}s</span>
                      <StockBar stock={p.stock} reorderLevel={p.reorderLevel}/>
                      {p.isLowStock && <span className="badge badge-danger" style={{fontSize:9}}>Low</span>}
                    </div>
                    {/* QR Button */}
                    <button onClick={()=>setQrProduct(p)}
                      style={{width:'100%',marginBottom:6,padding:'5px 0',borderRadius:8,border:'1.5px solid var(--border-dark)',background:'var(--bg-hover)',color:'var(--text-secondary)',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .12s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-dark)';e.currentTarget.style.color='var(--text-secondary)';}}>
                      ⬛ View QR Label
                    </button>
                    <div className="inv-card-actions">
                      <button className="btn btn-sm btn-primary" style={{flex:1,justifyContent:'center',fontSize:11}} onClick={()=>openRestock(p)}>+ Restock</button>
                      {canAdd && <button className="btn btn-sm" style={{flex:1,justifyContent:'center',fontSize:11}} onClick={()=>openEdit(p)}>✎ Edit</button>}
                      {isAdmin && <button className="btn btn-sm" onClick={()=>handleDelete(p._id)} style={{padding:'5px 8px',color:'var(--danger)',borderColor:'var(--danger)'}}>✕</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          {viewMode==='table' && (
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Price</th><th>Stock</th><th>GST</th><th>QR</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>No products found</td></tr>}
                    {products.map(p=>(
                      <tr key={p._id}>
                        <td><div style={{display:'flex',alignItems:'center',gap:10}}><ProductThumb product={p} height={40} className="prod-thumb"/><div><div className="td-bold">{p.name}</div><div className="td-mono">{p.code}</div></div></div></td>
                        <td><span className="badge badge-gray" style={{background:p.category?.color+'22',color:p.category?.color}}>{p.category?.name}</span></td>
                        <td style={{color:'var(--gold)',fontWeight:600}}>{p.brand?.name||'—'}</td>
                        <td className="td-bold" style={{color:'var(--primary)'}}>₹{p.pricePerUnit}/{p.unit}</td>
                        <td><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{minWidth:50,fontWeight:700,color:p.isLowStock?'var(--danger)':'inherit'}}>{p.stock}</span><StockBar stock={p.stock} reorderLevel={p.reorderLevel}/>{p.isLowStock&&<span className="badge badge-danger" style={{fontSize:9}}>Low</span>}</div></td>
                        <td>{p.gstRate}%</td>
                        <td><button className="btn btn-sm" onClick={()=>setQrProduct(p)} style={{fontSize:11}}>⬛ QR</button></td>
                        <td><div style={{display:'flex',gap:4}}>
                          <button className="btn btn-sm btn-primary" onClick={()=>openRestock(p)} style={{fontSize:11}}>+ Stock</button>
                          {canAdd&&<button className="btn btn-sm" onClick={()=>openEdit(p)} style={{fontSize:11}}>✎ Edit</button>}
                          {isAdmin&&<button className="btn btn-sm" onClick={()=>handleDelete(p._id)} style={{color:'var(--danger)',fontSize:11}}>✕</button>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ CATEGORIES TAB ══ */}
      {activeTab==='categories' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{categories.length} Categories</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>Manage categories with size systems, fabric types, and custom attributes</div>
            </div>
            {isAdmin && <button className="btn btn-primary" onClick={()=>openCatBuilder(null)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add Category
            </button>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {categories.map(cat=>{
              const activeSizes = cat.sizeSystem==='custom' ? cat.customSizes||[] : SIZE_PRESETS[cat.sizeSystem]?.sizes||[];
              const productCount = products.filter(p=>(p.category?._id||p.category)===cat._id).length;
              return (
                <div key={cat._id} style={{background:'var(--bg-card)',borderRadius:14,overflow:'hidden',border:'1.5px solid var(--border)',boxShadow:'var(--shadow-xs)',transition:'box-shadow .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-xs)'}>
                  <div style={{height:6,background:cat.color||'#0D5C45'}}/>
                  <div style={{padding:'14px 16px 10px',borderBottom:'1px solid var(--border)',background:`${cat.color||'#0D5C45'}10`}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:cat.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,boxShadow:`0 3px 10px ${cat.color}55`}}>{cat.icon||'🧵'}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:800,fontSize:15}}>{cat.name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cat.description||cat.fabricType||'No description'}</div>
                      </div>
                      <span style={{background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,color:'var(--text-secondary)',whiteSpace:'nowrap'}}>{productCount} item{productCount!==1?'s':''}</span>
                    </div>
                  </div>
                  <div style={{padding:'10px 16px'}}>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                      {cat.fabricType && <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'#E0F2FE',color:'#0369A1',fontWeight:700}}>{cat.fabricType}</span>}
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'var(--bg-hover)',color:'var(--text-muted)',fontWeight:600}}>{cat.defaultUnit||'meter'} · GST {cat.defaultGstRate||5}%</span>
                      {cat.attributes?.length>0 && <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:'#EDE9FE',color:'#5B21B6',fontWeight:700}}>{cat.attributes.length} attr</span>}
                    </div>
                    {activeSizes.length>0
                      ? <div>
                          <div style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{SIZE_PRESETS[cat.sizeSystem]?.label}</div>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                            {activeSizes.slice(0,8).map(s=>(
                              <span key={s} style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:`${cat.color}18`,border:`1px solid ${cat.color}44`,fontWeight:700,color:cat.color}}>{s}</span>
                            ))}
                            {activeSizes.length>8 && <span style={{fontSize:10,color:'var(--text-muted)',alignSelf:'center'}}>+{activeSizes.length-8}</span>}
                          </div>
                        </div>
                      : <div style={{fontSize:11,color:'var(--text-muted)',fontStyle:'italic'}}>No size system configured</div>
                    }
                  </div>
                  {isAdmin && (
                    <div style={{padding:'8px 12px',borderTop:'1px solid var(--border)',display:'flex',gap:6}}>
                      <button className="btn btn-sm" onClick={()=>openCatBuilder(cat)} style={{flex:1,justifyContent:'center',fontSize:11}}>✎ Edit Category</button>
                      <button className="btn btn-sm" onClick={()=>handleDeleteCat(cat._id)} style={{color:'var(--danger)',borderColor:'var(--danger)',fontSize:11}}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}
            {categories.length===0 && (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px 20px',background:'var(--bg-card)',borderRadius:14,border:'2px dashed var(--border)'}}>
                <div style={{fontSize:40,marginBottom:10}}>🏷</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>No categories yet</div>
                <div style={{color:'var(--text-muted)',fontSize:13,marginBottom:18}}>Create your first category to organise your products</div>
                {isAdmin && <button className="btn btn-primary" onClick={()=>openCatBuilder(null)}>Create First Category</button>}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ ADD/EDIT PRODUCT MODAL ═══ */}
      <Modal open={modal} onClose={closeModal}
        title={editItem?`Edit — ${editItem.name}`:'Add New Product'}
        footer={<><button className="btn" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editItem?'Update Product':'Add Product'}</button></>}>
        {formError && <div className="alert alert-danger" style={{marginBottom:12}}>{formError}</div>}
        {!editItem && <div className="alert alert-info" style={{marginBottom:14,fontSize:12}}>This adds a <strong>brand new product</strong>. To refill existing stock → close and click <strong>+ Restock</strong>.</div>}
        <div className="form-group">
          <label className="form-label">Product Photo</label>
          <div className="img-upload-zone" onClick={()=>fileRef.current?.click()}>
            {imgPreview ? <img src={imgPreview} className="img-preview" alt="preview"/> : <div style={{padding:'16px 0',color:'var(--text-muted)',fontSize:12}}><div style={{fontSize:24,marginBottom:6}}>📷</div>Click to upload fabric photo (optional)</div>}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImgChange} style={{display:'none'}}/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Product Code *</label><input className="form-control" name="code" value={form.code} onChange={handleChange} placeholder="CTN-010"/></div>
          <div className="form-group"><label className="form-label">Product Name *</label><input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Silk Cotton Blend"/></div>
        </div>
        {/* Category */}
        <div className="form-group">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
            <label className="form-label" style={{marginBottom:0}}>Category *</label>
            <button type="button" onClick={()=>{setModal(false);setTimeout(()=>openCatBuilder(null),50);}} style={{fontSize:10,color:'var(--primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:0}}>+ Build New Category</button>
          </div>
          <select className="form-control" name="category" value={form.category} onChange={handleCatChange}>
            <option value="">Select category</option>
            {categories.map(c=><option key={c._id} value={c._id}>{c.icon||''} {c.name}</option>)}
          </select>
          {form.category && (()=>{
            const cat=categories.find(c=>c._id===form.category);
            const sizes=cat?.sizeSystem==='custom'?cat.customSizes||[]:SIZE_PRESETS[cat?.sizeSystem]?.sizes||[];
            if(!cat) return null;
            return <div style={{marginTop:6,padding:'6px 10px',background:`${cat.color}12`,border:`1px solid ${cat.color}33`,borderRadius:8,fontSize:11,color:cat.color,fontWeight:600,display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              <span>{cat.icon} {cat.name}</span>{cat.fabricType&&<span>· {cat.fabricType}</span>}{sizes.length>0&&<span>· Sizes: {sizes.slice(0,5).join(', ')}{sizes.length>5?'…':''}</span>}
            </div>;
          })()}
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <input className="form-control" placeholder="Quick add category name…" value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddCat()} style={{fontSize:12,padding:'5px 10px'}}/>
            <button className="btn btn-sm btn-primary" onClick={handleAddCat} disabled={addingCat||!newCatName.trim()}>+ Add</button>
          </div>
          {catMsg && <div style={{fontSize:11,marginTop:3,color:catMsg.startsWith('✓')?'var(--success)':'var(--danger)',fontWeight:600}}>{catMsg}</div>}
        </div>
        {/* Brand */}
        <div className="form-group">
          <label className="form-label">Brand</label>
          <select className="form-control" name="brand" value={form.brand} onChange={handleChange}>
            <option value="">No Brand / Generic</option>
            {brands.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <input className="form-control" placeholder="Quick add brand name…" value={newBrandName} onChange={e=>setNewBrandName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddBrand()} style={{fontSize:12,padding:'5px 10px'}}/>
            <button className="btn btn-sm btn-primary" onClick={handleAddBrand} disabled={addingBrand||!newBrandName.trim()}>+ Add</button>
          </div>
          {brandMsg && <div style={{fontSize:11,marginTop:3,color:brandMsg.startsWith('✓')?'var(--success)':'var(--danger)',fontWeight:600}}>{brandMsg}</div>}
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Unit</label>
            <select className="form-control" name="unit" value={form.unit} onChange={handleChange}>
              <option value="meter">Meter</option><option value="piece">Piece</option><option value="kg">Kg</option><option value="yard">Yard</option>
            </select></div>
          <div className="form-group"><label className="form-label">GST Rate (%)</label>
            <select className="form-control" name="gstRate" value={form.gstRate} onChange={handleChange}>
              <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option>
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Price per Unit (₹) *</label><input className="form-control" name="pricePerUnit" type="number" value={form.pricePerUnit} onChange={handleChange} placeholder="100"/></div>
          <div className="form-group"><label className="form-label">{editItem?'Stock':'Opening Stock *'}</label><input className="form-control" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="100"/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Reorder Level</label><input className="form-control" name="reorderLevel" type="number" value={form.reorderLevel} onChange={handleChange}/></div>
          <div className="form-group"><label className="form-label">Swatch Color</label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="color" name="swatchColor" value={form.swatchColor} onChange={handleChange} style={{width:40,height:36,border:'1.5px solid var(--border-dark)',borderRadius:8,padding:2,cursor:'pointer'}}/>
              <input className="form-control" name="swatchColor" value={form.swatchColor} onChange={handleChange} style={{fontFamily:'monospace'}} placeholder="#1A8060"/>
            </div></div>
        </div>
        <div className="form-group"><label className="form-label">Description</label><input className="form-control" name="description" value={form.description||''} onChange={handleChange} placeholder="Optional product notes"/></div>
      </Modal>

      {/* ═══ RESTOCK MODAL ═══ */}
      <Modal open={restockModal} onClose={closeRestock} title={`Restock — ${restockItem?.name||''}`}
        footer={<><button className="btn" onClick={closeRestock}>Cancel</button>
          <button className="btn btn-primary" onClick={handleRestock} disabled={restockSaving}>{restockSaving?'Saving…':'✓ Confirm Restock'}</button></>}>
        {restockItem && <>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16,padding:'10px 12px',background:'var(--bg-hover)',borderRadius:10}}>
            <ProductThumb product={restockItem} height={50} className="prod-thumb"/>
            <div><div style={{fontWeight:700}}>{restockItem.name}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>Current stock: <strong style={{color:'var(--primary)'}}>{restockItem.stock} {restockItem.unit}s</strong></div></div>
          </div>
          <div className="form-group">
            <label className="form-label">Add Quantity ({restockItem.unit}s) *</label>
            <input className="form-control" type="number" min="0.01" step="0.01" value={restockQty} onChange={e=>setRestockQty(e.target.value)} autoFocus placeholder={`Enter quantity in ${restockItem.unit}s`} style={{fontSize:18,fontWeight:700,textAlign:'center'}}/>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input className="form-control" value={restockNote} onChange={e=>setRestockNote(e.target.value)} placeholder="Supplier, invoice number…"/>
          </div>
          {restockQty&&Number(restockQty)>0 && <div style={{padding:'8px 12px',background:'var(--primary-light)',borderRadius:8,fontSize:12,fontWeight:600,color:'var(--primary)'}}>New stock: <strong>{Number(restockItem.stock)+Number(restockQty)} {restockItem.unit}s</strong></div>}
          {restockMsg && <div style={{marginTop:8,fontSize:12,fontWeight:600,color:restockMsg.startsWith('Restocked')?'var(--success)':'var(--danger)'}}>{restockMsg}</div>}
        </>}
      </Modal>
    </>
  );
};

export default Inventory;
