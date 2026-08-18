// =============================================================================
// FunTunes Shared Components
// Layout/spacing lives in css/app.css; this file keeps only dynamic styling.
// =============================================================================

const C = {
  bg:"#f7f4fb", card:"#ffffff",
  accent:"#7B2D8E", accentSoft:"#f4eaf9", accentDark:"#5a1d6b", accentLight:"#a855f7",
  green:"#3f9c47", greenSoft:"#e9f5ea",
  blue:"#2E86DE", blueSoft:"#e8f1fc",
  pink:"#E84393", pinkSoft:"#fde8f3",
  orange:"#F39C12", orangeSoft:"#fef5e0",
  yellow:"#F4B400", yellowSoft:"#fef8e6",
  text:"#1a1a2e", textMid:"#52526e", textLight:"#8a8aa6",
  border:"#e6e0ee", borderStrong:"#d6cce2",
  danger:"#e04b3c", dangerSoft:"#fdecea",
  warm1:"#faf7fd",
  shadowLift:"0 12px 34px rgba(26,16,40,.16)",
};

const Spinner = ({size=18,color=C.accent}) => (
  <div style={{width:size,height:size,border:`2.5px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}} />
);

const InputField = ({label,icon,error,children,className}) => (
  <div className={`field${className?" "+className:""}`}>
    <label className="field-label">
      {icon && <span>{icon}</span>}{label}
      {error && <span className="err-msg">{error}</span>}
    </label>
    {children}
  </div>
);

const SectionHeading = ({icon,label}) => (
  <div className="section-title">{icon && <span>{icon}</span>}{label}</div>
);

const ChipSelect = ({options,value,onChange}) => (
  <div className="chips">
    {options.map(opt => {
      const v=opt.value||opt; const sel=value===v;
      return <button key={v} type="button" className={`chip${sel?" is-on":""}`} onClick={()=>onChange(v)}>
        {opt.icon && <span>{opt.icon}</span>}{opt.label||opt}
      </button>;
    })}
  </div>
);

const NumberStepper = ({value,onChange,min=1,max=10}) => (
  <div className="stepper">
    <button type="button" onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}>−</button>
    <div className="stepper-value">{value}</div>
    <button type="button" onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}>+</button>
  </div>
);

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_ORDER = ["not_contacted","warm","rejected","booking"];
const STATUS_META = {
  not_contacted: {label:"Not Contacted", dot:C.textLight, bg:`${C.textLight}18`, fg:C.textLight},
  warm:          {label:"Warm",          dot:C.yellow,    bg:C.yellowSoft,       fg:"#8a6d00"},
  rejected:      {label:"Rejected",      dot:C.danger,    bg:C.dangerSoft,       fg:C.danger},
  booking:       {label:"Booking",       dot:C.green,     bg:C.greenSoft,        fg:C.green},
};

const Dropdown = ({value,options,onChange,flex}) => {
  const [open,setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{position:"relative",flex:flex||1,minWidth:0}}>
      <button type="button" className="fld" onClick={()=>setOpen(o=>!o)} style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,
        cursor:"pointer",textAlign:"left",
        borderColor:open?C.accent:undefined,
        boxShadow:open?`0 0 0 3px rgba(123,45,142,.13)`:undefined,
      }}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected?selected.label:""}</span>
        <span style={{fontSize:10,color:C.textLight,flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
      </button>
      {open && <div className="dropdown-panel">
        {options.map(o => <div key={o.value} className={`dropdown-opt${o.value===value?" is-on":""}`}
          onClick={()=>{onChange(o.value);setOpen(false);}}
        >{o.label}</div>)}
      </div>}
    </div>
  );
};

// Icon button that opens a small menu — keeps secondary navigation out of the
// way instead of spending header space on a permanent switcher.
const IconMenu = ({trigger,title,items,activeValue}) => {
  const [open,setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} style={{position:"relative"}}>
      <button type="button" className="btn btn-sm btn-icon" title={title} aria-label={title}
        aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>{trigger}</button>
      {open && <div className="menu" role="menu">
        {items.map((it,i) => it.separator
          ? <div key={"sep"+i} className="menu-sep" />
          : <button key={it.value||i} type="button" role="menuitem"
              className={`menu-item${it.value!=null&&it.value===activeValue?" is-on":""}`}
              onClick={()=>{ setOpen(false); it.onSelect(); }}>
              {it.icon && <span>{it.icon}</span>}{it.label}
            </button>)}
      </div>}
    </div>
  );
};

const initialStatus = (b) => b.status || (b.contacted ? "warm" : "not_contacted");

const BirthdayCard = ({b, isToday, onSave}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [phone, setPhone] = React.useState(b.phone || "");
  const [notes, setNotes] = React.useState(b.notes || "");
  const [status, setStatus] = React.useState(initialStatus(b));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setPhone(b.phone || ""); setNotes(b.notes || ""); setStatus(initialStatus(b));
  }, [b.key]);

  const kidName = b.kidName || b.name || "—";
  const meta = STATUS_META[status] || STATUS_META.not_contacted;
  const dirty = phone !== (b.phone||"") || notes !== (b.notes||"") || status !== initialStatus(b);

  // parentName is no longer edited here; `...b` carries the stored value
  // through unchanged so saving does not blank it out.
  const save = async () => {
    setSaving(true);
    await onSave({ ...b, phone, notes, status });
    setSaving(false);
  };

  const setStatusAndSave = async (s) => {
    setStatus(s);
    setSaving(true);
    await onSave({ ...b, phone, notes, status: s });
    setSaving(false);
  };

  return (
    <div className="card" style={{
      borderColor: status==="not_contacted" ? (isToday?C.pink+"55":C.border) : meta.dot+"55",
      background: status==="not_contacted" ? (isToday?C.pinkSoft:C.card) : meta.bg,
      overflow:"hidden", animation:"springIn .3s ease both", alignSelf:"start",
    }}>
      <div onClick={() => setExpanded(x=>!x)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",cursor:"pointer"}}>
        <div style={{width:38,height:38,borderRadius:10,background:isToday?C.pink:C.accentSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>
          <div style={{fontSize:15,fontWeight:900,color:isToday?"#fff":C.accent}}>{b.day}</div>
          <div style={{fontSize:8,fontWeight:800,color:isToday?"#fff":C.accent,textTransform:"uppercase",marginTop:1}}>{MONTH_NAMES[b.month-1]?.slice(0,3)}</div>
        </div>
        <div className="row-body">
          <div className="row-title">{kidName}{isToday && " 🎉"}</div>
          <div className="row-sub">{b.phone||"No phone"}</div>
        </div>
        <div title={meta.label} style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:meta.dot,boxShadow:`0 0 0 3px ${meta.dot}25`}} />
        <span style={{fontSize:10,color:C.textLight,flexShrink:0,transform:expanded?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
      </div>

      {expanded && (
        <div style={{padding:"0 12px 12px",display:"flex",flexDirection:"column",gap:10,borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:2}} onClick={e=>e.stopPropagation()}>
          <div>
            <div className="field-label">Phone</div>
            <input className="fld" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="Mobile number" type="tel" inputMode="numeric" />
          </div>

          <div>
            <div className="field-label">Call Notes</div>
            <textarea className="fld" value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              placeholder="e.g. Spoke to mom, interested, will confirm by Friday..." style={{resize:"vertical"}} />
          </div>

          <div>
            <div className="field-label">Status</div>
            <div className="chips">
              {STATUS_ORDER.map(s => <button key={s} type="button" className="chip" onClick={()=>setStatusAndSave(s)} style={{
                borderColor:status===s?STATUS_META[s].dot:undefined,
                background:status===s?STATUS_META[s].bg:undefined,
                color:status===s?STATUS_META[s].fg:undefined,
                fontWeight:status===s?800:600,
              }}>
                <span style={{width:7,height:7,borderRadius:"50%",background:STATUS_META[s].dot,flexShrink:0}} />
                {STATUS_META[s].label}
              </button>)}
            </div>
            {status==="booking" && <div className="field-hint" style={{color:C.green}}>📋 Follow up: Sindhu</div>}
          </div>

          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {phone && <a href={`tel:${phone}`} className="btn btn-sm" onClick={e=>e.stopPropagation()}
              style={{background:C.blueSoft,color:C.blue,borderColor:"transparent",textDecoration:"none"}}>📞 Call</a>}
            {dirty && <button type="button" className="btn btn-sm btn-primary" onClick={save} disabled={saving} style={{marginLeft:"auto"}}>
              {saving?"Saving…":"Save changes"}
            </button>}
          </div>
        </div>
      )}
    </div>
  );
};

const weekRangeLabel = (w) => `days ${(w-1)*7+1}–${Math.min(31,w*7)}`;
const weekOfDay = (day) => Math.min(5, Math.ceil(Number(day)/7));

const BirthdayList = ({birthdays,loading,weekFilter,onSave,onShowAll}) => {
  if (loading) return <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading birthdays…</div></div>;
  if (!birthdays.length) return <div className="empty-state">🎈 No birthdays found for this month.</div>;

  const filtered = weekFilter === "all" ? birthdays : birthdays.filter(b => weekOfDay(b.day) === weekFilter);
  if (!filtered.length) return (
    <div className="empty-state">
      <div>🎈 No birthdays in {weekRangeLabel(weekFilter)}.</div>
      <div style={{fontSize:12,margin:"6px 0 14px"}}>{birthdays.length} birthday{birthdays.length!==1?"s":""} this month overall.</div>
      {onShowAll && <button type="button" className="btn btn-sm" onClick={onShowAll}>Show all this month</button>}
    </div>
  );

  const now = new Date();

  return (
    <div className="birthdays-grid">
      {filtered.map((b,i) => (
        <BirthdayCard key={b.key || i} b={b} isToday={b.day === now.getDate()} onSave={onSave} />
      ))}
    </div>
  );
};

// ── Dashboard Components ──

const TabBar = ({tabs,active,onChange}) => (
  <div className="tab-bar">
    {tabs.map(t => (
      <button key={t.value} type="button"
        className={`tab-item${active===t.value?" is-on":""}`}
        onClick={()=>onChange(t.value)}>
        {t.icon && <span>{t.icon}</span>}{t.label}
      </button>
    ))}
  </div>
);

const CalendarFilter = ({mode,date,rangeStart,rangeEnd,onModeChange,onDateChange,onRangeChange,onToday}) => {
  const today = new Date().toISOString().slice(0,10);
  const isToday = date === today;
  return (
    <div className="cal-filter">
      <div className="cal-filter-modes">
        {[{v:"day",l:"Day"},{v:"month",l:"Month"},{v:"range",l:"Range"}].map(m => (
          <button key={m.v} type="button" className={`chip chip-sm${mode===m.v?" is-on":""}`}
            onClick={()=>onModeChange(m.v)}>{m.l}</button>
        ))}
      </div>
      {mode==="day" && <>
        <input className="fld cal-filter-date" type="date" value={date} onChange={e=>onDateChange(e.target.value)} />
        {!isToday && <button type="button" className="chip chip-sm" onClick={onToday}>Today</button>}
      </>}
      {mode==="month" && <input className="fld cal-filter-date" type="month" value={date.slice(0,7)}
        onChange={e=>onDateChange(e.target.value+"-01")} />}
      {mode==="range" && <>
        <input className="fld cal-filter-date" type="date" value={rangeStart||""} onChange={e=>onRangeChange(e.target.value,rangeEnd)} />
        <span className="cal-filter-to">to</span>
        <input className="fld cal-filter-date" type="date" value={rangeEnd||""} onChange={e=>onRangeChange(rangeStart,e.target.value)} />
      </>}
    </div>
  );
};

const BarChart = ({data,labelKey,valueKey,color,height=180,prefix=""}) => {
  if (!data||!data.length) return <div className="empty-state">No data to chart.</div>;
  const max = Math.max(...data.map(d=>d[valueKey]),1);
  return (
    <div className="bar-chart" style={{height}}>
      <div className="bar-chart-bars">
        {data.map((d,i) => {
          const pct = (d[valueKey]/max)*100;
          return (
            <div key={i} className="bar-chart-col">
              <div className="bar-chart-val">{prefix}{d[valueKey].toLocaleString("en-IN")}</div>
              <div className="bar-chart-bar" style={{height:`${Math.max(pct,2)}%`,background:color||C.accent}} />
              <div className="bar-chart-label">{d[labelKey]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatsCards = ({entries}) => {
  const totalRevenue = entries.reduce((a,e)=>a+(parseInt(e.amount)||0),0);
  const totalKids = entries.reduce((a,e)=>a+(parseInt(e.numKids)||1),0);
  const totalSocks = entries.reduce((a,e)=>a+(parseInt(e.socks)||0),0);
  const upiTotal = entries.reduce((a,e)=>a+(parseInt(e.playUpi)||0)+(parseInt(e.socksUpi)||0),0);
  const cashTotal = entries.reduce((a,e)=>a+(parseInt(e.playCash)||0)+(parseInt(e.socksCash)||0),0);
  const items = [
    {l:"Entries",v:entries.length,i:"🎟️",bg:C.accentSoft,clr:C.accent},
    {l:"Revenue",v:`₹${totalRevenue.toLocaleString("en-IN")}`,i:"💰",bg:C.greenSoft,clr:C.green},
    {l:"Kids",v:totalKids,i:"👶",bg:C.blueSoft,clr:C.blue},
    {l:"Socks",v:`₹${totalSocks.toLocaleString("en-IN")}`,i:"🧦",bg:C.orangeSoft,clr:C.orange},
    {l:"UPI",v:`₹${upiTotal.toLocaleString("en-IN")}`,i:"📱",bg:C.accentSoft,clr:C.accent},
    {l:"Cash",v:`₹${cashTotal.toLocaleString("en-IN")}`,i:"💵",bg:C.yellowSoft,clr:"#8a6d00"},
  ];
  return (
    <div className="stats-grid stats-grid-6">
      {items.map((s,i) => (
        <div key={i} className="stat">
          <div className="stat-icon" style={{background:s.bg}}>{s.i}</div>
          <div style={{minWidth:0}}>
            <div className="stat-value" style={{color:s.clr}}>{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PeriodSummary = ({entries,mode}) => {
  if (!entries.length) return null;

  const grouped = {};
  entries.forEach(e => {
    let key;
    if (mode === "month") {
      key = e.date ? e.date.slice(0,7) : "unknown";
    } else {
      key = e.date || "unknown";
    }
    if (!grouped[key]) grouped[key] = {revenue:0,kids:0,count:0};
    grouped[key].revenue += parseInt(e.amount)||0;
    grouped[key].kids += parseInt(e.numKids)||1;
    grouped[key].count += 1;
  });

  const sorted = Object.keys(grouped).sort();
  const rows = sorted.map(k => ({
    label: mode==="month" ? MONTH_NAMES[parseInt(k.split("-")[1])-1]+" "+k.split("-")[0] : k.split("-").reverse().join("/"),
    ...grouped[k],
  }));

  const kidsData = rows.map(r => ({label:r.label, value:r.kids}));
  const revenueData = rows.map(r => ({label:r.label, value:r.revenue}));

  return (
    <div className="period-summary">
      <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
        <div className="card-title" style={{marginBottom:12}}>👶 Kids per {mode==="month"?"month":"day"}</div>
        <BarChart data={kidsData} labelKey="label" valueKey="value" color={C.blue} height={160} />
      </div>
      <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
        <div className="card-title" style={{marginBottom:12}}>💰 Revenue per {mode==="month"?"month":"day"}</div>
        <BarChart data={revenueData} labelKey="label" valueKey="value" color={C.green} height={160} prefix="₹" />
      </div>
      <div className="card" style={{marginBottom:"var(--sp-4)"}}>
        <div className="card-head"><div className="card-title">📊 Breakdown</div></div>
        <div className="breakdown-table-wrap">
          <table className="breakdown-table">
            <thead><tr><th>Date</th><th>Entries</th><th>Kids</th><th>Revenue</th></tr></thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={i}><td>{r.label}</td><td>{r.count}</td><td>{r.kids}</td><td>₹{r.revenue.toLocaleString("en-IN")}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EntryList = ({entries,onEdit,onDelete,loading}) => {
  if (loading) return <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading entries…</div></div>;
  if (!entries.length) return <div className="empty-state">No entries today yet — start with <strong style={{color:C.accent}}>New Entry</strong>.</div>;
  return (
    <div className="entries-grid">
      {entries.map((e,i) => {
        const name=e.customerName||e["Customer name"]||"—";
        const amt=e.amount||e["Amount"]||0;
        const mop=e.mop||e["MOP"]||"";
        const kids=e.numKids||e["No of kids"]||1;
        const timing=e.timing||e["Timing"]||"";
        const typeColors = {"funzone":C.accentSoft,"birthday":C.pinkSoft,"event":C.blueSoft,"daycare":C.orangeSoft};
        const typeKey = e.entryType||e["Entry Type"]||"funzone";
        return (
          <div key={i} className="row-card" style={{animation:"springIn .3s ease both",animationDelay:`${Math.min(i,10)*.025}s`}}>
            <div className="row-icon" style={{background:typeColors[typeKey]||C.accentSoft}}>
              {CONFIG.ENTRY_TYPES.find(t=>t.key===typeKey)?.icon||"🎪"}
            </div>
            <div className="row-body">
              <div className="row-title">{name}</div>
              <div className="row-sub">{kids>1?`${kids} kids · `:""}{mop}{timing?` · ${timing}`:""}</div>
            </div>
            <div className="row-amount">₹{parseInt(amt).toLocaleString("en-IN")}</div>
            <div className="row-actions">
              <button type="button" className="icon-btn" title="Edit" onClick={()=>onEdit(e)}>✏️</button>
              <button type="button" className="icon-btn danger" title="Delete" onClick={()=>onDelete(e)}>🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
