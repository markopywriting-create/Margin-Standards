import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const storeSet = async(k,v)=>{
  try{await supabase.from("kv_store").upsert({key:k,value:JSON.stringify(v)});}catch(e){}
};
const storeGet = async(k)=>{
  try{const{data}=await supabase.from("kv_store").select("value").eq("key",k).single();return data?JSON.parse(data.value):null;}catch(e){return null;}
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PER_MONTH = 20;

// Brand palette
const T    = "#188C7E";   // Dark Cyan — primary
const BG   = "#F9F4F1";   // Parchment — page background
const SURF = "#FFFFFF";   // White — surfaces
const CARD = "#FFFFFF";   // White — cards
const BRD  = "#E2DAD5";   // Warm border
const BRD2 = "#CEC5BE";   // Stronger border
const DARK = "#424651";   // Charcoal Blue — primary text
const DIM  = "#8E8B96";   // Muted text
const DIM2 = "#B5AEA9";   // Placeholder
const ACC  = "#188C7E";   // Teal accent
const TLIGHT = "#EAF4F2"; // Teal tint for hovers/fills
const TMED   = "#C2E0DC"; // Teal medium tint

const uid6 = () => Math.random().toString(36).slice(2,8).toUpperCase();
const emptyPost = () => ({date:"",time:"",link:"",thumbnail:"",impressions:"",membersReached:"",profileViewers:"",followersGained:"",reactions:"",comments:"",reposts:"",saves:"",sends:"",notes:"",demographics:[],snapshots:{day1:null,week1:null,week2:null}});
const initData = () => MONTHS.reduce((a,m)=>({...a,[m]:Array.from({length:PER_MONTH},emptyPost)}),{});
const calcRow = r => {
  const imp=parseFloat(r.impressions)||0, eng=["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0);
  return {...r, reachRate:imp>0?((parseFloat(r.membersReached)||0)/imp*100).toFixed(1)+"%":"", engRate:imp>0?(eng/imp*100).toFixed(2)+"%":""};
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{
    // ensure viewport meta exists
    if(!document.querySelector('meta[name="viewport"]')) {
      const m=document.createElement("meta");m.name="viewport";m.content="width=device-width,initial-scale=1";document.head.appendChild(m);
    }
    const handler = ()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handler);
    return ()=>window.removeEventListener("resize",handler);
  },[]);
  return isMobile;
}


const COLS = [
  {key:"slot",           label:"#",            w:32,  type:"index", group:"POST"},
  {key:"date",           label:"Date",          w:100, type:"text",  group:"POST"},
  {key:"time",           label:"Time",          w:68,  type:"text",  group:"POST"},
  {key:"link",           label:"Post",          w:220, type:"link",  group:"POST"},
  {key:"impressions",    label:"Impressions",   w:88,  type:"num",   group:"DISCOVERY"},
  {key:"membersReached", label:"Reached",       w:80,  type:"num",   group:"DISCOVERY"},
  {key:"reachRate",      label:"Reach %",       w:70,  type:"calc",  group:"DISCOVERY"},
  {key:"profileViewers", label:"Profile Views", w:86,  type:"num",   group:"PROFILE"},
  {key:"followersGained",label:"Followers",     w:74,  type:"num",   group:"PROFILE"},
  {key:"reactions",      label:"Reactions",     w:74,  type:"num",   group:"ENGAGEMENT"},
  {key:"comments",       label:"Comments",      w:74,  type:"num",   group:"ENGAGEMENT"},
  {key:"reposts",        label:"Reposts",       w:64,  type:"num",   group:"ENGAGEMENT"},
  {key:"saves",          label:"Saves",         w:58,  type:"num",   group:"ENGAGEMENT"},
  {key:"sends",          label:"Sends",         w:58,  type:"num",   group:"ENGAGEMENT"},
  {key:"engRate",        label:"Eng. %",        w:68,  type:"calc",    group:"ENGAGEMENT"},
  {key:"upload",         label:"Screenshot",    w:88,  type:"upload",  group:"UPLOAD"},
  {key:"notes",          label:"Notes",         w:140, type:"text",    group:"NOTES"},
  {key:"details",        label:"Details",       w:80,  type:"details", group:"NOTES"},
  {key:"demoUpload",     label:"↑ Import",      w:80,  type:"demoupload", group:"JOB TITLES"},
  {key:"d0",             label:"#1 Job Title",  w:150, type:"dtitle",  group:"JOB TITLES"},
  {key:"d1",             label:"#2 Job Title",  w:150, type:"dtitle",  group:"JOB TITLES"},
  {key:"d2",             label:"#3 Job Title",  w:150, type:"dtitle",  group:"JOB TITLES"},
  {key:"d3",             label:"#4 Job Title",  w:150, type:"dtitle",  group:"JOB TITLES"},
  {key:"d4",             label:"#5 Job Title",  w:150, type:"dtitle",  group:"JOB TITLES"},
  {key:"clearRow",       label:"",              w:36,  type:"clearrow",group:"ACTIONS"},
];

const GC = {
  POST:        "#424651",
  DISCOVERY:   "#188C7E",
  PROFILE:     "#0d7066",
  ENGAGEMENT:  "#0a5c54",
  UPLOAD:      "#5a5e6b",
  NOTES:       "#6b6f7c",
  "JOB TITLES":"#2d6a8a",
  "ACTIONS":   "#9a9ea8",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${BG};color:${DARK};font-family:'DM Sans',system-ui,sans-serif;}
