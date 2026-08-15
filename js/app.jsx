// =============================================================================
// FunTunes Main App v3 — Purple Theme + Logo
// =============================================================================
const { useState, useRef, useEffect, useCallback } = React;

const STEP_LABELS = ["Customer","Payment","Review"];
const STEP_ICONS = ["👤","💳","✅"];
const LAST_STEP = STEP_LABELS.length - 1;

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

// ── Pricing ──
// Full hours at RATE_PER_HOUR + a trailing half hour at RATE_PER_HALF_HOUR.
function computeAmountForHours(hours) {
  const h = parseFloat(hours)||0;
  const full = Math.floor(h);
  return full*CONFIG.RATE_PER_HOUR + ((h-full) >= 0.5 ? CONFIG.RATE_PER_HALF_HOUR : 0);
}

function formatHoursLabel(hours) {
  const preset = CONFIG.HOUR_OPTIONS.find(o=>o.value===String(hours));
  if (preset) return preset.label;
  const h = parseFloat(hours)||0;
  return h === 1 ? "1 hour" : `${h} hours`;
}

// ── Main App ──
function App() {
  const [screen,setScreen] = useState("form");
  const [step,setStep] = useState(0);
  const [entryType,setEntryType] = useState("funzone");
  const [form,setFormState] = useState(getDefaultForm());
  const [errors,setErrors] = useState({});
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
  const [phoneLookupLoading,setPhoneLookupLoading] = useState(false);
  const containerRef = useRef(null);
  const lastLookedUpPhone = useRef("");

  function getDefaultForm() {
    const n=new Date();
    const hours=CONFIG.DEFAULT_HOURS, socksCount=CONFIG.DEFAULT_SOCK_COUNT;
    return {customerName:"",amount:String(computeAmountForHours(hours)),mop:CONFIG.DEFAULT_MOP,numKids:1,
      hours:hours,hoursMode:"preset",
      timeIn:`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,
      socks:socksCount*CONFIG.SOCKS_RATE,sockCount:socksCount,sockMode:"preset",
      socksMop:socksCount>0?CONFIG.DEFAULT_MOP:"",phone:"",dob:"",date:n.toISOString().slice(0,10)};
  }

  const set = useCallback((key,val) => {
    setFormState(f=>({...f,[key]:val}));
    setErrors(e=>({...e,[key]:undefined}));
  },[]);

  // Duration drives the per-kid amount; sock count drives the socks charge.
  const setHours = useCallback((v) => {
    setFormState(f=>({...f,hours:v,amount:String(computeAmountForHours(v))}));
    setErrors(e=>({...e,amount:undefined}));
  },[]);

  const setSockCount = useCallback((n) => {
    setFormState(f=>({...f,sockCount:n,socks:n*CONFIG.SOCKS_RATE,
      socksMop:n>0?(f.socksMop||f.mop):""}));
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

  async function lookupByPhone(phone) {
    if (phone.length !== 10 || phone === lastLookedUpPhone.current) return;
    lastLookedUpPhone.current = phone;
    setPhoneLookupLoading(true);
    try {
      const res = await api.lookupPhone(phone);
      if (res.success && res.found) {
        setFormState(f => ({
          ...f,
          customerName: f.customerName || res.customerName || f.customerName,
          dob: f.dob || res.dob || f.dob,
        }));
        if (res.customerName || res.dob) showToastMsg("Found previous entry — autofilled","success");
      }
    } catch(e) { console.error("Phone lookup:",e); }
    finally { setPhoneLookupLoading(false); }
  }

  const computeTimeOut = (timeIn,hours) => {
    if(!timeIn) return "";
    const [h,m]=timeIn.split(":").map(Number);
    const dur=parseFloat(hours)||1;
    const t=h*60+m+dur*60;
    return `${String(Math.floor(t/60)%24).padStart(2,"0")}:${String(Math.round(t%60)).padStart(2,"0")}`;
  };

  const totalAmount = (parseInt(form.amount)||0)*form.numKids + form.socks;

  const validate = (s) => {
    const errs={};
    if(s===0&&!form.customerName.trim()) errs.customerName="Required";
    if(s===1&&(!form.amount||parseInt(form.amount)<=0)) errs.amount="Enter amount";
    if(s===1&&!form.mop) errs.mop="Select mode";
    setErrors(errs);
    if(Object.keys(errs).length){setShakeStep(true);setTimeout(()=>setShakeStep(false),500);}
    return !Object.keys(errs).length;
  };

  const next = () => { if(validate(step)){setStep(s=>Math.min(s+1,LAST_STEP));containerRef.current?.scrollTo({top:0,behavior:"smooth"});} };
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
    lastLookedUpPhone.current = String(entry.phone||entry["Phone number"]||"");
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
    const hours = String(entry.hours||entry["Hours"]||CONFIG.DEFAULT_HOURS);
    const socksTotal = parseInt(entry.socks||entry["Socks"]||0)||0;
    const sockCount = socksTotal>0?Math.max(1,Math.round(socksTotal/CONFIG.SOCKS_RATE)):0;
    setFormState({
      customerName:entry.customerName||entry["Customer name"]||"",
      amount:String(entry.amount||entry["Amount"]||300),
      mop:entry.mop||entry["MOP"]||CONFIG.DEFAULT_MOP,
      numKids:parseInt(entry.numKids||entry["No of kids"]||1),
      hours:hours,
      hoursMode:CONFIG.HOUR_OPTIONS.some(o=>o.value===hours)?"preset":"custom",
      timeIn:timeIn,
      socks:socksTotal,
      sockCount:sockCount,
      sockMode:CONFIG.SOCK_COUNT_OPTIONS.includes(sockCount)?"preset":"custom",
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
    lastLookedUpPhone.current = "";
  }

  function startNewEntry() {
    setFormState(getDefaultForm()); setEditTarget(null); setScreen("form"); setStep(0);
    lastLookedUpPhone.current = "";
  }

  const dateDisplay = getCurrentDate();
  const timeDisplay = getCurrentTime12();

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="app-shell">

      {/* Toast */}
      {toast && <div className="toast" style={{background:toast.type==="success"?C.green:toast.type==="error"?C.danger:C.blue}}>{toast.msg}</div>}

      {/* Saving */}
      {saving && <div className="overlay" style={{zIndex:150}}>
        <div className="modal" style={{padding:"24px 30px",maxWidth:260}}>
          <Spinner size={28} /><div style={{marginTop:10,fontSize:13.5,fontWeight:700,color:C.textMid}}>Saving to Sheet…</div>
        </div></div>}

      {/* Success */}
      {showSuccess && <div className="overlay">
        <div className="modal">
          <div style={{width:64,height:64,margin:"0 auto 16px",borderRadius:"50%",background:C.greenSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M10 20 L17 27 L30 14" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{animation:"checkDraw .6s ease .3s forwards"}} /></svg>
          </div>
          <h2 style={{margin:"0 0 6px",fontSize:19,fontWeight:800}}>Entry saved</h2>
          <p style={{margin:"0 0 2px",fontSize:13.5,color:C.textMid}}><strong>{form.customerName}</strong>{form.numKids>1?` × ${form.numKids} kids`:""}</p>
          <p style={{margin:"0 0 20px",fontSize:26,fontWeight:800,color:C.green}}>₹{totalAmount.toLocaleString("en-IN")}</p>
          <button className="btn btn-primary btn-block btn-lg" style={{marginBottom:8}}
            onClick={()=>{setFormState(getDefaultForm());setStep(0);setShowSuccess(false);setEntryType("funzone");}}>+ Add another</button>
          <button className="btn btn-block" onClick={resetForm}>📊 Go to dashboard</button>
        </div></div>}

      {/* ══════════ HOME ══════════ */}
      {screen==="home" && <>
        <header className="appbar">
          <div className="container appbar-inner">
            <div className="appbar-brand">
              <img className="appbar-logo" src="icons/logo-header.png" alt="" />
              <div style={{minWidth:0}}>
                <div className="appbar-title">{CONFIG.APP_NAME}</div>
                <div className="appbar-sub">{dateDisplay} · {timeDisplay}</div>
              </div>
            </div>
            <div className="appbar-actions">
              <button className="btn btn-sm" onClick={()=>setScreen("birthdays")} title="Birthdays">🎂 <span style={{marginLeft:2}}>Birthdays</span></button>
              <button className="btn btn-sm btn-primary new-entry-inline" onClick={startNewEntry}>+ New Entry</button>
            </div>
          </div>
        </header>

        <div className="container page">
          {/* Stats */}
          <div className="stats-grid">
            {[
              {l:"Entries",v:todayEntries.length,i:"🎟️",bg:C.accentSoft,clr:C.accent},
              {l:"Revenue",v:`₹${todayEntries.reduce((a,e)=>a+(parseInt(e.amount||e["Amount"]||0)),0).toLocaleString("en-IN")}`,i:"💰",bg:C.greenSoft,clr:C.green},
              {l:"Kids",v:todayEntries.reduce((a,e)=>a+(parseInt(e.numKids||e["No of kids"]||1)),0),i:"👶",bg:C.blueSoft,clr:C.blue}
            ].map((s,i)=>
              <div key={i} className="stat">
                <div className="stat-icon" style={{background:s.bg}}>{s.i}</div>
                <div style={{minWidth:0}}>
                  <div className="stat-value" style={{color:s.clr}}>{s.v}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              </div>)}
          </div>

          {/* Entries */}
          <div className="card">
            <div className="card-head">
              <div style={{display:"flex",alignItems:"baseline",gap:8,minWidth:0}}>
                <span className="card-title">Today's entries</span>
                {!loading && todayEntries.length>0 &&
                  <span style={{fontSize:12,color:C.textLight,fontWeight:600}}>{todayEntries.length}</span>}
              </div>
              <button className="btn btn-sm" onClick={fetchToday} disabled={loading}>↻ Refresh</button>
            </div>
            <div className="card-pad">
              <EntryList entries={todayEntries} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
            </div>
          </div>
        </div>

        {/* New Entry (mobile floating action button) */}
        <div className="new-entry-fab">
          <button className="btn btn-primary btn-block btn-lg" onClick={startNewEntry} style={{boxShadow:`0 6px 22px ${C.accent}45`,animation:"slideUp .35s ease"}}>+ New Entry</button>
        </div>
      </>}

      {/* ══════════ BIRTHDAYS ══════════ */}
      {screen==="birthdays" && <>
        <header className="appbar">
          <div className="container appbar-inner">
            <div className="appbar-brand">
              <button className="btn btn-sm btn-ghost" onClick={()=>setScreen("home")}>← Back</button>
              <span className="card-title">🎂 Birthdays</span>
            </div>
            <button className="btn btn-sm" onClick={()=>fetchBirthdays()} disabled={birthdaysLoading}>↻ Refresh</button>
          </div>
        </header>

        <div className="container page">
          {/* Filters */}
          <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
            <div style={{display:"flex",gap:"var(--gap)",marginBottom:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:8,flex:"1 1 260px",minWidth:0}}>
                <Dropdown flex={1.5} value={birthdayMonth} onChange={changeMonth}
                  options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
                <Dropdown flex={1} value={birthdayYear} onChange={changeYear}
                  options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
              </div>
              <div className="chips" style={{flex:"1 1 auto",alignItems:"center"}}>
                <button type="button" className={`chip${weekFilter==="all"?" is-on":""}`} onClick={()=>setWeekFilter("all")}>All</button>
                {[1,2,3,4,5].map(w=>(
                  <button key={w} type="button" className={`chip${weekFilter===w?" is-on":""}`} onClick={()=>setWeekFilter(w)}>W{w}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.textMid,fontWeight:600,borderTop:`1px solid ${C.border}`,paddingTop:11}}>
              <span>🎉 <strong style={{color:C.text}}>{birthdays.length}</strong> birthday{birthdays.length!==1?"s":""} in {MONTH_NAMES[birthdayMonth-1]} {birthdayYear}</span>
              <span style={{color:C.textLight}}>·</span>
              <span style={{color:C.green}}>{birthdays.filter(b=>(b.status||(b.contacted?"warm":"not_contacted"))!=="not_contacted").length} contacted</span>
            </div>
          </div>

          <BirthdayList birthdays={birthdays} loading={birthdaysLoading} weekFilter={weekFilter} onSave={saveBirthdayCall} onShowAll={()=>setWeekFilter("all")} />
        </div>
      </>}

      {/* ══════════ FORM ══════════ */}
      {screen==="form" && <>
        <header className="appbar">
          <div className="container container--form" style={{paddingTop:9,paddingBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9}}>
              <div className="appbar-brand">
                <img className="appbar-logo" src="icons/logo-header.png" alt="" />
                <span className="card-title">{editTarget?"Edit entry":"New entry"}</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={resetForm}>📊 Dashboard</button>
            </div>
            <div className="stepbar">
              {STEP_LABELS.map((_,i)=><React.Fragment key={i}>
                <button type="button" onClick={()=>{if(i<step)setStep(i);}}
                  className={`stepdot${i===step?" is-current":i<step?" is-done":""}`}>{i<step?"✓":STEP_ICONS[i]}</button>
                {i<LAST_STEP&&<div className={`stepline${i<step?" is-done":""}`} />}
              </React.Fragment>)}
            </div>
            <div className="steplabels">
              {STEP_LABELS.map((l,i)=><span key={l} className={`steplabel${i===step?" is-current":""}`}>{l}</span>)}
            </div>
          </div>
        </header>

        {/* Form Body */}
        <div ref={containerRef} className="container container--form page" style={{paddingBottom:0}}>
          <div style={{animation:shakeStep?"shake .4s ease":"springIn .3s ease"}}>

            {/* Step 0 — Customer */}
            {step===0&&<>
              <div className="section">
                <SectionHeading label="Entry type" />
                <div className="segmented">
                  {CONFIG.ENTRY_TYPES.map(t=><button key={t.key} type="button"
                    className={`seg${entryType===t.key?" is-on":""}`} onClick={()=>setEntryType(t.key)}
                    style={entryType===t.key?{color:t.color,background:`${t.color}10`}:undefined}>
                    <span style={{fontSize:17}}>{t.icon}</span>{t.label}
                  </button>)}
                </div>
              </div>

              <div className="section">
                <SectionHeading label="Customer" />
                <div className="form-grid">
                  <InputField label="Phone Number" icon="📱">
                    <div style={{position:"relative"}}>
                      <input className="fld" value={form.phone} placeholder="10-digit mobile" type="tel" inputMode="numeric"
                        onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,10);set("phone",v);if(v.length===10)lookupByPhone(v);}} />
                      {phoneLookupLoading && <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}><Spinner size={16} /></div>}
                    </div>
                  </InputField>
                  <InputField label="Customer Name" icon="👤" error={errors.customerName}>
                    <input className={`fld${errors.customerName?" is-error":""}`} value={form.customerName} placeholder="e.g. Priya"
                      onChange={e=>set("customerName",e.target.value)} />
                  </InputField>
                  <InputField label="Number of Kids" icon="👶">
                    <NumberStepper value={form.numKids} onChange={v=>set("numKids",v)} min={1} max={10} />
                  </InputField>
                  <InputField label="Date of Birth (Child)" icon="🎂">
                    <input className="fld" value={form.dob} onChange={e=>set("dob",e.target.value)} type="date" />
                  </InputField>
                </div>
                {form.numKids>1&&<div className="field-hint" style={{color:C.blue,background:C.blueSoft,padding:"9px 11px",borderRadius:10,marginTop:2}}>
                  ℹ️ Saved as {form.numKids} separate rows: {form.customerName||"Name"} - Kid 1, Kid 2{form.numKids>2?`, … Kid ${form.numKids}`:""}
                </div>}
              </div>
            </>}

            {/* Step 1 — Payment */}
            {step===1&&<>
              <div className="section">
                <SectionHeading icon="🎪" label="Playtime" />
                <div className="form-grid">
                  <InputField label="Duration" icon="⏱️">
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Dropdown flex={1}
                        value={form.hoursMode==="custom"?"custom":String(form.hours)}
                        options={[...CONFIG.HOUR_OPTIONS.map(o=>({value:o.value,label:o.label})),{value:"custom",label:"Custom…"}]}
                        onChange={v=>{
                          if(v==="custom"){ set("hoursMode","custom"); }
                          else { set("hoursMode","preset"); setHours(v); }
                        }} />
                      {form.hoursMode==="custom" &&
                        <input className="fld" value={form.hours} onChange={e=>setHours(e.target.value.replace(/[^\d.]/g,""))}
                          placeholder="hrs" type="tel" inputMode="decimal" style={{width:74,flexShrink:0,textAlign:"center"}} />}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:7,fontSize:11,color:C.textLight,fontWeight:600}}>
                      <span title="Start time">🕐</span>
                      <input className="fld fld-compact" value={form.timeIn} onChange={e=>set("timeIn",e.target.value)} type="time" />
                      {form.timeIn && <span>→ {formatTime12(computeTimeOut(form.timeIn,form.hours))}</span>}
                    </div>
                  </InputField>

                  <InputField label="Playtime (₹ per kid)" icon="💰" error={errors.amount}>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:16,fontWeight:800,color:C.accent,pointerEvents:"none"}}>₹</span>
                      <input className={`fld fld-lg${errors.amount?" is-error":""}`} value={form.amount} type="tel" inputMode="numeric" placeholder="300"
                        onChange={e=>set("amount",e.target.value.replace(/\D/g,""))} />
                    </div>
                  </InputField>
                </div>
                <InputField label="Payment Mode" icon="💳" error={errors.mop}>
                  <ChipSelect options={CONFIG.MOP_OPTIONS} value={form.mop} onChange={v=>set("mop",v)} />
                </InputField>
              </div>

              <div className="section">
                <SectionHeading icon="🧦" label="Socks" />
                <div className="form-grid">
                  <InputField label={`Pairs (₹${CONFIG.SOCKS_RATE} each)`}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Dropdown flex={1}
                        value={form.sockMode==="custom"?"custom":String(form.sockCount||0)}
                        options={[...CONFIG.SOCK_COUNT_OPTIONS.map(n=>({value:String(n),label:n===0?"None":`${n} pair${n>1?"s":""}`})),{value:"custom",label:"Custom…"}]}
                        onChange={v=>{
                          if(v==="custom"){ set("sockMode","custom"); }
                          else { set("sockMode","preset"); setSockCount(parseInt(v)); }
                        }} />
                      {form.sockMode==="custom" &&
                        <input className="fld" value={form.sockCount||""} placeholder="pairs" type="tel" inputMode="numeric"
                          onChange={e=>{const v=e.target.value.replace(/\D/g,"");setSockCount(v===""?0:parseInt(v));}}
                          style={{width:74,flexShrink:0,textAlign:"center"}} />}
                    </div>
                  </InputField>
                  {form.socks>0&&<InputField label="Socks Payment Mode" icon="🔄">
                    <ChipSelect options={CONFIG.MOP_OPTIONS} value={form.socksMop} onChange={v=>set("socksMop",v)} />
                  </InputField>}
                </div>
              </div>

              <div className="card card-pad" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,background:C.accentSoft,borderColor:`${C.accent}30`}}>
                <div>
                  <div className="stat-label" style={{color:C.textMid}}>Total amount</div>
                  <div style={{fontSize:11.5,color:C.textMid,fontWeight:600,marginTop:2}}>{form.numKids} kid{form.numKids>1?"s":""} × ₹{form.amount}{form.socks>0?` + ₹${form.socks} socks`:""}</div>
                </div>
                <div style={{fontSize:24,fontWeight:800,color:C.accent,letterSpacing:-0.5}}>₹{totalAmount.toLocaleString("en-IN")}</div>
              </div>
            </>}

            {/* Step 2 — Review */}
            {step===2&&<>
              <div className="section">
                <SectionHeading label="Review entry" />
                <div className="card">
                  {[
                    {l:"Type",v:CONFIG.ENTRY_TYPES.find(t=>t.key===entryType)?.label,i:CONFIG.ENTRY_TYPES.find(t=>t.key===entryType)?.icon},
                    {l:"Customer",v:form.customerName,i:"👤"},
                    {l:"Kids",v:`${form.numKids}${form.numKids>1?" (separate rows)":""}`,i:"👶"},
                    {l:"Playtime",v:`₹${form.amount} per kid`,i:"💰"},
                    ...(form.socks>0?[{l:"Socks",v:`${form.sockCount} pair${form.sockCount>1?"s":""} · ₹${form.socks} (${form.socksMop})`,i:"🧦"}]:[]),
                    {l:"Payment",v:form.mop,i:"💳"},
                    {l:"Duration",v:formatHoursLabel(form.hours),i:"⏱️"},
                    {l:"Timing",v:`${formatTime12(form.timeIn)} → ${formatTime12(computeTimeOut(form.timeIn,form.hours))}`,i:"🕐"},
                    {l:"Date",v:formatDateDDMMYYYY(form.date),i:"📅"},
                    ...(form.phone?[{l:"Phone",v:form.phone,i:"📱"}]:[]),
                    ...(form.dob?[{l:"DOB",v:form.dob,i:"🎂"}]:[]),
                  ].map((r,i,arr)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px var(--card-p)",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:14,width:20,textAlign:"center",flexShrink:0}}>{r.i}</span>
                    <span style={{fontSize:12.5,color:C.textLight,flex:1,fontWeight:600}}>{r.l}</span>
                    <span style={{fontSize:13.5,fontWeight:700,textAlign:"right"}}>{r.v}</span>
                  </div>)}
                </div>
              </div>
              <div className="card card-pad" style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.greenSoft,borderColor:`${C.green}40`}}>
                <div style={{fontSize:13,fontWeight:800,color:C.green,textTransform:"uppercase",letterSpacing:.5}}>Grand total</div>
                <div style={{fontSize:26,fontWeight:800,color:C.green,letterSpacing:-0.5}}>₹{totalAmount.toLocaleString("en-IN")}</div>
              </div>
            </>}

            {/* Actions */}
            <div className="form-actions">
              {step>0&&<button className="btn btn-lg" onClick={prev} style={{flex:"0 0 100px"}}>Back</button>}
              <button className={`btn btn-lg ${step===LAST_STEP?"btn-success":"btn-primary"}`} disabled={saving} style={{flex:1}}
                onClick={step===LAST_STEP?(editTarget?handleUpdateSubmit:submitEntry):next}>
                {step===LAST_STEP?(editTarget?"✓ Update entry":"✓ Save entry"):`Next → ${STEP_LABELS[step+1]}`}
              </button>
            </div>
          </div>
        </div>
      </>}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
