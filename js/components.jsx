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

const BirthdayList = ({birthdays,loading}) => {
  if (loading) return <div style={{textAlign:"center",padding:30}}><Spinner size={28} /><div style={{marginTop:10,fontSize:13,color:C.textLight}}>Loading birthdays...</div></div>;
  if (!birthdays.length) return <div style={{textAlign:"center",padding:"30px 20px",color:C.textLight,fontSize:14}}>🎈 No birthdays found for this month.</div>;

  const today = new Date();
  const todayDay = today.getDate();

  return (
    <div>
      {birthdays.map((b,i) => {
        const isToday = b.day === todayDay;
        return (
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
            background:isToday?C.pinkSoft:C.warm1,borderRadius:14,marginBottom:8,
            border:`1.5px solid ${isToday?C.pink+"50":C.border}`,
            animation:"springIn .35s ease both",animationDelay:`${i*.03}s`,
          }}>
            <div style={{width:44,height:44,borderRadius:12,background:isToday?C.pink:C.accentSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:900,color:isToday?"#fff":C.accent,lineHeight:1}}>{b.day}</div>
              <div style={{fontSize:8,fontWeight:700,color:isToday?"#fff":C.accent,textTransform:"uppercase"}}>{MONTH_NAMES[b.month-1]?.slice(0,3)}</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div>
              <div style={{fontSize:11,color:C.textLight}}>{b.turningAge?`Turning ${b.turningAge}`:""}{b.phone?` · ${b.phone}`:""}</div>
            </div>
            {isToday && <div style={{fontSize:22,flexShrink:0}}>🎉</div>}
          </div>
        );
      })}
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
