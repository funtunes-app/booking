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

const STATUS_ORDER = ["not_contacted","warm","booking"];
const STATUS_META = {
  not_contacted: {label:"Not Contacted", dot:"#e57373", bg:"#fce4e4", fg:"#c62828"},
  warm:          {label:"Contacted",     dot:C.green,   bg:C.greenSoft, fg:C.green},
  booking:       {label:"Booked",        dot:C.accent,  bg:C.accentSoft,fg:C.accent},
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

const BirthdayMiniCard = ({b, onSave}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [phone, setPhone] = React.useState(b.phone || "");
  const [notes, setNotes] = React.useState(b.notes || "");
  const [status, setStatus] = React.useState(b.status || "not_contacted");
  const [saving, setSaving] = React.useState(false);
  const meta = STATUS_META[status] || STATUS_META.not_contacted;

  React.useEffect(() => {
    setPhone(b.phone || ""); setNotes(b.notes || ""); setStatus(b.status || "not_contacted");
  }, [b.key]);

  const save = async (s) => {
    const st = s || status;
    if (s) setStatus(s);
    setSaving(true);
    await onSave({ ...b, phone, notes, status: st });
    setSaving(false);
  };

  return (
    <div className={`bday-card bday-card--${status}`}>
      <div className="bday-card-main" onClick={() => setExpanded(x => !x)}>
        <span className="bday-card-dot" style={{background: meta.dot}} />
        <span className="bday-card-name">{b.kidName || "—"}</span>
        {b.phone && <span className="bday-card-phone">{b.phone}</span>}
      </div>
      {expanded && (
        <div className="bday-card-detail" onClick={e => e.stopPropagation()}>
          <input className="fld" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="Phone" type="tel" inputMode="numeric" />
          <textarea className="fld" value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes…" style={{resize:"vertical"}} />
          <div className="chips">
            {STATUS_ORDER.map(s => <button key={s} type="button" className="chip chip-sm" onClick={()=>save(s)} style={{
              borderColor:status===s?STATUS_META[s].dot:undefined,
              background:status===s?STATUS_META[s].bg:undefined,
              color:status===s?STATUS_META[s].fg:undefined,
              fontWeight:status===s?800:600,
            }}>
              <span style={{width:7,height:7,borderRadius:"50%",background:STATUS_META[s].dot,flexShrink:0}} />
              {STATUS_META[s].label}
            </button>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            {phone && <a href={`tel:${phone}`} className="btn btn-sm" onClick={e=>e.stopPropagation()}
              style={{background:C.blueSoft,color:C.blue,borderColor:"transparent",textDecoration:"none"}}>📞 Call</a>}
            <button type="button" className="btn btn-sm btn-primary" onClick={()=>save()} disabled={saving} style={{marginLeft:"auto"}}>
              {saving?"Saving…":"Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BirthdayCalendar = ({birthdays, month, year, loading, onSave}) => {
  if (loading) return <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading birthdays…</div></div>;
  if (!birthdays.length) return <div className="empty-state">🎈 No birthdays found for this month.</div>;

  const today = new Date();
  const isCurrentMonth = today.getMonth()+1 === month && today.getFullYear() === year;
  const todayDay = isCurrentMonth ? today.getDate() : -1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = [];
  for (let w = 0; w < 5; w++) {
    const startDay = w * 7 + 1;
    const endDay = Math.min((w + 1) * 7, daysInMonth);
    if (startDay > daysInMonth) break;
    const days = [];
    let weekHasBirthdays = false;
    for (let d = startDay; d <= endDay; d++) {
      const dayBirthdays = birthdays.filter(b => b.day === d);
      if (dayBirthdays.length) weekHasBirthdays = true;
      days.push({ day: d, birthdays: dayBirthdays });
    }
    weeks.push({ week: w + 1, startDay, endDay, days, hasBirthdays: weekHasBirthdays });
  }

  return (
    <div className="bday-kanban">
      {weeks.map(w => (
        <div key={w.week} className={`bday-week-col${w.hasBirthdays?"":" bday-week-col--empty"}`}>
          <div className="bday-week-header">
            <span className="bday-week-label">W{w.week}</span>
            <span className="bday-week-range">{w.startDay}–{w.endDay} {MONTH_NAMES[month-1]?.slice(0,3)}</span>
          </div>
          <div className="bday-week-body">
            {w.days.map(d => {
              if (!d.birthdays.length) return (
                <div key={d.day} className={`bday-day-row${d.day===todayDay?" bday-day--today":""}`}>
                  <div className="bday-day-num">{d.day}</div>
                </div>
              );
              return (
                <div key={d.day} className={`bday-day-row has-kids${d.day===todayDay?" bday-day--today":""}`}>
                  <div className="bday-day-num">{d.day}{d.day===todayDay?" 🎉":""}</div>
                  <div className="bday-day-cards">
                    {d.birthdays.map((b, i) => (
                      <BirthdayMiniCard key={b.key || i} b={b} onSave={onSave} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Dashboard Components ──

const STATS_PASSWORD = "FunSamu5";

const CalendarFilter = ({mode,date,rangeStart,rangeEnd,onModeChange,onDateChange,onRangeChange,onToday}) => {
  const today = new Date().toISOString().slice(0,10);
  const isToday = date === today;
  const step = (dir) => {
    const d = new Date(date);
    if (mode === "day") d.setDate(d.getDate() + dir);
    else if (mode === "month") d.setMonth(d.getMonth() + dir);
    onDateChange(d.toISOString().slice(0,10));
  };
  return (
    <div className="cal-filter">
      <div className="cal-filter-modes">
        {[{v:"day",l:"Day"},{v:"month",l:"Month"},{v:"range",l:"Range"}].map(m => (
          <button key={m.v} type="button" className={`chip chip-sm${mode===m.v?" is-on":""}`}
            onClick={()=>onModeChange(m.v)}>{m.l}</button>
        ))}
      </div>
      <span className="cal-filter-sep" />
      {mode==="day" && <>
        <button type="button" className="cal-nav-btn" onClick={()=>step(-1)} aria-label="Previous day">‹</button>
        <input className="fld cal-filter-date" type="date" value={date} onChange={e=>onDateChange(e.target.value)} />
        <button type="button" className="cal-nav-btn" onClick={()=>step(1)} aria-label="Next day">›</button>
        {!isToday && <button type="button" className="chip chip-sm" onClick={onToday}>Today</button>}
      </>}
      {mode==="month" && <>
        <button type="button" className="cal-nav-btn" onClick={()=>step(-1)} aria-label="Previous month">‹</button>
        <input className="fld cal-filter-date" type="month" value={date.slice(0,7)}
          onChange={e=>onDateChange(e.target.value+"-01")} />
        <button type="button" className="cal-nav-btn" onClick={()=>step(1)} aria-label="Next month">›</button>
      </>}
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

const PasswordGate = ({onUnlock}) => {
  const [pw,setPw] = React.useState("");
  const [error,setError] = React.useState(false);
  const submit = () => {
    if (pw === STATS_PASSWORD) {
      onUnlock();
    } else { setError(true); setTimeout(()=>setError(false),1500); }
  };
  return (
    <div className="password-gate">
      <div className="card card-pad password-card">
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <div className="card-title" style={{marginBottom:4}}>Stats Dashboard</div>
        <div style={{fontSize:12,color:C.textLight,fontWeight:600,marginBottom:16}}>Enter password to view stats</div>
        <input className={`fld${error?" is-error":""}`} type="password" placeholder="Password"
          value={pw} onChange={e=>{setPw(e.target.value);setError(false);}}
          onKeyDown={e=>{if(e.key==="Enter")submit();}}
          style={{textAlign:"center",marginBottom:12}} />
        {error && <div style={{fontSize:12,color:C.danger,fontWeight:700,marginBottom:8}}>Wrong password</div>}
        <button className="btn btn-primary btn-block" onClick={submit}>Unlock</button>
      </div>
    </div>
  );
};

const ConfirmDialog = ({message, needsPassword, onConfirm, onCancel, confirmLabel}) => {
  const [pw, setPw] = React.useState("");
  const [error, setError] = React.useState(false);
  const submit = () => {
    if (needsPassword && pw !== STATS_PASSWORD) { setError(true); setTimeout(()=>setError(false),1500); return; }
    onConfirm();
  };
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" style={{maxWidth:360,textAlign:"center",padding:"24px 20px"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{message}</div>
        <div style={{fontSize:12,color:C.textMid,marginBottom:16}}>This action cannot be undone.</div>
        {needsPassword && <>
          <input className={`fld${error?" is-error":""}`} type="password" placeholder="Enter password to proceed"
            value={pw} onChange={e=>{setPw(e.target.value);setError(false);}}
            onKeyDown={e=>{if(e.key==="Enter")submit();}}
            style={{textAlign:"center",marginBottom:8}} autoFocus />
          {error && <div style={{fontSize:12,color:C.danger,fontWeight:700,marginBottom:8}}>Wrong password</div>}
        </>}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button className="btn" onClick={onCancel} style={{flex:1}}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} style={{flex:1,background:confirmLabel?C.accent:C.danger,borderColor:confirmLabel?C.accent:C.danger}}>{confirmLabel||"Delete"}</button>
        </div>
      </div>
    </div>
  );
};

const CHECKOUT_KEY = "funtunes_checkouts";

function getCheckedOutIds() {
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0,10);
    if (data._date !== today) return {};
    return data;
  } catch(e) { return {}; }
}

function setCheckedOut(id) {
  const data = getCheckedOutIds();
  data._date = new Date().toISOString().slice(0,10);
  data[id] = true;
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
}

function parseTime24ToMinutes(t) {
  if (!t || t.indexOf(":") === -1) return null;
  const parts = t.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function formatTime12Short(t24) {
  if (!t24 || t24.indexOf(":") === -1) return "";
  const [hStr,mStr] = t24.split(":");
  let h = parseInt(hStr);
  const ap = h >= 12 ? "p" : "a";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${mStr}${ap}`;
}

const LiveEntryRow = ({e, onEdit, onDelete, onCheckout, isCheckedOut, now}) => {
  const name = e.customerName || "—";
  const dob = e.dob || "";
  const timeIn = e.timeIn || "";
  const timeOut = e.timeOut || "";
  const hours = e.hours || "1";
  const amt = parseInt(e.amount) || 0;
  const socks = parseInt(e.socks) || 0;
  const total = amt + socks;
  const playUpi = parseInt(e.playUpi) || 0;
  const playCash = parseInt(e.playCash) || 0;
  const socksUpi = parseInt(e.socksUpi) || 0;
  const socksCash = parseInt(e.socksCash) || 0;
  const upiTotal = playUpi + socksUpi;
  const cashTotal = playCash + socksCash;

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const outMins = parseTime24ToMinutes(timeOut);
  const entryDate = e.date || "";
  const todayStr = now.toISOString().slice(0,10);
  const isToday = entryDate === todayStr;

  let timeStatus = "normal";
  if (isToday && timeIn && outMins !== null && !isCheckedOut) {
    timeStatus = nowMins < outMins ? "active" : "exceeded";
  }

  const splitParts = [];
  if (upiTotal > 0) splitParts.push(`UPI ₹${upiTotal.toLocaleString("en-IN")}`);
  if (cashTotal > 0) splitParts.push(`Cash ₹${cashTotal.toLocaleString("en-IN")}`);
  const splitStr = splitParts.length ? ` (${splitParts.join(" + ")})` : "";

  return (
    <div className={`live-row${timeStatus==="exceeded"?" live-row--exceeded":""}`}>
      <div className="live-row-main">
        <div className="live-row-name">{name}</div>
        {dob && <span className="live-row-dob">DOB: {dob}</span>}
      </div>
      <div className={`live-row-time live-row-time--${timeStatus}`}>
        <span>⏱ {formatTime12Short(timeIn)} → {formatTime12Short(timeOut)}</span>
      </div>
      <div className="live-row-dur-col">{hours}h</div>
      <div className="live-row-amount">
        <span className="live-row-total">₹{total.toLocaleString("en-IN")}</span>
        {splitStr && <span className="live-row-split">{splitStr}</span>}
      </div>
      <div className="live-row-actions">
        {isToday && !isCheckedOut && timeIn && <button type="button" className={`icon-btn${timeStatus==="exceeded"?" icon-btn--alert":""}`} title="Checkout" onClick={()=>onCheckout(e)}>🚪</button>}
        {isCheckedOut && <span className="live-row-done" title="Checked out">✅</span>}
        <button type="button" className="icon-btn" title="Edit" onClick={()=>onEdit(e)}>✏️</button>
        <button type="button" className="icon-btn danger" title="Delete" onClick={()=>onDelete(e)}>🗑️</button>
      </div>
    </div>
  );
};

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const LiveEntryList = ({entries, onEdit, onDelete, onCheckout, loading}) => {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const checkedOut = getCheckedOutIds();

  if (loading) return <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading entries…</div></div>;
  if (!entries.length) return <div className="empty-state">No entries yet — start with <strong style={{color:C.accent}}>New Entry</strong>.</div>;

  const grouped = {};
  entries.forEach(e => {
    const d = e.date || "unknown";
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });
  const sortedDates = Object.keys(grouped).sort();

  const todayStr = now.toISOString().slice(0,10);

  return (
    <div className="live-list">
      {sortedDates.map(dateStr => {
        const dateObj = new Date(dateStr + "T00:00:00");
        const day = dateObj.getDate();
        const dayName = DAY_NAMES[dateObj.getDay()];
        const isToday = dateStr === todayStr;
        const dateEntries = grouped[dateStr];
        return (
          <div key={dateStr} className="live-date-group">
            <div className={`live-date-header${isToday ? " live-date-header--today" : ""}`}>
              <span className="live-date-label">{day} - {dayName}</span>
              <span className="live-date-count">{dateEntries.length} {dateEntries.length === 1 ? "entry" : "entries"}</span>
              {isToday && <span className="live-date-today-badge">Today</span>}
            </div>
            <div className="live-date-entries">
              <div className="live-list-header">
                <span className="live-col-name">Name</span>
                <span className="live-col-time">Playtime</span>
                <span className="live-col-dur">Duration</span>
                <span className="live-col-amount">Amount</span>
                <span className="live-col-actions">Actions</span>
              </div>
              {dateEntries.map((e,i) => (
                <LiveEntryRow key={e.id||i} e={e} onEdit={onEdit} onDelete={onDelete}
                  onCheckout={onCheckout} isCheckedOut={!!checkedOut[e.id]} now={now} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EXPENSE_CATEGORIES = [
  {value:"snacks",label:"Snacks"},
  {value:"supplies",label:"Supplies"},
  {value:"maintenance",label:"Maintenance"},
  {value:"transport",label:"Transport"},
  {value:"misc",label:"Misc"},
];

const MONTHLY_EXPENSE_CATEGORIES = [
  {value:"rent",label:"Rent"},
  {value:"maintenance",label:"Maintenance"},
  {value:"eb",label:"EB (Electricity)"},
  {value:"salary",label:"Salary"},
  {value:"marketing",label:"Marketing"},
  {value:"misc",label:"FT Monthly Expenses"},
];

const MonthlyExpensesDashboard = ({expenses, month, year, onChangeMonth, onChangeYear, onAdd, onDelete, loading, hideFilter}) => {
  const f = (v) => `₹${(v||0).toLocaleString("en-IN")}`;
  const catLabel = (c) => (MONTHLY_EXPENSE_CATEGORIES.find(x=>x.value===c)||{}).label || c;
  const total = expenses.reduce((s,e)=>s+(e.amount||0),0);

  const byCat = {};
  MONTHLY_EXPENSE_CATEGORIES.forEach(c => { byCat[c.value] = 0; });
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category]||0) + (e.amount||0); });

  const catColors = {rent:C.accent, maintenance:C.blue, eb:C.orange, salary:C.green, marketing:C.pink, misc:C.textMid};

  return (
    <div>
      {!hideFilter && <div className="card card-pad filter-bar" style={{marginBottom:"var(--sp-4)"}}>
        <div style={{display:"flex",gap:8,flex:"1 1 220px",minWidth:0}}>
          <Dropdown flex={1.5} value={month} onChange={v=>onChangeMonth(parseInt(v))}
            options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
          <Dropdown flex={1} value={year} onChange={v=>onChangeYear(parseInt(v))}
            options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
        </div>
        <div className="filter-bar-right">
          {!loading && <span className="filter-bar-count">{expenses.length} items</span>}
          <button className="btn btn-sm" onClick={onAdd}>+ Add Expense</button>
        </div>
      </div>}
      {hideFilter && <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:"var(--sp-4)"}}>
        <button className="btn btn-sm" onClick={onAdd}>+ Add Expense</button>
      </div>}

      {loading ? <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading…</div></div> : <>
        <div className="cashflow-grid" style={{marginBottom:"var(--sp-4)"}}>
          {MONTHLY_EXPENSE_CATEGORIES.map(cat => (
            <div key={cat.value} className="cashflow-item">
              <div className="cashflow-label">{cat.label}</div>
              <div className="cashflow-value" style={{color:catColors[cat.value]||C.text,fontSize:18}}>{f(byCat[cat.value])}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{marginBottom:"var(--sp-4)",textAlign:"center",padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:".4px",marginBottom:4}}>Total Monthly Expenses</div>
          <div style={{fontSize:28,fontWeight:900,color:C.danger}}>{f(total)}</div>
          <div style={{fontSize:11,color:C.textLight,fontWeight:600,marginTop:4}}>{MONTH_NAMES[(month||1)-1]} {year}</div>
        </div>

        {expenses.length > 0 ? <div className="card" style={{marginBottom:"var(--sp-4)"}}>
          <div className="card-head"><div className="card-title">Expense Details</div></div>
          <div className="breakdown-table-wrap">
            <table className="breakdown-table">
              <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {expenses.map((e,i) => (
                  <tr key={e.id||i}>
                    <td><span style={{display:"inline-block",width:8,height:8,borderRadius:4,background:catColors[e.category]||C.textMid,marginRight:6}}></span>{catLabel(e.category)}</td>
                    <td>{e.description || "—"}</td>
                    <td style={{color:C.danger,fontWeight:700}}>{f(e.amount)}</td>
                    <td style={{width:36,textAlign:"center"}}><button type="button" className="icon-btn danger" title="Delete" onClick={()=>onDelete(e)} style={{fontSize:14}}>🗑️</button></td>
                  </tr>
                ))}
                <tr style={{fontWeight:800,borderTop:"2px solid var(--border-strong)"}}>
                  <td colSpan={2} style={{textAlign:"right"}}>Total</td>
                  <td style={{color:C.danger}}>{f(total)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> : <div className="empty-state">No expenses recorded for {MONTH_NAMES[(month||1)-1]} {year}.</div>}
      </>}
    </div>
  );
};

const CashFlowSummary = ({entries, expenses}) => {
  const totalUpi = entries.reduce((a,e) => a + (parseInt(e.playUpi)||0) + (parseInt(e.socksUpi)||0), 0);
  const totalCash = entries.reduce((a,e) => a + (parseInt(e.playCash)||0) + (parseInt(e.socksCash)||0), 0);
  const totalExpenses = expenses.reduce((a,e) => a + (parseInt(e.amount)||0), 0);
  const netCash = totalCash - totalExpenses;
  const f = (v) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <div className="card card-pad cashflow-summary" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-title" style={{marginBottom:12}}>💵 Cash Flow Summary</div>
      <div className="cashflow-grid">
        <div className="cashflow-item cashflow-item--in">
          <div className="cashflow-icon">📱</div>
          <div>
            <div className="cashflow-label">UPI Received</div>
            <div className="cashflow-value" style={{color:C.blue}}>{f(totalUpi)}</div>
          </div>
        </div>
        <div className="cashflow-item cashflow-item--in">
          <div className="cashflow-icon">💵</div>
          <div>
            <div className="cashflow-label">Cash Received</div>
            <div className="cashflow-value" style={{color:C.green}}>{f(totalCash)}</div>
          </div>
        </div>
        <div className="cashflow-item cashflow-item--out">
          <div className="cashflow-icon">📤</div>
          <div>
            <div className="cashflow-label">Cash Expenses</div>
            <div className="cashflow-value" style={{color:C.danger}}>{f(totalExpenses)}</div>
          </div>
        </div>
        <div className="cashflow-item cashflow-item--net">
          <div className="cashflow-icon">🏦</div>
          <div>
            <div className="cashflow-label">Net Cash in Hand</div>
            <div className="cashflow-value" style={{color:netCash>=0?C.green:C.danger}}>{f(netCash)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseList = ({expenses, onDelete}) => {
  if (!expenses.length) return null;
  const f = (v) => `₹${v.toLocaleString("en-IN")}`;
  const catLabel = (c) => (EXPENSE_CATEGORIES.find(x=>x.value===c)||{}).label || c;
  const total = expenses.reduce((s,e)=>s+(e.amount||0),0);
  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head"><div className="card-title">📤 Expenses</div></div>
      <div className="breakdown-table-wrap">
        <table className="breakdown-table">
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {expenses.map((e,i) => (
              <tr key={e.id||i}>
                <td>{(e.date||"").split("-").reverse().join("/")}</td>
                <td>{e.description || "—"}</td>
                <td>{catLabel(e.category)}</td>
                <td style={{color:C.danger,fontWeight:700}}>{f(e.amount)}</td>
                <td style={{width:36,textAlign:"center"}}><button type="button" className="icon-btn danger" title="Delete" onClick={()=>onDelete(e)} style={{fontSize:14}}>🗑️</button></td>
              </tr>
            ))}
            {expenses.length > 1 && <tr style={{fontWeight:800}}>
              <td colSpan={3} style={{textAlign:"right"}}>Total</td>
              <td style={{color:C.danger}}>{f(total)}</td>
              <td></td>
            </tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatsDashboard = ({entries, expenses, onDeleteExpense}) => {
  const totalKids = entries.reduce((a,e) => a + (parseInt(e.numKids)||1), 0);
  const totalRevenue = entries.reduce((a,e) => a + (parseInt(e.amount)||0) + (parseInt(e.socks)||0), 0);
  const totalPlayUpi = entries.reduce((a,e) => a + (parseInt(e.playUpi)||0), 0);
  const totalPlayCash = entries.reduce((a,e) => a + (parseInt(e.playCash)||0), 0);
  const totalPlayAmt = entries.reduce((a,e) => a + (parseInt(e.amount)||0), 0);
  const totalSocksUpi = entries.reduce((a,e) => a + (parseInt(e.socksUpi)||0), 0);
  const totalSocksCash = entries.reduce((a,e) => a + (parseInt(e.socksCash)||0), 0);
  const totalSocksAmt = entries.reduce((a,e) => a + (parseInt(e.socks)||0), 0);
  const totalUpi = totalPlayUpi + totalSocksUpi;
  const totalCash = totalPlayCash + totalSocksCash;

  const allExpenses = expenses || [];
  const totalExpenses = allExpenses.reduce((a,e) => a + (parseInt(e.amount)||0), 0);

  const grouped = {};
  entries.forEach(e => {
    const key = e.date || "unknown";
    if (!grouped[key]) grouped[key] = {revenue:0,kids:0,count:0,upi:0,cash:0,expenses:0};
    grouped[key].revenue += (parseInt(e.amount)||0) + (parseInt(e.socks)||0);
    grouped[key].kids += parseInt(e.numKids)||1;
    grouped[key].count += 1;
    grouped[key].upi += (parseInt(e.playUpi)||0) + (parseInt(e.socksUpi)||0);
    grouped[key].cash += (parseInt(e.playCash)||0) + (parseInt(e.socksCash)||0);
  });
  allExpenses.forEach(e => {
    const key = e.date || "unknown";
    if (!grouped[key]) grouped[key] = {revenue:0,kids:0,count:0,upi:0,cash:0,expenses:0};
    grouped[key].expenses += parseInt(e.amount)||0;
  });
  const sorted = Object.keys(grouped).sort();
  const rows = sorted.map(k => ({label:k.split("-").reverse().join("/"), ...grouped[k]}));
  const kidsData = rows.map(r => ({label:r.label, value:r.kids}));
  const revenueData = rows.map(r => ({label:r.label, value:r.revenue}));

  const f = (v) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <div className="stats-dash">
      <CashFlowSummary entries={entries} expenses={allExpenses} />

      <div className="stats-dash-cards">
        <div className="scard scard--blue">
          <div className="scard-icon">👶</div>
          <div className="scard-body">
            <div className="scard-value">{totalKids}</div>
            <div className="scard-label">Total Kids</div>
          </div>
        </div>

        <div className="scard scard--green">
          <div className="scard-icon">💰</div>
          <div className="scard-body">
            <div className="scard-value">{f(totalRevenue)}</div>
            <div className="scard-label">Total Revenue</div>
            <div className="scard-split">
              <span className="scard-tag scard-tag--accent">📱 UPI {f(totalUpi)}</span>
              <span className="scard-tag scard-tag--yellow">💵 Cash {f(totalCash)}</span>
            </div>
          </div>
        </div>

        <div className="scard scard--accent">
          <div className="scard-icon">🎪</div>
          <div className="scard-body">
            <div className="scard-value">{f(totalPlayAmt)}</div>
            <div className="scard-label">Playtime Revenue</div>
            <div className="scard-split">
              <span className="scard-tag scard-tag--accent">📱 UPI {f(totalPlayUpi)}</span>
              <span className="scard-tag scard-tag--yellow">💵 Cash {f(totalPlayCash)}</span>
            </div>
          </div>
        </div>

        <div className="scard scard--orange">
          <div className="scard-icon">🧦</div>
          <div className="scard-body">
            <div className="scard-value">{f(totalSocksAmt)}</div>
            <div className="scard-label">Socks Revenue</div>
            <div className="scard-split">
              <span className="scard-tag scard-tag--accent">📱 UPI {f(totalSocksUpi)}</span>
              <span className="scard-tag scard-tag--yellow">💵 Cash {f(totalSocksCash)}</span>
            </div>
          </div>
        </div>
      </div>

      {rows.length > 1 && <>
        <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
          <div className="card-title" style={{marginBottom:12}}>👶 Kids per day</div>
          <BarChart data={kidsData} labelKey="label" valueKey="value" color={C.blue} height={160} />
        </div>
        <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
          <div className="card-title" style={{marginBottom:12}}>💰 Revenue per day</div>
          <BarChart data={revenueData} labelKey="label" valueKey="value" color={C.green} height={160} prefix="₹" />
        </div>
      </>}

      {rows.length > 0 && <div className="card" style={{marginBottom:"var(--sp-4)"}}>
        <div className="card-head"><div className="card-title">📊 Daily Breakdown</div></div>
        <div className="breakdown-table-wrap">
          <table className="breakdown-table">
            <thead><tr><th>Date</th><th>Kids</th><th>UPI</th><th>Cash</th><th>Expenses</th><th>Net Cash</th></tr></thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td>{r.kids}</td>
                  <td style={{color:C.blue}}>{f(r.upi)}</td>
                  <td style={{color:C.green}}>{f(r.cash)}</td>
                  <td style={{color:r.expenses>0?C.danger:undefined}}>{r.expenses>0?f(r.expenses):"—"}</td>
                  <td style={{fontWeight:800,color:r.cash-r.expenses>=0?C.green:C.danger}}>{f(r.cash - r.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      <ExpenseList expenses={allExpenses} onDelete={onDeleteExpense} />
    </div>
  );
};

const SOCKS_COST_PER_PIECE = 7;

const PnLReport = ({entries, expenses, monthlyExpenses, month, year, onChangeMonth, onChangeYear, loading}) => {
  const f = (v) => `₹${Math.abs(v).toLocaleString("en-IN")}`;
  const totalPlayUpi = entries.reduce((s,e)=>s+(e.playUpi||0),0);
  const totalPlayCash = entries.reduce((s,e)=>s+(e.playCash||0),0);
  const totalSocksUpi = entries.reduce((s,e)=>s+(e.socksUpi||0),0);
  const totalSocksCash = entries.reduce((s,e)=>s+(e.socksCash||0),0);
  const totalSocksAmt = entries.reduce((s,e)=>s+(e.socks||0),0);
  const socksCount = CONFIG.SOCKS_RATE > 0 ? Math.round(totalSocksAmt / CONFIG.SOCKS_RATE) : 0;
  const socksCost = socksCount * SOCKS_COST_PER_PIECE;
  const totalCashExp = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const allMonthly = monthlyExpenses || [];
  const catLabel = (c) => (MONTHLY_EXPENSE_CATEGORIES.find(x=>x.value===c)||{}).label || c;
  const monthlyCatTotals = {};
  allMonthly.forEach(e => { monthlyCatTotals[e.category] = (monthlyCatTotals[e.category]||0) + (e.amount||0); });
  const totalMonthlyExp = allMonthly.reduce((s,e)=>s+(e.amount||0),0);
  const totalIncome = totalPlayUpi + totalPlayCash + totalSocksUpi + totalSocksCash;
  const totalCosts = socksCost + totalCashExp + totalMonthlyExp;
  const profit = totalIncome - totalCosts;

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <Dropdown flex={1.5} value={month} onChange={v=>onChangeMonth(parseInt(v))}
          options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
        <Dropdown flex={1} value={year} onChange={v=>onChangeYear(parseInt(v))}
          options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
      </div>

      {loading ? <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading…</div></div> :
      <div>
        <div className="card" style={{marginBottom:"var(--sp-4)"}}>
          <div className="card-head"><div className="card-title">📥 Revenue</div></div>
          <div className="breakdown-table-wrap">
            <table className="breakdown-table">
              <tbody>
                <tr><td>Play Income (UPI)</td><td style={{textAlign:"right",color:C.blue,fontWeight:700}}>{f(totalPlayUpi)}</td></tr>
                <tr><td>Play Income (Cash)</td><td style={{textAlign:"right",color:C.green,fontWeight:700}}>{f(totalPlayCash)}</td></tr>
                <tr><td>Socks Income (UPI)</td><td style={{textAlign:"right",color:C.blue,fontWeight:700}}>{f(totalSocksUpi)}</td></tr>
                <tr><td>Socks Income (Cash)</td><td style={{textAlign:"right",color:C.green,fontWeight:700}}>{f(totalSocksCash)}</td></tr>
                <tr style={{fontWeight:800,borderTop:"2px solid var(--border-strong)"}}>
                  <td>Total Revenue</td>
                  <td style={{textAlign:"right",color:C.green}}>{f(totalIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{marginBottom:"var(--sp-4)"}}>
          <div className="card-head"><div className="card-title">📤 Costs</div></div>
          <div className="breakdown-table-wrap">
            <table className="breakdown-table">
              <tbody>
                <tr>
                  <td>Socks Procurement ({socksCount} pcs × ₹{SOCKS_COST_PER_PIECE})</td>
                  <td style={{textAlign:"right",color:C.danger,fontWeight:700}}>{f(socksCost)}</td>
                </tr>
                <tr>
                  <td>Daily Cash Expenses</td>
                  <td style={{textAlign:"right",color:C.danger,fontWeight:700}}>{f(totalCashExp)}</td>
                </tr>
                {MONTHLY_EXPENSE_CATEGORIES.map(cat => {
                  const v = monthlyCatTotals[cat.value] || 0;
                  if (v === 0) return null;
                  return <tr key={cat.value}>
                    <td>{cat.label}</td>
                    <td style={{textAlign:"right",color:C.danger,fontWeight:700}}>{f(v)}</td>
                  </tr>;
                })}
                <tr style={{fontWeight:800,borderTop:"2px solid var(--border-strong)"}}>
                  <td>Total Costs</td>
                  <td style={{textAlign:"right",color:C.danger}}>{f(totalCosts)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card pnl-result" style={{marginBottom:"var(--sp-4)",textAlign:"center",padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>
            {profit >= 0 ? "Net Profit" : "Net Loss"}
          </div>
          <div style={{fontSize:32,fontWeight:900,color:profit>=0?C.green:C.danger}}>
            {profit >= 0 ? "+" : "−"}{f(profit)}
          </div>
          <div style={{fontSize:12,color:C.textLight,fontWeight:600,marginTop:6}}>
            {MONTH_NAMES[(month||1)-1]} {year} · {entries.length} entries
          </div>
        </div>
      </div>}
    </div>
  );
};

// ── Staff Components ──

const STAFF_ROLES = [
  {value:"Staff",label:"Staff"},
  {value:"Manager",label:"Manager"},
  {value:"Helper",label:"Helper"},
  {value:"Cleaner",label:"Cleaner"},
];

const STAFF_SHIFTS = [
  {value:"morning",label:"Morning (4 hrs)",hours:4},
  {value:"evening",label:"Evening (6 hrs)",hours:6},
  {value:"weekend",label:"Weekend",hours:8},
];

const ATT_STATUS = {
  present:  {label:"P", full:"Present",  color:C.green,  bg:C.greenSoft},
  absent:   {label:"A", full:"Absent",   color:C.danger, bg:C.dangerSoft},
  half_day: {label:"H", full:"Half Day", color:C.orange, bg:C.orangeSoft},
  leave:    {label:"L", full:"Leave",    color:C.blue,   bg:C.blueSoft},
};

function calcStaffSalary(staff, summary) {
  const presentDays = (summary.present || 0) + (summary.half_day || 0) * 0.5;
  const paidLeave = Math.min(summary.leave || 0, staff.paid_holidays || 4);
  const effectiveDays = presentDays + paidLeave;
  const dailyRate = staff.pro_rata_base ? staff.pro_rata_base / 30 : 0;
  const proRata = Math.round(dailyRate * effectiveDays);
  const fixedPay = staff.fixed_pay || 0;
  return { fixedPay, proRata, total: fixedPay + proRata, effectiveDays, paidLeave, dailyRate };
}

const StaffFormPopup = ({staff, onSave, onCancel, saving}) => {
  const [form, setForm] = React.useState({
    name: staff?.name || "",
    phone: staff?.phone || "",
    role: staff?.role || "Staff",
    shift: staff?.shift || "morning",
    fixed_pay: staff?.fixed_pay ? String(staff.fixed_pay) : "",
    pro_rata_base: staff?.pro_rata_base ? String(staff.pro_rata_base) : "",
    hours_per_shift: staff?.hours_per_shift ? String(staff.hours_per_shift) : "4",
    paid_holidays: staff?.paid_holidays != null ? String(staff.paid_holidays) : "4",
    join_date: staff?.join_date || "",
    active: staff?.active !== false,
  });
  const onShiftChange = (v) => {
    const s = STAFF_SHIFTS.find(x=>x.value===v);
    setForm({...form, shift:v, hours_per_shift: s ? String(s.hours) : form.hours_per_shift,
      pro_rata_base: v==="evening"?"7000":v==="morning"?"5000":form.pro_rata_base});
  };
  const submit = () => {
    if (!form.name.trim()) return;
    onSave({...form,
      fixed_pay: parseInt(form.fixed_pay)||0,
      pro_rata_base: parseInt(form.pro_rata_base)||0,
      hours_per_shift: parseInt(form.hours_per_shift)||4,
      paid_holidays: parseInt(form.paid_holidays)||0,
    });
  };
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" style={{maxWidth:460,textAlign:"left",padding:"20px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span className="card-title">{staff ? "Edit Staff" : "+ Add Staff"}</span>
          <button className="btn btn-sm btn-icon" onClick={onCancel} disabled={saving} aria-label="Close">✕</button>
        </div>
        <div className="form-grid">
          <InputField label="Name" icon="👤">
            <input className="fld" value={form.name} placeholder="e.g. Ravi" autoFocus
              onChange={e=>setForm({...form, name:e.target.value})} />
          </InputField>
          <InputField label="Phone" icon="📱">
            <input className="fld" value={form.phone} type="tel" inputMode="numeric" placeholder="10-digit"
              onChange={e=>setForm({...form, phone:e.target.value.replace(/\D/g,"").slice(0,10)})} />
          </InputField>
          <InputField label="Role" icon="🏷️">
            <select className="fld" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              {STAFF_ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </InputField>
          <InputField label="Shift" icon="🕐">
            <select className="fld" value={form.shift} onChange={e=>onShiftChange(e.target.value)}>
              {STAFF_SHIFTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </InputField>
          <InputField label="Fixed Pay (monthly)" icon="₹">
            <input className="fld" value={form.fixed_pay} type="tel" inputMode="numeric" placeholder="e.g. 12000"
              onChange={e=>setForm({...form, fixed_pay:e.target.value.replace(/\D/g,"")})} />
          </InputField>
          <InputField label="Pro Rata Base (/30)" icon="₹">
            <input className="fld" value={form.pro_rata_base} type="tel" inputMode="numeric" placeholder="e.g. 7000"
              onChange={e=>setForm({...form, pro_rata_base:e.target.value.replace(/\D/g,"")})} />
          </InputField>
          <InputField label="Paid Holidays/mo">
            <input className="fld" value={form.paid_holidays} type="tel" inputMode="numeric" placeholder="4"
              onChange={e=>setForm({...form, paid_holidays:e.target.value.replace(/\D/g,"")})} />
          </InputField>
          <InputField label="Join Date" icon="📅">
            <input className="fld" value={form.join_date} type="date"
              onChange={e=>setForm({...form, join_date:e.target.value})} />
          </InputField>
          {staff && <InputField label="Status" icon="✅">
            <select className="fld" value={form.active?"active":"inactive"} onChange={e=>setForm({...form, active:e.target.value==="active"})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </InputField>}
        </div>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button className="btn" onClick={onCancel} disabled={saving} style={{flex:"0 0 90px"}}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving||!form.name.trim()} style={{flex:1}}>
            {saving?"Saving…":staff?"Update":"Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AttendanceMarker = ({staffList, date, attendance, onMark, saving}) => {
  const dateAtt = {};
  attendance.filter(a=>a.date===date).forEach(a=>{ dateAtt[a.staff_id]=a; });
  const active = staffList.filter(s=>s.active!==false);
  if (!active.length) return <div className="empty-state">Add staff members first.</div>;

  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head">
        <div className="card-title">Mark Attendance — {date.split("-").reverse().join("/")}</div>
      </div>
      <div className="att-marker-list">
        {active.map(s=>{
          const cur = dateAtt[s.id];
          const status = cur ? cur.status : null;
          return (
            <div key={s.id} className="att-marker-row">
              <div className="att-marker-name">
                <span className="att-marker-avatar">{s.name.charAt(0).toUpperCase()}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                  <div style={{fontSize:11,color:C.textLight}}>{s.role}</div>
                </div>
              </div>
              <div className="att-marker-btns">
                {Object.keys(ATT_STATUS).map(st=>{
                  const meta = ATT_STATUS[st];
                  const isOn = status === st;
                  return (
                    <button key={st} type="button" className="att-status-btn"
                      disabled={saving}
                      style={{
                        background:isOn?meta.bg:"transparent",
                        color:isOn?meta.color:C.textLight,
                        borderColor:isOn?meta.color:"var(--border)",
                        fontWeight:isOn?800:600,
                      }}
                      onClick={()=>onMark(s.id, date, st)}
                      title={meta.full}>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StaffTimesheet = ({staffList, attendance, month, year}) => {
  const f = (v)=>`₹${Math.round(v).toLocaleString("en-IN")}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const active = staffList.filter(s=>s.active!==false);
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);
  const mm = String(month).padStart(2,"0");

  const attMap = {};
  attendance.forEach(a=>{
    const key = a.staff_id + "_" + a.date;
    attMap[key] = a.status;
  });

  if (!active.length) return <div className="empty-state">No staff members yet.</div>;

  const days = [];
  for (let d=1; d<=daysInMonth; d++) days.push(d);

  const summaries = {};
  active.forEach(s=>{
    const sum = {present:0,absent:0,half_day:0,leave:0};
    days.forEach(d=>{
      const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
      const st = attMap[s.id+"_"+dateStr];
      if (st && sum[st] !== undefined) sum[st]++;
    });
    summaries[s.id] = sum;
  });

  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head"><div className="card-title">Timesheet — {MONTH_NAMES[month-1]} {year}</div></div>
      <div className="timesheet-wrap">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th className="timesheet-name-col">Staff</th>
              {days.map(d=>{
                const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
                const dow = new Date(dateStr).getDay();
                const isSun = dow === 0;
                const isToday = dateStr === todayStr;
                return <th key={d} className={`timesheet-day-col${isSun?" timesheet-sun":""}${isToday?" timesheet-today":""}`}>{d}</th>;
              })}
              <th className="timesheet-sum-col" style={{color:C.green}}>P</th>
              <th className="timesheet-sum-col" style={{color:C.danger}}>A</th>
              <th className="timesheet-sum-col" style={{color:C.orange}}>H</th>
              <th className="timesheet-sum-col" style={{color:C.blue}}>L</th>
            </tr>
          </thead>
          <tbody>
            {active.map(s=>(
              <tr key={s.id}>
                <td className="timesheet-name-col">
                  <span className="timesheet-avatar">{s.name.charAt(0).toUpperCase()}</span>
                  <span className="timesheet-staff-name">{s.name}</span>
                </td>
                {days.map(d=>{
                  const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
                  const st = attMap[s.id+"_"+dateStr];
                  const dow = new Date(dateStr).getDay();
                  const isSun = dow === 0;
                  const isToday = dateStr === todayStr;
                  const meta = st ? ATT_STATUS[st] : null;
                  return (
                    <td key={d} className={`timesheet-cell${isSun?" timesheet-sun":""}${isToday?" timesheet-today":""}`}>
                      {meta
                        ? <span className="timesheet-dot" style={{background:meta.color,color:"#fff"}}>{meta.label}</span>
                        : <span className="timesheet-empty">·</span>}
                    </td>
                  );
                })}
                <td className="timesheet-sum-col" style={{color:C.green,fontWeight:700}}>{summaries[s.id].present}</td>
                <td className="timesheet-sum-col" style={{color:C.danger,fontWeight:700}}>{summaries[s.id].absent}</td>
                <td className="timesheet-sum-col" style={{color:C.orange,fontWeight:700}}>{summaries[s.id].half_day}</td>
                <td className="timesheet-sum-col" style={{color:C.blue,fontWeight:700}}>{summaries[s.id].leave}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StaffList = ({staffList, onEdit, onDelete}) => {
  const f = (v)=>`₹${(v||0).toLocaleString("en-IN")}`;
  if (!staffList.length) return <div className="empty-state">No staff members yet. Add your first staff member.</div>;
  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head"><div className="card-title">Staff Members</div></div>
      <div className="breakdown-table-wrap">
        <table className="breakdown-table">
          <thead><tr><th>Name</th><th>Shift</th><th>Fixed</th><th>Pro Rata</th><th>Holidays</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {staffList.map(s=>{
              const shiftLabel = (STAFF_SHIFTS.find(x=>x.value===s.shift)||{}).label||s.shift;
              return (
                <tr key={s.id} style={{opacity:s.active===false?0.5:1}}>
                  <td style={{fontWeight:700}}>{s.name}<div style={{fontSize:10,color:C.textLight}}>{s.role}{s.phone?" · "+s.phone:""}</div></td>
                  <td style={{fontSize:11}}>{shiftLabel}</td>
                  <td style={{color:C.accent,fontWeight:700}}>{s.fixed_pay?f(s.fixed_pay):"—"}</td>
                  <td style={{color:C.blue,fontWeight:700}}>{s.pro_rata_base?f(s.pro_rata_base)+"/30":"—"}</td>
                  <td>{s.paid_holidays||0} days</td>
                  <td><span style={{fontSize:11,fontWeight:700,color:s.active!==false?C.green:C.textLight,background:s.active!==false?C.greenSoft:"var(--bg)",padding:"2px 8px",borderRadius:6}}>{s.active!==false?"Active":"Inactive"}</span></td>
                  <td style={{width:60,textAlign:"center"}}>
                    <button type="button" className="icon-btn" title="Edit" onClick={()=>onEdit(s)} style={{fontSize:14}}>✏️</button>
                    <button type="button" className="icon-btn danger" title="Delete" onClick={()=>onDelete(s)} style={{fontSize:14}}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StaffSection = ({staffList, attendance, month, year, onChangeMonth, onChangeYear,
  onAddStaff, onEditStaff, onDeleteStaff, loading}) => {
  const [tab, setTab] = React.useState("members");

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div className="chips" style={{marginRight:"auto"}}>
          {[{v:"members",l:"Staff List"},{v:"salary",l:"Salary"}].map(t=>(
            <button key={t.v} type="button" className={`chip chip-sm${tab===t.v?" is-on":""}`} onClick={()=>setTab(t.v)}>{t.l}</button>
          ))}
        </div>
        {tab==="salary" && <>
          <Dropdown flex={0} value={month} onChange={v=>onChangeMonth(parseInt(v))}
            options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
          <Dropdown flex={0} value={year} onChange={v=>onChangeYear(parseInt(v))}
            options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
        </>}
        {tab==="members" && <button className="btn btn-sm btn-primary" onClick={onAddStaff}>+ Add Staff</button>}
      </div>

      {loading ? <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading…</div></div> : <>
        {tab==="members" && <StaffList staffList={staffList} onEdit={onEditStaff} onDelete={onDeleteStaff} />}
        {tab==="salary" && <StaffSalaryTable staffList={staffList} attendance={attendance} month={month} year={year} />}
      </>}
    </div>
  );
};

const StaffSalaryTable = ({staffList, attendance, month, year}) => {
  const f = (v)=>`₹${Math.round(v).toLocaleString("en-IN")}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const active = staffList.filter(s=>s.active!==false);
  const mm = String(month).padStart(2,"0");

  const attMap = {};
  attendance.forEach(a=>{ attMap[a.staff_id + "_" + a.date] = a.status; });

  if (!active.length) return <div className="empty-state">No staff members yet.</div>;

  const days = [];
  for (let d=1; d<=daysInMonth; d++) days.push(d);

  const summaries = {};
  const salaries = {};
  active.forEach(s=>{
    const sum = {present:0,absent:0,half_day:0,leave:0};
    days.forEach(d=>{
      const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
      const st = attMap[s.id+"_"+dateStr];
      if (st && sum[st] !== undefined) sum[st]++;
    });
    summaries[s.id] = sum;
    salaries[s.id] = calcStaffSalary(s, sum);
  });

  const totalSalary = active.reduce((s,st)=>s+salaries[st.id].total,0);

  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head"><div className="card-title">Salary Calculation — {MONTH_NAMES[month-1]} {year}</div></div>
      <div className="breakdown-table-wrap">
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Shift</th>
              <th>P</th><th>A</th><th>H</th><th>L</th>
              <th>Eff. Days</th>
              <th>Fixed</th>
              <th>Pro Rata</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {active.map(s=>{
              const sal = salaries[s.id];
              const sum = summaries[s.id];
              const shiftLabel = (STAFF_SHIFTS.find(x=>x.value===s.shift)||{}).label||s.shift;
              return (
                <tr key={s.id}>
                  <td style={{fontWeight:700}}>{s.name}</td>
                  <td style={{fontSize:11,color:C.textMid}}>{shiftLabel}</td>
                  <td style={{color:C.green,fontWeight:700}}>{sum.present}</td>
                  <td style={{color:C.danger,fontWeight:700}}>{sum.absent}</td>
                  <td style={{color:C.orange,fontWeight:700}}>{sum.half_day}</td>
                  <td style={{color:C.blue,fontWeight:700}}>{sum.leave}</td>
                  <td>{sal.effectiveDays}{sal.paidLeave>0?<span style={{fontSize:10,color:C.blue}}> ({sal.paidLeave}L paid)</span>:""}</td>
                  <td>{sal.fixedPay ? f(sal.fixedPay) : "—"}</td>
                  <td>{sal.proRata ? f(sal.proRata) : "—"}<br/><span style={{fontSize:10,color:C.textLight}}>{s.pro_rata_base?`${f(s.pro_rata_base)}/30`:""}</span></td>
                  <td style={{fontWeight:800,color:C.accent}}>{f(sal.total)}</td>
                </tr>
              );
            })}
            <tr style={{fontWeight:800,borderTop:"2px solid var(--border-strong)"}}>
              <td colSpan={9} style={{textAlign:"right"}}>Total Payroll</td>
              <td style={{color:C.accent}}>{f(totalSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceWidget = ({staffList, date, attendance, onMark, onChangeDate, saving}) => {
  const [open, setOpen] = React.useState(false);
  const dateAtt = {};
  attendance.filter(a=>a.date===date).forEach(a=>{ dateAtt[a.staff_id]=a; });
  const active = staffList.filter(s=>s.active!==false);
  if (!active.length) return null;

  const marked = active.filter(s=>dateAtt[s.id]).length;

  return (
    <div className="card" style={{marginBottom:"var(--sp-4)"}}>
      <div className="card-head" style={{cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <div className="card-title" style={{margin:0}}>Mark Attendance</div>
          <span style={{fontSize:11,color:C.textLight,background:"var(--bg)",padding:"2px 8px",borderRadius:10}}>
            {marked}/{active.length} marked
          </span>
        </div>
        <span style={{fontSize:14,color:C.textLight,transition:"transform .2s",transform:open?"rotate(180deg)":"rotate(0)"}}>{open?"▲":"▼"}</span>
      </div>
      {open && <div style={{padding:"12px 16px"}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
          <input className="fld" type="date" value={date} onChange={e=>onChangeDate(e.target.value)}
            style={{maxWidth:160,fontSize:13,padding:"6px 10px"}} />
          <span style={{fontSize:12,color:C.textMid}}>{date.split("-").reverse().join("/")}</span>
        </div>
        <div className="att-marker-list">
          {active.map(s=>{
            const cur = dateAtt[s.id];
            const status = cur ? cur.status : null;
            const checkIn = cur ? cur.check_in : "";
            const checkOut = cur ? cur.check_out : "";
            return (
              <div key={s.id} className="att-widget-row">
                <div className="att-marker-name" style={{minWidth:90,flex:"0 0 auto"}}>
                  <span className="att-marker-avatar" style={{width:26,height:26,fontSize:11}}>{s.name.charAt(0).toUpperCase()}</span>
                  <span style={{fontWeight:700,fontSize:12}}>{s.name}</span>
                </div>
                <div className="att-marker-btns" style={{gap:4}}>
                  {Object.keys(ATT_STATUS).map(st=>{
                    const meta = ATT_STATUS[st];
                    const isOn = status === st;
                    return (
                      <button key={st} type="button" className="att-status-btn"
                        disabled={saving}
                        style={{
                          background:isOn?meta.bg:"transparent",
                          color:isOn?meta.color:C.textLight,
                          borderColor:isOn?meta.color:"var(--border)",
                          fontWeight:isOn?800:600,
                          minWidth:28,height:28,fontSize:11,padding:"0 4px",
                        }}
                        onClick={()=>onMark(s.id, date, st)}
                        title={meta.full}>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center",flex:"0 0 auto"}}>
                  <input className="fld" type="time" value={checkIn} placeholder="In"
                    style={{width:75,fontSize:11,padding:"4px 6px"}}
                    onChange={e=>onMark(s.id, date, status||"present", e.target.value, checkOut)} />
                  <span style={{fontSize:10,color:C.textLight}}>to</span>
                  <input className="fld" type="time" value={checkOut} placeholder="Out"
                    style={{width:75,fontSize:11,padding:"4px 6px"}}
                    onChange={e=>onMark(s.id, date, status||"present", checkIn, e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
};

const AttendanceSection = ({staffList, attendance, month, year, attDate,
  onChangeMonth, onChangeYear, onChangeAttDate, onMarkAttendance, loading, saving}) => {
  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <Dropdown flex={0} value={month} onChange={v=>onChangeMonth(parseInt(v))}
          options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
        <Dropdown flex={0} value={year} onChange={v=>onChangeYear(parseInt(v))}
          options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
      </div>

      {loading ? <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading…</div></div> : <>
        <AttendanceWidget staffList={staffList} date={attDate} attendance={attendance}
          onMark={onMarkAttendance} onChangeDate={onChangeAttDate} saving={saving} />
        <StaffTimesheet staffList={staffList} attendance={attendance} month={month} year={year} />
      </>}
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
