// =============================================================================
// FunTunes Shared Components
// =============================================================================

const C = {
  bg:"#f6f1eb",card:"#fff",accent:"#e85d26",accentSoft:"#fef0e8",accentDark:"#c94a1a",
  green:"#1a9d6c",greenSoft:"#e6f7f0",blue:"#2563eb",blueSoft:"#eff4ff",
  text:"#1a1a1a",textMid:"#555",textLight:"#999",border:"#e8e2da",borderFocus:"#e85d26",
  danger:"#dc2626",dangerSoft:"#fef2f2",warm1:"#fdf8f3",
  shadowLift:"0 8px 32px rgba(0,0,0,.12)",
};

const Spinner = ({size=18,color=C.accent}) => (
  <div style={{width:size,height:size,border:`2.5px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}} />
);

const inputStyle = (focused,error) => ({
  width:"100%",boxSizing:"border-box",padding:"14px 16px",fontSize:16,fontFamily:"'Nunito',sans-serif",fontWeight:500,
  border:`2px solid ${error?C.danger:focused?C.borderFocus:C.border}`,borderRadius:14,
  background:error?C.dangerSoft:focused?C.accentSoft:C.card,color:C.text,outline:"none",
  transition:"all .25s ease",boxShadow:focused?`0 0 0 4px ${C.accent}18`:"none",
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
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.warm1,borderRadius:14,marginBottom:8,border:`1px solid ${C.border}`,animation:"springIn .35s ease both",animationDelay:`${i*.03}s`}}>
            <div style={{width:40,height:40,borderRadius:12,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
              {CONFIG.ENTRY_TYPES.find(t=>t.key===(e.entryType||e["Entry Type"]||"funzone"))?.icon||"🎪"}
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
