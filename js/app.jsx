// =============================================================================
// FunTunes Main App v3 — Purple Theme + Logo
// =============================================================================
const { useState, useRef, useEffect, useCallback } = React;

const STEP_LABELS = ["Customer","Payment","Session","Review"];
const STEP_ICONS = ["👤","💳","⏰","✅"];

// ── Date/Time Formatters ──
function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function formatTime12(time24) {
  if (!time24 || time24.indexOf(":") === -1) return time24 || "";
  const [hStr,mStr] = time24.split(":");
  let h = parseInt(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${String(h).padStart(2,"0")}:${mStr} ${ampm}`;
}

function getCurrentDate() {
  const n = new Date();
  return `${String(n.getDate()).padStart(2,"0")}/${String(n.getMonth()+1).padStart(2,"0")}/${n.getFullYear()}`;
}

function getCurrentTime12() {
  const n = new Date();
  let h = n.getHours();
  const m = String(n.getMinutes()).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${String(h).padStart(2,"0")}:${m} ${ampm}`;
}

// ── Main App ──
function App() {
  const [screen,setScreen] = useState("home");
  const [step,setStep] = useState(0);
  const [entryType,setEntryType] = useState("funzone");
  const [form,setFormState] = useState(getDefaultForm());
  const [errors,setErrors] = useState({});
  const [focusedField,setFocusedField] = useState(null);
  const [shakeStep,setShakeStep] = useState(false);
  const [todayEntries,setTodayEntries] = useState([]);
  const [loading,setLoading] = useState(false);
  const [saving,setSaving] = useState(false);
  const [showSuccess,setShowSuccess] = useState(false);
  const [editTarget,setEditTarget] = useState(null);
  const [toast,setToast] = useState(null);
  const [birthdays,setBirthdays] = useState([]);
  const [birthdaysLoading,setBirthdaysLoading] = useState(false);
  const [birthdayMonth,setBirthdayMonth] = useState(new Date().getMonth()+1);
  const [birthdayYear,setBirthdayYear] = useState(new Date().getFullYear());
  const [weekFilter,setWeekFilter] = useState(()=>Math.min(5,Math.ceil(new Date().getDate()/7)));
  const containerRef = useRef(null);

  function getDefaultForm() {
    const n=new Date();
    return {customerName:"",amount:CONFIG.DEFAULT_AMOUNT,mop:CONFIG.DEFAULT_MOP,numKids:1,hours:"1",
      timeIn:`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,
      socks:0,socksMop:"",phone:"",dob:"",date:n.toISOString().slice(0,10)};
  }

  const set = useCallback((key,val) => {
    setFormState(f=>({...f,[key]:val}));
    setErrors(e=>({...e,[key]:undefined}));
  },[]);

  const showToastMsg = (msg,type) => { setToast({msg,type:type||"info"}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{ fetchToday(); checkBirthdaysCache(); },[]);

  // Birthdays: cache in localStorage for the CURRENT month/year only, refetch once per day.
  // Any other month/year selection always fetches fresh (not cached).
  const BIRTHDAY_CACHE_KEY = "funtunes_birthdays_cache_v2";

  function checkBirthdaysCache() {
    const nowMonth = new Date().getMonth()+1, nowYear = new Date().getFullYear();
    try {
      const raw = localStorage.getItem(BIRTHDAY_CACHE_KEY);
      const todayStr = new Date().toISOString().slice(0,10);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.date === todayStr && cached.month === nowMonth && cached.year === nowYear) {
          setBirthdays(cached.data || []);
          return; // Already fetched today — skip API call
        }
      }
    } catch(e) { console.error("Birthday cache read error:", e); }
    fetchBirthdays(nowMonth, nowYear);
  }

  async function fetchBirthdays(month, year) {
    const m = month || birthdayMonth, y = year || birthdayYear;
    setBirthdaysLoading(true);
    try {
      const res = await api.getBirthdays(m, y);
      if (res.success) {
        setBirthdays(res.data || []);
        const nowMonth = new Date().getMonth()+1, nowYear = new Date().getFullYear();
        if (m === nowMonth && y === nowYear) {
          const todayStr = new Date().toISOString().slice(0,10);
          localStorage.setItem(BIRTHDAY_CACHE_KEY, JSON.stringify({date:todayStr, month:m, year:y, data:res.data||[]}));
        }
      } else showToastMsg("Sheet error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Birthdays fetch:",e); showToastMsg("Could not load birthdays","error"); }
    finally { setBirthdaysLoading(false); }
  }

  function changeMonth(m) { setBirthdayMonth(m); fetchBirthdays(m, birthdayYear); }
  function changeYear(y) { setBirthdayYear(y); fetchBirthdays(birthdayMonth, y); }

  async function saveBirthdayCall(record) {
    try {
      const res = await api.updateBirthdayCall({
        key: record.key, year: record.year, month: record.month, day: record.day,
        kidName: record.kidName, parentName: record.parentName, phone: record.phone,
        status: record.status, notes: record.notes,
      });
      if (res.success) {
        setBirthdays(prev => prev.map(b => b.key === record.key ? {...b, ...record} : b));
        showToastMsg("Saved!","success");
      } else showToastMsg("Save failed: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Save call:",e); showToastMsg("Could not save — check internet","error"); }
  }

  async function fetchToday() {
    setLoading(true);
    try {
      const res = await api.readToday();
      if (res.success) setTodayEntries(res.data||[]);
      else showToastMsg("Sheet error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Fetch:",e); showToastMsg("Could not reach Google Sheet","error"); }
    finally { setLoading(false); }
  }

  const computeTimeOut = (timeIn,hours) => {
    if(!timeIn) return "";
    const [h,m]=timeIn.split(":").map(Number);
    const dur=parseFloat(hours)||1;
    const t=h*60+m+dur*60;
    return `${String(Math.floor(t/60)%24).padStart(2,"0")}:${String(Math.round(t%60)).padStart(2,"0")}`;
  };

  const totalAmount = (parseInt(form.amount)||0)*form.numKids + form.socks*form.numKids;

  const validate = (s) => {
    const errs={};
    if(s===0&&!form.customerName.trim()) errs.customerName="Required";
    if(s===1&&(!form.amount||parseInt(form.amount)<=0)) errs.amount="Enter amount";
    if(s===1&&!form.mop) errs.mop="Select mode";
    setErrors(errs);
    if(Object.keys(errs).length){setShakeStep(true);setTimeout(()=>setShakeStep(false),500);}
    return !Object.keys(errs).length;
  };

  const next = () => { if(validate(step)){setStep(s=>Math.min(s+1,3));containerRef.current?.scrollTo({top:0,behavior:"smooth"});} };
  const prev = () => setStep(s=>Math.max(s-1,0));

  async function submitEntry() {
    const timeOut = computeTimeOut(form.timeIn,form.hours);
    const entry={...form,entryType,timeIn:form.timeIn,timeOut:timeOut,amount:parseInt(form.amount)||0};
    setSaving(true);
    try {
      const res=await api.addEntry(entry);
      if(res.success){
        const rowCount = form.numKids > 1 ? `${form.numKids} entries` : "Entry";
        showToastMsg(`${rowCount} saved to Google Sheet!`,"success");
        setShowSuccess(true);fetchToday();
      }
      else showToastMsg("Sheet error: "+(res.error||"unknown"),"error");
    } catch(e){console.error("Save:",e);showToastMsg("Could not save — check internet","error");}
    finally{setSaving(false);}
  }

  function handleEdit(entry) {
    setEditTarget(entry);
    const timing = entry.timing||entry["Timing"]||"";
    let timeIn = "";
    if (timing) {
      const parts = timing.split(" to ");
      timeIn = parts[0]?.trim() || "";
      if (timeIn.includes("AM") || timeIn.includes("PM")) {
        const match = timeIn.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1]);
          if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
          if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
          timeIn = `${String(h).padStart(2,"0")}:${match[2]}`;
        }
      }
    }
    setFormState({
      customerName:entry.customerName||entry["Customer name"]||"",
      amount:String(entry.amount||entry["Amount"]||300),
      mop:entry.mop||entry["MOP"]||CONFIG.DEFAULT_MOP,
      numKids:parseInt(entry.numKids||entry["No of kids"]||1),
      hours:entry.hours||entry["Hours"]||"1",
      timeIn:timeIn,
      socks:parseInt(entry.socks||entry["Socks"]||0)||0,
      socksMop:entry.socksMop||entry["MOP - Socks"]||"",
      phone:String(entry.phone||entry["Phone number"]||""),
      dob:entry.dob||entry["DOB"]||"",
      date:entry.date||new Date().toISOString().slice(0,10),
    });
    setEntryType(entry.entryType||entry["Entry Type"]||"funzone");
    setStep(0); setScreen("form");
  }

  async function handleUpdateSubmit() {
    const timeOut = computeTimeOut(form.timeIn,form.hours);
    const entry={...form,entryType,timeIn:form.timeIn,timeOut:timeOut,amount:parseInt(form.amount)||0,slNo:editTarget?.["Sl.no"]||editTarget?.["SI. No"]||editTarget?.["S.no"]||""};
    if(!editTarget?._rowIndex){showToastMsg("Cannot identify row","error");resetForm();return;}
    setSaving(true);
    try {
      const res=await api.updateEntry(editTarget._tab||"",editTarget._rowIndex,entry);
      if(res.success){showToastMsg("Updated!","success");fetchToday();}else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e){console.error("Update:",e);showToastMsg("Could not update","error");}
    finally{setSaving(false);resetForm();}
  }

  async function handleDelete(entry) {
    if(!entry._rowIndex){showToastMsg("Cannot identify row","error");return;}
    const tab = entry._tab || (() => {
      const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
      const d=new Date();
      return `Funzone - ${months[d.getMonth()]} ${d.getFullYear()}`;
    })();
    setSaving(true);
    try {
      const res=await api.deleteEntry(tab,entry._rowIndex);
      if(res.success){showToastMsg("Deleted","info");fetchToday();}else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e){console.error("Delete:",e);showToastMsg("Could not delete","error");}
    finally{setSaving(false);}
  }

  function resetForm() {
    setFormState(getDefaultForm()); setStep(0); setErrors({}); setShowSuccess(false);
    setEditTarget(null); setScreen("home"); setEntryType("funzone");
  }

  const dateDisplay = getCurrentDate();
  const timeDisplay = getCurrentTime12();

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div style={{maxWidth:420,margin:"0 auto",background:C.bg,minHeight:"100vh",fontFamily:"'Nunito',sans-serif",position:"relative"}}>

      {/* Toast */}
      {toast && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:200,background:toast.type==="success"?C.green:toast.type==="error"?C.danger:C.blue,color:"#fff",padding:"10px 20px",borderRadius:14,fontSize:13,fontWeight:700,boxShadow:C.shadowLift,animation:"popIn .3s ease",maxWidth:340}}>{toast.msg}</div>}

      {/* Saving */}
      {saving && <div style={{position:"fixed",inset:0,background:"rgba(123,45,142,.15)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:150}}>
        <div style={{background:C.card,borderRadius:20,padding:"24px 32px",textAlign:"center",boxShadow:C.shadowLift,animation:"popIn .3s ease"}}>
          <Spinner size={32} /><div style={{marginTop:12,fontSize:14,fontWeight:700,color:C.textMid}}>Saving to Sheet...</div>
        </div></div>}

      {/* Success */}
      {showSuccess && <div style={{position:"fixed",inset:0,background:"rgba(123,45,142,.25)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20,animation:"fadeIn .3s ease"}}>
        <div style={{background:C.card,borderRadius:24,padding:"36px 28px",textAlign:"center",maxWidth:340,width:"100%",boxShadow:C.shadowLift,animation:"popIn .5s ease"}}>
          <div style={{width:80,height:80,margin:"0 auto 20px",borderRadius:"50%",background:C.greenSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M10 20 L17 27 L30 14" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{animation:"checkDraw .6s ease .3s forwards"}} /></svg>
          </div>
          <h2 style={{margin:"0 0 8px",fontSize:22,fontWeight:800,color:C.text}}>Entry Saved!</h2>
          <p style={{margin:"0 0 4px",fontSize:14,color:C.textMid}}><strong>{form.customerName}</strong>{form.numKids>1?` × ${form.numKids} kids`:""}</p>
          <p style={{margin:"0 0 24px",fontSize:28,fontWeight:800,color:C.green}}>₹{totalAmount.toLocaleString("en-IN")}</p>
          <button onClick={()=>{setFormState(getDefaultForm());setStep(0);setShowSuccess(false);setEntryType("funzone");}} style={{width:"100%",padding:14,borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.accent},${C.pink})`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10,boxShadow:`0 4px 16px ${C.accent}30`}}>+ Add Another</button>
          <button onClick={resetForm} style={{width:"100%",padding:14,borderRadius:14,border:`2px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:14,fontWeight:600,cursor:"pointer"}}>Back to Home</button>
        </div></div>}

      {/* ══════════ HOME ══════════ */}
      {screen==="home" && <div style={{padding:"16px 20px 120px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:4}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="icons/logo-header.png" alt="FunTunes" style={{width:42,height:42,borderRadius:10}} />
            <div>
              <div style={{fontSize:18,fontWeight:800,color:C.accent}}>{CONFIG.APP_NAME}</div>
              <div style={{fontSize:11,color:C.textLight}}>{dateDisplay} · {timeDisplay}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setScreen("birthdays")} style={{display:"flex",alignItems:"center",gap:6,background:C.pinkSoft,border:`1.5px solid ${C.pink}30`,borderRadius:20,padding:"7px 12px",fontSize:16,cursor:"pointer"}}>🎂</button>
            <div style={{display:"flex",alignItems:"center",gap:6,background:C.greenSoft,border:`1.5px solid ${C.green}30`,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,color:C.green}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.green}} />Online
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {l:"Entries",v:todayEntries.length,i:"🎟️",bg:C.accentSoft,clr:C.accent},
            {l:"Revenue",v:`₹${todayEntries.reduce((a,e)=>a+(parseInt(e.amount||e["Amount"]||0)),0).toLocaleString("en-IN")}`,i:"💰",bg:C.greenSoft,clr:C.green},
            {l:"Kids",v:todayEntries.reduce((a,e)=>a+(parseInt(e.numKids||e["No of kids"]||1)),0),i:"👶",bg:C.blueSoft,clr:C.blue}
          ].map((s,i)=>
            <div key={i} style={{background:s.bg,borderRadius:16,padding:"14px 12px",textAlign:"center",border:`1px solid ${s.clr}15`}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.i}</div>
              <div style={{fontSize:16,fontWeight:800,color:s.clr}}>{s.v}</div>
              <div style={{fontSize:10,color:C.textLight,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
            </div>)}
        </div>

        {/* Entries */}
        <div style={{background:C.card,borderRadius:18,padding:"16px 18px",border:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(123,45,142,.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>Today's Entries</h3>
            <button onClick={fetchToday} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.warm1,fontSize:12,fontWeight:600,color:C.textMid,cursor:"pointer"}}>↻ Refresh</button>
          </div>
          <EntryList entries={todayEntries} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
        </div>

        {/* New Entry Button */}
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 40px)",maxWidth:380,zIndex:50}}>
          <button onClick={()=>{setFormState(getDefaultForm());setEditTarget(null);setScreen("form");setStep(0);}} style={{width:"100%",padding:16,borderRadius:18,border:"none",background:`linear-gradient(135deg,${C.accent},${C.pink})`,color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:`0 6px 24px ${C.accent}40`,animation:"slideUp .4s ease"}}>+ New Entry</button>
        </div>
      </div>}

      {/* ══════════ BIRTHDAYS ══════════ */}
      {screen==="birthdays" && <div style={{padding:"16px 20px 40px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,paddingTop:4}}>
          <button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:C.accent,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>← Back</button>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>🎂 Birthdays</div>
          <button onClick={()=>fetchBirthdays()} disabled={birthdaysLoading} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.warm1,fontSize:12,fontWeight:600,color:C.textMid,cursor:"pointer"}}>↻</button>
        </div>

        {/* Month / Year selectors */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <Dropdown flex={1.4} value={birthdayMonth} onChange={changeMonth}
            options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
          <Dropdown flex={1} value={birthdayYear} onChange={changeYear}
            options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
        </div>

        {/* Week filter chips */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          <button onClick={()=>setWeekFilter("all")} style={{padding:"7px 14px",borderRadius:10,border:`1.5px solid ${weekFilter==="all"?C.accent:C.border}`,background:weekFilter==="all"?C.accentSoft:C.card,color:weekFilter==="all"?C.accent:C.textMid,fontSize:12,fontWeight:700,cursor:"pointer"}}>All</button>
          {[1,2,3,4,5].map(w=>(
            <button key={w} onClick={()=>setWeekFilter(w)} style={{padding:"7px 14px",borderRadius:10,border:`1.5px solid ${weekFilter===w?C.accent:C.border}`,background:weekFilter===w?C.accentSoft:C.card,color:weekFilter===w?C.accent:C.textMid,fontSize:12,fontWeight:700,cursor:"pointer"}}>W{w}</button>
          ))}
        </div>

        {/* Summary */}
        <div style={{background:`linear-gradient(135deg,${C.pinkSoft},${C.accentSoft})`,borderRadius:16,padding:"14px 16px",marginBottom:16,border:`1.5px solid ${C.pink}20`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>🎉</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{birthdays.length} birthday{birthdays.length!==1?"s":""} in {MONTH_NAMES[birthdayMonth-1]} {birthdayYear}</div>
              <div style={{fontSize:11,color:C.textLight}}>{birthdays.filter(b=>b.contacted).length} contacted so far</div>
            </div>
          </div>
        </div>

        <div style={{background:C.card,borderRadius:18,padding:"16px 18px",border:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(123,45,142,.05)"}}>
          <BirthdayList birthdays={birthdays} loading={birthdaysLoading} weekFilter={weekFilter} onSave={saveBirthdayCall} onShowAll={()=>setWeekFilter("all")} />
        </div>
      </div>}

      {/* ══════════ FORM ══════════ */}
      {screen==="form" && <>
        {/* Form Header */}
        <div style={{background:C.card,padding:"14px 20px 12px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={resetForm} style={{background:"transparent",border:"none",color:C.accent,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back</button>
            <div style={{fontSize:15,fontWeight:800,color:C.text}}>{editTarget?"Edit Entry":"New Entry"}</div>
            <div style={{width:60}} />
          </div>
          {/* Progress */}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {[0,1,2,3].map(i=><React.Fragment key={i}>
              <button onClick={()=>{if(i<step)setStep(i);}} style={{width:32,height:32,borderRadius:10,border:"none",fontSize:14,background:i<=step?(i===step?C.accent:C.green):C.border,color:i<=step?"#fff":C.textLight,fontWeight:700,cursor:i<step?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>{i<step?"✓":STEP_ICONS[i]}</button>
              {i<3&&<div style={{flex:1,height:3,borderRadius:2,background:i<step?C.green:C.border}} />}
            </React.Fragment>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            {STEP_LABELS.map((l,i)=><span key={l} style={{fontSize:10,fontWeight:i===step?800:500,color:i===step?C.accent:C.textLight}}>{l}</span>)}
          </div>
        </div>

        {/* Form Body */}
        <div ref={containerRef} style={{padding:"20px 20px 120px",overflowY:"auto"}}>
          <div style={{animation:shakeStep?"shake .4s ease":"springIn .45s ease"}}>

            {/* Step 0 — Customer */}
            {step===0&&<>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Entry Type</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {CONFIG.ENTRY_TYPES.map(t=><button key={t.key} onClick={()=>setEntryType(t.key)} style={{padding:"14px 12px",borderRadius:14,border:`2px solid ${entryType===t.key?t.color:C.border}`,background:entryType===t.key?`${t.color}12`:C.card,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s ease"}}>
                    <span style={{fontSize:24}}>{t.icon}</span><span style={{fontSize:14,fontWeight:entryType===t.key?800:500,color:entryType===t.key?t.color:C.textMid}}>{t.label}</span>
                  </button>)}
                </div>
              </div>
              <InputField label="Customer Name" icon="👤" error={errors.customerName}>
                <input value={form.customerName} onChange={e=>set("customerName",e.target.value)} placeholder="e.g. Priya" onFocus={()=>setFocusedField("name")} onBlur={()=>setFocusedField(null)} style={inputStyle(focusedField==="name",errors.customerName)} />
              </InputField>
              <InputField label="Number of Kids" icon="👶"><NumberStepper value={form.numKids} onChange={v=>set("numKids",v)} min={1} max={10} label="kids" /></InputField>
              {form.numKids>1&&<div style={{background:C.blueSoft,borderRadius:12,padding:"10px 14px",marginBottom:18,border:`1.5px solid ${C.blue}25`,fontSize:12,color:C.blue,fontWeight:600}}>
                ℹ️ {form.numKids} separate rows: {form.customerName||"Name"} - Kid 1, Kid 2{form.numKids>2?`, ... Kid ${form.numKids}`:""}
              </div>}
              <InputField label="Phone Number" icon="📱">
                <input value={form.phone} onChange={e=>set("phone",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" onFocus={()=>setFocusedField("phone")} onBlur={()=>setFocusedField(null)} style={inputStyle(focusedField==="phone")} />
              </InputField>
              <InputField label="Date of Birth (Child)" icon="🎂">
                <input value={form.dob} onChange={e=>set("dob",e.target.value)} type="date" onFocus={()=>setFocusedField("dob")} onBlur={()=>setFocusedField(null)} style={inputStyle(focusedField==="dob")} />
              </InputField>
            </>}

            {/* Step 1 — Payment */}
            {step===1&&<>
              <InputField label="Amount per Kid (₹)" icon="💰" error={errors.amount}>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:800,color:C.accent}}>₹</span>
                  <input value={form.amount} onChange={e=>set("amount",e.target.value.replace(/\D/g,""))} type="tel" inputMode="numeric" placeholder="300" onFocus={()=>setFocusedField("amount")} onBlur={()=>setFocusedField(null)} style={{...inputStyle(focusedField==="amount",errors.amount),paddingLeft:40,fontSize:24,fontWeight:800}} />
                </div>
              </InputField>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
                {CONFIG.AMOUNT_PRESETS.map(a=><button key={a} onClick={()=>set("amount",String(a))} style={{padding:"8px 14px",borderRadius:10,border:`1.5px solid ${form.amount===String(a)?C.accent:C.border}`,background:form.amount===String(a)?C.accentSoft:"transparent",color:form.amount===String(a)?C.accent:C.textMid,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s ease"}}>₹{a}</button>)}
              </div>
              <InputField label="Payment Mode" icon="💳" error={errors.mop}><ChipSelect options={CONFIG.MOP_OPTIONS} value={form.mop} onChange={v=>set("mop",v)} /></InputField>
              <InputField label="Socks (₹ per pair)" icon="🧦">
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {CONFIG.SOCKS_PRICES.map(p=><button key={p} onClick={()=>{set("socks",p);if(p>0&&!form.socksMop)set("socksMop",form.mop);}} style={{padding:"10px 18px",borderRadius:12,border:`2px solid ${form.socks===p?C.accent:C.border}`,background:form.socks===p?C.accentSoft:C.card,color:form.socks===p?C.accent:C.textMid,fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .15s ease"}}>{p===0?"None":`₹${p}`}</button>)}
                  <input value={CONFIG.SOCKS_PRICES.includes(form.socks)?"":(form.socks||"")}
                    onChange={e=>{
                      const v=e.target.value.replace(/\D/g,"");
                      set("socks",v===""?0:parseInt(v));
                      if(v&&!form.socksMop)set("socksMop",form.mop);
                    }}
                    placeholder="Other ₹" type="tel" inputMode="numeric"
                    style={{width:76,boxSizing:"border-box",padding:"10px 12px",borderRadius:12,border:`2px solid ${!CONFIG.SOCKS_PRICES.includes(form.socks)&&form.socks>0?C.accent:C.border}`,background:!CONFIG.SOCKS_PRICES.includes(form.socks)&&form.socks>0?C.accentSoft:C.card,color:C.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"'Nunito',sans-serif",outline:"none"}} />
                </div>
              </InputField>
              {form.socks>0&&<InputField label="Socks Payment Mode" icon="🔄"><ChipSelect options={CONFIG.MOP_OPTIONS} value={form.socksMop} onChange={v=>set("socksMop",v)} /></InputField>}
              <div style={{background:`linear-gradient(135deg,${C.accentSoft},${C.pinkSoft})`,borderRadius:16,padding:"16px 18px",border:`2px solid ${C.accent}20`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,color:C.textMid,fontWeight:600,textTransform:"uppercase"}}>Total Amount</div><div style={{fontSize:11,color:C.textLight}}>{form.numKids} kid{form.numKids>1?"s":""} × ₹{form.amount}{form.socks>0?` + ₹${form.socks}`:""}</div></div>
                <div style={{fontSize:28,fontWeight:900,color:C.accent}}>₹{totalAmount.toLocaleString("en-IN")}</div>
              </div>
            </>}

            {/* Step 2 — Session */}
            {step===2&&<>
              <InputField label="Duration" icon="⏱️"><ChipSelect options={CONFIG.HOUR_OPTIONS} value={form.hours} onChange={v=>set("hours",v)} /></InputField>
              <InputField label="Time In" icon="🕐">
                <input value={form.timeIn} onChange={e=>set("timeIn",e.target.value)} type="time" onFocus={()=>setFocusedField("timein")} onBlur={()=>setFocusedField(null)} style={{...inputStyle(focusedField==="timein"),fontSize:20,fontWeight:700,textAlign:"center"}} />
              </InputField>
              {form.timeIn&&<div style={{background:C.blueSoft,borderRadius:14,padding:"14px 18px",border:`1.5px solid ${C.blue}25`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,color:C.blue,fontWeight:600,textTransform:"uppercase"}}>Session</div><div style={{fontSize:10,color:C.textLight}}>{form.hours} hr</div></div>
                <div style={{fontSize:15,fontWeight:700,color:C.blue}}>{formatTime12(form.timeIn)} → {formatTime12(computeTimeOut(form.timeIn,form.hours))}</div>
              </div>}
            </>}

            {/* Step 3 — Review */}
            {step===3&&<>
              <div style={{fontSize:14,fontWeight:700,color:C.textMid,marginBottom:14,textTransform:"uppercase",letterSpacing:.8}}>Review Entry</div>
              {[
                {l:"Type",v:CONFIG.ENTRY_TYPES.find(t=>t.key===entryType)?.label,i:CONFIG.ENTRY_TYPES.find(t=>t.key===entryType)?.icon},
                {l:"Customer",v:form.customerName,i:"👤"},
                {l:"Kids",v:`${form.numKids}${form.numKids>1?" (separate rows)":""}`,i:"👶"},
                {l:"Amount/Kid",v:`₹${form.amount}`,i:"💰"},
                ...(form.socks>0?[{l:"Socks",v:`₹${form.socks} (${form.socksMop})`,i:"🧦"}]:[]),
                {l:"Payment",v:form.mop,i:"💳"},{l:"Duration",v:`${form.hours} hr`,i:"⏱️"},
                {l:"Timing",v:`${formatTime12(form.timeIn)} → ${formatTime12(computeTimeOut(form.timeIn,form.hours))}`,i:"🕐"},
                {l:"Date",v:formatDateDDMMYYYY(form.date),i:"📅"},
                ...(form.phone?[{l:"Phone",v:form.phone,i:"📱"}]:[]),
                ...(form.dob?[{l:"DOB",v:form.dob,i:"🎂"}]:[]),
              ].map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:18,marginRight:12,width:28,textAlign:"center"}}>{r.i}</span>
                <span style={{fontSize:13,color:C.textLight,flex:1,fontWeight:500}}>{r.l}</span>
                <span style={{fontSize:14,fontWeight:700,color:C.text}}>{r.v}</span>
              </div>)}
              <div style={{marginTop:18,background:`linear-gradient(135deg,${C.greenSoft},#d4edda)`,borderRadius:16,padding:"18px 20px",border:`2px solid ${C.green}30`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:C.green}}>Grand Total</div>
                <div style={{fontSize:30,fontWeight:900,color:C.green}}>₹{totalAmount.toLocaleString("en-IN")}</div>
              </div>
            </>}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,padding:"14px 20px 24px",background:`linear-gradient(to top,${C.bg} 70%,transparent)`,display:"flex",gap:10,zIndex:50}}>
          {step>0&&<button onClick={prev} style={{flex:.4,padding:16,borderRadius:16,border:`2px solid ${C.border}`,background:C.card,color:C.textMid,fontSize:15,fontWeight:700,cursor:"pointer"}}>Back</button>}
          <button disabled={saving} onClick={step===3?(editTarget?handleUpdateSubmit:submitEntry):next} style={{flex:1,padding:16,borderRadius:16,border:"none",background:step===3?`linear-gradient(135deg,${C.green},#27ae60)`:`linear-gradient(135deg,${C.accent},${C.pink})`,color:"#fff",fontSize:16,fontWeight:800,cursor:saving?"wait":"pointer",boxShadow:`0 4px 20px ${step===3?C.green:C.accent}40`,opacity:saving?.7:1}}>
            {step===3?(editTarget?"✓ Update Entry":"✓ Save Entry"):`Next → ${STEP_LABELS[step+1]}`}
          </button>
        </div>
      </>}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