::-webkit-scrollbar{height:5px;width:5px;}
::-webkit-scrollbar-track{background:${BG};}
::-webkit-scrollbar-thumb{background:${TMED};border-radius:3px;}
input,select{background:transparent;border:none;outline:none;color:${DARK};font-family:'DM Mono',monospace;font-size:11px;width:100%;padding:1px 4px;}
input::placeholder{color:${DIM2};}
input:focus{background:rgba(24,140,126,0.08);border-radius:3px;}
select{font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;color:${DARK};}
.inp{background:${SURF};border:1px solid ${BRD};color:${DARK};border-radius:8px;padding:9px 13px;font-size:13px;font-family:'DM Sans',sans-serif;width:100%;outline:none;}
.inp:focus{border-color:${T};box-shadow:0 0 0 3px rgba(24,140,126,0.1);}
.btn{cursor:pointer;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;transition:all .15s;border:none;}
.btn-primary{background:${T};color:#fff;padding:9px 20px;}
.btn-primary:hover{background:#0f7167;}
.btn-ghost{background:${SURF};border:1px solid ${BRD};color:${DARK};padding:7px 14px;}
.btn-ghost:hover{border-color:${T};color:${T};background:${TLIGHT};}
.btn-danger{background:rgba(200,60,60,0.07);border:1px solid rgba(200,60,60,0.2);color:#c03c3c;padding:5px 12px;font-size:12px;border-radius:6px;cursor:pointer;}
.btn-danger:hover{background:rgba(200,60,60,0.13);}
.btn-sm{padding:5px 12px;font-size:11px;border-radius:6px;}
.post-row:hover td{background:${TLIGHT}!important;}
.flash-row td{background:${TMED}!important;}
.drag-over td{outline:1px solid ${T};background:rgba(24,140,126,0.1)!important;}
.ubtn{cursor:pointer;background:${TLIGHT};border:1px solid ${TMED};color:${T};border-radius:5px;padding:3px 8px;font-size:10px;font-weight:600;display:inline-block;transition:all .15s;}
.ubtn:hover{background:${TMED};border-color:${T};}
.ubtn.loading{color:${DIM};border-color:${BRD};animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.mtab{cursor:pointer;padding:5px 13px;border-radius:6px;font-size:12px;font-weight:500;transition:all .15s;color:${DIM};white-space:nowrap;}
.mtab:hover{color:${T};background:${TLIGHT};}
.mtab.active{color:#fff;background:${T};}
.dot{display:inline-block;width:5px;height:5px;background:${T};border-radius:50%;margin-left:5px;vertical-align:middle;}
.client-row{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:10px;border:1px solid ${BRD};background:${CARD};margin-bottom:8px;cursor:pointer;transition:all .15s;}
.client-row:hover{border-color:${T};background:${TLIGHT};}
.token{font-family:'DM Mono',monospace;background:${TLIGHT};color:${T};padding:3px 10px;border-radius:6px;font-size:13px;letter-spacing:2px;border:1px solid ${TMED};}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:.5px;}
.divider{border:none;border-top:1px solid ${BRD};margin:0;}
@media(max-width:768px){
  .dash-header-controls{flex-direction:column;align-items:stretch!important;gap:8px!important;}
  .dash-header-controls>*{width:100%;}
  .view-toggle{width:100%!important;justify-content:center;}
  .view-toggle button{flex:1!important;}
  .month-tabs{padding-bottom:4px!important;}
  .stat-cards-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;padding:12px 16px!important;}
  .stat-card-item{min-width:unset!important;}
  .report-row2{grid-template-columns:1fr!important;}
  .report-row3{grid-template-columns:1fr!important;}
  .report-padding{padding:12px 16px 32px!important;}
  .landing-cards{grid-template-columns:1fr!important;}
  .admin-header{padding:14px 16px 12px!important;flex-wrap:wrap!important;gap:8px!important;}
  .client-row{flex-wrap:wrap!important;}
  .token{font-size:11px!important;letter-spacing:1px!important;}
  .dash-content{padding:0 16px 32px!important;}
}
`;

// ─── Details Panel (Snapshots + Demographics) ─────────────────────────────────
const SNAP_KEYS = ["impressions","membersReached","reactions","comments","saves","sends"];
const SNAP_LABELS = {impressions:"Impressions",membersReached:"Reached",reactions:"Reactions",comments:"Comments",saves:"Saves",sends:"Sends"};
const SNAP_PERIODS = [{key:"day1",label:"1 Day After"},{key:"week1",label:"1 Week After"},{key:"week2",label:"2 Weeks After"}];

function delta(curr, prev) {
  const c=parseFloat(curr)||0, p=parseFloat(prev)||0;
  if(!p||!c) return null;
  const d=Math.round(((c-p)/p)*100);
  return d;
}

function DetailsPanel({post, onChange, readOnly, rowBg}) {
  const [section, setSection] = useState("snapshots");
  const snapshots = post.snapshots||{day1:null,week1:null,week2:null};
  const demographics = post.demographics||[];
  const max = Math.max(...demographics.map(d=>parseFloat(d.pct)||0), 0.1);
  const [loadingSnap, setLoadingSnap] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const extractSnap = async(file, periodKey) => {
    setLoadingSnap(periodKey);
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Extract LinkedIn post stats. Return ONLY JSON: {"impressions":number,"membersReached":number,"reactions":number,"comments":number,"reposts":number,"saves":number,"sends":number}'}]}]})});
      const d=await resp.json();
      const txt=d.content?.find(b=>b.type==="text")?.text||"{}";
      const p=JSON.parse(txt.replace(/```json|```/g,"").trim());
      const snap={...p, capturedAt:new Date().toLocaleDateString()};
      onChange({snapshots:{...snapshots,[periodKey]:snap}});
    } catch(e){console.error(e);}
    setLoadingSnap(null);
  };

  const extractDemo = async(file) => {
    setLoadingDemo(true);
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Extract job title demographics from this LinkedIn analytics screenshot. Return ONLY JSON: {"items":[{"title":"Software Engineer","pct":13.8},{"title":"Founder","pct":4.4},...]}'}]}]})});
      const d=await resp.json();
      const txt=d.content?.find(b=>b.type==="text")?.text||"{}";
      const p=JSON.parse(txt.replace(/```json|```/g,"").trim());
      if(p.items) onChange({demographics:p.items});
    } catch(e){console.error(e);}
    setLoadingDemo(false);
  };

  const pickFile = (onFile) => { const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{if(e.target.files[0])onFile(e.target.files[0]);};i.click(); };

  const updateDemo = (i,field,val) => { const next=demographics.map((d,idx)=>idx===i?{...d,[field]:val}:d); onChange({demographics:next}); };
  const addDemo = () => onChange({demographics:[...demographics,{title:"",pct:""}]});
  const removeDemo = i => onChange({demographics:demographics.filter((_,idx)=>idx!==i)});
  const clearSnap = k => onChange({snapshots:{...snapshots,[k]:null}});

  return (
    <tr>
      <td colSpan={999} style={{padding:0,borderBottom:`2px solid ${T}`}}>
        <div style={{background:rowBg}}>
          {/* Section tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${BRD}`,paddingLeft:44}}>
            {[["snapshots","📸 Snapshots"],["demographics","👔 Job Titles"]].map(([k,label])=>(
              <button key={k} onClick={()=>setSection(k)}
                style={{padding:"8px 16px",fontSize:11,fontWeight:600,background:"none",border:"none",cursor:"pointer",color:section===k?T:DIM,borderBottom:section===k?`2px solid ${T}`:"2px solid transparent",marginBottom:-1,fontFamily:"DM Sans",transition:"all .15s"}}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Snapshots ── */}
          {section==="snapshots" && (
            <div style={{padding:"16px 20px 18px 44px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {SNAP_PERIODS.map(({key:pk,label},pi)=>{
                  const snap=snapshots[pk];
                  const prev=pi>0?snapshots[SNAP_PERIODS[pi-1].key]:null;
                  return (
                    <div key={pk} style={{background:SURF,border:`1px solid ${snap?T:BRD}`,borderRadius:10,overflow:"hidden"}}>
                      {/* Period header */}
                      <div style={{background:snap?T:"#f4efeb",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:11,fontWeight:700,color:snap?"#fff":DIM,letterSpacing:".3px"}}>{label}</span>
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          {snap && <span style={{fontSize:9,color:snap?"rgba(255,255,255,.7)":"none"}}>{snap.capturedAt}</span>}
                          {!readOnly && (
                            <>
                              {loadingSnap===pk
                                ? <span style={{fontSize:10,color:snap?"#fff":DIM}}>reading…</span>
                                : <span onClick={()=>pickFile(f=>extractSnap(f,pk))} style={{fontSize:10,fontWeight:600,color:snap?"#fff":T,cursor:"pointer",background:snap?"rgba(255,255,255,.2)":TLIGHT,padding:"2px 7px",borderRadius:4,border:snap?"none":`1px solid ${TMED}`}}>↑ {snap?"Replace":"Import"}</span>}
                              {snap && <span onClick={()=>clearSnap(pk)} style={{fontSize:12,color:"rgba(255,255,255,.6)",cursor:"pointer",padding:"0 2px"}}>×</span>}
                            </>
                          )}
                        </div>
                      </div>
                      {/* Stats */}
                      <div style={{padding:"10px 12px"}}>
                        {snap ? SNAP_KEYS.map(k=>{
                          const d=prev?delta(snap[k],prev[k]):null;
                          return (
                            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:`1px solid ${BRD}`}}>
                              <span style={{fontSize:10,color:DIM}}>{SNAP_LABELS[k]}</span>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                {d!==null && <span style={{fontSize:9,fontWeight:600,color:d>=0?"#1a8c4e":"#c03c3c",background:d>=0?"rgba(26,140,78,.08)":"rgba(192,60,60,.08)",padding:"1px 5px",borderRadius:3}}>{d>=0?"+":""}{d}%</span>}
                                <span style={{fontSize:11,fontWeight:600,color:DARK,fontFamily:"DM Mono"}}>{snap[k]!=null?Number(snap[k]).toLocaleString():"—"}</span>
                              </div>
                            </div>
                          );
                        }) : (
                          <div style={{textAlign:"center",padding:"16px 0",color:DIM2,fontSize:11}}>
                            {readOnly?"No snapshot yet.":`Drop a screenshot\nor click Import above`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:10,color:DIM2,marginTop:10}}>% change shown relative to prior snapshot period.</div>
            </div>
          )}

          {/* ── Demographics ── */}
          {section==="demographics" && (
            <div style={{padding:"14px 20px 16px 44px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:10,color:DIM}}>Top job titles reaching this post</span>
                {!readOnly && (
                  <span onClick={()=>pickFile(extractDemo)} style={{cursor:"pointer",background:loadingDemo?BG:TLIGHT,border:`1px solid ${TMED}`,color:T,borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:600,transition:"all .15s"}}>
                    {loadingDemo?"⏳ reading…":"↑ Import from screenshot"}
                  </span>
                )}
              </div>
              {demographics.length===0 && <div style={{fontSize:11,color:DIM2,fontStyle:"italic",paddingBottom:8}}>{readOnly?"No demographics recorded.":"Import a screenshot or add manually."}</div>}
              <div style={{maxWidth:480}}>
                {demographics.map((d,i)=>{
                  const pct=parseFloat(d.pct)||0;
                  return (
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        {readOnly
                          ? <span style={{fontSize:12,fontWeight:600,color:DARK,flex:1}}>{d.title||"—"}</span>
                          : <input value={d.title} placeholder="Job title" onChange={e=>updateDemo(i,"title",e.target.value)} style={{flex:1,fontSize:12,fontWeight:600,color:DARK,background:"transparent",border:"none",outline:"none",fontFamily:"DM Sans",padding:0}}/>}
                        {readOnly
                          ? <span style={{fontSize:12,color:DIM,fontFamily:"DM Mono",minWidth:42,textAlign:"right"}}>{d.pct?d.pct+"%":"—"}</span>
                          : <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <input type="number" value={d.pct} placeholder="0" onChange={e=>updateDemo(i,"pct",e.target.value)} style={{width:44,fontSize:12,color:DARK,background:TLIGHT,border:`1px solid ${TMED}`,borderRadius:5,padding:"2px 5px",textAlign:"right",fontFamily:"DM Mono"}}/>
                              <span style={{fontSize:11,color:DIM}}>%</span>
                              <button onClick={()=>removeDemo(i)} style={{background:"none",border:"none",cursor:"pointer",color:DIM2,fontSize:14,padding:"0 2px",lineHeight:1}}>×</button>
                            </div>}
                      </div>
                      <div style={{height:5,borderRadius:3,background:BRD,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${max>0?(pct/max*100):0}%`,background:T,borderRadius:3,transition:"width .3s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!readOnly && <button onClick={addDemo} style={{marginTop:6,background:TLIGHT,border:`1px dashed ${TMED}`,color:T,borderRadius:6,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans"}}>+ Add row</button>}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function TrackerTable({posts, onUpdate, onClearRow, onClearSheet, readOnly}) {
  const [loadSlot,setLoadSlot]   = useState(null);
  const [loadDemoSlot,setLoadDemoSlot] = useState(null);
  const [pasteLoadSlot,setPasteLoadSlot] = useState(null);
  const [flashSlot,setFlashSlot] = useState(null);
  const [hoverRow,setHoverRow]   = useState(null);
  const hoverRowRef = useRef(null);
  const [sortKey,setSortKey]     = useState(null);
  const [sortDir,setSortDir]     = useState("desc");
  const [filterFilled,setFilterFilled] = useState(false);
  const [editingLink,setEditingLink] = useState(null);
  const thumbHoverRef = useRef(null);

  // keep ref in sync so paste handler always has latest
  useEffect(()=>{ hoverRowRef.current = hoverRow; },[hoverRow]);

  const fillAutoFromImage = async(file, ri) => {
    if(readOnly) return;
    setPasteLoadSlot(ri);
    try {
      const b64full = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
      const b64 = b64full.split(",")[1];
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Look at this image. Determine if it shows (A) LinkedIn post performance stats with numbers like impressions/reactions, (B) LinkedIn job title demographics with a list of job titles and percentages, or (C) something else like a post image, photo or screenshot. Return ONLY JSON:\n\nIf post stats: {"type":"stats","impressions":number,"membersReached":number,"profileViewers":number,"followersGained":number,"reactions":number,"comments":number,"reposts":number,"saves":number,"sends":number}\n\nIf job titles: {"type":"demographics","items":[{"title":"Software Engineer","pct":13.8}]}\n\nIf neither: {"type":"thumbnail"}'}]}]})});
      const d = await resp.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"{}";
      const p = JSON.parse(txt.replace(/```json|```/g,"").trim());
      if(p.type==="demographics") {
        onUpdate(ri,{demographics:p.items||[]});
      } else if(p.type==="thumbnail") {
        onUpdate(ri,{thumbnail:b64full});
      } else {
        const keys=["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"];
        onUpdate(ri, keys.reduce((a,k)=>({...a,...(p[k]!=null&&{[k]:p[k]})}),{}));
      }
      setFlashSlot(ri); setTimeout(()=>setFlashSlot(null),1800);
    } catch(e){console.error(e);}
    setPasteLoadSlot(null);
  };

  // Global paste listener
  useEffect(()=>{
    if(readOnly) return;
    const handlePaste = e => {
      const thumbRi = thumbHoverRef.current;
      const ri = hoverRowRef.current;
      const items = Array.from(e.clipboardData?.items||[]);
      const imgItem = items.find(i=>i.type.startsWith("image/"));
      if(!imgItem) return;
      // If hovering the thumbnail zone — always save as thumbnail, no AI needed
      if(thumbRi!==null&&thumbRi!==undefined) {
        e.preventDefault();
        const file = imgItem.getAsFile();
        const reader = new FileReader();
        reader.onload = ev => onUpdate(thumbRi, {thumbnail: ev.target.result});
        reader.readAsDataURL(file);
        return;
      }
      // Otherwise use auto-detect for stats/demographics
      if(ri===null||ri===undefined) return;
      e.preventDefault();
      fillAutoFromImage(imgItem.getAsFile(), ri);
    };
    document.addEventListener("paste", handlePaste);
    return ()=>document.removeEventListener("paste", handlePaste);
  },[readOnly, onUpdate]);
  const [dragSlot,setDragSlot]   = useState(null);
  const [expanded,setExpanded]   = useState(new Set());

  const displayCols = readOnly ? COLS.filter(c=>c.key!=="upload" && c.key!=="demoupload" && c.key!=="clearRow") : COLS;
  const groups = [...new Set(displayCols.map(c=>c.group))];

  const toggleExpand = ri => setExpanded(prev=>{const s=new Set(prev);s.has(ri)?s.delete(ri):s.add(ri);return s;});

  const fillFromImage = async(file, ri) => {
    if(readOnly) return;
    setLoadSlot(ri);
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Extract LinkedIn post stats. Return ONLY JSON: {"impressions":number,"membersReached":number,"profileViewers":number,"followersGained":number,"reactions":number,"comments":number,"reposts":number,"saves":number,"sends":number}'}]}]})});
      const d = await resp.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"{}";
      const p = JSON.parse(txt.replace(/```json|```/g,"").trim());
      const keys=["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"];
      onUpdate(ri, keys.reduce((a,k)=>({...a,...(p[k]!=null&&{[k]:p[k]})}),{}));
      setFlashSlot(ri); setTimeout(()=>setFlashSlot(null),1800);
    } catch(e){console.error(e);}
    setLoadSlot(null);
  };

  const pick = ri => { const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{if(e.target.files[0])fillFromImage(e.target.files[0],ri);};i.click(); };

  const fillDemoFromImage = async(file, ri) => {
    if(readOnly) return;
    setLoadDemoSlot(ri);
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Extract job title demographics from this LinkedIn analytics screenshot. Return ONLY JSON: {"items":[{"title":"Software Engineer","pct":13.8},{"title":"Founder","pct":4.4},...]} Include all visible job titles with their percentages.'}]}]})});
      const d = await resp.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"{}";
      const p = JSON.parse(txt.replace(/```json|```/g,"").trim());
      if(p.items) {
        onUpdate(ri,{demographics:p.items});
        setFlashSlot(ri); setTimeout(()=>setFlashSlot(null),1800);
      }
    } catch(e){console.error(e);}
    setLoadDemoSlot(null);
  };

  const pickDemo = ri => { const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>{if(e.target.files[0])fillDemoFromImage(e.target.files[0],ri);};i.click(); };

  const totals = posts.reduce((acc,r)=>{
    ["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].forEach(k=>{acc[k]=(acc[k]||0)+(parseFloat(r[k])||0);});
    return acc;
  },{});
  const eng = ["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(totals[k]||0),0);
  const totEngRate  = totals.impressions>0?(eng/totals.impressions*100).toFixed(2)+"%":"—";
  const totReachRate= totals.impressions>0?((totals.membersReached/totals.impressions)*100).toFixed(1)+"%":"—";

  // Sort & filter
  const SORT_OPTIONS = [
    {key:"impressions",label:"Impressions"},
    {key:"engRate",label:"Eng. Rate"},
    {key:"reactions",label:"Reactions"},
    {key:"date",label:"Date"},
  ];

  const cycleSort = key => {
    if(sortKey===key) { sortDir==="desc"?setSortDir("asc"):setSortKey(null); }
    else { setSortKey(key); setSortDir("desc"); }
  };

  let displayPosts = posts.map((r,i)=>({...r,_origIdx:i}));
  if(filterFilled) displayPosts = displayPosts.filter(r=>parseFloat(r.impressions)>0);
  if(sortKey) displayPosts = [...displayPosts].sort((a,b)=>{
    let av = sortKey==="engRate" ? parseFloat(a.engRate)||0 : sortKey==="date" ? (a.date||"") : parseFloat(a[sortKey])||0;
    let bv = sortKey==="engRate" ? parseFloat(b.engRate)||0 : sortKey==="date" ? (b.date||"") : parseFloat(b[sortKey])||0;
    return sortDir==="desc" ? (bv>av?1:-1) : (av>bv?1:-1);
  });

  return (
    <div>
      {!readOnly && <div style={{fontSize:11,color:DIM,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>📋</span> Hover any row + <kbd style={{background:BRD,border:`1px solid ${BRD2}`,borderRadius:4,padding:"1px 5px",fontSize:10,fontFamily:"DM Mono",color:DARK}}>Ctrl+V</kbd> to auto-fill stats or demographics. Hover the <strong>📷 thumbnail box</strong> + paste to set a post image.</div>}

      {/* Sort / Filter toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontWeight:600,color:DIM,letterSpacing:".5px"}}>SORT BY</span>
        {SORT_OPTIONS.map(opt=>(
          <button key={opt.key} onClick={()=>cycleSort(opt.key)}
            style={{padding:"4px 10px",fontSize:10,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"DM Sans",transition:"all .15s",
              background:sortKey===opt.key?T:SURF,
              color:sortKey===opt.key?"#fff":DIM,
              border:`1px solid ${sortKey===opt.key?T:BRD}`}}>
            {opt.label} {sortKey===opt.key?(sortDir==="desc"?"↓":"↑"):""}
          </button>
        ))}
        <div style={{width:1,height:16,background:BRD,margin:"0 4px"}}/>
        <button onClick={()=>setFilterFilled(f=>!f)}
          style={{padding:"4px 10px",fontSize:10,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"DM Sans",transition:"all .15s",
            background:filterFilled?T:SURF,color:filterFilled?"#fff":DIM,border:`1px solid ${filterFilled?T:BRD}`}}>
          {filterFilled?"Filled only ✓":"Show all"}
        </button>
        {(sortKey||filterFilled) && (
          <button onClick={()=>{setSortKey(null);setFilterFilled(false);}}
            style={{padding:"4px 8px",fontSize:10,color:DIM,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>
            Clear
          </button>
        )}
        {!readOnly && (
          <>
            <div style={{flex:1}}/>
            <button onClick={onClearSheet}
              style={{padding:"4px 12px",fontSize:10,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"DM Sans",background:"rgba(200,60,60,0.07)",border:"1px solid rgba(200,60,60,0.2)",color:"#c03c3c",transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(200,60,60,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(200,60,60,0.07)"}>
              🗑 Clear month
            </button>
          </>
        )}
      </div>

      <div style={{overflowX:"auto",borderRadius:10,border:`1px solid ${BRD}`,boxShadow:"0 1px 4px rgba(66,70,81,0.06)"}}>
      <table style={{borderCollapse:"collapse",fontSize:11,width:"100%"}}>
        <thead>
          <tr>
            {groups.map(g=>{
              const cols=displayCols.filter(c=>c.group===g);
              return <th key={g} colSpan={cols.length} style={{background:GC[g],color:"rgba(255,255,255,0.9)",padding:"6px 6px",fontSize:8.5,fontWeight:700,letterSpacing:"1.3px",textAlign:"center",borderRight:`1px solid rgba(255,255,255,0.15)`}}>{g}</th>;
            })}
          </tr>
          <tr>
            {displayCols.map(c=>(
              <th key={c.key} style={{background:TLIGHT,color:DARK,padding:"8px 5px",fontWeight:600,fontSize:9.5,textAlign:"center",whiteSpace:"nowrap",borderRight:`1px solid ${BRD}`,borderBottom:`2px solid ${T}`,width:c.w,minWidth:c.w}}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayPosts.map((row,_ri)=>{
            const ri = row._origIdx;
            const rowBg = ri%2===0?SURF:BG;
            const isExpanded = expanded.has(ri);
            const hasSnaps = Object.values(row.snapshots||{}).some(Boolean);
            const hasDemos = (row.demographics||[]).length>0;
            const hasDetails = hasSnaps||hasDemos;
            return (
              <>
                <tr key={ri}
                  className={`post-row${flashSlot===ri?" flash-row":""}${dragSlot===ri?" drag-over":""}`}
                  onMouseEnter={()=>!readOnly&&setHoverRow(ri)}
                  onMouseLeave={()=>!readOnly&&setHoverRow(null)}
                  onDragOver={e=>{e.preventDefault();if(!readOnly)setDragSlot(ri);}}
                  onDragLeave={()=>setDragSlot(null)}
                  onDrop={e=>{e.preventDefault();setDragSlot(null);const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))fillFromImage(f,ri);}}>
                  {displayCols.map(c=>{
                    const base={background:rowBg,borderRight:`1px solid ${BRD}`,borderBottom:isExpanded?`1px solid ${TMED}`:`1px solid ${BRD}`,padding:c.type==="upload"||c.type==="details"?"4px 5px":"0 4px",height:118,textAlign:"center",minWidth:c.w,width:c.w};
                    if(c.type==="index") return (
                      <td key={c.key} style={{...base,color:DIM2,fontFamily:"DM Mono",fontSize:10}}>
                        {pasteLoadSlot===ri
                          ? <span style={{fontSize:9,color:T,fontWeight:700}}>…</span>
                          : hoverRow===ri
                            ? <span title="Hover active — paste image (Ctrl+V)" style={{fontSize:9,color:T,cursor:"default"}}>📋</span>
                            : ri+1}
                      </td>
                    );
                    if(c.type==="calc") return <td key={c.key} style={{...base,color:T,fontFamily:"DM Mono",fontSize:10.5,fontWeight:500}}>{row[c.key]||<span style={{color:BRD2}}>—</span>}</td>;
                    if(c.type==="link") {
                      const hasLink = !!row.link;
                      const isEditing = editingLink===ri;
                      const thumb = row.thumbnail;
                      const toBase64 = file => new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
                      const pickThumb = async() => {
                        const i=document.createElement("input");i.type="file";i.accept="image/*";
                        i.onchange=async e=>{if(e.target.files[0]){const b64=await toBase64(e.target.files[0]);onUpdate(ri,{thumbnail:b64});}};
                        i.click();
                      };
                      return (
                        <td key={c.key} style={{...base, padding:"3px 6px", height:44}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            {/* Thumbnail */}
                            <div
                              onClick={!readOnly?pickThumb:undefined}
                              onMouseEnter={()=>{ if(!readOnly) thumbHoverRef.current=ri; }}
                              onMouseLeave={()=>{ thumbHoverRef.current=null; }}
                              title={readOnly?"":thumb?"Hover & paste to replace, or click to upload":"Hover & paste image, or click to upload"}
                              style={{width:80,height:110,borderRadius:8,flexShrink:0,overflow:"hidden",cursor:readOnly?"default":"pointer",
                                background:thumb?"transparent":TLIGHT,border:`1px solid ${thumb?TMED:BRD}`,
                                display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all .15s"}}>
                              {thumb
                                ? <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                : !readOnly && <span style={{fontSize:14,color:TMED}}>📷</span>}
                              {thumb && !readOnly && (
                                <div onClick={e=>{e.stopPropagation();onUpdate(ri,{thumbnail:""});}}
                                  style={{position:"absolute",top:1,right:1,width:14,height:14,borderRadius:"50%",background:"rgba(66,70,81,0.75)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:9,color:"#fff",lineHeight:1}}>×</div>
                              )}
                            </div>
                            {/* Link / input */}
                            <div style={{flex:1,minWidth:0}}>
                              {isEditing ? (
                                <input autoFocus value={row.link}
                                  placeholder="linkedin.com/posts/…"
                                  onChange={e=>onUpdate(ri,{link:e.target.value})}
                                  onBlur={()=>setEditingLink(null)}
                                  onKeyDown={e=>e.key==="Enter"&&setEditingLink(null)}
                                  style={{fontSize:10,textAlign:"left",width:"100%"}}/>
                              ) : hasLink ? (
                                <div style={{display:"flex",alignItems:"center",gap:3}}>
                                  <a href={row.link.startsWith("http")?row.link:"https://"+row.link} target="_blank" rel="noopener noreferrer"
                                    style={{fontSize:10,fontWeight:600,color:T,textDecoration:"none",background:TLIGHT,border:`1px solid ${TMED}`,borderRadius:5,padding:"3px 7px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block",flex:1}}>
                                    ↗ View Post
                                  </a>
                                  {!readOnly && <span onClick={()=>setEditingLink(ri)} style={{fontSize:11,color:DIM2,cursor:"pointer",flexShrink:0}} title="Edit link">✎</span>}
                                </div>
                              ) : readOnly ? (
                                <span style={{color:BRD2,fontSize:10}}>—</span>
                              ) : (
                                <input value={row.link} placeholder="linkedin.com/…"
                                  onChange={e=>onUpdate(ri,{link:e.target.value})}
                                  style={{fontSize:10,textAlign:"left"}}/>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    }
                    if(c.type==="clearrow") return (
                      <td key={c.key} style={{...base, padding:"0 4px"}}>
                        {(row.impressions||row.date||row.link||row.thumbnail||(row.demographics||[]).length>0) ? (
                          <span onClick={()=>onClearRow(ri)}
                            title="Clear this row"
                            style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:5,background:"rgba(200,60,60,0.07)",border:"1px solid rgba(200,60,60,0.2)",color:"#c03c3c",fontSize:12,margin:"0 auto",transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,60,60,0.15)";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(200,60,60,0.07)";}}>
                            ×
                          </span>
                        ) : <span style={{color:BRD2,fontSize:10,display:"block",textAlign:"center"}}>—</span>}
                      </td>
                    );
                    if(c.type==="upload") return <td key={c.key} style={base}>{loadSlot===ri?<span className="ubtn loading">⏳ reading…</span>:<span className="ubtn" onClick={()=>pick(ri)}>↑ Upload</span>}</td>;
                    if(c.type==="dtitle") {
                      const idx = parseInt(c.key.slice(1));
                      const d = (row.demographics||[])[idx];
                      return (
                        <td key={c.key} style={{...base, padding:"0 8px"}}>
                          {d ? (
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                              <span style={{fontSize:10,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,fontFamily:"DM Sans"}}>{d.title}</span>
                              <span style={{fontSize:10,fontWeight:700,color:T,fontFamily:"DM Mono",flexShrink:0,background:TLIGHT,padding:"1px 5px",borderRadius:3}}>{d.pct}%</span>
                            </div>
                          ) : <span style={{color:BRD2,fontSize:10}}>—</span>}
                        </td>
                      );
                    }
                    if(c.type==="details") return (
                      <td key={c.key} style={base}>
                        <span onClick={()=>toggleExpand(ri)} title="Snapshots & Job Titles" style={{cursor:"pointer",background:hasDetails?T:TLIGHT,border:`1px solid ${hasDetails?T:TMED}`,color:hasDetails?"#fff":T,borderRadius:5,padding:"3px 7px",fontSize:10,fontWeight:600,display:"inline-block",transition:"all .15s"}}>
                          {isExpanded?"▲":"▼"} {hasDetails?"•••":"···"}
                        </span>
                      </td>
                    );
                    return (
                      <td key={c.key} style={base}>
                        {readOnly
                          ? <span style={{fontFamily:"DM Mono",fontSize:11,color:row[c.key]?DARK:BRD2,padding:"0 4px"}}>{row[c.key]||"—"}</span>
                          : <input type={c.type==="num"?"number":"text"} value={row[c.key]}
                              placeholder={c.key==="date"?"YYYY-MM-DD":c.key==="time"?"HH:MM":c.key==="link"?"linkedin.com/…":""}
                              onChange={e=>onUpdate(ri,{[c.key]:e.target.value})}
                              style={{textAlign:c.type==="num"?"center":"left"}}/>}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <DetailsPanel
                    key={`${ri}-details`}
                    post={row}
                    onChange={fields=>onUpdate(ri,fields)}
                    readOnly={readOnly}
                    rowBg={rowBg}
                  />
                )}
              </>
            );
          })}
          <tr style={{borderTop:`2px solid ${T}`}}>
            {displayCols.map(c=>{
              let v="";
              if(c.key==="date") v="TOTALS";
              else if(["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].includes(c.key)) v=totals[c.key]?Math.round(totals[c.key]).toLocaleString():"—";
              else if(c.key==="reachRate") v=totReachRate;
              else if(c.key==="engRate") v=totEngRate;
              else if(c.type==="dtitle") v="";
              const isLabel = c.key==="date";
              const isNum = v && v!=="—" && !isLabel;
              return (
                <td key={c.key} style={{
                  background:TLIGHT,
                  borderRight:`1px solid ${BRD}`,
                  borderTop:`2px solid ${T}`,
                  padding:"10px 6px",
                  textAlign:"center",
                  fontFamily: isLabel?"DM Sans":"DM Sans",
                  fontWeight: 700,
                  fontSize: isLabel?10:14,
                  color: isLabel?T:DARK,
                  letterSpacing: isLabel?"1.5px":0,
                }}>
                  {v}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ─── Month Report ─────────────────────────────────────────────────────────────
const PIE_COLORS = ["#188C7E","#2aab9c","#5bc4b8","#8fd8d2","#424651","#6b6f7c"];

function StatCard({label, value, sub}) {
  return (
    <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:10,padding:"14px 18px",flex:1,minWidth:110}}>
      <div style={{fontSize:9,color:DIM,fontWeight:700,letterSpacing:".8px",marginBottom:4}}>{label.toUpperCase()}</div>
      <div style={{fontSize:22,fontWeight:700,color:T,fontFamily:"DM Mono",lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:10,color:DIM,marginTop:4}}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({active, payload, label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:8,padding:"8px 12px",fontSize:11,boxShadow:"0 2px 8px rgba(66,70,81,0.12)"}}>
      <div style={{fontWeight:600,color:DARK,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||T,fontFamily:"DM Mono"}}>{p.name}: {typeof p.value==="number"?p.value.toLocaleString():p.value}</div>
      ))}
    </div>
  );
};

function MonthReport({posts, month, year}) {
  const isMobile = useIsMobile();
  const filled = posts.filter(r=>parseFloat(r.impressions)>0);
  if(filled.length===0) return (
    <div style={{textAlign:"center",padding:"60px 24px",color:DIM}}>
      <div style={{fontSize:32,marginBottom:12}}>📭</div>
      <div style={{fontSize:14,fontWeight:600,color:DARK}}>No data for {month} {year}</div>
      <div style={{fontSize:12,marginTop:6}}>Add post stats in the table view to generate a report.</div>
    </div>
  );

  const totals = filled.reduce((acc,r)=>{
    ["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].forEach(k=>{acc[k]=(acc[k]||0)+(parseFloat(r[k])||0);});
    return acc;
  },{});
  const totalEng = ["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(totals[k]||0),0);
  const avgEngRate = totals.impressions>0?((totalEng/totals.impressions)*100).toFixed(2):0;
  const avgImpressions = Math.round(totals.impressions/filled.length);

  const postData = filled.map((r,i)=>({
    name: r.date ? r.date.slice(5) : `#${posts.indexOf(r)+1}`,
    impressions: parseFloat(r.impressions)||0,
    engRate: parseFloat(r.impressions)>0
      ? +((["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0)/parseFloat(r.impressions))*100).toFixed(2)
      : 0,
  }));

  const topPosts = [...filled].sort((a,b)=>(parseFloat(b.impressions)||0)-(parseFloat(a.impressions)||0)).slice(0,5);

  const engBreakdown = [
    {name:"Reactions", value:Math.round(totals.reactions||0)},
    {name:"Comments",  value:Math.round(totals.comments||0)},
    {name:"Saves",     value:Math.round(totals.saves||0)},
    {name:"Sends",     value:Math.round(totals.sends||0)},
    {name:"Reposts",   value:Math.round(totals.reposts||0)},
  ].filter(d=>d.value>0);

  const demoMap = {};
  filled.forEach(r=>(r.demographics||[]).forEach(d=>{
    const k=d.title?.trim();
    if(!k) return;
    demoMap[k]=(demoMap[k]||[]).concat(parseFloat(d.pct)||0);
  }));
  const demoData = Object.entries(demoMap)
    .map(([title,vals])=>({title, avg:+(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(1)}))
    .sort((a,b)=>b.avg-a.avg).slice(0,8);

  const pad = isMobile?"12px 16px 32px":"20px 24px 40px";
  const cardStyle = {background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:isMobile?"14px 16px":"18px 20px"};
  const sectionTitle = {fontSize:12,fontWeight:700,color:DARK,marginBottom:isMobile?10:14};

  return (
    <div style={{padding:pad}} className="report-padding">

      {/* Stat cards — 2 col on mobile, flex wrap on desktop */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:isMobile?8:10,marginBottom:isMobile?16:24}}>
        {[
          ["Posts Tracked",  filled.length,                                              `of ${PER_MONTH} slots`],
          ["Impressions",    totals.impressions?Math.round(totals.impressions).toLocaleString():"—", null],
          ["Avg / Post",     avgImpressions.toLocaleString(),                            "impressions"],
          ["Avg Eng. Rate",  avgEngRate+"%",                                             null],
          ["Reactions",      Math.round(totals.reactions||0).toLocaleString(),           null],
          ["Followers",      Math.round(totals.followersGained||0).toLocaleString(),     null],
        ].map(([label,value,sub])=>(
          <div key={label} style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:10,padding:isMobile?"10px 12px":"14px 18px"}}>
            <div style={{fontSize:9,color:DIM,fontWeight:700,letterSpacing:".8px",marginBottom:3}}>{label.toUpperCase()}</div>
            <div style={{fontSize:isMobile?18:22,fontWeight:700,color:T,fontFamily:"DM Mono",lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value}</div>
            {sub&&<div style={{fontSize:9,color:DIM,marginTop:3}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Impressions per post */}
      <div style={{...cardStyle,marginBottom:isMobile?12:16}}>
        <div style={sectionTitle}>Impressions per post</div>
        <ResponsiveContainer width="100%" height={Math.max(160, filled.length*(isMobile?18:22))}>
          <BarChart data={postData} layout="vertical" margin={{left:isMobile?0:8,right:isMobile?36:44,top:0,bottom:0}}>
            <XAxis type="number" tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:isMobile?9:10,fill:DARK}} tickLine={false} axisLine={false} width={isMobile?38:52}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="impressions" fill={T} radius={[0,4,4,0]} barSize={isMobile?10:14}>
              <LabelList dataKey="impressions" position="right" style={{fontSize:9,fill:DIM,fontFamily:"DM Mono"}} formatter={v=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement breakdown */}
      <div style={{...cardStyle,marginBottom:isMobile?12:16}}>
        <div style={sectionTitle}>Engagement breakdown</div>
        <div style={{fontSize:10,color:DIM,marginBottom:10}}>Total: {totalEng.toLocaleString()} engagements</div>
        {engBreakdown.length>0 ? (
          <div style={{display:"flex",flexDirection:isMobile?"column":"row",alignItems:isMobile?"stretch":"center",gap:16}}>
            <ResponsiveContainer width={isMobile?"100%":200} height={isMobile?160:160}>
              <PieChart>
                <Pie data={engBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2}>
                  {engBreakdown.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px 16px",flex:1}}>
              {engBreakdown.map((d,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,minWidth:isMobile?"45%":"auto"}}>
                  <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                  <span style={{color:DARK}}>{d.name}</span>
                  <span style={{color:DIM,fontFamily:"DM Mono"}}>{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <div style={{textAlign:"center",color:DIM2,padding:20,fontSize:11}}>No engagement data yet.</div>}
      </div>

      {/* Eng rate per post */}
      <div style={{...cardStyle,marginBottom:isMobile?12:16}}>
        <div style={sectionTitle}>Engagement rate per post</div>
        <ResponsiveContainer width="100%" height={isMobile?160:180}>
          <BarChart data={postData} margin={{left:0,right:isMobile?8:16,top:0,bottom:isMobile?24:20}}>
            <XAxis dataKey="name" tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0}/>
            <YAxis tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} tickFormatter={v=>v+"%"}/>
            <Tooltip content={<CustomTooltip/>} formatter={v=>v+"%"}/>
            <Bar dataKey="engRate" name="Eng. Rate" fill="#424651" radius={[3,3,0,0]} barSize={isMobile?12:16}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top posts */}
      <div style={{...cardStyle,marginBottom:isMobile?12:16}}>
        <div style={sectionTitle}>Top posts by impressions</div>
        {topPosts.map((r,i)=>{
          const eng=["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0);
          const er=parseFloat(r.impressions)>0?(eng/parseFloat(r.impressions)*100).toFixed(1):0;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<topPosts.length-1?`1px solid ${BRD}`:"none"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:i===0?T:TLIGHT,border:`1px solid ${i===0?T:TMED}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:i===0?"#fff":T,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.date||`Post ${posts.indexOf(r)+1}`}</div>
                <div style={{fontSize:10,color:DIM,marginTop:1,fontFamily:"DM Mono"}}>{parseFloat(r.impressions).toLocaleString()} impr · {er}% eng</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demographics */}
      {demoData.length>0 && (
        <div style={cardStyle}>
          <div style={sectionTitle}>Audience — job title reach</div>
          <div style={{fontSize:10,color:DIM,marginBottom:12}}>Averaged across posts with demographics data</div>
          {demoData.map((d,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:isMobile?11:12,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8}}>{d.title}</span>
                <span style={{fontSize:11,fontWeight:700,color:T,fontFamily:"DM Mono",flexShrink:0}}>{d.avg}%</span>
              </div>
              <div style={{height:6,borderRadius:3,background:BRD,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(d.avg/demoData[0].avg)*100}%`,background:T,borderRadius:3,transition:"width .4s"}}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Content & Calendar ──────────────────────────────────────────────────────

const TIMEZONES = ["UTC","Europe/London","Europe/Belgrade","Europe/Paris","America/New_York","America/Chicago","America/Los_Angeles","Australia/Sydney"];
// ── LinkedIn Post Preview Spec ──────────────────────────────────────────────
const LI_SPEC = {
  MAX_POST_CHARS:          3000,
  DESKTOP_WIDTH:           555,
  MOBILE_WIDTH:            347,
  DESKTOP_CUTOFF_CHARS:    168,
  MOBILE_CUTOFF_CHARS:     111,
  DESKTOP_CHARS_PER_LINE:  58,
  MOBILE_CHARS_PER_LINE:   39,
  IMAGE_PREVIEW_LINES:     2,
  DESKTOP_FONT:            "14px -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",
  MOBILE_FONT:             "13.5px -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",
  DESKTOP_PADDING:         32,
  MOBILE_PADDING:          24,
};

/**
 * Spec-compliant truncation:
 * 1. Normalize line endings
 * 2. Split into source lines by \n (each blank line counts as 1 visual line)
 * 3. For each non-empty source line, wrap at chars-per-line to count visual lines
 * 4. Stop after preview line limit (3 desktop / 3 mobile / 2 with image)
 * 5. Fallback: also truncate if raw chars exceed cutoff threshold
 * Layout before truncation — never truncate raw text first.
 */
function truncateToLines(text, isMobile, hasImage) {
  if (!text) return { shown: "", truncated: false };

  // Step 1: normalize
  const norm = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const cutoff   = isMobile ? LI_SPEC.MOBILE_CUTOFF_CHARS    : LI_SPEC.DESKTOP_CUTOFF_CHARS;
  const lineW    = isMobile ? LI_SPEC.MOBILE_CHARS_PER_LINE  : LI_SPEC.DESKTOP_CHARS_PER_LINE;
  const maxLines = 3;

  // Try canvas first, fall back to lineW estimate
  const ctx = (() => {
    try {
      const c = document.createElement("canvas");
      const x = c.getContext("2d");
      x.font = isMobile ? LI_SPEC.MOBILE_FONT : LI_SPEC.DESKTOP_FONT;
      return x;
    } catch(e) { return null; }
  })();

  const textW = (isMobile ? LI_SPEC.MOBILE_WIDTH : LI_SPEC.DESKTOP_WIDTH)
              - (isMobile ? LI_SPEC.MOBILE_PADDING : LI_SPEC.DESKTOP_PADDING);

  // Wrap a single non-empty source line → array of visual sub-lines
  function wrapSourceLine(src) {
    if (!src) return [""];
    if (ctx) {
      const words = src.split(" ");
      const lines = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (ctx.measureText(test).width > textW && cur) {
          lines.push(cur); cur = w;
        } else { cur = test; }
      }
      if (cur) lines.push(cur);
      return lines;
    }
    // Fallback: split by estimated chars per line
    const lines = [];
    for (let i = 0; i < src.length; i += lineW) lines.push(src.slice(i, i + lineW));
    return lines.length ? lines : [src];
  }

  // Step 2-4: iterate source lines, count visual lines
  const srcLines = norm.split("\n");
  const shownSrcLines = [];
  let visualCount = 0;
  let truncated = false;

  for (let si = 0; si < srcLines.length; si++) {
    const sl = srcLines[si];

    if (sl === "") {
      visualCount++;
      if (visualCount > maxLines) { truncated = true; break; }
      shownSrcLines.push("");
      continue;
    }

    const subLines = wrapSourceLine(sl);
    let fitsCount = 0;
    for (let vi = 0; vi < subLines.length; vi++) {
      visualCount++;
      if (visualCount > maxLines) { truncated = true; break; }
      fitsCount++;
    }
    if (truncated) {
      // Add partial source line (only the sub-lines that fit)
      if (fitsCount > 0) shownSrcLines.push(subLines.slice(0, fitsCount).join(" "));
      break;
    }
    shownSrcLines.push(sl);
  }

  // Step 5: fallback char threshold (secondary guardrail)
  if (!truncated && norm.length > cutoff) {
    return { shown: norm.slice(0, cutoff).trimEnd(), truncated: true };
  }

  if (!truncated) return { shown: norm, truncated: false };
  return { shown: shownSrcLines.join("\n").trimEnd(), truncated: true };
}


const emptyContent = () => ({id:uid6(),text:"",media:[],source:"",adminNote:"",status:"draft",clientComment:"",scheduledDate:"",scheduledTime:"",timezone:"Europe/Belgrade",createdAt:new Date().toISOString()});

// ── LinkedIn text renderer (hashtags + links in blue) ──
function LiText({t}) {
  if(!t) return <span style={{color:DIM2,fontStyle:"italic"}}>Post copy will appear here…</span>;
  return t.split(/(#\w+|https?:\/\/\S+)/g).map((p,i)=>
    (p.startsWith("#")||p.startsWith("http"))
      ? <span key={i} style={{color:"#0a66c2"}}>{p}</span>
      : <span key={i}>{p}</span>
  );
}

// ── Action icons ──
const LikeIcon   = ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>;
const CommentIcon= ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const RepostIcon = ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
const SendIcon   = ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

// ── LinkedIn Media Preview (spec-compliant) ────────────────────────────────

const LI_AR = { MAX_IMG:3/1, MIN_IMG:4/5, VID_MAX:2.4/1, VID_MIN:1/2.4 };

function detectMode(media) {
  if(!media||!media.length) return null;
  if(media.some(m=>m.type==="video"))  return "single_video";
  if(media.some(m=>m.type==="pdf"))    return "document_carousel";
  if(media.length===1)                 return "single_image";
  return "multi_image_grid";
}

function LiSingleImage({src, feedW}) {
  const [ratio, setRatio] = useState(16/9);
  useEffect(()=>{
    if(!src) return;
    const img = new Image();
    img.onload = ()=>setRatio(img.naturalWidth/img.naturalHeight);
    img.src = src;
  },[src]);
  const clamped = Math.min(LI_AR.MAX_IMG, Math.max(LI_AR.MIN_IMG, ratio));
  return (
    <div style={{width:"100%",height:Math.round(feedW/clamped),overflow:"hidden",background:"#000"}}>
      <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",display:"block"}}/>
    </div>
  );
}

function LiMultiImageGrid({media, feedW}) {
  const images = media.slice(0,20);
  const n = images.length;
  const gap = 2;
  const maxH = Math.round(feedW / LI_AR.MIN_IMG); // 4:5 bound
  const [firstRatio, setFirstRatio] = useState(16/9);
  useEffect(()=>{
    if(!images[0]?.src) return;
    const img = new Image();
    img.onload = ()=>setFirstRatio(img.naturalWidth/img.naturalHeight);
    img.src = images[0].src;
  },[images[0]?.src]);

  if(n===1) return <LiSingleImage src={images[0].src} feedW={feedW}/>;

  const ImgCell = ({src, style, extra})=>(
    <div style={{overflow:"hidden",position:"relative",...style}}>
      <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",display:"block"}}/>
      {extra}
    </div>
  );

  if(n===2) {
    const h = Math.min(Math.round(feedW/2/Math.max(LI_AR.MIN_IMG, firstRatio)), maxH);
    return <div style={{display:"flex",gap,width:"100%",height:h,background:"#000"}}>
      {images.map((m,i)=><ImgCell key={i} src={m.src} style={{flex:1,height:"100%"}}/>)}
    </div>;
  }

  const firstIsPortrait = firstRatio < 4/3;
  const rest = images.slice(1);

  if(firstIsPortrait) {
    const totalH = Math.min(maxH, Math.round(feedW*0.75));
    const leftW = Math.round(feedW*0.55);
    return (
      <div style={{display:"flex",gap,width:"100%",height:totalH,background:"#000",overflow:"hidden"}}>
        <ImgCell src={images[0].src} style={{width:leftW,height:"100%",flexShrink:0}}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap,overflow:"hidden"}}>
          {rest.slice(0,4).map((m,i)=>(
            <ImgCell key={i} src={m.src} style={{flex:1}}
              extra={i===3&&rest.length>4
                ? <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:700}}>+{rest.length-4}</div>
                : null}/>
          ))}
        </div>
      </div>
    );
  } else {
    const totalH = Math.min(maxH, Math.round(feedW*0.85));
    const topH = Math.round(totalH*0.6);
    const botH = totalH - topH - gap;
    return (
      <div style={{display:"flex",flexDirection:"column",gap,width:"100%",background:"#000",overflow:"hidden"}}>
        <ImgCell src={images[0].src} style={{width:"100%",height:topH}}/>
        <div style={{display:"flex",gap,height:botH,overflow:"hidden"}}>
          {rest.slice(0,3).map((m,i)=>(
            <ImgCell key={i} src={m.src} style={{flex:1,height:"100%"}}
              extra={i===2&&rest.length>3
                ? <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:700}}>+{rest.length-3}</div>
                : null}/>
          ))}
        </div>
      </div>
    );
  }
}

function LiSingleVideo({src, mimeType, feedW}) {
  const [ratio, setRatio] = useState(16/9);
  useEffect(()=>{
    if(!src) return;
    const v = document.createElement("video");
    v.onloadedmetadata = ()=>{ if(v.videoWidth&&v.videoHeight) setRatio(v.videoWidth/v.videoHeight); };
    v.src = src;
  },[src]);
  const clamped = Math.min(LI_AR.VID_MAX, Math.max(LI_AR.VID_MIN, ratio));
  const type = mimeType || "video/mp4";
  return (
    <div style={{width:"100%",height:Math.round(feedW/clamped),background:"#000",overflow:"hidden",position:"relative"}}>
      <video controls style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}>
        <source src={src} type={type}/>
        Your browser does not support this video format.
      </video>
    </div>
  );
}

function LiDocumentCarousel({media, feedW}) {
  const [slide, setSlide] = useState(0);
  const doc = media.find(m=>m.type==="pdf");
  if(!doc) return null;
  const pages = doc.pages||(doc.src?[{src:doc.src}]:[]);
  const total = Math.min(Math.max(pages.length,1), 300);
  const vpRatio = doc.pageRatio||(4/3);
  const vpH = Math.round(feedW/vpRatio);
  const cur = pages[Math.min(slide,pages.length-1)];
  return (
    <div style={{width:"100%",background:"#f3f2ef",overflow:"hidden",borderTop:"1px solid #e0dfdd",borderBottom:"1px solid #e0dfdd"}}>
      <div style={{width:"100%",height:vpH,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {cur?.src
          ? <img src={cur.src} alt="" style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}/>
          : <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:24,textAlign:"center"}}>
              <div style={{fontSize:48}}>📄</div>
              <div style={{fontSize:13,fontWeight:600,color:DARK,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name||"Document"}</div>
              <div style={{fontSize:11,color:DIM}}>Page {slide+1} of {total}</div>
            </div>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderTop:"1px solid #e0dfdd"}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:feedW-110}}>{doc.name||"Document"}</div>
          <div style={{fontSize:11,color:DIM,marginTop:1}}>{total} page{total!==1?"s":""}</div>
        </div>
        {total>1&&(
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <button onClick={()=>setSlide(s=>Math.max(0,s-1))} disabled={slide===0} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #ccc",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",opacity:slide===0?.35:1}}>‹</button>
            <span style={{fontSize:10,color:DIM,fontFamily:"DM Mono",minWidth:32,textAlign:"center"}}>{slide+1}/{total}</span>
            <button onClick={()=>setSlide(s=>Math.min(total-1,s+1))} disabled={slide===total-1} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #ccc",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",opacity:slide===total-1?.35:1}}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LiMediaBlock({media, isMobile}) {
  if(!media||!media.length) return null;
  const feedW = isMobile ? LI_SPEC.MOBILE_WIDTH : LI_SPEC.DESKTOP_WIDTH;
  const mode  = detectMode(media);
  return (
    <div style={{width:"100%",overflow:"hidden"}}>
      {mode==="single_image"      && <LiSingleImage     src={media[0].src}                        feedW={feedW}/>}
      {mode==="multi_image_grid"  && <LiMultiImageGrid  media={media}                             feedW={feedW}/>}
      {mode==="single_video"      && <LiSingleVideo     src={media.find(m=>m.type==="video")?.src} mimeType={media.find(m=>m.type==="video")?.mimeType} feedW={feedW}/>}
      {mode==="document_carousel" && <LiDocumentCarousel media={media}                            feedW={feedW}/>}
    </div>
  );
}

// ── The LinkedIn post mockup ──
function LinkedInPost({text, media, displayName, tagline, isMobile}) {
  const [expanded, setExpanded] = useState(false);
  const hasImage = (media||[]).length > 0;
  const { shown: collapsedText, truncated } = truncateToLines(text||"", isMobile, hasImage);
  const displayText = expanded ? (text||"") : collapsedText;
  const needsMore   = !expanded && truncated;
  const cardW = isMobile ? LI_SPEC.MOBILE_WIDTH : LI_SPEC.DESKTOP_WIDTH;

  return (
    <div style={{width:cardW,maxWidth:"100%",margin:"0 auto",background:"#fff",borderRadius:8,border:"1px solid #e0dfdd",fontFamily:"-apple-system,system-ui,'Segoe UI',Roboto,sans-serif",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
      {/* Header */}
      <div style={{padding:isMobile?"12px 12px 6px":"14px 16px 6px",display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:isMobile?40:48,height:isMobile?40:48,borderRadius:"50%",background:"linear-gradient(135deg,#188C7E,#0a5c54)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:isMobile?15:18,border:"2px solid #eee"}}>
          {(displayName||"?").trim().split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:isMobile?13:14,fontWeight:700,color:"#000",lineHeight:1.2}}>{displayName||"Client Name"}</div>
              <div style={{fontSize:isMobile?11:12,color:"#666",marginTop:1,maxWidth:isMobile?155:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>{tagline||"LinkedIn Member"}</div>
              <div style={{fontSize:isMobile?10:11,color:"#666",marginTop:2,display:"flex",alignItems:"center",gap:3}}>
                12h •&nbsp;<svg width={12} height={12} viewBox="0 0 24 24" fill="#666"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button style={{padding:"4px 12px",border:"1px solid #0a66c2",borderRadius:16,color:"#0a66c2",background:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:600,whiteSpace:"nowrap"}}>+  Follow</button>
              <span style={{fontSize:18,color:"#666",cursor:"pointer",lineHeight:1}}>···</span>
            </div>
          </div>
        </div>
      </div>
      {/* Text */}
      <div style={{padding:isMobile?"2px 12px 8px":"2px 16px 10px"}}>
        <div style={{fontSize:isMobile?13.5:14,color:"#000",lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
          <LiText t={displayText}/>
          {needsMore&&(
            isMobile
              ? <span style={{display:"block",textAlign:"right",marginTop:2}}>
                  <span style={{color:"#666",cursor:"pointer",fontWeight:600}} onClick={()=>setExpanded(true)}>…more</span>
                </span>
              : <span>
                  &nbsp;&nbsp;<span style={{color:"#666",cursor:"pointer",fontWeight:600}} onClick={()=>setExpanded(true)}>…more</span>
                </span>
          )}
          {expanded&&truncated&&(
            <span>&nbsp;&nbsp;<span style={{color:"#666",cursor:"pointer",fontWeight:600}} onClick={()=>setExpanded(false)}>…less</span></span>
          )}
        </div>
      </div>
      {/* Media */}
      <LiMediaBlock media={media} isMobile={isMobile}/>
      {/* Counts */}
      <div style={{padding:isMobile?"6px 12px":"6px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e0dfdd"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,fontSize:isMobile?11:12,color:"#666"}}>
          <span>👍❤️</span><span> 57</span>
        </div>
        <div style={{fontSize:isMobile?11:12,color:"#666"}}>24 comments  •  6 reposts</div>
      </div>
      {/* Actions */}
      <div style={{display:"flex",padding:isMobile?"0 4px":"0 6px"}}>
        {[[LikeIcon,"Like"],[CommentIcon,"Comment"],[RepostIcon,"Repost"],[SendIcon,"Send"]].map(([Icon,label])=>(
          <button key={label} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 0",flex:1,justifyContent:"center",border:"none",background:"none",cursor:"pointer",fontSize:isMobile?11:13,color:"#666",fontWeight:600,borderRadius:4,fontFamily:"inherit"}}>
            <Icon/>{!isMobile&&label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ContentCard ──
function ContentCard({item, readOnly, onUpdate, onDelete, displayName, tagline}) {
  const [isMobile,setIsMobile] = useState(false);
  const [schedOpen,setSchedOpen] = useState(false);
  const [commentDraft,setCommentDraft] = useState(item.clientComment||"");
  const isPending=item.status==="pending", isApproved=item.status==="approved", isRejected=item.status==="rejected";
  const fileRef = useRef(null);

  const statusColor = {pending:"#B07A00",approved:T,rejected:"#c03c3c",draft:DIM}[item.status]||DIM;
  const statusBg    = {pending:"#FFF8E7",approved:TLIGHT,rejected:"#FEF0F0",draft:"#f4f0ee"}[item.status]||"#f4f0ee";
  const statusLabel = {pending:"Awaiting Approval",approved:"Approved ✓",rejected:"Changes Requested — Edit & Resubmit",draft:"Draft"}[item.status]||"Draft";

  const toBase64 = f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});

  const addMedia = async(files) => {
    const next = [...(item.media||[])];
    for(const f of Array.from(files)){
      const type = f.type.startsWith("video")?"video":f.type==="application/pdf"?"pdf":"image";
      if(type==="video") {
        const src = URL.createObjectURL(f);
        next.push({src, type, name:f.name, mimeType:f.type||"video/mp4"});
      } else {
        const src = await toBase64(f);
        next.push({src, type, name:f.name});
      }
    }
    onUpdate({media:next});
  };

  const removeMedia = idx => { const m=[...(item.media||[])];m.splice(idx,1);onUpdate({media:m}); };

  return (
    <div style={{background:SURF,border:`1.5px solid ${isApproved?T:isPending?"#E8C84A":isRejected?"#e8a4a4":BRD}`,borderRadius:14,overflow:"hidden",marginBottom:18,boxShadow:"0 1px 6px rgba(66,70,81,0.07)"}}>

      {/* ── Status bar ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:`1px solid ${BRD}`,background:statusBg,flexWrap:"wrap"}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:".8px",color:statusColor,background:"rgba(255,255,255,0.6)",padding:"2px 8px",borderRadius:4}}>{statusLabel.toUpperCase()}</span>
        {item.scheduledDate&&<span style={{fontSize:10,color:DIM,fontFamily:"DM Mono"}}>📅 {item.scheduledDate}{item.scheduledTime&&" at "+item.scheduledTime}{item.timezone&&" ("+item.timezone.split("/").pop()+")"}</span>}
        <div style={{flex:1}}/>
        {/* Device toggle */}
        <div style={{display:"flex",background:"rgba(255,255,255,0.7)",border:`1px solid ${BRD}`,borderRadius:6,padding:2,gap:1}}>
          <button onClick={()=>setIsMobile(false)} style={{padding:"3px 10px",fontSize:10,fontWeight:600,border:"none",borderRadius:4,cursor:"pointer",background:!isMobile?DARK:"transparent",color:!isMobile?"#fff":DIM,fontFamily:"DM Sans"}}>🖥</button>
          <button onClick={()=>setIsMobile(true)}  style={{padding:"3px 10px",fontSize:10,fontWeight:600,border:"none",borderRadius:4,cursor:"pointer",background:isMobile?DARK:"transparent",color:isMobile?"#fff":DIM,fontFamily:"DM Sans"}}>📱</button>
        </div>
        {/* Admin controls */}
        {!readOnly&&<div style={{display:"flex",gap:6}}>
          {item.status==="draft"&&<button onClick={()=>onUpdate({status:"pending"})} className="btn btn-primary" style={{padding:"3px 10px",fontSize:10}}>Send for Approval</button>}
          {item.status==="pending"&&<button onClick={()=>onUpdate({status:"draft"})} style={{padding:"3px 8px",fontSize:10,background:"none",border:`1px solid ${BRD}`,borderRadius:5,cursor:"pointer",color:DIM,fontFamily:"DM Sans"}}>Recall</button>}
          {item.status==="approved"&&<button onClick={()=>onUpdate({status:"draft"})} style={{padding:"3px 8px",fontSize:10,background:"none",border:`1px solid ${BRD}`,borderRadius:5,cursor:"pointer",color:DIM,fontFamily:"DM Sans"}}>Reopen</button>}
          {item.status==="rejected"&&<button onClick={()=>onUpdate({status:"pending",clientComment:item.clientComment})} className="btn btn-primary" style={{padding:"3px 10px",fontSize:10}}>↺ Resubmit for Approval</button>}
          {item.status==="rejected"&&<button onClick={()=>onUpdate({status:"draft"})} style={{padding:"3px 8px",fontSize:10,background:"none",border:`1px solid ${BRD}`,borderRadius:5,cursor:"pointer",color:DIM,fontFamily:"DM Sans"}}>Back to Draft</button>}
          <button onClick={()=>onDelete()} style={{padding:"3px 8px",fontSize:10,background:"none",border:"1px solid rgba(200,60,60,0.2)",borderRadius:5,cursor:"pointer",color:"#c03c3c",fontFamily:"DM Sans"}}>Delete</button>
        </div>}
      </div>

      {/* ── LinkedIn preview ── */}
      <div style={{background:"#F0EDEA",padding:isMobile?"16px 12px":"20px 24px",display:"flex",justifyContent:"center"}}>
        <LinkedInPost text={item.text} media={item.media||[]} displayName={displayName} tagline={tagline} isMobile={isMobile}/>
      </div>

      {/* ── Admin note (visible to client if set) ── */}
      {item.adminNote&&(
        <div style={{margin:"0 16px",marginTop:12,background:"#FFFDF0",border:"1px solid #F0E080",borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#B07A00",letterSpacing:".6px",marginBottom:4}}>NOTE FROM MARGIN STANDARDS</div>
          {readOnly
            ? <div style={{fontSize:12,color:DARK,lineHeight:1.5}}>{item.adminNote}</div>
            : <textarea value={item.adminNote} onChange={e=>onUpdate({adminNote:e.target.value})} placeholder="Leave a note for the client…" style={{width:"100%",background:"transparent",border:"none",outline:"none",resize:"vertical",fontFamily:"DM Sans",fontSize:12,color:DARK,lineHeight:1.5,padding:0,minHeight:36}}/>
          }
        </div>
      )}
      {!readOnly&&!item.adminNote&&(
        <div style={{margin:"12px 16px 0"}}>
          <textarea value={item.adminNote} onChange={e=>onUpdate({adminNote:e.target.value})} placeholder="Add a note for the client (optional)…" style={{width:"100%",background:BG,border:`1px solid ${BRD}`,borderRadius:8,padding:"8px 10px",resize:"vertical",fontFamily:"DM Sans",fontSize:12,color:DARK,lineHeight:1.5,minHeight:34,outline:"none"}}/>
        </div>
      )}

      {/* ── Source ── */}
      {(item.source||!readOnly)&&(
        <div style={{padding:"8px 16px 0",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,fontWeight:600,color:DIM,flexShrink:0}}>SOURCE</span>
          {readOnly
            ? item.source?<a href={item.source.startsWith("http")?item.source:"https://"+item.source} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:T,textDecoration:"none"}}>↗ {item.source}</a>:<span style={{fontSize:11,color:DIM2}}>—</span>
            : <input value={item.source} onChange={e=>onUpdate({source:e.target.value})} placeholder="URL or article source…" style={{flex:1,fontSize:11,color:DARK,background:BG,border:`1px solid ${BRD}`,borderRadius:5,padding:"3px 7px",fontFamily:"DM Sans",outline:"none"}}/>
          }
        </div>
      )}

      {/* ── Admin: edit copy + media ── */}
      {!readOnly&&(
        <div style={{padding:"12px 16px",borderTop:`1px solid ${BRD}`,marginTop:12}}>
          <div style={{fontSize:10,fontWeight:700,color:DIM,letterSpacing:".6px",marginBottom:6}}>POST COPY</div>
          <textarea value={item.text} onChange={e=>onUpdate({text:e.target.value})} placeholder="Write post copy here…" rows={5} style={{width:"100%",background:SURF,border:`1px solid ${BRD}`,borderRadius:8,padding:"9px 12px",resize:"vertical",fontFamily:"DM Sans",fontSize:13,color:DARK,lineHeight:1.6,outline:"none"}}/>
          <div style={{fontSize:10,color:(item.text||"").length>LI_SPEC.MAX_POST_CHARS?"#c03c3c":(item.text||"").length>2500?"#B07A00":DIM,textAlign:"right",marginTop:3,fontFamily:"DM Mono"}}>
            {(item.text||"").length.toLocaleString()} / {LI_SPEC.MAX_POST_CHARS.toLocaleString()}{(item.text||"").length>LI_SPEC.MAX_POST_CHARS?" — over limit!":""}
          </div>

          <div style={{fontSize:10,fontWeight:700,color:DIM,letterSpacing:".6px",marginTop:12,marginBottom:6}}>MEDIA</div>
          {(item.media||[]).length>0&&(
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              {(item.media||[]).map((m,i)=>(
                <div key={i} style={{position:"relative",width:60,height:60,borderRadius:6,overflow:"hidden",border:`1px solid ${BRD}`,background:"#f3f2ef",flexShrink:0}}>
                  {m.type==="image"&&<img src={m.src} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                  {m.type==="video"&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🎥</div>}
                  {m.type==="pdf"&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📄</div>}
                  <div onClick={()=>removeMedia(i)} style={{position:"absolute",top:1,right:1,width:16,height:16,borderRadius:"50%",background:"rgba(66,70,81,0.8)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:10,color:"#fff"}}>×</div>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*,video/mp4,video/mov,video/avi,video/webm,video/quicktime,.pdf" multiple ref={fileRef} style={{display:"none"}} onChange={e=>addMedia(e.target.files)}/>
          <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${TMED}`,borderRadius:8,padding:"10px",textAlign:"center",cursor:"pointer",background:TLIGHT,fontSize:11,color:T,fontWeight:600}}>
            ↑ Upload images, video or PDF (carousel)
          </div>

          {/* Schedule */}
          <div style={{marginTop:12}}>
            <button onClick={()=>setSchedOpen(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:DIM,fontFamily:"DM Sans",fontWeight:600,padding:0}}>
              {schedOpen?"▲":"▼"} Schedule settings
            </button>
            {schedOpen&&(
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8,alignItems:"flex-end"}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <span style={{fontSize:9,color:DIM,fontWeight:600}}>DATE</span>
                  <input type="date" value={item.scheduledDate} onChange={e=>onUpdate({scheduledDate:e.target.value})} className="inp" style={{padding:"5px 8px",fontSize:11,width:140}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <span style={{fontSize:9,color:DIM,fontWeight:600}}>TIME</span>
                  <input type="time" value={item.scheduledTime} onChange={e=>onUpdate({scheduledTime:e.target.value})} className="inp" style={{padding:"5px 8px",fontSize:11,width:110}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <span style={{fontSize:9,color:DIM,fontWeight:600}}>TIMEZONE</span>
                  <select value={item.timezone} onChange={e=>onUpdate({timezone:e.target.value})} className="inp" style={{padding:"5px 8px",fontSize:11,width:180}}>
                    {TIMEZONES.map(tz=><option key={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Client approval area ── */}
      <div style={{padding:"14px 16px",borderTop:`1px solid ${BRD}`,background:"#fafaf9"}}>
        {/* Client feedback box */}
        {readOnly&&(isPending||isRejected||item.clientComment)&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:isRejected?"#c03c3c":T,letterSpacing:".6px",marginBottom:6}}>YOUR FEEDBACK</div>
            <textarea
              value={commentDraft}
              onChange={e=>setCommentDraft(e.target.value)}
              onBlur={()=>onUpdate({clientComment:commentDraft})}
              placeholder={isPending?"Leave a comment or notes for changes (optional)…":"Describe what changes you'd like…"}
              rows={2}
              style={{width:"100%",border:`1px solid ${BRD}`,borderRadius:8,padding:"9px 12px",fontSize:12,color:DARK,lineHeight:1.5,resize:"vertical",background:"#fff",fontFamily:"DM Sans",outline:"none"}}
            />
          </div>
        )}
        {/* Admin sees client feedback */}
        {!readOnly&&item.clientComment&&(
          <div style={{marginBottom:12,background:isRejected?"#FEF0F0":TLIGHT,border:`1px solid ${isRejected?"rgba(200,60,60,0.2)":TMED}`,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:9,fontWeight:700,color:isRejected?"#c03c3c":T,letterSpacing:".6px",marginBottom:4}}>CLIENT FEEDBACK</div>
            <div style={{fontSize:12,color:DARK,lineHeight:1.5}}>{item.clientComment}</div>
          </div>
        )}
        {/* Action buttons */}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
          {readOnly&&isPending&&<>
            <button onClick={()=>onUpdate({status:"rejected",clientComment:commentDraft})} style={{background:"#fff",color:DARK,border:`1px solid ${BRD}`,borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans"}}>Request Changes</button>
            <button onClick={()=>onUpdate({status:"approved",clientComment:commentDraft})} style={{background:T,color:"#fff",border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"DM Sans"}}>Approve ✓</button>
          </>}
          {readOnly&&isRejected&&<button onClick={()=>onUpdate({status:"approved",clientComment:commentDraft})} style={{background:T,color:"#fff",border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"DM Sans"}}>Approve instead ✓</button>}
        </div>
      </div>
    </div>
  );
}

function ContentView({clientId, month, readOnly, displayName, tagline}) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{ storeGet(`content_${clientId}_${month}`).then(d=>setItems(d||[])); },[clientId,month]);

  const save = async(next) => { setItems(next); await storeSet(`content_${clientId}_${month}`,next); };
  const addItem = () => save([...(items||[]), emptyContent()]);
  const updateItem = (id,fields) => save(items.map(it=>it.id===id?{...it,...fields}:it));
  const deleteItem = (id) => { if(!confirm("Delete this post?")) return; save(items.filter(it=>it.id!==id)); };

  if(!items) return <div style={{padding:40,textAlign:"center",color:DIM}}>Loading…</div>;

  const pending = items.filter(it=>it.status==="pending");
  const filtered = filter==="all" ? items : items.filter(it=>it.status===filter);

  return (
    <div style={{padding:"20px 24px 40px"}}>
      {/* Awaiting approval banner */}
      {pending.length>0 && readOnly && (
        <div style={{background:"#FFF8E7",border:"1px solid #E8C84A",borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>⏳</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#B07A00"}}>{pending.length} post{pending.length>1?"s":""} awaiting your approval</div>
            <div style={{fontSize:11,color:"#8a6500",marginTop:2}}>Review and approve or request changes below.</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["all","pending","approved","rejected","draft"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{padding:"4px 10px",fontSize:10,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"DM Sans",transition:"all .15s",
              background:filter===f?T:SURF,color:filter===f?"#fff":DIM,border:`1px solid ${filter===f?T:BRD}`}}>
            {f==="all"?"All posts":f.charAt(0).toUpperCase()+f.slice(1)}
            {f!=="all"&&<span style={{marginLeft:4,opacity:.7}}>({items.filter(it=>it.status===f).length})</span>}
          </button>
        ))}
        <div style={{flex:1}}/>
        {!readOnly && (
          <button onClick={addItem} className="btn btn-primary" style={{padding:"6px 14px",fontSize:11}}>+ New post</button>
        )}
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"40px 24px",color:DIM,background:SURF,borderRadius:12,border:`1px dashed ${BRD}`}}>
          <div style={{fontSize:28,marginBottom:8}}>📝</div>
          <div style={{fontSize:13,fontWeight:600,color:DARK}}>{filter==="all"?"No posts for this month yet.":`No ${filter} posts.`}</div>
          {!readOnly && filter==="all" && <div style={{fontSize:11,marginTop:4}}>Click "+ New post" to start building content.</div>}
        </div>
      )}

      {filtered.map(item=>(
        <ContentCard key={item.id} item={item} readOnly={readOnly}
          displayName={displayName} tagline={tagline}
          onUpdate={fields=>updateItem(item.id,fields)}
          onDelete={()=>deleteItem(item.id)}/>
      ))}
    </div>
  );
}

function CalendarView({clientId, month, year}) {
  const [items, setItems] = useState(null);
  useEffect(()=>{ storeGet(`content_${clientId}_${month}`).then(d=>setItems(d||[])); },[clientId,month]);

  if(!items) return <div style={{padding:40,textAlign:"center",color:DIM}}>Loading…</div>;

  const scheduled = items.filter(it=>(it.status==="approved"||it.status==="pending")&&it.scheduledDate);
  const monthIndex = MONTHS.indexOf(month);
  const daysInMonth = new Date(year, monthIndex+1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const postsByDay = {};
  scheduled.forEach(it=>{ const d=parseInt(it.scheduledDate.split("-")[2]); if(d) { postsByDay[d]=(postsByDay[d]||[]).concat(it); } });

  const cells = [];
  for(let i=0;i<firstDayOfWeek;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  return (
    <div style={{padding:"20px 24px 40px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:DARK}}>{month} {year}</div>
          <div style={{fontSize:11,color:DIM,marginTop:2}}>{scheduled.length} post{scheduled.length!==1?"s":""} scheduled</div>
        </div>
        {scheduled.length===0 && (
          <div style={{fontSize:11,color:DIM2,fontStyle:"italic"}}>Approve posts in the Content tab to see them here.</div>
        )}
      </div>

      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {DAY_NAMES.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:DIM,letterSpacing:".5px",padding:"4px 0"}}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((day,i)=>{
          const today = new Date();
          const isToday = day && today.getDate()===day && today.getMonth()===monthIndex && today.getFullYear()===year;
          const posts = day ? (postsByDay[day]||[]) : [];
          return (
            <div key={i} style={{
              minHeight:80,borderRadius:8,padding:"6px 7px",
              background:day?SURF:"transparent",
              border:day?(isToday?`2px solid ${T}`:`1px solid ${BRD}`):"none",
              opacity:day?1:0,
            }}>
              {day && (
                <>
                  <div style={{fontSize:11,fontWeight:isToday?700:500,color:isToday?T:DARK,marginBottom:4}}>{day}</div>
                  {posts.map((p,pi)=>(
                    <div key={pi} style={{
                      background:p.status==="approved"?TLIGHT:"#FFF8E7",
                      border:`1px solid ${p.status==="approved"?TMED:"#E8C84A"}`,
                      borderRadius:4,padding:"3px 5px",marginBottom:3,
                    }}>
                      {p.thumbnail && <img src={p.thumbnail} alt="" style={{width:"100%",height:32,objectFit:"cover",borderRadius:3,display:"block",marginBottom:2}}/>}
                      <div style={{fontSize:9,fontWeight:600,color:p.status==="approved"?T:"#B07A00",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>{p.text?.slice(0,40)||(p.source?.slice(0,30)||"Post")}</div>
                      {p.scheduledTime && <div style={{fontSize:8,color:DIM,fontFamily:"DM Mono",marginTop:1}}>{p.scheduledTime} {p.timezone?.split("/").pop()||""}</div>}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:12,marginTop:12}}>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:DIM}}>
          <div style={{width:10,height:10,borderRadius:2,background:TLIGHT,border:`1px solid ${TMED}`}}/> Approved
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:DIM}}>
          <div style={{width:10,height:10,borderRadius:2,background:"#FFF8E7",border:"1px solid #E8C84A"}}/> Pending
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({client, readOnly, onBack}) {
  const isMobile = useIsMobile();
  const [month,setMonth]   = useState(MONTHS[new Date().getMonth()]);
  const [year,setYear]     = useState(new Date().getFullYear());
  const [data,setData]     = useState(null);
  const [saving,setSaving] = useState(false);
  const [copied,setCopied] = useState(false);
  const [view,setView]     = useState("table");

  useEffect(()=>{ storeGet(`cdata_${client.id}`).then(d=>setData(d||initData())); },[client.id]);

  const posts = data?.[month]||Array.from({length:PER_MONTH},emptyPost);

  const handleUpdate = useCallback(async(ri,fields)=>{
    setData(prev=>{
      const rows=[...prev[month]];
      rows[ri]=calcRow({...rows[ri],...fields});
      const next={...prev,[month]:rows};
      setSaving(true);
      storeSet(`cdata_${client.id}`,next).then(()=>setSaving(false));
      return next;
    });
  },[month,client.id]);

  const handleClearRow = useCallback(async(ri)=>{
    setData(prev=>{
      const rows=[...prev[month]];
      rows[ri]=emptyPost();
      const next={...prev,[month]:rows};
      setSaving(true);
      storeSet(`cdata_${client.id}`,next).then(()=>setSaving(false));
      return next;
    });
  },[month,client.id]);

  const handleClearSheet = useCallback(async()=>{
    if(!confirm(`Clear all 20 posts for ${month}? This cannot be undone.`)) return;
    setData(prev=>{
      const next={...prev,[month]:Array.from({length:PER_MONTH},emptyPost)};
      setSaving(true);
      storeSet(`cdata_${client.id}`,next).then(()=>setSaving(false));
      return next;
    });
  },[month,client.id]);

  const totals = posts.reduce((acc,r)=>{
    ["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].forEach(k=>{acc[k]=(acc[k]||0)+(parseFloat(r[k])||0);});
    acc.filled=(acc.filled||0)+(r.impressions?1:0);
    return acc;
  },{});
  const eng = ["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(totals[k]||0),0);

  const exportCSV = () => {
    const headers=["#","Date","Time","Link","Impressions","Members Reached","Reach Rate","Profile Views","Followers Gained","Reactions","Comments","Reposts","Saves","Sends","Eng. Rate","Notes","Job Title Demographics"];
    const rows=posts.map((r,i)=>{
      const demos=(r.demographics||[]).map(d=>`${d.title}: ${d.pct}%`).join(" | ");
      return [i+1,r.date,r.time,r.link,r.impressions,r.membersReached,r.reachRate,r.profileViewers,r.followersGained,r.reactions,r.comments,r.reposts,r.saves,r.sends,r.engRate,r.notes,demos].map(v=>`"${v??""}"`).join(",");
    });
    const csv=[`"${client.name} — LinkedIn Tracker — ${month} ${year}"`,headers.join(","),...rows].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`${client.name.replace(/\s+/g,"-").toLowerCase()}-${month.toLowerCase()}-${year}.csv`;a.click();
  };

  const copyToken = () => { navigator.clipboard.writeText(client.token).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };

  if(!data) return <div style={{padding:60,textAlign:"center",color:DIM}}>Loading…</div>;

  return (
    <div style={{background:BG,minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:SURF,borderBottom:`1px solid ${BRD}`,padding:isMobile?"12px 16px 0":"16px 24px 0"}}>
        <div style={{display:"flex",alignItems:isMobile?"flex-start":"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,paddingBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
            <div style={{width:1,height:20,background:BRD}}/>
            <div>
              <div style={{fontSize:isMobile?14:16,fontWeight:700,color:DARK}}>{client.name}</div>
              <div style={{fontSize:10,color:DIM,marginTop:1}}>
                {readOnly?"View-only dashboard":"Admin"}{saving&&<span style={{color:T}}> · saving…</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {!readOnly && !isMobile && (
              <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:DIM}}>
                Code: <span className="token">{client.token}</span>
                <button className="btn btn-ghost btn-sm" onClick={copyToken} style={{padding:"2px 8px",fontSize:10}}>{copied?"✓":"Copy"}</button>
              </span>
            )}
            <div style={{display:"flex",background:BG,border:`1px solid ${BRD}`,borderRadius:8,padding:2,gap:2}}>
              {[["table","≡","Table"],["report","◫","Report"],["content","✦","Content"],["calendar","▦","Calendar"]].map(([v,icon,label])=>(
                <button key={v} onClick={()=>setView(v)} className="btn"
                  style={{padding:isMobile?"5px 10px":"5px 12px",fontSize:11,fontWeight:600,borderRadius:6,background:view===v?T:"transparent",color:view===v?"#fff":DIM,border:"none",transition:"all .15s"}}>
                  {isMobile?icon:`${icon} ${label}`}
                </button>
              ))}
            </div>
            <select value={year} onChange={e=>setYear(+e.target.value)} className="inp" style={{width:isMobile?70:84,padding:"6px 8px",borderRadius:7}}>
              {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
            </select>
            <button className="btn btn-primary" onClick={exportCSV} style={{padding:"7px 12px",fontSize:isMobile?11:13}}>↓ CSV</button>
          </div>
        </div>
        {/* Month tabs */}
        <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
          {MONTHS.map(m=>(
            <div key={m} className={`mtab${month===m?" active":""}`} onClick={()=>setMonth(m)} style={{padding:isMobile?"5px 10px":"5px 13px",fontSize:isMobile?11:12}}>
              {isMobile?m.slice(0,3):m.slice(0,3)}{data[m]?.some(r=>r.impressions)&&month!==m&&<span className="dot"/>}
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards — only in table view */}
      {view==="table" && (
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?8:10,padding:isMobile?"12px 16px":"16px 24px"}}>
          {[["Posts",totals.filled||0],["Impressions",totals.impressions?Math.round(totals.impressions).toLocaleString():"—"],["Reactions",totals.reactions?Math.round(totals.reactions).toLocaleString():"—"],["Comments",totals.comments?Math.round(totals.comments).toLocaleString():"—"],["Saves",totals.saves?Math.round(totals.saves).toLocaleString():"—"],["Eng. Rate",totals.impressions>0?(eng/totals.impressions*100).toFixed(2)+"%":"—"],["Followers",totals.followersGained?Math.round(totals.followersGained).toLocaleString():"—"]].map(([l,v])=>(
            <div key={l} style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:10,padding:isMobile?"10px 12px":"12px 16px",boxShadow:"0 1px 3px rgba(66,70,81,0.05)"}}>
              <div style={{fontSize:9,color:DIM,fontWeight:600,letterSpacing:".8px",marginBottom:3}}>{l.toUpperCase()}</div>
              <div style={{fontSize:isMobile?16:20,fontWeight:700,color:T,fontFamily:"DM Mono",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table / Report / Content / Calendar */}
      {view==="table" && (
        <div style={{padding:isMobile?"0 16px 32px":"0 24px 32px"}}>
          <TrackerTable posts={posts} onUpdate={handleUpdate} onClearRow={handleClearRow} onClearSheet={handleClearSheet} readOnly={readOnly}/>
        </div>
      )}
      {view==="report"   && <MonthReport posts={posts} month={month} year={year}/>}
      {view==="content"  && <ContentView clientId={client.id} month={month} readOnly={readOnly} displayName={client.displayName||client.name} tagline={client.tagline||""}/>}
      {view==="calendar" && <CalendarView clientId={client.id} month={month} year={year}/>}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({onLogout}) {
  const [clients,setClients] = useState([]);
  const [selected,setSelected] = useState(null);
  const [newName,setNewName] = useState("");
  const [newDisplay,setNewDisplay] = useState("");
  const [newTagline,setNewTagline] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ storeGet("clients").then(c=>{ setClients(c||[]); setLoading(false); }); },[]);

  const addClient = async() => {
    if(!newName.trim()) return;
    const c={id:uid6(),name:newName.trim(),token:uid6(),displayName:newDisplay.trim()||newName.trim(),tagline:newTagline.trim(),createdAt:new Date().toISOString()};
    const updated=[...clients,c];
    await storeSet("clients",updated);
    setClients(updated); setNewName(""); setNewDisplay(""); setNewTagline("");
  };

  const removeClient = async(id,e) => {
    e.stopPropagation();
    if(!confirm("Delete this client and all their data?")) return;
    const updated=clients.filter(c=>c.id!==id);
    await storeSet("clients",updated);
    setClients(updated);
  };

  if(selected) return <Dashboard client={selected} readOnly={false} onBack={()=>setSelected(null)}/>;

  return (
    <div style={{background:BG,minHeight:"100vh"}}>
      <div style={{background:SURF,borderBottom:`1px solid ${BRD}`,padding:"18px 28px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(66,70,81,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:4,height:26,background:T,borderRadius:2}}/>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:DARK}}>Admin Dashboard</div>
            <div style={{fontSize:11,color:DIM}}>Manage client trackers</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"20px 24px",marginBottom:28,boxShadow:"0 1px 4px rgba(66,70,81,0.06)"}}>
          <div style={{fontSize:13,fontWeight:600,color:DARK,marginBottom:14}}>Add new client</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:10}}>
              <input className="inp" style={{flex:1}} placeholder="Client / account name (internal)" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addClient()}/>
              <button className="btn btn-primary" onClick={addClient}>Add client</button>
            </div>
            <input className="inp" placeholder="Display name on LinkedIn preview (e.g. Alex Johnson)" value={newDisplay} onChange={e=>setNewDisplay(e.target.value)}/>
            <input className="inp" placeholder="LinkedIn tagline (e.g. Founder @ Acme | Helping teams grow)" value={newTagline} onChange={e=>setNewTagline(e.target.value)}/>
          </div>
        </div>

        <div style={{fontSize:11,color:DIM,fontWeight:600,letterSpacing:"1px",marginBottom:12}}>CLIENTS ({clients.length})</div>

        {loading && <div style={{color:DIM,padding:20,textAlign:"center"}}>Loading…</div>}
        {!loading && clients.length===0 && (
          <div style={{color:DIM,padding:32,textAlign:"center",fontSize:13,background:SURF,borderRadius:12,border:`1px dashed ${BRD}`}}>
            No clients yet. Add one above.
          </div>
        )}

        {clients.map(c=>(
          <div key={c.id} className="client-row" onClick={()=>setSelected(c)}>
            <div style={{width:40,height:40,borderRadius:"50%",background:TLIGHT,border:`1px solid ${TMED}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:T,flexShrink:0}}>
              {c.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:DARK}}>{c.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                <span style={{fontSize:11,color:DIM}}>Access code:</span>
                <span className="token">{c.token}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
              <span className="badge" style={{background:TLIGHT,color:T,border:`1px solid ${TMED}`}}>Open →</span>
              <button className="btn btn-danger" onClick={e=>removeClient(c.id,e)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Client Access ────────────────────────────────────────────────────────────
function ClientAccess({onBack, isClientRoute}) {
  const [token,setToken]   = useState("");
  const [client,setClient] = useState(null);
  const [err,setErr]       = useState("");
  const [loading,setLoading] = useState(false);

  const lookup = async() => {
    if(token.trim().length<4) return;
    setLoading(true); setErr("");
    const clients = await storeGet("clients");
    const found = (clients||[]).find(c=>c.token.toUpperCase()===token.trim().toUpperCase());
    if(found) setClient(found);
    else setErr("Access code not found. Check with your account manager.");
    setLoading(false);
  };

  if(client) return <Dashboard client={client} readOnly={true} onBack={()=>setClient(null)}/>;

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BG,padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{marginBottom:24,display:"flex",alignItems:"center"}}>
          {!isClientRoute && onBack
            ? <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
            : <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:3,height:20,background:T,borderRadius:2}}/>
                <span style={{fontSize:13,fontWeight:700,color:DARK}}>Margin Standards</span>
              </div>}
        </div>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,borderRadius:14,background:TLIGHT,border:`1px solid ${TMED}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,color:T,fontWeight:700}}>L</div>
          <div style={{fontSize:22,fontWeight:700,color:DARK,marginBottom:6}}>Your dashboard</div>
          <div style={{fontSize:13,color:DIM}}>Enter your access code to view your LinkedIn stats</div>
        </div>
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:14,padding:"24px",boxShadow:"0 2px 12px rgba(66,70,81,0.08)"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:DIM,fontWeight:600,letterSpacing:".8px",marginBottom:8}}>ACCESS CODE</div>
            <input className="inp" placeholder="e.g. A1B2C3" value={token} onChange={e=>setToken(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&lookup()} style={{letterSpacing:"3px",fontFamily:"DM Mono",textTransform:"uppercase",textAlign:"center",fontSize:16}}/>
          </div>
          {err && <div style={{fontSize:12,color:"#c03c3c",marginBottom:12,padding:"8px 12px",background:"rgba(200,60,60,0.06)",border:"1px solid rgba(200,60,60,0.15)",borderRadius:6}}>{err}</div>}
          <button className="btn btn-primary" style={{width:"100%",padding:"10px"}} onClick={lookup} disabled={loading}>
            {loading?"Checking…":"View my dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({onLogin, onBack}) {
  const [pw,setPw]         = useState("");
  const [err,setErr]       = useState("");
  const [setup,setSetup]   = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ storeGet("admin_pw").then(p=>{ setSetup(!p); setLoading(false); }); },[]);

  const submit = async() => {
    const stored = await storeGet("admin_pw");
    if(!stored) { await storeSet("admin_pw",pw); onLogin(); }
    else if(stored===pw) onLogin();
    else setErr("Incorrect password.");
  };

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BG,color:DIM}}>Loading…</div>;

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BG,padding:24}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{marginBottom:24}}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        </div>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,borderRadius:14,background:TLIGHT,border:`1px solid ${TMED}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20,color:T}}>🔐</div>
          <div style={{fontSize:22,fontWeight:700,color:DARK,marginBottom:6}}>{setup?"Set admin password":"Admin login"}</div>
          <div style={{fontSize:13,color:DIM}}>{setup?"Choose a password for your admin account":"Enter your admin password"}</div>
        </div>
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:14,padding:24,boxShadow:"0 2px 12px rgba(66,70,81,0.08)"}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:DIM,fontWeight:600,letterSpacing:".8px",marginBottom:8}}>PASSWORD</div>
            <input className="inp" type="password" placeholder={setup?"Create a password":"Enter password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
          {err && <div style={{fontSize:12,color:"#c03c3c",marginBottom:12,padding:"8px 12px",background:"rgba(200,60,60,0.06)",border:"1px solid rgba(200,60,60,0.15)",borderRadius:6}}>{err}</div>}
          <button className="btn btn-primary" style={{width:"100%",padding:"10px"}} onClick={submit}>{setup?"Set password & continue":"Sign in"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({onAdmin, onClient}) {
  const isMobile = useIsMobile();
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BG,padding:isMobile?16:24}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:isMobile?28:44}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:4,height:36,background:T,borderRadius:2}}/>
            <div style={{fontSize:isMobile?18:22,fontWeight:700,color:DARK,letterSpacing:"-0.5px"}}>Margin Standards — Client LinkedIn Metrics</div>
          </div>
          <div style={{fontSize:13,color:DIM,lineHeight:1.6}}>Performance data that's simple to read and easy to track.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?10:14}}>
          {[
            {label:"Admin",desc:"Manage clients, upload screenshots, edit data",icon:"⚙️",onClick:onAdmin},
            {label:"Client",desc:"View your dashboard with an access code",icon:"📊",onClick:onClient},
          ].map(item=>(
            <button key={item.label} onClick={item.onClick}
              style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:14,padding:isMobile?"20px":"28px 20px",cursor:"pointer",textAlign:"center",transition:"all .18s",boxShadow:"0 1px 4px rgba(66,70,81,0.06)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T;e.currentTarget.style.boxShadow=`0 4px 16px rgba(24,140,126,0.15)`;e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BRD;e.currentTarget.style.boxShadow="0 1px 4px rgba(66,70,81,0.06)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:isMobile?22:28,marginBottom:isMobile?8:12}}>{item.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:DARK,marginBottom:6}}>{item.label}</div>
              <div style={{fontSize:12,color:DIM,lineHeight:1.5}}>{item.desc}</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:28,fontSize:11,color:DIM2}}>
          Powered by Authority Engine
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const isClientRoute = typeof window!=="undefined" && window.location.pathname.startsWith("/client");
  const [screen,setScreen]           = useState(isClientRoute ? "client" : "landing");
  const [adminAuthed,setAdminAuthed] = useState(false);
  return (
    <>
      <style>{css}</style>
      {screen==="landing"  && <Landing onAdmin={()=>setScreen("admin")} onClient={()=>setScreen("client")}/>}
      {screen==="admin" && !adminAuthed && <AdminLogin onLogin={()=>setAdminAuthed(true)} onBack={()=>setScreen("landing")}/>}
      {screen==="admin" && adminAuthed  && <AdminDashboard onLogout={()=>{setAdminAuthed(false);setScreen("landing");}}/>}
      {screen==="client"   && <ClientAccess onBack={isClientRoute ? null : ()=>setScreen("landing")} isClientRoute={isClientRoute}/>}
    </>
  );
}
