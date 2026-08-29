// =============================================================================
// FunTunes Hi-Fi Components
// =============================================================================

const C = {
  bg:"#f4f1f9", card:"#ffffff",
  accent:"#7c3fc4", accentSoft:"#f6f1fc", accentDark:"#5d2a99", accentLight:"#9a63dd",
  deep:"#4e2b73", deepest:"#3f1f6b",
  green:"#1f9e7e", greenSoft:"#e4f7f1", green2:"#5ef0cf", green3:"#33c9a6",
  blue:"#2E86DE", blueSoft:"#e8f1fc",
  pink:"#E84393", pinkSoft:"#fde8f3",
  orange:"#F39C12", orangeSoft:"#fef5e0",
  yellow:"#F4B400", yellowSoft:"#fef8e6",
  text:"#2a2036", textMid:"#7d7493", textLight:"#8b83a0",
  muted:"#6b6280", muted2:"#a099b5",
  border:"#e6dff2", borderStrong:"#ded5ee",
  danger:"#c2607a", dangerSoft:"#fdf4f6",
  purplePill:"#6d3f9c", purpleGlow:"rgba(139,82,204,0.1)",
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATS_PIN = "1504";

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
    <button type="button" className="stepper-btn" onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}>−</button>
    <span className="stepper-val">{value}</span>
    <button type="button" className="stepper-btn" onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}>+</button>
  </div>
);

