import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";

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
const emptyPost = () => ({date:"",time:"",link:"",impressions:"",membersReached:"",profileViewers:"",followersGained:"",reactions:"",comments:"",reposts:"",saves:"",sends:"",notes:"",demographics:[],snapshots:{day1:null,week1:null,week2:null}});
const initData = () => MONTHS.reduce((a,m)=>({...a,[m]:Array.from({length:PER_MONTH},emptyPost)}),{});
const calcRow = r => {
  const imp=parseFloat(r.impressions)||0, eng=["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0);
  return {...r, reachRate:imp>0?((parseFloat(r.membersReached)||0)/imp*100).toFixed(1)+"%":"", engRate:imp>0?(eng/imp*100).toFixed(2)+"%":""};
};

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

const COLS = [
  {key:"slot",           label:"#",            w:32,  type:"index", group:"POST"},
  {key:"date",           label:"Date",          w:100, type:"text",  group:"POST"},
  {key:"time",           label:"Time",          w:68,  type:"text",  group:"POST"},
  {key:"link",           label:"Link",          w:130, type:"text",  group:"POST"},
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
];

const GC = {
  POST:        "#424651",
  DISCOVERY:   "#188C7E",
  PROFILE:     "#0d7066",
  ENGAGEMENT:  "#0a5c54",
  UPLOAD:      "#5a5e6b",
  NOTES:       "#6b6f7c",
  "JOB TITLES":"#2d6a8a",
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

function TrackerTable({posts, onUpdate, readOnly}) {
  const [loadSlot,setLoadSlot]   = useState(null);
  const [loadDemoSlot,setLoadDemoSlot] = useState(null);
  const [pasteLoadSlot,setPasteLoadSlot] = useState(null);
  const [flashSlot,setFlashSlot] = useState(null);
  const [hoverRow,setHoverRow]   = useState(null);
  const hoverRowRef = useRef(null);

  // keep ref in sync so paste handler always has latest
  useEffect(()=>{ hoverRowRef.current = hoverRow; },[hoverRow]);

  const fillAutoFromImage = async(file, ri) => {
    if(readOnly) return;
    setPasteLoadSlot(ri);
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/png",data:b64}},{type:"text",text:'Look at this LinkedIn analytics screenshot. Determine if it shows (A) post performance stats or (B) job title demographics. Return ONLY JSON:\n\nIf post stats: {"type":"stats","impressions":number,"membersReached":number,"profileViewers":number,"followersGained":number,"reactions":number,"comments":number,"reposts":number,"saves":number,"sends":number}\n\nIf job titles: {"type":"demographics","items":[{"title":"Software Engineer","pct":13.8},...]}'}]}]})});
      const d = await resp.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"{}";
      const p = JSON.parse(txt.replace(/```json|```/g,"").trim());
      if(p.type==="demographics") {
        onUpdate(ri,{demographics:p.items||[]});
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
      const ri = hoverRowRef.current;
      if(ri===null||ri===undefined) return;
      const items = Array.from(e.clipboardData?.items||[]);
      const imgItem = items.find(i=>i.type.startsWith("image/"));
      if(!imgItem) return;
      e.preventDefault();
      fillAutoFromImage(imgItem.getAsFile(), ri);
    };
    document.addEventListener("paste", handlePaste);
    return ()=>document.removeEventListener("paste", handlePaste);
  },[readOnly, onUpdate]);
  const [dragSlot,setDragSlot]   = useState(null);
  const [expanded,setExpanded]   = useState(new Set());

  const displayCols = readOnly ? COLS.filter(c=>c.key!=="upload" && c.key!=="demoupload") : COLS;
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

  return (
    <div>
      {!readOnly && <div style={{fontSize:11,color:DIM,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>📋</span> Hover any row and paste <kbd style={{background:BRD,border:`1px solid ${BRD2}`,borderRadius:4,padding:"1px 5px",fontSize:10,fontFamily:"DM Mono",color:DARK}}>Ctrl+V</kbd> to auto-fill — works for both stats and job title screenshots.</div>}
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
          {posts.map((row,ri)=>{
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
                    const base={background:rowBg,borderRight:`1px solid ${BRD}`,borderBottom:isExpanded?`1px solid ${TMED}`:`1px solid ${BRD}`,padding:c.type==="upload"||c.type==="details"?"4px 5px":"0 4px",height:30,textAlign:"center",minWidth:c.w,width:c.w};
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
                    if(c.type==="upload") return <td key={c.key} style={base}>{loadSlot===ri?<span className="ubtn loading">⏳ reading…</span>:<span className="ubtn" onClick={()=>pick(ri)}>↑ Upload</span>}</td>;
                    if(c.type==="demoupload") return <td key={c.key} style={{...base,padding:"4px 5px"}}>{loadDemoSlot===ri?<span className="ubtn loading">⏳ reading…</span>:<span className="ubtn" onClick={()=>pickDemo(ri)}>↑ Upload</span>}</td>;
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
              if(c.key==="date") v="MONTH TOTAL";
              else if(["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].includes(c.key)) v=totals[c.key]?Math.round(totals[c.key]).toLocaleString():"—";
              else if(c.key==="reachRate") v=totReachRate;
              else if(c.key==="engRate") v=totEngRate;
              else if(c.type==="dtitle") v="";
              return <td key={c.key} style={{background:TLIGHT,borderRight:`1px solid ${BRD}`,padding:"8px 5px",textAlign:"center",fontFamily:"DM Mono",fontWeight:600,fontSize:c.key==="date"?9:11,color:c.key==="date"?T:DARK,letterSpacing:c.key==="date"?"1px":0}}>{v}</td>;
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
  const filled = posts.filter(r=>parseFloat(r.impressions)>0);
  if(filled.length===0) return (
    <div style={{textAlign:"center",padding:"60px 24px",color:DIM}}>
      <div style={{fontSize:32,marginBottom:12}}>📭</div>
      <div style={{fontSize:14,fontWeight:600,color:DARK}}>No data for {month} {year}</div>
      <div style={{fontSize:12,marginTop:6}}>Add post stats in the table view to generate a report.</div>
    </div>
  );

  // Aggregates
  const totals = filled.reduce((acc,r)=>{
    ["impressions","membersReached","profileViewers","followersGained","reactions","comments","reposts","saves","sends"].forEach(k=>{acc[k]=(acc[k]||0)+(parseFloat(r[k])||0);});
    return acc;
  },{});
  const totalEng = ["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(totals[k]||0),0);
  const avgEngRate = totals.impressions>0?((totalEng/totals.impressions)*100).toFixed(2):0;
  const avgImpressions = Math.round(totals.impressions/filled.length);

  // Per-post chart data
  const postData = filled.map((r,i)=>({
    name: r.date ? r.date.slice(5) : `Post ${posts.indexOf(r)+1}`,
    impressions: parseFloat(r.impressions)||0,
    engRate: parseFloat(r.impressions)>0
      ? +((["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0)/parseFloat(r.impressions))*100).toFixed(2)
      : 0,
    reactions: parseFloat(r.reactions)||0,
  }));

  // Sorted for top posts
  const topPosts = [...filled].sort((a,b)=>(parseFloat(b.impressions)||0)-(parseFloat(a.impressions)||0)).slice(0,5);

  // Engagement breakdown pie
  const engBreakdown = [
    {name:"Reactions", value:Math.round(totals.reactions||0)},
    {name:"Comments",  value:Math.round(totals.comments||0)},
    {name:"Saves",     value:Math.round(totals.saves||0)},
    {name:"Sends",     value:Math.round(totals.sends||0)},
    {name:"Reposts",   value:Math.round(totals.reposts||0)},
  ].filter(d=>d.value>0);

  // Aggregated job titles across all posts
  const demoMap = {};
  filled.forEach(r=>(r.demographics||[]).forEach(d=>{
    const k=d.title?.trim();
    if(!k) return;
    demoMap[k]=(demoMap[k]||[]).concat(parseFloat(d.pct)||0);
  }));
  const demoData = Object.entries(demoMap)
    .map(([title,vals])=>({title, avg:+(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(1)}))
    .sort((a,b)=>b.avg-a.avg).slice(0,8);

  return (
    <div style={{padding:"20px 24px 40px"}}>

      {/* Stat cards */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
        <StatCard label="Posts Tracked"    value={filled.length} sub={`of ${PER_MONTH} slots`}/>
        <StatCard label="Total Impressions" value={totals.impressions?Math.round(totals.impressions).toLocaleString():"—"}/>
        <StatCard label="Avg per Post"     value={avgImpressions.toLocaleString()} sub="impressions"/>
        <StatCard label="Avg Eng. Rate"    value={avgEngRate+"%"}/>
        <StatCard label="Total Reactions"  value={Math.round(totals.reactions||0).toLocaleString()}/>
        <StatCard label="Followers Gained" value={Math.round(totals.followersGained||0).toLocaleString()}/>
      </div>

      {/* Row 2: Impressions bar + Engagement pie */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,marginBottom:16,alignItems:"start"}}>

        {/* Impressions per post */}
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:DARK,marginBottom:14}}>Impressions per post</div>
          <ResponsiveContainer width="100%" height={Math.max(180, filled.length*22)}>
            <BarChart data={postData} layout="vertical" margin={{left:8,right:40,top:0,bottom:0}}>
              <XAxis type="number" tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:DARK}} tickLine={false} axisLine={false} width={52}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="impressions" fill={T} radius={[0,4,4,0]} barSize={14}>
                <LabelList dataKey="impressions" position="right" style={{fontSize:9,fill:DIM,fontFamily:"DM Mono"}} formatter={v=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement breakdown pie */}
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:DARK,marginBottom:4}}>Engagement breakdown</div>
          <div style={{fontSize:10,color:DIM,marginBottom:12}}>Total: {totalEng.toLocaleString()} engagements</div>
          {engBreakdown.length>0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={engBreakdown} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" paddingAngle={2}>
                    {engBreakdown.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",marginTop:8}}>
                {engBreakdown.map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                    <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                    <span style={{color:DARK}}>{d.name}</span>
                    <span style={{color:DIM,fontFamily:"DM Mono"}}>{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{textAlign:"center",color:DIM2,padding:20,fontSize:11}}>No engagement data yet.</div>}
        </div>
      </div>

      {/* Row 3: Eng rate chart + Top posts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* Eng rate per post */}
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:DARK,marginBottom:14}}>Engagement rate per post</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={postData} margin={{left:0,right:16,top:0,bottom:20}}>
              <XAxis dataKey="name" tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0}/>
              <YAxis tick={{fontSize:9,fill:DIM}} tickLine={false} axisLine={false} tickFormatter={v=>v+"%"}/>
              <Tooltip content={<CustomTooltip/>} formatter={v=>v+"%"}/>
              <Bar dataKey="engRate" name="Eng. Rate" fill="#424651" radius={[3,3,0,0]} barSize={16}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 posts */}
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:DARK,marginBottom:14}}>Top posts by impressions</div>
          {topPosts.map((r,i)=>{
            const eng=["reactions","comments","reposts","saves","sends"].reduce((s,k)=>s+(parseFloat(r[k])||0),0);
            const er=parseFloat(r.impressions)>0?(eng/parseFloat(r.impressions)*100).toFixed(1):0;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<topPosts.length-1?`1px solid ${BRD}`:"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:i===0?T:TLIGHT,border:`1px solid ${i===0?T:TMED}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:i===0?"#fff":T,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:DARK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.date||`Post ${posts.indexOf(r)+1}`}{r.link&&<span style={{color:DIM,fontWeight:400}}> · {r.link.replace(/https?:\/\/(www\.)?/,"").slice(0,20)}…</span>}</div>
                  <div style={{fontSize:10,color:DIM,marginTop:1,fontFamily:"DM Mono"}}>{parseFloat(r.impressions).toLocaleString()} impr · {er}% eng</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Demographics (if data exists) */}
      {demoData.length>0 && (
        <div style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:DARK,marginBottom:4}}>Audience — job title reach</div>
          <div style={{fontSize:10,color:DIM,marginBottom:14}}>Averaged across posts with demographics data</div>
          <div style={{maxWidth:560}}>
            {demoData.map((d,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:600,color:DARK}}>{d.title}</span>
                  <span style={{fontSize:11,fontWeight:700,color:T,fontFamily:"DM Mono"}}>{d.avg}%</span>
                </div>
                <div style={{height:6,borderRadius:3,background:BRD,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(d.avg/demoData[0].avg)*100}%`,background:T,borderRadius:3,transition:"width .4s"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({client, readOnly, onBack}) {
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
      <div style={{background:SURF,borderBottom:`1px solid ${BRD}`,padding:"16px 24px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
            <div style={{width:1,height:20,background:BRD}}/>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:DARK}}>{client.name}</div>
              <div style={{fontSize:11,color:DIM,marginTop:1,display:"flex",alignItems:"center",gap:8}}>
                {readOnly
                  ? <span>View-only dashboard</span>
                  : <><span style={{color:DIM}}>Admin</span>{saving&&<span style={{color:T}}>· saving…</span>}</>}
                {!readOnly && (
                  <span style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:DIM2}}>Client code:</span>
                    <span className="token">{client.token}</span>
                    <button className="btn btn-ghost btn-sm" onClick={copyToken} style={{padding:"2px 8px",fontSize:10}}>{copied?"✓ Copied":"Copy"}</button>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* View toggle */}
            <div style={{display:"flex",background:BG,border:`1px solid ${BRD}`,borderRadius:8,padding:2,gap:2}}>
              {[["table","≡ Table"],["report","◫ Report"]].map(([v,label])=>(
                <button key={v} onClick={()=>setView(v)} className="btn"
                  style={{padding:"5px 12px",fontSize:11,fontWeight:600,borderRadius:6,background:view===v?T:"transparent",color:view===v?"#fff":DIM,border:"none",transition:"all .15s"}}>
                  {label}
                </button>
              ))}
            </div>
            <select value={year} onChange={e=>setYear(+e.target.value)} className="inp" style={{width:84,padding:"6px 10px",borderRadius:7}}>
              {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
            </select>
            <button className="btn btn-primary" onClick={exportCSV}>↓ Export CSV</button>
          </div>
        </div>
        {/* Month tabs */}
        <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:0}}>
          {MONTHS.map(m=>(
            <div key={m} className={`mtab${month===m?" active":""}`} onClick={()=>setMonth(m)}>
              {m.slice(0,3)}{data[m]?.some(r=>r.impressions)&&month!==m&&<span className="dot"/>}
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards — only in table view */}
      {view==="table" && (
        <div style={{display:"flex",gap:10,padding:"16px 24px",overflowX:"auto",flexWrap:"wrap"}}>
          {[["Posts Tracked",totals.filled||0],["Impressions",totals.impressions?Math.round(totals.impressions).toLocaleString():"—"],["Reactions",totals.reactions?Math.round(totals.reactions).toLocaleString():"—"],["Comments",totals.comments?Math.round(totals.comments).toLocaleString():"—"],["Saves",totals.saves?Math.round(totals.saves).toLocaleString():"—"],["Eng. Rate",totals.impressions>0?(eng/totals.impressions*100).toFixed(2)+"%":"—"],["Followers",totals.followersGained?Math.round(totals.followersGained).toLocaleString():"—"]].map(([l,v])=>(
            <div key={l} style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:10,padding:"12px 16px",minWidth:100,boxShadow:"0 1px 3px rgba(66,70,81,0.05)"}}>
              <div style={{fontSize:9,color:DIM,fontWeight:600,letterSpacing:".8px",marginBottom:4}}>{l.toUpperCase()}</div>
              <div style={{fontSize:20,fontWeight:700,color:T,fontFamily:"DM Mono"}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table or Report */}
      {view==="table"
        ? <div style={{padding:"0 24px 32px"}}>
            <TrackerTable posts={posts} onUpdate={handleUpdate} readOnly={readOnly}/>
          </div>
        : <MonthReport posts={posts} month={month} year={year}/>
      }
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({onLogout}) {
  const [clients,setClients] = useState([]);
  const [selected,setSelected] = useState(null);
  const [newName,setNewName] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ storeGet("clients").then(c=>{ setClients(c||[]); setLoading(false); }); },[]);

  const addClient = async() => {
    if(!newName.trim()) return;
    const c={id:uid6(),name:newName.trim(),token:uid6(),createdAt:new Date().toISOString()};
    const updated=[...clients,c];
    await storeSet("clients",updated);
    setClients(updated); setNewName("");
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
          <div style={{display:"flex",gap:10}}>
            <input className="inp" style={{flex:1}} placeholder="Client name" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addClient()}/>
            <button className="btn btn-primary" onClick={addClient}>Add client</button>
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
function ClientAccess({onBack}) {
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
        <div style={{marginBottom:24}}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
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
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BG,padding:24}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:4,height:36,background:T,borderRadius:2}}/>
            <div style={{fontSize:22,fontWeight:700,color:DARK,letterSpacing:"-0.5px"}}>Margin Standards — Client LinkedIn Metrics</div>
          </div>
          <div style={{fontSize:13,color:DIM,lineHeight:1.6}}>Performance data that's simple to read and easy to track.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[
            {label:"Admin",desc:"Manage clients, upload screenshots, edit data",icon:"⚙️",onClick:onAdmin},
            {label:"Client",desc:"View your dashboard with an access code",icon:"📊",onClick:onClient},
          ].map(item=>(
            <button key={item.label} onClick={item.onClick}
              style={{background:SURF,border:`1px solid ${BRD}`,borderRadius:14,padding:"28px 20px",cursor:"pointer",textAlign:"center",transition:"all .18s",boxShadow:"0 1px 4px rgba(66,70,81,0.06)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T;e.currentTarget.style.boxShadow=`0 4px 16px rgba(24,140,126,0.15)`;e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BRD;e.currentTarget.style.boxShadow="0 1px 4px rgba(66,70,81,0.06)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:28,marginBottom:12}}>{item.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:DARK,marginBottom:6}}>{item.label}</div>
              <div style={{fontSize:12,color:DIM,lineHeight:1.5}}>{item.desc}</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:32,fontSize:11,color:DIM2}}>
          Powered by Authority Engine
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]       = useState("landing");
  const [adminAuthed,setAdminAuthed] = useState(false);
  return (
    <>
      <style>{css}</style>
      {screen==="landing"  && <Landing onAdmin={()=>setScreen("admin")} onClient={()=>setScreen("client")}/>}
      {screen==="admin" && !adminAuthed && <AdminLogin onLogin={()=>setAdminAuthed(true)} onBack={()=>setScreen("landing")}/>}
      {screen==="admin" && adminAuthed  && <AdminDashboard onLogout={()=>{setAdminAuthed(false);setScreen("landing");}}/>}
      {screen==="client"   && <ClientAccess onBack={()=>setScreen("landing")}/>}
    </>
  );
}
