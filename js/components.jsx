// =============================================================================
// FunTunes Shared Components — Purple Theme
// =============================================================================

const C = {
  bg:"#faf5ff", card:"#ffffff",
  accent:"#7B2D8E", accentSoft:"#f3e8f9", accentDark:"#5a1d6b", accentLight:"#a855f7",
  green:"#4CAF50", greenSoft:"#e8f5e9",
  blue:"#2E86DE", blueSoft:"#e8f1fc",
  pink:"#E84393", pinkSoft:"#fde8f3",
  orange:"#F39C12", orangeSoft:"#fef5e0",
  text:"#1a1a2e", textMid:"#4a4a6a", textLight:"#9090b0",
  border:"#e8e0f0", borderFocus:"#7B2D8E",
  danger:"#e74c3c", dangerSoft:"#fdecea",
  warm1:"#f8f2fd",
  shadowLift:"0 8px 32px rgba(123,45,142,.15)",
};

const Spinner = ({size=18,color=C.accent}) => (
  <div style={{width:size,height:size,border:`2.5px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}} />
);

const inputStyle = (focused,error) => ({
  width:"100%",boxSizing:"border-box",padding:"14px 16px",fontSize:16,fontFamily:"'Nunito',sans-serif",fontWeight:500,
  border:`2px solid ${error?C.danger:focused?C.borderFocus:C.border}`,borderRadius:14,
  background:error?C.dangerSoft:focused?C.accentSoft:C.card,color:C.text,outline:"none",
  transition:"all .25s ease",boxShadow:focused?`0 0 0 4px ${C.accent}15`:"none",
});

const InputField = ({label,icon,error,children}) => (
  <div style={{marginBottom:18}}>
    <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:error?C.danger:C.textMid,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>
      {icon && <span style={{fontSize:14}}>{icon}</span>}{label}
      {error && <span style={{color:C.danger,fontSize:11,fontWeight:500,textTransform:"none",marginLeft:"auto"}}>{error}</span>}
    </label>
    {children}
  </div>
);

const ChipSelect = ({options,value,onChange}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {options.map(opt => {
      const v=opt.value||opt; const sel=value===v;
      return <button key={v} onClick={()=>onChange(v)} style={{
        padding:"10px 16px",borderRadius:12,border:`2px solid ${sel?C.accent:C.border}`,
        background:sel?C.accentSoft:C.card,color:sel?C.accent:C.textMid,
        fontSize:14,fontWeight:sel?700:500,cursor:"pointer",transition:"all .2s ease",
        transform:sel?"scale(1.03)":"scale(1)",display:"flex",alignItems:"center",gap:6,
      }}>{opt.icon && <span>{opt.icon}</span>}{opt.label||opt}</button>;
    })}
  </div>
);

const NumberStepper = ({value,onChange,min=1,max=10,label}) => (
  <div style={{display:"flex",alignItems:"center",background:C.warm1,borderRadius:16,border:`2px solid ${C.border}`,overflow:"hidden"}}>
    <button onClick={()=>onChange(Math.max(min,value-1))} style={{width:52,height:52,border:"none",background:"transparent",fontSize:22,fontWeight:700,color:value<=min?C.textLight:C.accent,cursor:value<=min?"default":"pointer"}}>−</button>
    <div style={{flex:1,textAlign:"center"}}>
      <div style={{fontSize:24,fontWeight:800,color:C.text}}>{value}</div>
      {label && <div style={{fontSize:10,color:C.textLight,textTransform:"uppercase"}}>{label}</div>}
    </div>
    <button onClick={()=>onChange(Math.min(max,value+1))} style={{width:52,height:52,border:"none",background:"transparent",fontSize:22,fontWeight:700,color:value>=max?C.textLight:C.accent,cursor:value>=max?"default":"pointer"}}>+</button>
  </div>
);

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const WEEK_LABELS = ["Week 1","Week 2","Week 3","Week 4","Week 5"];

const BirthdayCard = ({b, isToday, onSave}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [parentName, setParentName] = React.useState(b.parentName || "");
  const [phone, setPhone] = React.useState(b.phone || "");
  const [notes, setNotes] = React.useState(b.notes || "");
  const [contacted, setContacted] = React.useState(!!b.contacted);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setParentName(b.parentName || ""); setPhone(b.phone || "");
    setNotes(b.notes || ""); setContacted(!!b.contacted);
  }, [b.key]);

  const dirty = parentName !== (b.parentName||"") || phone !== (b.phone||"") || notes !== (b.notes||"") || contacted !== !!b.contacted;

  const save = async () => {
    setSaving(true);
    await onSave({ ...b, parentName, phone, notes, contacted });
    setSaving(false);
  };

  const toggleContacted = async (val) => {
    setContacted(val);
    setSaving(true);
    await onSave({ ...b, parentName, phone, notes, contacted: val });
    setSaving(false);
  };

  return (
    <div style={{
      background: contacted ? C.greenSoft : (isToday ? C.pinkSoft : C.warm1),
      borderRadius: 14, marginBottom: 8,
      border: `1.5px solid ${contacted ? C.green+"40" : isToday ? C.pink+"50" : C.border}`,
      overflow: "hidden", animation: "springIn .35s ease both",
    }}>
      <div onClick={() => setExpanded(x=>!x)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}}>
        <div style={{width:44,height:44,borderRadius:12,background:contacted?C.green:isToday?C.pink:C.accentSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:900,color:(contacted||isToday)?"#fff":C.accent,lineHeight:1}}>{b.day}</div>
          <div style={{fontSize:8,fontWeight:700,color:(contacted||isToday)?"#fff":C.accent,textTransform:"uppercase"}}>{MONTH_NAMES[b.month-1]?.slice(0,3)}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.kidName}</div>
          <div style={{fontSize:11,color:C.textLight}}>{b.turningAge?`Turning ${b.turningAge}`:""}{b.phone?` · ${b.phone}`:" · No phone"}</div>
        </div>
        {contacted && <span style={{fontSize:11,fontWeight:700,color:C.green,background:"#fff",padding:"3px 8px",borderRadius:8,flexShrink:0}}>✓ Called</span>}
        {isToday && !contacted && <div style={{fontSize:20,flexShrink:0}}>🎉</div>}
        <span style={{fontSize:12,color:C.textLight,flexShrink:0,transform:expanded?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
      </div>

      {expanded && (
        <div style={{padding:"0 14px 14px",display:"flex",flexDirection:"column",gap:10}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",marginBottom:4}}>Parent Name</div>
              <input value={parentName} onChange={e=>setParentName(e.target.value)} placeholder="Add parent name"
                style={{width:"100%",boxSizing:"border-box",padding:"9px 10px",fontSize:13,border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"'Nunito',sans-serif"}} />
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",marginBottom:4}}>Phone</div>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="Mobile number" type="tel" inputMode="numeric"
                style={{width:"100%",boxSizing:"border-box",padding:"9px 10px",fontSize:13,border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"'Nunito',sans-serif"}} />
            </div>
          </div>

          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",marginBottom:4}}>Call Notes</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Spoke to mom, interested, will confirm by Friday..." rows={2}
              style={{width:"100%",boxSizing:"border-box",padding:"9px 10px",fontSize:13,border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"'Nunito',sans-serif",resize:"vertical"}} />
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>toggleContacted(!contacted)} style={{
              display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,border:"none",cursor:"pointer",
              background:contacted?C.green:C.card,color:contacted?"#fff":C.textMid,fontSize:13,fontWeight:700,
              border:`1.5px solid ${contacted?C.green:C.border}`,
            }}>
              <span style={{width:16,height:16,borderRadius:4,border:`2px solid ${contacted?"#fff":C.textLight}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,background:contacted?"transparent":C.card}}>{contacted?"✓":""}</span>
              {contacted ? "Contacted" : "Mark as Contacted"}
            </button>
            {phone && <a href={`tel:${phone}`} onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:C.blueSoft,color:C.blue,fontSize:13,fontWeight:700,textDecoration:"none"}}>📞 Call</a>}
          </div>

          {dirty && (
            <button onClick={save} disabled={saving} style={{
              padding:"10px",borderRadius:10,border:"none",cursor:saving?"wait":"pointer",
              background:`linear-gradient(135deg,${C.accent},${C.pink})`,color:"#fff",fontSize:13,fontWeight:700,opacity:saving?0.7:1,
            }}>{saving?"Saving...":"💾 Save Changes"}</button>
          )}
        </div>
      )}
    </div>
  );
};