const Dropdown = ({value,options,onChange,flex}) => (
  <select className="fld" style={flex?{flex}:undefined} value={value}
    onChange={e=>onChange(e.target.value)}>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const IconMenu = ({trigger,title,activeValue,items}) => {
  const [open,setOpen] = React.useState(false);
  return (
    <div style={{position:"relative"}}>
      <button className="btn btn-sm" onClick={()=>setOpen(!open)} title={title}>{trigger}</button>
      {open && <>
        <div style={{position:"fixed",inset:0,zIndex:90}} onClick={()=>setOpen(false)} />
        <div className="ft-more-menu" style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:91}}>
          {items.map(it=>(
            <button key={it.value} className={`ft-more-item${activeValue===it.value?" ft-more-item--active":""}`}
              onClick={()=>{it.onSelect();setOpen(false);}}>
              <span>{it.icon}</span>{it.label}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
};

// ── SVG Tab Icons ──

const TabIconToday = ({active}) => (
  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke={active?"#5d2a99":"#a099b5"} strokeWidth="1.8">
    <rect x="3" y="8" width="14" height="9" rx="1.5"/><path d="M3 8l7-5 7 5"/>
  </svg>
);
const TabIconEntries = ({active}) => (
  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke={active?"#5d2a99":"#a099b5"} strokeWidth="1.7">
    <rect x="2.5" y="6" width="15" height="8" rx="2"/><path d="M7 6v8"/>
  </svg>
);
const TabIconBirthdays = ({active}) => (
  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke={active?"#5d2a99":"#a099b5"} strokeWidth="1.7">
    <rect x="3.5" y="8" width="13" height="8" rx="2"/><circle cx="10" cy="4.5" r="1.5"/>
  </svg>
);
const TabIconMore = ({active}) => (
  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke={active?"#5d2a99":"#a099b5"} strokeWidth="1.7">
    <path d="M4 6h12M4 10h12M4 14h12"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="#6d3f9c" strokeWidth="1.6">
    <path d="M10 2.6l6 2.4v4.4c0 3.4-2.4 6.2-6 7.4-3.6-1.2-6-4-6-7.4V5l6-2.4z"/>
    <path d="M7.6 10.2l1.7 1.7 3.3-3.4"/>
  </svg>
);

// ── PIN Pad (replaces PasswordGate) ──

const PinPad = ({onUnlock}) => {
  const [digits, setDigits] = React.useState([]);
  const [error, setError] = React.useState(false);

  const addDigit = (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      const pin = next.join("");
      if (pin === STATS_PIN) {
        setTimeout(() => onUnlock(), 200);
      } else {
        setError(true);
        setTimeout(() => { setDigits([]); setError(false); }, 600);
      }
    }
  };

  const removeLast = () => {
    setDigits(d => d.slice(0, -1));
    setError(false);
  };

  return (
    <div className="ft-pin-overlay">
      <div className="ft-pin-sheet">
        <div className="ft-pin-shield">
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="#6d3f9c" strokeWidth="1.4">
            <path d="M10 2.6l6 2.4v4.4c0 3.4-2.4 6.2-6 7.4-3.6-1.2-6-4-6-7.4V5l6-2.4z"/>
            <path d="M7.6 10.2l1.7 1.7 3.3-3.4"/>
          </svg>
        </div>
        <div className="ft-pin-title">Admin access</div>
        <div className="ft-pin-sub">Enter 4-digit PIN</div>
        <div className={`ft-pin-dots${error?" ft-pin-error":""}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`ft-pin-dot${i < digits.length ? " ft-pin-dot--filled" : ""}`} />
          ))}
        </div>
        <div className="ft-pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="ft-pin-key" onClick={() => addDigit(n)}>{n}</button>
          ))}
          <div className="ft-pin-key ft-pin-key--empty"></div>
          <button className="ft-pin-key" onClick={() => addDigit(0)}>0</button>
          <button className="ft-pin-key ft-pin-key--del" onClick={removeLast}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
          </button>
        </div>
        <div className="ft-pin-note">Unlocked for this shift only</div>
      </div>
    </div>
  );
};

const PasswordGate = ({onUnlock}) => <PinPad onUnlock={onUnlock} />;

// ── Confirm Dialog ──

const ConfirmDialog = ({message, needsPassword, confirmLabel, onConfirm, onCancel}) => {
  const [pin, setPin] = React.useState([]);
  const [pinError, setPinError] = React.useState(false);

  const handleConfirm = () => {
    if (needsPassword) {
      const p = pin.join("");
      if (p !== STATS_PIN) { setPinError(true); setTimeout(()=>{setPin([]);setPinError(false);},600); return; }
    }
    onConfirm();
  };

  const addDigit = (d) => {
    if (pin.length >= 4) return;
    setPin([...pin, d]);
  };

  return (
    <div className="ft-confirm-overlay" onClick={onCancel}>
      <div className="ft-confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="ft-confirm-msg">{message}</div>
        {needsPassword && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:C.textMid,fontWeight:600,marginBottom:8,textAlign:"center"}}>Enter admin PIN</div>
            <div className={`ft-pin-dots${pinError?" ft-pin-error":""}`} style={{marginBottom:12}}>
              {[0,1,2,3].map(i => (
                <div key={i} className={`ft-pin-dot${i < pin.length ? " ft-pin-dot--filled" : ""}`} />
              ))}
            </div>
            <div className="ft-pin-grid ft-pin-grid--sm">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className="ft-pin-key ft-pin-key--sm" onClick={() => addDigit(n)}>{n}</button>
              ))}
              <div></div>
              <button className="ft-pin-key ft-pin-key--sm" onClick={() => addDigit(0)}>0</button>
              <button className="ft-pin-key ft-pin-key--sm" onClick={() => setPin(p=>p.slice(0,-1))}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
              </button>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button className="ft-btn-secondary" style={{flex:1}} onClick={onCancel}>Cancel</button>
          <button className="ft-btn-primary" style={{flex:1}} onClick={handleConfirm}>{confirmLabel||"Confirm"}</button>
        </div>
      </div>
    </div>
  );
};

// ── Birthday Components ──

const BirthdayCard = ({record, onSave, onMove}) => {
  const [notes, setNotes] = React.useState(record.notes || "");
  const [editingNotes, setEditingNotes] = React.useState(false);

  const save = (s, n) => { onSave({...record, status:s, notes:n}); };

  const thisYear = new Date().getFullYear();
  const age = record.year ? thisYear - record.year : null;
  const turnsLabel = age ? `turns ${age}` : "";
  const status = record.status || "not_contacted";

  return (
    <div className="ft-kb-card" id={`bday-day-${record.day}`}>
      <div className="ft-kb-card-top">
        <div className="ft-kb-card-day">{record.day || "?"}</div>
        <div className="ft-kb-card-info">
          <div className="ft-kb-card-name">{record.kidName || "—"}{turnsLabel ? ` ${turnsLabel}` : ""}</div>
          {record.phone && <div className="ft-kb-card-phone">{record.phone}</div>}
        </div>
      </div>
      {(notes || editingNotes) && (
        <div className="ft-kb-card-notes">
          {editingNotes ? (
            <textarea className="fld" rows={2} value={notes} placeholder="Add a note..."
              onChange={e => setNotes(e.target.value)}
              onBlur={() => {save(status, notes); setEditingNotes(false);}} autoFocus />
          ) : (
            <div className="ft-kb-card-note-text" onClick={()=>setEditingNotes(true)}>{notes}</div>
          )}
        </div>
      )}
      <div className="ft-kb-card-actions">
        {record.phone && <a href={`https://wa.me/${record.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener" className="ft-kb-act" title="WhatsApp">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 18l1.3-4.7a7.5 7.5 0 1110.4 0L18 18l-4.7-1.3"/></svg>
        </a>}
        <button className="ft-kb-act" onClick={()=>setEditingNotes(!editingNotes)} title="Notes">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h12v12H4z"/><path d="M7 8h6M7 11h4"/></svg>
        </button>
        <div className="ft-kb-card-move">
          {status === "not_contacted" && <>
            <button className="ft-kb-move-btn ft-kb-move-btn--na" onClick={()=>{save("na","");onMove&&onMove();}}>NA</button>
            <button className="ft-kb-move-btn ft-kb-move-btn--follow" onClick={()=>{save("warm",notes);onMove&&onMove();}}>Follow</button>
          </>}
          {status === "na" && <>
            <button className="ft-kb-move-btn" onClick={()=>{save("not_contacted",notes);onMove&&onMove();}}>New</button>
            <button className="ft-kb-move-btn ft-kb-move-btn--follow" onClick={()=>{save("warm",notes);onMove&&onMove();}}>Follow</button>
          </>}
          {status === "warm" && <>
            <button className="ft-kb-move-btn" onClick={()=>{save("not_contacted",notes);onMove&&onMove();}}>New</button>
            <button className="ft-kb-move-btn ft-kb-move-btn--book" onClick={()=>{save("booking",notes);onMove&&onMove();}}>Book</button>
          </>}
          {status === "booking" && <>
            <button className="ft-kb-move-btn" onClick={()=>{save("warm",notes);onMove&&onMove();}}>Follow</button>
          </>}
        </div>
      </div>
    </div>
  );
};

const KANBAN_COLS = [
  {key:"not_contacted", label:"New", color:"#7c3fc4"},
  {key:"na", label:"NA", color:"#a099b5"},
  {key:"warm", label:"Follow", color:"#e6a817"},
];

const BookedCard = ({record, onSave}) => {
  const [notes, setNotes] = React.useState(record.notes || "");
  const [pkg, setPkg] = React.useState(record.package || "");
  const [numKids, setNumKids] = React.useState(record.numKids || "");
  const [numAdults, setNumAdults] = React.useState(record.numAdults || "");
  const [services, setServices] = React.useState(record.services || "");
  const [inclusions, setInclusions] = React.useState(record.inclusions || "");
  const [editing, setEditing] = React.useState(false);

  const thisYear = new Date().getFullYear();
  const age = record.year ? thisYear - record.year : null;
  const turnsLabel = age ? `turns ${age}` : "";

  const doSave = () => {
    onSave({...record, status:"booking", notes, package:pkg, numKids, numAdults, services, inclusions});
    setEditing(false);
  };
  const moveBack = () => { onSave({...record, status:"warm", notes}); };

  return (
    <div className="ft-booked-card">
      <div className="ft-booked-card-header">
        <div className="ft-kb-card-day">{record.day || "?"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div className="ft-booked-card-name">{record.kidName || "—"}{turnsLabel ? ` ${turnsLabel}` : ""}</div>
          {record.phone && <div className="ft-kb-card-phone">{record.phone}</div>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {record.phone && <a href={`https://wa.me/${record.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener" className="ft-kb-act" title="WhatsApp">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 18l1.3-4.7a7.5 7.5 0 1110.4 0L18 18l-4.7-1.3"/></svg>
          </a>}
          <button className="ft-kb-move-btn" onClick={moveBack}>Move to Follow</button>
          <button className="ft-kb-act" onClick={()=>setEditing(!editing)} title={editing?"Cancel":"Edit"}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"/></svg>
          </button>
        </div>
      </div>
      <div className="ft-booked-card-body">
        <div className="ft-booked-grid">
          <div className="ft-booked-field">
            <label>Package</label>
            {editing ? <input className="fld" value={pkg} placeholder="e.g. Gold" onChange={e=>setPkg(e.target.value)} />
              : <span>{pkg || "—"}</span>}
          </div>
          <div className="ft-booked-field">
            <label>Kids</label>
            {editing ? <input className="fld" value={numKids} placeholder="e.g. 15" type="tel" inputMode="numeric" onChange={e=>setNumKids(e.target.value.replace(/\D/g,""))} />
              : <span>{numKids || "—"}</span>}
          </div>
          <div className="ft-booked-field">
            <label>Adults</label>
            {editing ? <input className="fld" value={numAdults} placeholder="e.g. 10" type="tel" inputMode="numeric" onChange={e=>setNumAdults(e.target.value.replace(/\D/g,""))} />
              : <span>{numAdults || "—"}</span>}
          </div>
          <div className="ft-booked-field">
            <label>Services</label>
            {editing ? <input className="fld" value={services} placeholder="e.g. Cake, Decoration" onChange={e=>setServices(e.target.value)} />
              : <span>{services || "—"}</span>}
          </div>
          <div className="ft-booked-field ft-booked-field--wide">
            <label>Inclusions</label>
            {editing ? <input className="fld" value={inclusions} placeholder="e.g. Return gifts, Food" onChange={e=>setInclusions(e.target.value)} />
              : <span>{inclusions || "—"}</span>}
          </div>
          <div className="ft-booked-field ft-booked-field--wide">
            <label>Notes</label>
            {editing ? <textarea className="fld" rows={2} value={notes} placeholder="Any notes..." onChange={e=>setNotes(e.target.value)} />
              : <span>{notes || "—"}</span>}
          </div>
        </div>
        {editing && <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:10}}>
          <button className="ft-kb-move-btn" onClick={()=>setEditing(false)}>Cancel</button>
          <button className="ft-kb-move-btn ft-kb-move-btn--book" onClick={doSave}>Save</button>
        </div>}
      </div>
    </div>
  );
};

const BirthdayKanban = ({birthdays, month, year, loading, onSave, isSearching, mobileFilter, showBooked, bookedList}) => {
  if (loading) return <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading birthdays...</div></div>;

  if (showBooked) {
    const booked = (bookedList||[]).sort((a,b) => (a.day||0)-(b.day||0));
    if (!booked.length) return <div className="ft-empty">No booked birthdays for {MONTH_NAMES[(month||1)-1]}.</div>;
    return (
      <div className="ft-booked-list">
        {booked.map((b,i) => <BookedCard key={b.key||i} record={b} onSave={onSave} />)}
      </div>
    );
  }

  if (!birthdays.length) return <div className="ft-empty">{isSearching ? "No results found." : `No birthdays found for ${MONTH_NAMES[(month||1)-1]}.`}</div>;

  const cols = {};
  KANBAN_COLS.forEach(c => { cols[c.key] = []; });
  birthdays.forEach(b => {
    const s = b.status || "not_contacted";
    if (s === "booking") return;
    if (!cols[s]) cols[s] = [];
    cols[s].push(b);
  });
  Object.keys(cols).forEach(k => { cols[k].sort((a,b) => (a.day||0)-(b.day||0)); });

  return (
    <div className="ft-kb-board">
      {KANBAN_COLS.map(col => (
        <div key={col.key} className={`ft-kb-col${mobileFilter && mobileFilter !== col.key ? " ft-kb-col--mobile-hide" : ""}`}>
          <div className="ft-kb-col-header">
            <span className="ft-kb-col-dot" style={{background:col.color}} />
            <span className="ft-kb-col-title">{col.label}</span>
            <span className="ft-kb-col-count">{(cols[col.key]||[]).length}</span>
          </div>
          <div className="ft-kb-col-body">
            {(cols[col.key]||[]).length === 0 && <div className="ft-kb-col-empty">No entries</div>}
            {(cols[col.key]||[]).map((b,i) => (
              <BirthdayCard key={b.key||i} record={b} onSave={onSave} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Calendar Filter ──

const CalendarFilter = ({mode, date, rangeStart, rangeEnd, onModeChange, onDateChange, onRangeChange, onToday}) => {
  return (
    <div className="ft-filter">
      <div className="ft-seg">
        {[{v:"day",l:"Day"},{v:"month",l:"Month"},{v:"range",l:"Range"}].map(t => (
          <button key={t.v} className={`ft-seg-item${mode===t.v?" ft-seg-item--active":""}`}
            onClick={() => onModeChange(t.v)}>{t.l}</button>
        ))}
      </div>
      <div className="ft-filter-controls">
        {mode !== "range" && (
          <input className="fld" type="date" value={date} onChange={e => onDateChange(e.target.value)}
            style={{maxWidth:160,fontSize:12}} />
        )}
        {mode === "range" && <>
          <input className="fld" type="date" value={rangeStart||""} onChange={e => onRangeChange(e.target.value, rangeEnd)}
            style={{maxWidth:140,fontSize:12}} />
          <span style={{fontSize:11,color:C.textMid}}>to</span>
          <input className="fld" type="date" value={rangeEnd||""} onChange={e => onRangeChange(rangeStart, e.target.value)}
            style={{maxWidth:140,fontSize:12}} />
        </>}
        <button className="ft-chip" onClick={onToday}>Today</button>
      </div>
    </div>
  );
};

// ── Checkout Tracking ──

const CHECKOUT_KEY = "funtunes_checkouts";

function isCheckedOut(id) {
  try { const d = JSON.parse(localStorage.getItem(CHECKOUT_KEY)||"{}"); return !!d[id]; } catch(e) { return false; }
}
function setCheckedOut(id) {
  try { const d = JSON.parse(localStorage.getItem(CHECKOUT_KEY)||"{}"); d[id] = Date.now(); localStorage.setItem(CHECKOUT_KEY, JSON.stringify(d)); } catch(e) {}
}
function parseTime24ToMinutes(t) {
  if (!t) return 0;
  const p = t.split(":").map(Number);
  return (p[0]||0)*60 + (p[1]||0);
}
function formatTime12Short(t) {
  if (!t) return "";
  const [h,m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2,"0")} ${ampm}`;
}

// ── Entry Card (replaces LiveEntryRow table row) ──

const EntryRow = ({entry, onEdit, onDelete, onCheckout}) => {
  const name = entry.customerName || entry["Customer name"] || "—";
  const amt = parseInt(entry.amount) || parseInt(entry["Amount"]) || 0;
  const socksAmt = parseInt(entry.socks) || parseInt(entry["Socks"]) || 0;
  const mop = entry.mop || entry["MOP"] || "";
  const kids = parseInt(entry.numKids || entry["No of kids"] || 1);
  const phone = entry.phone || entry["Phone number"] || "";
  const timeIn = entry.timeIn || "";
  const timeOut = entry.timeOut || "";
  const hours = parseFloat(entry.hours || entry["Hours"] || 0);
  const id = entry.id;
  const age = entry.age || entry["Age"] || "";

  const checkedOut = id ? isCheckedOut(id) : false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = (entry.date || "") === now.toISOString().slice(0, 10);
  const inMin = parseTime24ToMinutes(timeIn);
  const outMin = parseTime24ToMinutes(timeOut);
  const isActive = isToday && !checkedOut && timeIn && timeOut && nowMin >= inMin && nowMin < outMin;
  const isExceeded = isToday && !checkedOut && timeIn && timeOut && nowMin >= outMin && outMin > 0;

  const total = amt + socksAmt;

  const durLabel = hours ? (hours >= 1 ? `${hours}h` : `${Math.round(hours*60)}m`) : "—";

  const isPass = mop.toLowerCase().includes("pass");
  const mopLabel = isPass ? "Pass"
    : mop.toLowerCase().includes("upi") && mop.toLowerCase().includes("cash") ? "UPI + Cash"
    : mop.toLowerCase().includes("upi") ? "UPI"
    : mop.toLowerCase().includes("cash") ? "Cash" : mop || "—";

  const mopClass = isPass ? "pass" : mopLabel.includes("UPI") ? "upi" : mopLabel.includes("Cash") ? "cash" : "";

  const timeLabel = timeIn
    ? `${formatTime12Short(timeIn)} → ${formatTime12Short(timeOut)}`
    : null;

  const subInfo = [age ? `${age}y` : null, phone].filter(Boolean).join(" · ");

  return (
    <div className={`ft-erow${isActive?" ft-erow--active":""}${isExceeded?" ft-erow--exceeded":""}${checkedOut?" ft-erow--done":""}`}
      onClick={() => onEdit(entry)}>
      <div className="ft-erow-name">
        <div className="ft-erow-name-main">{name}{kids > 1 ? ` (${kids})` : ""}</div>
        {subInfo && <div className="ft-erow-name-sub">{subInfo}</div>}
      </div>
      <div className="ft-erow-time">
        {timeLabel ? <span>{timeLabel}</span>
          : <span className="ft-erow-missing">— set time</span>}
      </div>
      <div className="ft-erow-dur">{durLabel}</div>
      <div className="ft-erow-mop">
        <span className={`ft-entry-mop${mopClass?` ft-entry-mop--${mopClass}`:""}`}>{mopLabel}</span>
      </div>
      <div className="ft-erow-amt">₹{total.toLocaleString("en-IN")}</div>
      <div className="ft-erow-actions" onClick={e=>e.stopPropagation()}>
        <button className="ft-entry-act-btn" onClick={() => onEdit(entry)} title="Edit">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"/></svg>
        </button>
        {isActive && onCheckout && (
          <button className="ft-entry-act-btn ft-entry-act-btn--checkout" onClick={() => onCheckout(entry)} title="Checkout">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l4 4-4 4"/><path d="M18 6H8"/><path d="M6 4H3v14h3"/></svg>
          </button>
        )}
        <button className="ft-entry-act-btn ft-entry-act-btn--danger" onClick={() => onDelete(entry)} title="Delete">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h12M8 5V3h4v2M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5"/><path d="M9 8v6M11 8v6"/></svg>
        </button>
      </div>
    </div>
  );
};

const LiveEntryList = ({entries, onEdit, onDelete, onCheckout, loading}) => {
  const MAX_PER_GROUP = 10;
  const [expanded, setExpanded] = React.useState({});

  if (loading) return <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading entries...</div></div>;
  if (!entries.length) return <div className="ft-empty">No entries yet — tap <strong style={{color:C.accent}}>New booking</strong> to start.</div>;

  const grouped = {};
  entries.forEach(e => {
    const d = e.date || "unknown";
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });
  const dates = Object.keys(grouped).sort().reverse();

  function formatGroupDate(d) {
    try {
      const dt = new Date(d+"T00:00:00");
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
    } catch(e) { return d; }
  }

  return (
    <div className="ft-entry-list">
      {dates.map(d => {
        const group = grouped[d];
        const groupTotal = group.reduce((s,e)=>s+(parseInt(e.amount||0))+(parseInt(e.socks||0)),0);
        const isExpanded = expanded[d];
        const visible = isExpanded ? group : group.slice(0, MAX_PER_GROUP);
        const hasMore = group.length > MAX_PER_GROUP && !isExpanded;

        return (
          <div key={d} className="ft-egroup">
            <div className="ft-egroup-header">
              <span className="ft-egroup-date">{formatGroupDate(d)}</span>
              <span className="ft-egroup-meta">{group.length} {group.length===1?"entry":"entries"} · ₹{groupTotal.toLocaleString("en-IN")}</span>
            </div>
            {dates.length > 0 && (
              <div className="ft-erow-cols">
                <span className="ft-erow-name">NAME</span>
                <span className="ft-erow-time">PLAYTIME</span>
                <span className="ft-erow-dur">DUR</span>
                <span className="ft-erow-mop">MODE</span>
                <span className="ft-erow-amt">AMOUNT</span>
                <span className="ft-erow-actions"></span>
              </div>
            )}
            {visible.map((e, i) => (
              <EntryRow key={e.id || i} entry={e} onEdit={onEdit} onDelete={onDelete} onCheckout={onCheckout} />
            ))}
            {hasMore && (
              <button className="ft-egroup-more" onClick={()=>setExpanded(p=>({...p,[d]:true}))}>
                +{group.length - MAX_PER_GROUP} more on this day
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const EntryList = ({entries, onEdit, onDelete, loading}) => {
  return <LiveEntryList entries={entries} onEdit={onEdit} onDelete={onDelete} loading={loading} />;
};

// ── Expense Categories ──

const EXPENSE_CATEGORIES = [
  {value:"snacks",label:"Snacks & Drinks"},
  {value:"cleaning",label:"Cleaning"},
  {value:"repairs",label:"Repairs"},
  {value:"supplies",label:"Supplies"},
  {value:"transport",label:"Transport"},
  {value:"misc",label:"Miscellaneous"},
];

const MONTHLY_EXPENSE_CATEGORIES = [
  {value:"rent",label:"Rent"},
  {value:"salary",label:"Salary"},
  {value:"electricity",label:"Electricity"},
  {value:"water",label:"Water"},
  {value:"internet",label:"Internet"},
  {value:"insurance",label:"Insurance"},
  {value:"maintenance",label:"Maintenance"},
  {value:"marketing",label:"Marketing"},
  {value:"misc",label:"Miscellaneous"},
];

// ── Monthly Expenses Dashboard ──

const MonthlyExpensesDashboard = ({expenses, month, year, onChangeMonth, onChangeYear, onAdd, onDelete, loading, hideFilter}) => {
  const f = (v) => `₹${(v||0).toLocaleString("en-IN")}`;
  const total = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const catLabel = (c) => (MONTHLY_EXPENSE_CATEGORIES.find(x=>x.value===c)||{}).label || c;

  return (
    <div>
      {!hideFilter && <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <Dropdown flex={1.5} value={month} onChange={v=>onChangeMonth(parseInt(v))}
          options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
        <Dropdown flex={1} value={year} onChange={v=>onChangeYear(parseInt(v))}
          options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
        <button className="ft-btn-primary" style={{padding:"8px 16px",fontSize:13}} onClick={onAdd}>+ Add</button>
      </div>}
      {loading ? <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading...</div></div> : <>
        <div className="ft-pnl-section" style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:".4px",marginBottom:4}}>Total Monthly Expenses</div>
          <div style={{fontSize:28,fontWeight:900,color:C.danger}}>{f(total)}</div>
          <div style={{fontSize:11,color:C.textLight,fontWeight:600,marginTop:4}}>{MONTH_NAMES[(month||1)-1]} {year}</div>
        </div>

        {expenses.length > 0 && <div className="ft-pnl-section">
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Expense Details</div>
          {expenses.map((e,i) => (
            <div key={e.id||i} className="ft-entry-card" style={{padding:"12px 16px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{catLabel(e.category)}</div>
                  <div style={{fontSize:11,color:C.textLight}}>{e.description || "—"}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700,color:C.danger}}>{f(e.amount)}</span>
                  <button className="ft-entry-act-btn ft-entry-act-btn--danger" onClick={()=>onDelete(e)}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>}
        {!expenses.length && <div className="ft-empty">No expenses recorded for {MONTH_NAMES[(month||1)-1]} {year}.</div>}
      </>}
    </div>
  );
};

// ── Cash Flow Summary ──

const CashFlowSummary = ({entries, expenses}) => {
  const totalUpi = entries.reduce((a,e) => a + (parseInt(e.playUpi)||0) + (parseInt(e.socksUpi)||0), 0);
  const totalCash = entries.reduce((a,e) => a + (parseInt(e.playCash)||0) + (parseInt(e.socksCash)||0), 0);
  const totalExpenses = expenses.reduce((a,e) => a + (parseInt(e.amount)||0), 0);
  const netCash = totalCash - totalExpenses;
  const f = (v) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <div className="ft-cr-summary">
      <div className="ft-stat-grid">
        <div className="ft-stat-card">
          <div className="ft-stat-label">UPI Received</div>
          <div className="ft-stat-value" style={{color:C.blue}}>{f(totalUpi)}</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-label">Cash Received</div>
          <div className="ft-stat-value" style={{color:C.green}}>{f(totalCash)}</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-label">Cash Expenses</div>
          <div className="ft-stat-value" style={{color:C.danger}}>{f(totalExpenses)}</div>
        </div>
        <div className="ft-cr-total">
          <div className="ft-stat-label" style={{color:"rgba(255,255,255,.7)"}}>Net Cash in Hand</div>
          <div className="ft-stat-value" style={{color:netCash>=0?"#5ef0cf":"#ff8a9b",fontSize:24}}>{f(netCash)}</div>
        </div>
      </div>
    </div>
  );
};

// ── Bar Chart (simple SVG) ──

const BarChart = ({data, labelKey, valueKey, color, height=160, prefix=""}) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d=>d[valueKey]||0), 1);
  const barW = Math.min(32, Math.max(12, Math.floor(300 / data.length) - 4));
  return (
    <div style={{overflowX:"auto"}}>
      <svg width={Math.max(300, data.length * (barW+8))} height={height+30} style={{display:"block"}}>
        {data.map((d,i) => {
          const v = d[valueKey]||0;
          const h = (v/max) * height;
          const x = i * (barW+8) + 4;
          return (
            <g key={i}>
              <rect x={x} y={height-h} width={barW} height={h} rx={4} fill={color} opacity={0.85} />
              <text x={x+barW/2} y={height+14} textAnchor="middle" fontSize="9" fill={C.textLight}>{d[labelKey]}</text>
              {v > 0 && <text x={x+barW/2} y={height-h-4} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.text}>{prefix}{v.toLocaleString("en-IN")}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Expense List ──

const ExpenseList = ({expenses, onDelete}) => {
  if (!expenses.length) return null;
  const f = (v) => `₹${v.toLocaleString("en-IN")}`;
  const catLabel = (c) => (EXPENSE_CATEGORIES.find(x=>x.value===c)||{}).label || c;
  return (
    <div className="ft-pnl-section" style={{marginTop:16}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Expenses</div>
      {expenses.map((e,i) => (
        <div key={e.id||i} className="ft-entry-card" style={{padding:"10px 14px",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:12,fontWeight:600}}>{(e.date||"").split("-").reverse().join("/")} · {catLabel(e.category)}</div>
              <div style={{fontSize:11,color:C.textLight}}>{e.description||"—"}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontWeight:700,fontSize:13,color:C.danger}}>{f(e.amount)}</span>
              <button className="ft-entry-act-btn ft-entry-act-btn--danger" onClick={()=>onDelete(e)}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15"/></svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Stats Dashboard ──

const StatsDashboard = ({entries, expenses, onDeleteExpense}) => {
  const totalKids = entries.reduce((a,e) => a + (parseInt(e.numKids)||1), 0);
  const totalRevenue = entries.reduce((a,e) => a + (parseInt(e.amount)||0) + (parseInt(e.socks)||0), 0);
  const totalPlayUpi = entries.reduce((a,e) => a + (parseInt(e.playUpi)||0), 0);
  const totalPlayCash = entries.reduce((a,e) => a + (parseInt(e.playCash)||0), 0);
  const totalSocksUpi = entries.reduce((a,e) => a + (parseInt(e.socksUpi)||0), 0);
  const totalSocksCash = entries.reduce((a,e) => a + (parseInt(e.socksCash)||0), 0);
  const totalUpi = totalPlayUpi + totalSocksUpi;
  const totalCash = totalPlayCash + totalSocksCash;
  const allExpenses = expenses || [];
  const f = (v) => `₹${v.toLocaleString("en-IN")}`;

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

  return (
    <div>
      <CashFlowSummary entries={entries} expenses={allExpenses} />

      <div className="ft-stat-grid" style={{marginTop:16}}>
        <div className="ft-stat-card">
          <div className="ft-stat-label">Total Kids</div>
          <div className="ft-stat-value">{totalKids}</div>
        </div>
        <div className="ft-stat-card">
          <div className="ft-stat-label">Revenue</div>
          <div className="ft-stat-value" style={{color:C.deepest}}>{f(totalRevenue)}</div>
          <div className="ft-stat-sub">UPI {f(totalUpi)} · Cash {f(totalCash)}</div>
        </div>
      </div>

      {rows.length > 1 && (
        <div className="ft-pnl-section" style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Kids per day</div>
          <BarChart data={kidsData} labelKey="label" valueKey="value" color={C.accent} height={120} />
        </div>
      )}
      {rows.length > 1 && (
        <div className="ft-pnl-section" style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Revenue per day</div>
          <BarChart data={revenueData} labelKey="label" valueKey="value" color={C.green} height={120} prefix="₹" />
        </div>
      )}

      {rows.length > 0 && (
        <div className="ft-pnl-section" style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Daily Breakdown</div>
          <div style={{overflowX:"auto"}}>
            <table className="ft-table">
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
        </div>
      )}

      <ExpenseList expenses={allExpenses} onDelete={onDeleteExpense} />
    </div>
  );
};

// ── P&L Report ──

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

      {loading ? <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading...</div></div> :
      <div>
        <div className="ft-pnl-hero">
          <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>
            {profit >= 0 ? "Net Profit" : "Net Loss"}
          </div>
          <div style={{fontSize:32,fontWeight:900,color:profit>=0?"#5ef0cf":"#ff8a9b"}}>
            {profit >= 0 ? "+" : "−"}{f(profit)}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:600,marginTop:6}}>
            {MONTH_NAMES[(month||1)-1]} {year} · {entries.length} entries
          </div>
        </div>

        <div className="ft-pnl-section" style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Revenue</div>
          <div style={{overflowX:"auto"}}>
            <table className="ft-table">
              <tbody>
                <tr><td>Play Income (UPI)</td><td style={{textAlign:"right",color:C.blue,fontWeight:700}}>{f(totalPlayUpi)}</td></tr>
                <tr><td>Play Income (Cash)</td><td style={{textAlign:"right",color:C.green,fontWeight:700}}>{f(totalPlayCash)}</td></tr>
                <tr><td>Socks Income (UPI)</td><td style={{textAlign:"right",color:C.blue,fontWeight:700}}>{f(totalSocksUpi)}</td></tr>
                <tr><td>Socks Income (Cash)</td><td style={{textAlign:"right",color:C.green,fontWeight:700}}>{f(totalSocksCash)}</td></tr>
                <tr style={{fontWeight:800,borderTop:`2px solid ${C.border}`}}>
                  <td>Total Revenue</td>
                  <td style={{textAlign:"right",color:C.green}}>{f(totalIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="ft-pnl-section" style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Costs</div>
          <div style={{overflowX:"auto"}}>
            <table className="ft-table">
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
                <tr style={{fontWeight:800,borderTop:`2px solid ${C.border}`}}>
                  <td>Total Costs</td>
                  <td style={{textAlign:"right",color:C.danger}}>{f(totalCosts)}</td>
                </tr>
              </tbody>
            </table>
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
  present:  {label:"Present",  short:"P", color:C.green,  bg:"#e4f7f1"},
  absent:   {label:"Absent",   short:"A", color:C.danger, bg:C.dangerSoft},
  half_day: {label:"Holiday",  short:"H", color:C.orange, bg:C.orangeSoft},
  leave:    {label:"Leave",    short:"L", color:C.blue,   bg:C.blueSoft},
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
    <div className="ft-confirm-overlay" onClick={onCancel}>
      <div className="ft-confirm-dialog" style={{maxWidth:460,textAlign:"left"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontWeight:700,fontSize:15}}>{staff ? "Edit Staff" : "Add Staff"}</span>
          <button className="ft-entry-act-btn" onClick={onCancel} disabled={saving}>✕</button>
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
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button className="ft-btn-secondary" onClick={onCancel} disabled={saving} style={{flex:"0 0 90px"}}>Cancel</button>
          <button className="ft-btn-primary" onClick={submit} disabled={saving||!form.name.trim()} style={{flex:1}}>
            {saving?"Saving...":staff?"Update":"Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Attendance (card-based) ──

const AttendanceMarker = ({staffList, date, attendance, onMark, saving}) => {
  const dateAtt = {};
  attendance.filter(a=>a.date===date).forEach(a=>{ dateAtt[a.staff_id]=a; });
  const active = staffList.filter(s=>s.active!==false);
  if (!active.length) return <div className="ft-empty">Add staff members first.</div>;

  return (
    <div className="ft-att-grid">
      {active.map(s => {
        const cur = dateAtt[s.id];
        const status = cur ? cur.status : null;
        return (
          <div key={s.id} className="ft-staff-card">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div className="ft-staff-avatar">{s.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                <div style={{fontSize:11,color:C.textLight}}>{s.role}</div>
              </div>
            </div>
            <div className="ft-att-btns">
              {Object.keys(ATT_STATUS).map(st => {
                const meta = ATT_STATUS[st];
                const isOn = status === st;
                return (
                  <button key={st} className={`ft-att-btn${isOn?" ft-att-btn--active":""}`}
                    disabled={saving}
                    style={isOn ? {background:meta.bg, color:meta.color, borderColor:meta.color} : {}}
                    onClick={() => onMark(s.id, date, st)}>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
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
  attendance.forEach(a=>{ attMap[a.staff_id + "_" + a.date] = a.status; });

  if (!active.length) return <div className="ft-empty">No staff members yet.</div>;

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
    <div className="ft-pnl-section" style={{marginTop:16}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Timesheet — {MONTH_NAMES[month-1]} {year}</div>
      <div style={{overflowX:"auto"}}>
        <table className="ft-table" style={{fontSize:10}}>
          <thead>
            <tr>
              <th style={{position:"sticky",left:0,background:"#fff",zIndex:1}}>Staff</th>
              {days.map(d => {
                const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
                const isToday = dateStr === todayStr;
                return <th key={d} style={isToday?{background:C.accentSoft,color:C.accent}:{}}>{d}</th>;
              })}
              <th style={{color:C.green}}>P</th>
              <th style={{color:C.danger}}>A</th>
              <th style={{color:C.orange}}>H</th>
              <th style={{color:C.blue}}>L</th>
            </tr>
          </thead>
          <tbody>
            {active.map(s=>(
              <tr key={s.id}>
                <td style={{position:"sticky",left:0,background:"#fff",zIndex:1,fontWeight:700,whiteSpace:"nowrap"}}>{s.name}</td>
                {days.map(d=>{
                  const dateStr = year+"-"+mm+"-"+String(d).padStart(2,"0");
                  const st = attMap[s.id+"_"+dateStr];
                  const isToday = dateStr === todayStr;
                  const meta = st ? ATT_STATUS[st] : null;
                  return (
                    <td key={d} style={isToday?{background:C.accentSoft}:{}}>
                      {meta ? <span style={{display:"inline-block",width:18,height:18,borderRadius:9,background:meta.color,color:"#fff",fontSize:9,lineHeight:"18px",textAlign:"center",fontWeight:700}}>{meta.short}</span> : "·"}
                    </td>
                  );
                })}
                <td style={{color:C.green,fontWeight:700}}>{summaries[s.id].present}</td>
                <td style={{color:C.danger,fontWeight:700}}>{summaries[s.id].absent}</td>
                <td style={{color:C.orange,fontWeight:700}}>{summaries[s.id].half_day}</td>
                <td style={{color:C.blue,fontWeight:700}}>{summaries[s.id].leave}</td>
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
  if (!staffList.length) return <div className="ft-empty">No staff members yet. Add your first staff member.</div>;
  return (
    <div className="ft-att-grid">
      {staffList.map(s => {
        const shiftLabel = (STAFF_SHIFTS.find(x=>x.value===s.shift)||{}).label||s.shift;
        return (
          <div key={s.id} className="ft-staff-card" style={{opacity:s.active===false?0.5:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div className="ft-staff-avatar">{s.name.charAt(0).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14}}>{s.name}</div>
                <div style={{fontSize:11,color:C.textLight}}>{s.role}{s.phone?" · "+s.phone:""}</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:8,
                background:s.active!==false?C.greenSoft:C.bg,
                color:s.active!==false?C.green:C.textLight}}>
                {s.active!==false?"Active":"Inactive"}
              </span>
            </div>
            <div style={{display:"flex",gap:12,fontSize:11,color:C.textMid,marginBottom:8}}>
              <span>{shiftLabel}</span>
              {s.fixed_pay > 0 && <span>Fixed: {f(s.fixed_pay)}</span>}
              {s.pro_rata_base > 0 && <span>Pro Rata: {f(s.pro_rata_base)}/30</span>}
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
              <button className="ft-entry-act-btn" onClick={()=>onEdit(s)} title="Edit">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"/></svg>
              </button>
              <button className="ft-entry-act-btn ft-entry-act-btn--danger" onClick={()=>onDelete(s)} title="Delete">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15"/></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StaffSection = ({staffList, attendance, month, year, onChangeMonth, onChangeYear,
  onAddStaff, onEditStaff, onDeleteStaff, loading}) => {
  const [tab, setTab] = React.useState("members");

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div className="ft-seg" style={{marginRight:"auto"}}>
          {[{v:"members",l:"Staff List"},{v:"salary",l:"Salary"}].map(t=>(
            <button key={t.v} className={`ft-seg-item${tab===t.v?" ft-seg-item--active":""}`}
              onClick={()=>setTab(t.v)}>{t.l}</button>
          ))}
        </div>
        {tab==="salary" && <>
          <Dropdown flex={0} value={month} onChange={v=>onChangeMonth(parseInt(v))}
            options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
          <Dropdown flex={0} value={year} onChange={v=>onChangeYear(parseInt(v))}
            options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
        </>}
        {tab==="members" && <button className="ft-btn-primary" style={{padding:"8px 16px",fontSize:13}} onClick={onAddStaff}>+ Add Staff</button>}
      </div>

      {loading ? <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading...</div></div> : <>
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

  if (!active.length) return <div className="ft-empty">No staff members yet.</div>;

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
    <div className="ft-pnl-section">
      <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Salary Calculation — {MONTH_NAMES[month-1]} {year}</div>
      <div style={{overflowX:"auto"}}>
        <table className="ft-table">
          <thead>
            <tr>
              <th>Staff</th><th>Shift</th><th>P</th><th>A</th><th>H</th><th>L</th>
              <th>Eff. Days</th><th>Fixed</th><th>Pro Rata</th><th>Total</th>
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
                  <td>{sal.effectiveDays}{sal.paidLeave>0?<span style={{fontSize:10,color:C.blue}}> ({sal.paidLeave}L)</span>:""}</td>
                  <td>{sal.fixedPay ? f(sal.fixedPay) : "—"}</td>
                  <td>{sal.proRata ? f(sal.proRata) : "—"}</td>
                  <td style={{fontWeight:800,color:C.accent}}>{f(sal.total)}</td>
                </tr>
              );
            })}
            <tr style={{fontWeight:800,borderTop:`2px solid ${C.border}`}}>
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
  const dateAtt = {};
  attendance.filter(a=>a.date===date).forEach(a=>{ dateAtt[a.staff_id]=a; });
  const active = staffList.filter(s=>s.active!==false);
  if (!active.length) return null;
  const marked = active.filter(s=>dateAtt[s.id]).length;

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <div style={{fontWeight:700,fontSize:14}}>Mark Attendance</div>
        <span style={{fontSize:11,color:C.textLight,background:C.accentSoft,padding:"3px 10px",borderRadius:10}}>
          {marked}/{active.length} marked
        </span>
        <input className="fld" type="date" value={date} onChange={e=>onChangeDate(e.target.value)}
          style={{maxWidth:150,fontSize:12,marginLeft:"auto"}} />
      </div>
      <AttendanceMarker staffList={staffList} date={date} attendance={attendance} onMark={onMark} saving={saving} />
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

      {loading ? <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading...</div></div> : <>
        <AttendanceWidget staffList={staffList} date={attDate} attendance={attendance}
          onMark={onMarkAttendance} onChangeDate={onChangeAttDate} saving={saving} />
        <StaffTimesheet staffList={staffList} attendance={attendance} month={month} year={year} />
      </>}
    </div>
  );
};