const BirthdayList = ({birthdays,loading,weekFilter,onSave}) => {
  if (loading) return <div style={{textAlign:"center",padding:30}}><Spinner size={28} /><div style={{marginTop:10,fontSize:13,color:C.textLight}}>Loading birthdays...</div></div>;
  if (!birthdays.length) return <div style={{textAlign:"center",padding:"30px 20px",color:C.textLight,fontSize:14}}>🎈 No birthdays found for this month.</div>;

  const filtered = weekFilter === "all" ? birthdays : birthdays.filter(b => b.week === weekFilter);
  if (!filtered.length) return <div style={{textAlign:"center",padding:"30px 20px",color:C.textLight,fontSize:14}}>No birthdays in this week.</div>;

  const now = new Date();
  const isCurrentPeriod = true; // "today" highlight only meaningful if viewing current month/year — handled by caller passing correct data

  return (
    <div>
      {filtered.map((b,i) => (
        <BirthdayCard key={b.key || i} b={b} isToday={b.day === now.getDate()} onSave={onSave} />
      ))}
    </div>
  );
};

const EntryList = ({entries,onEdit,onDelete,loading}) => {
  if (loading) return <div style={{textAlign:"center",padding:30}}><Spinner size={28} /><div style={{marginTop:10,fontSize:13,color:C.textLight}}>Loading entries...</div></div>;
  if (!entries.length) return <div style={{textAlign:"center",padding:"30px 20px",color:C.textLight,fontSize:14}}>No entries today yet. Tap <strong style={{color:C.accent}}>+ New Entry</strong> to begin.</div>;
  const total = entries.reduce((a,e)=>a+(parseInt(e.amount||e["Amount"]||0)),0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`,marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:700,color:C.textMid}}>{entries.length} entries today</span>
        <span style={{fontSize:17,fontWeight:800,color:C.green}}>₹{total.toLocaleString("en-IN")}</span>
      </div>
      {entries.map((e,i) => {
        const name=e.customerName||e["Customer name"]||"—";
        const amt=e.amount||e["Amount"]||0;
        const mop=e.mop||e["MOP"]||"";
        const kids=e.numKids||e["No of kids"]||1;
        const timing=e.timing||e["Timing"]||"";
        const typeColors = {"funzone":C.accentSoft,"birthday":C.pinkSoft,"event":C.blueSoft,"daycare":C.orangeSoft};
        const typeKey = e.entryType||e["Entry Type"]||"funzone";
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.warm1,borderRadius:14,marginBottom:8,border:`1px solid ${C.border}`,animation:"springIn .35s ease both",animationDelay:`${i*.03}s`}}>
            <div style={{width:40,height:40,borderRadius:12,background:typeColors[typeKey]||C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
              {CONFIG.ENTRY_TYPES.find(t=>t.key===typeKey)?.icon||"🎪"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
              <div style={{fontSize:11,color:C.textLight}}>{kids>1?`${kids} kids · `:""}{mop}{timing?` · ${timing}`:""}</div>
            </div>
            <div style={{fontSize:16,fontWeight:800,color:C.accent,flexShrink:0}}>₹{parseInt(amt).toLocaleString("en-IN")}</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
              <button onClick={()=>onEdit(e)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:C.card,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
              <button onClick={()=>onDelete(e)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.danger}30`,background:C.dangerSoft,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
