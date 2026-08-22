// =============================================================================
// FunTunes Main App v3 — Purple Theme + Logo
// =============================================================================
const { useState, useRef, useEffect, useCallback } = React;

const STEP_LABELS = ["Customer","Payment","Review"];
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
  const [screen,setScreen] = useState("home");
  const [step,setStep] = useState(0);
  const [entryType,setEntryType] = useState("funzone");
  const [form,setFormState] = useState(getDefaultForm());
  const [errors,setErrors] = useState({});
  const [shakeStep,setShakeStep] = useState(false);
  const [todayEntries,setTodayEntries] = useState([]);
  const [filterDate,setFilterDate] = useState(new Date().toISOString().slice(0,10));
  const [calMode,setCalMode] = useState("day");
  const [rangeStart,setRangeStart] = useState("");
  const [rangeEnd,setRangeEnd] = useState("");
  const SECTIONS = ["home","entries","cash-register","expenses","birthdays","staff","events","marketing"];
  const [section,setSection] = useState("home");
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [statsUnlocked,setStatsUnlocked] = useState(false);
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
  const [enquiry,setEnquiry] = useState(null);
  const [enquirySaving,setEnquirySaving] = useState(false);
  const [expenses,setExpenses] = useState([]);
  const [expensePopup,setExpensePopup] = useState(null);
  const [expenseSaving,setExpenseSaving] = useState(false);
  const [monthlyExp,setMonthlyExp] = useState([]);
  const [monthlyExpMonth,setMonthlyExpMonth] = useState(new Date().getMonth()+1);
  const [monthlyExpYear,setMonthlyExpYear] = useState(new Date().getFullYear());
  const [monthlyExpLoading,setMonthlyExpLoading] = useState(false);
  const [monthlyExpPopup,setMonthlyExpPopup] = useState(null);
  const [monthlyExpSaving,setMonthlyExpSaving] = useState(false);
  const [pnlEntries,setPnlEntries] = useState([]);
  const [pnlExpenses,setPnlExpenses] = useState([]);
  const [pnlLoading,setPnlLoading] = useState(false);
  const [confirmAction,setConfirmAction] = useState(null);
  const containerRef = useRef(null);
  const lastLookedUpPhone = useRef("");

  function getDefaultForm() {
    const n=new Date();
    const hours=CONFIG.DEFAULT_HOURS, socksCount=CONFIG.DEFAULT_SOCK_COUNT;
    return {customerName:"",amount:String(computeAmountForHours(hours)),numKids:1,
      hours:hours,hoursMode:"preset",
      timeIn:`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,
      socks:socksCount*CONFIG.SOCKS_RATE,sockCount:socksCount,sockMode:"preset",
      phone:"",dob:"",date:n.toISOString().slice(0,10),
      kidNames:[],dobs:[],
      playMop:CONFIG.DEFAULT_MOP,playUpiAmount:"",playCashAmount:"",
      socksMop:CONFIG.DEFAULT_MOP,socksUpiAmount:"",socksCashAmount:""};
  }

  const set = useCallback((key,val) => {
    setFormState(f=>{
      const next = {...f,[key]:val};
      if ((key==="numKids") && entryType==="funzone") {
        next.amount = String(computeAmountForHours(next.hours) * val);
      }
      return next;
    });
    setErrors(e=>({...e,[key]:undefined}));
  },[entryType]);

  const setHours = useCallback((v,autoPrice) => {
    setFormState(f=>autoPrice ? {...f,hours:v,amount:String(computeAmountForHours(v)*f.numKids)} : {...f,hours:v});
    if (autoPrice) setErrors(e=>({...e,amount:undefined}));
  },[]);

  const setSockCount = useCallback((n) => {
    setFormState(f=>({...f,sockCount:n,socks:n*CONFIG.SOCKS_RATE,
      socksMop:n>0?(f.socksMop||f.playMop):""}));
  },[]);

  const showToastMsg = (msg,type) => { setToast({msg,type:type||"info"}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    fetchEntries(); checkBirthdaysCache();
    const onHash = () => {
      const h = location.hash.replace("#","");
      if (SECTIONS.includes(h)) {
        setSection(h);
        if (h !== "cash-register" && h !== "expenses") setStatsUnlocked(false);
        if (h === "birthdays") checkBirthdaysCache();
      } else if (!h || h === "home") { setSection("home"); }
      else if (h === "list") { setSection("entries"); }
      else if (h === "stats") { setSection("cash-register"); }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  },[]);

  function switchSection(s) {
    setSidebarOpen(false);
    if (s !== "cash-register" && s !== "expenses") setStatsUnlocked(false);
    setSection(s);
    location.hash = s === "home" ? "" : s;
    if (s === "birthdays") checkBirthdaysCache();
  }

  function handleCheckout(entry) {
    if (!entry.id) return;
    setCheckedOut(entry.id);
    setTodayEntries(prev => [...prev]);
  }

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
          return;
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
      } else showToastMsg("Error: "+(res.error||"unknown"),"error");
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

  async function handleSaveExpense() {
    if (!expensePopup) return;
    if (!expensePopup.amount || parseInt(expensePopup.amount)<=0) { showToastMsg("Enter an amount","error"); return; }
    setExpenseSaving(true);
    try {
      const res = await api.addExpense({
        date: expensePopup.date || filterDate,
        amount: expensePopup.amount,
        description: expensePopup.description || "",
        category: expensePopup.category || "misc",
      });
      if (res.success) {
        setExpenses(prev=>[res.data,...prev]);
        setExpensePopup(null);
        showToastMsg("Expense saved!","success");
      } else showToastMsg("Save failed: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Save expense:",e); showToastMsg("Could not save expense","error"); }
    finally { setExpenseSaving(false); }
  }

  function handleDeleteExpense(expenseOrId) {
    const expense = typeof expenseOrId === "object" ? expenseOrId : {id: expenseOrId};
    const id = expense.id;
    const today = new Date().toISOString().slice(0,10);
    const isPast = expense.date && expense.date !== today;
    setConfirmAction({
      message: "Delete this expense" + (expense.description ? " — " + expense.description : "") + "?",
      needsPassword: isPast,
      onConfirm: async () => {
        try {
          const res = await api.deleteExpense(id);
          if (res.success) { setExpenses(prev=>prev.filter(x=>x.id!==id)); showToastMsg("Deleted","success"); }
          else showToastMsg("Delete failed: "+(res.error||"unknown"),"error");
        } catch(e) { console.error("Delete expense:",e); showToastMsg("Could not delete","error"); }
      }
    });
  }

  async function fetchMonthlyExpenses(month, year) {
    const m = month || monthlyExpMonth, y = year || monthlyExpYear;
    setMonthlyExpLoading(true);
    try {
      const res = await api.readMonthlyExpenses(m, y);
      if (res.success) setMonthlyExp(res.data || []);
      else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Monthly expenses fetch:",e); showToastMsg("Could not load expenses","error"); }
    finally { setMonthlyExpLoading(false); }
  }

  function onMonthlyExpMonthChange(m) { setMonthlyExpMonth(m); fetchMonthlyExpenses(m, monthlyExpYear); }
  function onMonthlyExpYearChange(y) { setMonthlyExpYear(y); fetchMonthlyExpenses(monthlyExpMonth, y); }

  async function handleSaveMonthlyExpense() {
    if (!monthlyExpPopup) return;
    if (!monthlyExpPopup.amount || parseInt(monthlyExpPopup.amount) <= 0) { showToastMsg("Enter an amount","error"); return; }
    setMonthlyExpSaving(true);
    try {
      const res = await api.addMonthlyExpense({
        month: monthlyExpMonth,
        year: monthlyExpYear,
        category: monthlyExpPopup.category || "misc",
        amount: monthlyExpPopup.amount,
        description: monthlyExpPopup.description || "",
      });
      if (res.success) {
        setMonthlyExp(prev => [res.data, ...prev]);
        setMonthlyExpPopup(null);
        showToastMsg("Expense saved!", "success");
      } else showToastMsg("Save failed: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Save monthly expense:",e); showToastMsg("Could not save","error"); }
    finally { setMonthlyExpSaving(false); }
  }

  function handleDeleteMonthlyExpense(expense) {
    const exp = typeof expense === "object" ? expense : {id: expense};
    const id = exp.id;
    setConfirmAction({
      message: "Delete this monthly expense" + (exp.description ? " — " + exp.description : "") + "?",
      needsPassword: true,
      onConfirm: async () => {
        try {
          const res = await api.deleteMonthlyExpense(id);
          if (res.success) { setMonthlyExp(prev => prev.filter(x => x.id !== id)); showToastMsg("Deleted","success"); }
          else showToastMsg("Delete failed: "+(res.error||"unknown"),"error");
        } catch(e) { console.error("Delete monthly expense:",e); showToastMsg("Could not delete","error"); }
      }
    });
  }

  async function fetchPnl(month, year) {
    const m = month || monthlyExpMonth, y = year || monthlyExpYear;
    const mm = String(m).padStart(2,"0");
    const startDate = y+"-"+mm+"-01";
    const endDate = y+"-"+mm+"-"+String(new Date(y,m,0).getDate()).padStart(2,"0");
    setPnlLoading(true);
    try {
      const [entRes, expRes] = await Promise.all([
        api.readDateRange(startDate, endDate),
        api.readExpenses(startDate, endDate),
      ]);
      if (entRes.success) setPnlEntries(entRes.data||[]);
      if (expRes.success) setPnlExpenses(expRes.data||[]);
    } catch(e) { console.error("P&L fetch:",e); showToastMsg("Could not load P&L data","error"); }
    finally { setPnlLoading(false); }
  }

  function onPnlSectionMonthChange(m) { setMonthlyExpMonth(m); fetchMonthlyExpenses(m, monthlyExpYear); fetchPnl(m, monthlyExpYear); }
  function onPnlSectionYearChange(y) { setMonthlyExpYear(y); fetchMonthlyExpenses(monthlyExpMonth, y); fetchPnl(monthlyExpMonth, y); }

  async function fetchEntries(date,mode,rs,re) {
    const d = date||filterDate, md = mode||calMode;
    setLoading(true);
    try {
      let res, startDate, endDate;
      if (md === "range") {
        const s = rs||rangeStart, e2 = re||rangeEnd;
        if (s && e2) { res = await api.readDateRange(s, e2); startDate=s; endDate=e2; }
        else { setLoading(false); return; }
      } else {
        const [y,m,dd] = d.split("-").map(Number);
        res = await api.readEntries(y,m,md==="month"?"all":dd);
        if (md==="month") {
          const mm=String(m).padStart(2,"0");
          startDate=y+"-"+mm+"-01";
          endDate=y+"-"+mm+"-"+String(new Date(y,m,0).getDate()).padStart(2,"0");
        } else {
          startDate=d; endDate=d;
        }
      }
      if (res.success) setTodayEntries(res.data||[]);
      else showToastMsg("Error: "+(res.error||"unknown"),"error");
      if (startDate && endDate) {
        try {
          const expRes = await api.readExpenses(startDate, endDate);
          if (expRes.success) setExpenses(expRes.data||[]);
        } catch(ex) { console.error("Expenses fetch:",ex); }
      }
    } catch(e) { console.error("Fetch:",e); showToastMsg("Could not load entries","error"); }
    finally { setLoading(false); }
  }

  function onCalModeChange(m) { setCalMode(m); if (m!=="range") fetchEntries(filterDate,m); }
  function onCalDateChange(v) { setFilterDate(v); fetchEntries(v,calMode); }
  function onCalRangeChange(s,e) { setRangeStart(s); setRangeEnd(e); if(s&&e) fetchEntries(filterDate,"range",s,e); }
  function onCalToday() { const t=new Date().toISOString().slice(0,10); setFilterDate(t); setCalMode("day"); fetchEntries(t,"day"); }

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

  const socksCharge = entryType === "funzone" ? (form.socks||0) : 0;
  const totalAmount = (parseInt(form.amount)||0) + socksCharge;

  const validate = (s) => {
    const errs={};
    if(s===0) {
      if(!form.phone||form.phone.length!==10) errs.phone="10 digits required";
      if(!form.customerName.trim()) errs.customerName="Required";
      if(!form.amount||parseInt(form.amount)<=0) errs.amount="Enter amount";
    }
    if(s===1) {
      if(!form.playMop) errs.playMop="Select mode";
      if(socksCharge>0 && !form.socksMop) errs.socksMop="Select mode";
    }
    setErrors(errs);
    if(Object.keys(errs).length){setShakeStep(true);setTimeout(()=>setShakeStep(false),500);}
    return !Object.keys(errs).length;
  };

  const doNext = () => { setStep(s=>Math.min(s+1,LAST_STEP));containerRef.current?.scrollTo({top:0,behavior:"smooth"}); };
  const next = () => {
    if(!validate(step)) return;
    const today = new Date().toISOString().slice(0,10);
    if(step===0 && form.date && form.date < today) {
      setConfirmAction({
        message: "You're creating an entry for a past date (" + formatDateDDMMYYYY(form.date) + "). Continue?",
        needsPassword: false,
        confirmLabel: "Continue",
        onConfirm: doNext,
      });
      return;
    }
    doNext();
  };
  const prev = () => setStep(s=>Math.max(s-1,0));

  function getPlayMopString() {
    if(form.playMop==="UPI + Cash"){
      const u=parseInt(form.playUpiAmount)||0, c=parseInt(form.playCashAmount)||0;
      return `UPI ₹${u} + Cash ₹${c}`;
    }
    return form.playMop;
  }

  function getSocksMopString() {
    if(socksCharge<=0) return "";
    if(form.socksMop==="UPI + Cash"){
      const u=parseInt(form.socksUpiAmount)||0, c=parseInt(form.socksCashAmount)||0;
      return `UPI ₹${u} + Cash ₹${c}`;
    }
    return form.socksMop;
  }

  function computePaymentCols() {
    const playAmt=parseInt(form.amount)||0;
    let pu=0,pc=0,su=0,sc=0;
    if(form.playMop==="UPI") pu=playAmt;
    else if(form.playMop==="Cash") pc=playAmt;
    else if(form.playMop==="UPI + Cash"){pu=parseInt(form.playUpiAmount)||0;pc=parseInt(form.playCashAmount)||0;}
    if(socksCharge>0){
      if(form.socksMop==="UPI") su=socksCharge;
      else if(form.socksMop==="Cash") sc=socksCharge;
      else if(form.socksMop==="UPI + Cash"){su=parseInt(form.socksUpiAmount)||0;sc=parseInt(form.socksCashAmount)||0;}
    }
    return {playUpi:pu,playCash:pc,socksUpi:su,socksCash:sc};
  }

  async function submitEntry() {
    const timeOut = computeTimeOut(form.timeIn,form.hours);
    const totalAmt = parseInt(form.amount)||0;
    const perKidAmt = form.numKids>1 ? Math.round(totalAmt/form.numKids) : totalAmt;
    const kidNames = form.kidNames || [];
    const playMopStr = getPlayMopString();
    const socksMopStr = getSocksMopString();
    const pay = computePaymentCols();

    if (form.numKids <= 1) {
      const entry={...form,mop:playMopStr,socksMop:socksMopStr,entryType,timeIn:form.timeIn,timeOut:timeOut,
        amount:perKidAmt,numKids:1,socks:socksCharge,
        playUpi:pay.playUpi,playCash:pay.playCash,socksUpi:pay.socksUpi,socksCash:pay.socksCash};
      setSaving(true);
      try {
        const res=await api.addEntry(entry);
        if(res.success){ showToastMsg("Entry saved!","success"); setShowSuccess(true); fetchEntries(); }
        else showToastMsg("Error: "+(res.error||"unknown"),"error");
      } catch(e){console.error("Save:",e);showToastMsg("Could not save — check internet","error");}
      finally{setSaving(false);}
    } else {
      setSaving(true);
      try {
        let ok=0;
        for (let k=0; k<form.numKids; k++) {
          const name = k===0 ? (form.customerName||"") : (kidNames[k]||form.customerName+" - Kid "+(k+1));
          const dob = k===0 ? (form.dob||"") : ((form.dobs&&form.dobs[k])||"");
          const kidPU = Math.round(pay.playUpi/form.numKids);
          const kidPC = Math.round(pay.playCash/form.numKids);
          const entry={...form,mop:playMopStr,socksMop:k===0?socksMopStr:"",entryType,timeIn:form.timeIn,timeOut:timeOut,
            customerName:name, dob:dob, amount:perKidAmt, numKids:1,
            socks: k===0 ? socksCharge : 0,
            playUpi:kidPU, playCash:kidPC,
            socksUpi: k===0 ? pay.socksUpi : 0, socksCash: k===0 ? pay.socksCash : 0};
          const res=await api.addEntry(entry);
          if(res.success) ok++;
        }
        showToastMsg(`${ok} entries saved!`,"success"); setShowSuccess(true); fetchEntries();
      } catch(e){console.error("Save:",e);showToastMsg("Could not save — check internet","error");}
      finally{setSaving(false);}
    }
  }

  function doEdit(entry) {
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
    const amt = String(entry.amount||entry["Amount"]||300);

    let editPlayMop=CONFIG.DEFAULT_MOP, editPlayUpi="", editPlayCash="";
    const pu=parseInt(entry.playUpi)||0, pc=parseInt(entry.playCash)||0;
    if(pu>0&&pc>0){editPlayMop="UPI + Cash";editPlayUpi=String(pu);editPlayCash=String(pc);}
    else if(pc>0) editPlayMop="Cash";
    else if(pu>0) editPlayMop="UPI";
    else {
      const rawMop=entry.mop||entry["MOP"]||CONFIG.DEFAULT_MOP;
      const sm=rawMop.match(/^UPI\s*₹(\d+)\s*\+\s*Cash\s*₹(\d+)$/);
      if(sm){editPlayMop="UPI + Cash";editPlayUpi=sm[1];editPlayCash=sm[2];}
      else editPlayMop=rawMop;
    }

    let editSocksMop=CONFIG.DEFAULT_MOP, editSocksUpi="", editSocksCash="";
    if(socksTotal>0){
      const su=parseInt(entry.socksUpi)||0, sc=parseInt(entry.socksCash)||0;
      if(su>0&&sc>0){editSocksMop="UPI + Cash";editSocksUpi=String(su);editSocksCash=String(sc);}
      else if(sc>0) editSocksMop="Cash";
      else if(su>0) editSocksMop="UPI";
      else {
        const rsm=entry.socksMop||"";
        const ssm=rsm.match(/^UPI\s*₹(\d+)\s*\+\s*Cash\s*₹(\d+)$/);
        if(ssm){editSocksMop="UPI + Cash";editSocksUpi=ssm[1];editSocksCash=ssm[2];}
        else if(rsm) editSocksMop=rsm;
      }
    }

    setFormState({
      customerName:entry.customerName||entry["Customer name"]||"",
      amount:amt,
      playMop:editPlayMop,playUpiAmount:editPlayUpi,playCashAmount:editPlayCash,
      socksMop:editSocksMop,socksUpiAmount:editSocksUpi,socksCashAmount:editSocksCash,
      numKids:1,
      hours:hours,
      hoursMode:CONFIG.HOUR_OPTIONS.some(o=>o.value===hours)?"preset":"custom",
      timeIn:timeIn,
      socks:socksTotal,
      sockCount:sockCount,
      sockMode:CONFIG.SOCK_COUNT_OPTIONS.includes(sockCount)?"preset":"custom",
      phone:String(entry.phone||entry["Phone number"]||""),
      dob:entry.dob||entry["DOB"]||"",
      date:entry.date||new Date().toISOString().slice(0,10),
      kidNames:[],
      dobs:[],
    });
    setEntryType(entry.entryType||entry["Entry Type"]||"funzone");
    setStep(0); setScreen("form");
  }

  function handleEdit(entry) {
    const today = new Date().toISOString().slice(0,10);
    const isPast = entry.date && entry.date !== today;
    if (isPast) {
      setConfirmAction({
        message: "Edit this past entry" + (entry.customerName ? " for " + entry.customerName : "") + "?",
        needsPassword: true,
        confirmLabel: "Confirm",
        onConfirm: () => doEdit(entry),
      });
    } else {
      doEdit(entry);
    }
  }

  async function handleUpdateSubmit() {
    const timeOut = computeTimeOut(form.timeIn,form.hours);
    const pay = computePaymentCols();
    const entry={...form,mop:getPlayMopString(),socksMop:getSocksMopString(),entryType,timeIn:form.timeIn,timeOut:timeOut,
      amount:parseInt(form.amount)||0,numKids:1,socks:socksCharge,
      playUpi:pay.playUpi,playCash:pay.playCash,socksUpi:pay.socksUpi,socksCash:pay.socksCash};
    if(!editTarget?.id){showToastMsg("Cannot identify entry","error");resetForm();return;}
    setSaving(true);
    try {
      const res=await api.updateEntry(editTarget.id,entry);
      if(res.success){showToastMsg("Updated!","success");fetchEntries();}else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e){console.error("Update:",e);showToastMsg("Could not update","error");}
    finally{setSaving(false);resetForm();}
  }

  function handleDelete(entry) {
    if(!entry.id){showToastMsg("Cannot identify entry","error");return;}
    const today = new Date().toISOString().slice(0,10);
    const isPast = entry.date && entry.date !== today;
    setConfirmAction({
      message: "Delete this entry" + (entry.customerName ? " for " + entry.customerName : "") + "?",
      needsPassword: isPast,
      onConfirm: async () => {
        setSaving(true);
        try {
          const res=await api.deleteEntry(entry.id);
          if(res.success){showToastMsg("Deleted","info");fetchEntries();}else showToastMsg("Error: "+(res.error||"unknown"),"error");
        } catch(e){console.error("Delete:",e);showToastMsg("Could not delete","error");}
        finally{setSaving(false);}
      }
    });
  }

  function resetForm() {
    setFormState(getDefaultForm()); setStep(0); setErrors({}); setShowSuccess(false);
    setEditTarget(null); setScreen("home"); setEntryType("funzone");
    lastLookedUpPhone.current = "";
  }

  // ── Birthday party enquiries (leads, not paid entries) ──
  function openEnquiry() {
    setEnquiry({parentName:"",kidName:"",phone:"",dob:"",preferredDate:"",numKids:"",notes:""});
  }

  async function saveEnquiry() {
    if (!enquiry.parentName.trim() && !enquiry.kidName.trim() && !enquiry.phone.trim()) {
      showToastMsg("Add a name or phone number first","error"); return;
    }
    setEnquirySaving(true);
    try {
      const res = await api.addEnquiry({...enquiry, date:new Date().toISOString().slice(0,10)});
      if (res.success) { showToastMsg("Enquiry saved","success"); setEnquiry(null); }
      else showToastMsg("Save failed: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Enquiry:",e); showToastMsg("Could not save — check internet","error"); }
    finally { setEnquirySaving(false); }
  }

  function openBirthdays() {
    resetForm();
    switchSection("birthdays");
  }

  function setFormType(type) {
    setEntryType(type);
    setStep(0);
    setFormState(f=>{
      if (type === "funzone") {
        const n = f.sockCount || CONFIG.DEFAULT_SOCK_COUNT;
        return {...f, sockCount:n, socks:n*CONFIG.SOCKS_RATE};
      }
      return {...f, sockCount:0, socks:0};
    });
  }

  function startNewEntry(type) {
    setFormState(getDefaultForm()); setEditTarget(null); setScreen("form");
    setFormType(type || "funzone");
    lastLookedUpPhone.current = "";
  }

  const dateDisplay = getCurrentDate();
  const timeDisplay = getCurrentTime12();
  const typeMeta = CONFIG.ENTRY_TYPES.find(t=>t.key===entryType) || CONFIG.ENTRY_TYPES[0];
  const isPlayArea = entryType === "funzone";

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className={`app-shell${screen==="form"?" theme-form":""}`}>

      {/* Toast */}
      {toast && <div className="toast" style={{background:toast.type==="success"?C.green:toast.type==="error"?C.danger:C.blue}}>{toast.msg}</div>}

      {/* Saving */}
      {saving && <div className="overlay" style={{zIndex:150}}>
        <div className="modal" style={{padding:"24px 30px",maxWidth:260}}>
          <Spinner size={28} /><div style={{marginTop:10,fontSize:13.5,fontWeight:700,color:C.textMid}}>Saving…</div>
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

      {/* ══════════ FULL-SCREEN HOME LANDING ══════════ */}
      {screen==="home" && section==="home" && <div className="home-fullscreen">
        <div className="home-hero">
          <img src="icons/logo.png" alt={CONFIG.APP_NAME} className="home-logo" />
          <p className="home-subtitle">Kids Indoor Play Zone — Ops</p>
        </div>
        <div className="home-grid">
          {[
            {key:"entries",icon:"🎟️",label:"Entries",desc:"Log walk-ins & manage daily entries"},
            {key:"cash-register",icon:"💰",label:"Cash Register",desc:"Revenue, UPI & cash breakdown"},
            {key:"expenses",icon:"📊",label:"Profit / Loss",desc:"Monthly expenses & P&L statement"},
            {key:"birthdays",icon:"🎂",label:"Birthdays CRM",desc:"Birthday calendar & bookings"},
          ].map(item=>(
            <button key={item.key} className="home-card" onClick={()=>switchSection(item.key)}>
              <span className="home-card-icon">{item.icon}</span>
              <span className="home-card-text">
                <div className="home-card-label">{item.label}</div>
                <div className="home-card-desc">{item.desc}</div>
              </span>
            </button>
          ))}
        </div>
      </div>}

      {/* ══════════ HOME — Sidebar + Main Content ══════════ */}
      {screen==="home" && section!=="home" && <>
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} />}

        {/* Sidebar */}
        <nav className={`sidebar${sidebarOpen?" is-open":""}`}>
          <div className="sidebar-brand" onClick={()=>switchSection("home")} style={{cursor:"pointer"}}>
            <img src="icons/logo-header.png" alt="" style={{width:32,height:32,borderRadius:8}} />
            <span className="sidebar-brand-name">{CONFIG.APP_NAME}</span>
          </div>
          <div className="sidebar-nav">
            {[
              {key:"home",icon:"🏠",label:"Home"},
              {key:"entries",icon:"🎟️",label:"Entries"},
              {key:"cash-register",icon:"💰",label:"Cash Register"},
              {key:"expenses",icon:"📊",label:"Profit / Loss"},
              {key:"birthdays",icon:"🎂",label:"Birthdays CRM"},
              {key:"staff",icon:"👥",label:"Staff",soon:true},
              {key:"events",icon:"🎪",label:"Events",soon:true},
              {key:"marketing",icon:"📢",label:"Marketing",soon:true},
            ].map(item=>(
              <button key={item.key} type="button"
                className={`sidebar-item${section===item.key?" is-on":""}`}
                onClick={()=>switchSection(item.key)}>
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.label}
                {item.soon && <span className="sidebar-item-badge">Soon</span>}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">{dateDisplay} · {timeDisplay}</div>
        </nav>

        {/* Main content area */}
        <div className="app-main">
          <header className="appbar">
            <div className="container appbar-inner">
              <div className="appbar-brand">
                <button type="button" className="sidebar-toggle" onClick={()=>setSidebarOpen(o=>!o)} aria-label="Menu">☰</button>
                <div style={{minWidth:0}}>
                  <div className="appbar-title">
                    {{home:CONFIG.APP_NAME,entries:"Entries","cash-register":"Cash Register",expenses:"Profit / Loss",birthdays:"Birthdays CRM",staff:"Staff",events:"Events",marketing:"Marketing"}[section]}
                  </div>
                  <div className="appbar-sub">{dateDisplay} · {timeDisplay}</div>
                </div>
              </div>
              <div className="appbar-actions">
                {section==="entries" && <button className="btn btn-sm btn-primary new-entry-inline" onClick={()=>startNewEntry("funzone")}>+ New Entry</button>}
              </div>
            </div>
          </header>

          <div className="container page">
            {/* ── ENTRIES SECTION ── */}
            {section==="entries" && <>
              <div className="card card-pad filter-bar" style={{marginBottom:"var(--sp-4)"}}>
                <CalendarFilter mode={calMode} date={filterDate}
                  rangeStart={rangeStart} rangeEnd={rangeEnd}
                  onModeChange={onCalModeChange} onDateChange={onCalDateChange}
                  onRangeChange={onCalRangeChange} onToday={onCalToday} />
                <div className="filter-bar-right">
                  {!loading && <span className="filter-bar-count">{todayEntries.length} entries</span>}
                  <button className="btn btn-sm btn-icon" onClick={()=>fetchEntries()} disabled={loading} title="Refresh">↻</button>
                </div>
              </div>
              <LiveEntryList entries={[...todayEntries].sort((a,b)=>(a.id||0)-(b.id||0))} onEdit={handleEdit} onDelete={handleDelete} onCheckout={handleCheckout} loading={loading} />
            </>}

            {/* ── BIRTHDAYS CRM SECTION ── */}
            {section==="birthdays" && <>
              <div className="card card-pad" style={{marginBottom:"var(--sp-4)"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:8,flex:"1 1 220px",minWidth:0}}>
                    <Dropdown flex={1.5} value={birthdayMonth} onChange={changeMonth}
                      options={MONTH_NAMES.map((m,i)=>({value:i+1,label:m}))} />
                    <Dropdown flex={1} value={birthdayYear} onChange={changeYear}
                      options={[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>({value:y,label:String(y)}))} />
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.textMid}}>🎉 <strong style={{color:C.text}}>{birthdays.length}</strong></span>
                    <span style={{fontSize:11,color:C.green,fontWeight:700}}>{birthdays.filter(b=>(b.status||"not_contacted")!=="not_contacted").length} contacted</span>
                    <button className="btn btn-sm" onClick={openEnquiry}>+ Enquiry</button>
                    <button className="btn btn-sm btn-icon" onClick={()=>fetchBirthdays()} disabled={birthdaysLoading} title="Refresh">↻</button>
                  </div>
                </div>
              </div>
              <BirthdayCalendar birthdays={birthdays} month={birthdayMonth} year={birthdayYear} loading={birthdaysLoading} onSave={saveBirthdayCall} />
            </>}

            {/* ── CASH REGISTER SECTION (Stats) ── */}
            {section==="cash-register" && <>
              {!statsUnlocked
                ? <PasswordGate onUnlock={()=>setStatsUnlocked(true)} />
                : <>
                  <div className="card card-pad filter-bar" style={{marginBottom:"var(--sp-4)"}}>
                    <CalendarFilter mode={calMode} date={filterDate}
                      rangeStart={rangeStart} rangeEnd={rangeEnd}
                      onModeChange={onCalModeChange} onDateChange={onCalDateChange}
                      onRangeChange={onCalRangeChange} onToday={onCalToday} />
                    <div className="filter-bar-right">
                      {!loading && <span className="filter-bar-count">{todayEntries.length} entries</span>}
                      <button className="btn btn-sm" onClick={()=>setExpensePopup({date:filterDate,amount:"",description:"",category:"misc"})}>+ Expense</button>
                      <button className="btn btn-sm btn-icon" onClick={()=>fetchEntries()} disabled={loading} title="Refresh">↻</button>
                    </div>
                  </div>
                  {loading ? <div className="empty-state"><Spinner size={26} /><div style={{marginTop:10}}>Loading…</div></div>
                    : <StatsDashboard entries={todayEntries} expenses={expenses} onDeleteExpense={handleDeleteExpense} />}
                </>}
            </>}

            {/* ── PROFIT / LOSS SECTION ── */}
            {section==="expenses" && <>
              {!statsUnlocked
                ? <PasswordGate onUnlock={()=>{setStatsUnlocked(true);fetchMonthlyExpenses();fetchPnl();}} />
                : <>
                  <PnLReport entries={pnlEntries} expenses={pnlExpenses} monthlyExpenses={monthlyExp}
                    month={monthlyExpMonth} year={monthlyExpYear}
                    onChangeMonth={onPnlSectionMonthChange} onChangeYear={onPnlSectionYearChange}
                    loading={pnlLoading||monthlyExpLoading} />
                  <MonthlyExpensesDashboard
                    expenses={monthlyExp}
                    month={monthlyExpMonth} year={monthlyExpYear}
                    onChangeMonth={onPnlSectionMonthChange} onChangeYear={onPnlSectionYearChange}
                    onAdd={()=>setMonthlyExpPopup({amount:"",category:"rent",description:""})}
                    onDelete={handleDeleteMonthlyExpense}
                    loading={monthlyExpLoading}
                    hideFilter={true} />
                </>}
            </>}

            {/* ── COMING SOON SECTIONS ── */}
            {section==="staff" && <div className="coming-soon">
              <div className="coming-soon-icon">👥</div>
              <div className="coming-soon-title">Staff Management</div>
              <div className="coming-soon-text">Manage staff schedules, attendance, and payroll. Coming soon!</div>
            </div>}
            {section==="events" && <div className="coming-soon">
              <div className="coming-soon-icon">🎪</div>
              <div className="coming-soon-title">Events</div>
              <div className="coming-soon-text">Plan and manage birthday parties, special events, and bookings. Coming soon!</div>
            </div>}
            {section==="marketing" && <div className="coming-soon">
              <div className="coming-soon-icon">📢</div>
              <div className="coming-soon-title">Marketing</div>
              <div className="coming-soon-text">WhatsApp campaigns, offers, and customer engagement. Coming soon!</div>
            </div>}
          </div>

          {/* New Entry (mobile floating action button) */}
          {section==="entries" && <div className="new-entry-fab">
            <button className="btn btn-primary btn-block btn-lg" onClick={()=>startNewEntry("funzone")} style={{boxShadow:`0 6px 22px ${C.accent}45`,animation:"slideUp .35s ease"}}>+ New Entry</button>
          </div>}
        </div>
      </>}

      {/* ══════════ BIRTHDAY ENQUIRY ══════════ */}
      {enquiry && <div className="overlay" onClick={()=>!enquirySaving&&setEnquiry(null)}>
        <div className="modal" style={{maxWidth:460,textAlign:"left",padding:"20px"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span className="card-title">🎂 Birthday enquiry</span>
            <button className="btn btn-sm btn-icon" onClick={()=>setEnquiry(null)} disabled={enquirySaving} aria-label="Close">✕</button>
          </div>
          <div className="form-grid">
            <InputField label="Parent Name" icon="👤">
              <input className="fld" value={enquiry.parentName} placeholder="e.g. Priya"
                onChange={e=>setEnquiry({...enquiry,parentName:e.target.value})} />
            </InputField>
            <InputField label="Phone" icon="📱">
              <input className="fld" value={enquiry.phone} type="tel" inputMode="numeric" placeholder="10-digit mobile"
                onChange={e=>setEnquiry({...enquiry,phone:e.target.value.replace(/\D/g,"").slice(0,10)})} />
            </InputField>
            <InputField label="Kid's Name" icon="🧒">
              <input className="fld" value={enquiry.kidName} placeholder="e.g. Aarav"
                onChange={e=>setEnquiry({...enquiry,kidName:e.target.value})} />
            </InputField>
            <InputField label="Kid's Date of Birth" icon="🎂">
              <input className="fld" value={enquiry.dob} type="date"
                onChange={e=>setEnquiry({...enquiry,dob:e.target.value})} />
            </InputField>
            <InputField label="Preferred Party Date" icon="📅">
              <input className="fld" value={enquiry.preferredDate} type="date"
                onChange={e=>setEnquiry({...enquiry,preferredDate:e.target.value})} />
            </InputField>
            <InputField label="Expected Kids" icon="👶">
              <input className="fld" value={enquiry.numKids} type="tel" inputMode="numeric" placeholder="e.g. 20"
                onChange={e=>setEnquiry({...enquiry,numKids:e.target.value.replace(/\D/g,"")})} />
            </InputField>
            <InputField label="Notes" icon="📝" className="span-2">
              <textarea className="fld" rows={2} value={enquiry.notes} style={{resize:"vertical"}}
                placeholder="e.g. Wants decoration + cake, budget around 8k"
                onChange={e=>setEnquiry({...enquiry,notes:e.target.value})} />
            </InputField>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button className="btn" onClick={()=>setEnquiry(null)} disabled={enquirySaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEnquiry} disabled={enquirySaving} style={{flex:1}}>
              {enquirySaving?"Saving…":"Save enquiry"}
            </button>
          </div>
        </div>
      </div>}

      {/* ══════════ EXPENSE POPUP ══════════ */}
      {expensePopup && <div className="overlay" onClick={()=>!expenseSaving&&setExpensePopup(null)}>
        <div className="modal" style={{maxWidth:400,textAlign:"left",padding:"20px"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span className="card-title">+ New Expense</span>
            <button className="btn btn-sm btn-icon" onClick={()=>setExpensePopup(null)} disabled={expenseSaving} aria-label="Close">✕</button>
          </div>
          <div className="form-grid">
            <InputField label="Amount" icon="₹">
              <input className="fld" value={expensePopup.amount} type="tel" inputMode="numeric" placeholder="e.g. 30" autoFocus
                onChange={e=>setExpensePopup({...expensePopup,amount:e.target.value.replace(/\D/g,"")})} />
            </InputField>
            <InputField label="Category" icon="📂">
              <select className="fld" value={expensePopup.category}
                onChange={e=>setExpensePopup({...expensePopup,category:e.target.value})}>
                {EXPENSE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </InputField>
            <InputField label="Description" icon="📝" className="span-2">
              <input className="fld" value={expensePopup.description} placeholder="e.g. Staff snacks"
                onChange={e=>setExpensePopup({...expensePopup,description:e.target.value})} />
            </InputField>
            <InputField label="Date" icon="📅">
              <input className="fld" value={expensePopup.date} type="date"
                onChange={e=>setExpensePopup({...expensePopup,date:e.target.value})} />
            </InputField>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button className="btn" onClick={()=>setExpensePopup(null)} disabled={expenseSaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveExpense} disabled={expenseSaving} style={{flex:1}}>
              {expenseSaving?"Saving…":"Save expense"}
            </button>
          </div>
        </div>
      </div>}


      {/* ══════════ MONTHLY EXPENSE POPUP ══════════ */}
      {monthlyExpPopup && <div className="overlay" onClick={()=>!monthlyExpSaving&&setMonthlyExpPopup(null)}>
        <div className="modal" style={{maxWidth:400,textAlign:"left",padding:"20px"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span className="card-title">+ Monthly Expense</span>
            <button className="btn btn-sm btn-icon" onClick={()=>setMonthlyExpPopup(null)} disabled={monthlyExpSaving} aria-label="Close">✕</button>
          </div>
          <div style={{fontSize:12,color:C.textMid,fontWeight:600,marginBottom:12}}>
            Adding to {MONTH_NAMES[(monthlyExpMonth||1)-1]} {monthlyExpYear}
          </div>
          <div className="form-grid">
            <InputField label="Amount" icon="₹">
              <input className="fld" value={monthlyExpPopup.amount} type="tel" inputMode="numeric" placeholder="e.g. 80000" autoFocus
                onChange={e=>setMonthlyExpPopup({...monthlyExpPopup,amount:e.target.value.replace(/\D/g,"")})} />
            </InputField>
            <InputField label="Category" icon="📂">
              <select className="fld" value={monthlyExpPopup.category}
                onChange={e=>setMonthlyExpPopup({...monthlyExpPopup,category:e.target.value})}>
                {MONTHLY_EXPENSE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </InputField>
            <InputField label="Description" icon="📝" className="span-2">
              <input className="fld" value={monthlyExpPopup.description} placeholder="e.g. Rent paid to George"
                onChange={e=>setMonthlyExpPopup({...monthlyExpPopup,description:e.target.value})} />
            </InputField>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button className="btn" onClick={()=>setMonthlyExpPopup(null)} disabled={monthlyExpSaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveMonthlyExpense} disabled={monthlyExpSaving} style={{flex:1}}>
              {monthlyExpSaving?"Saving…":"Save expense"}
            </button>
          </div>
        </div>
      </div>}

      {/* ══════════ CONFIRM ACTION DIALOG ══════════ */}
      {confirmAction && <ConfirmDialog
        message={confirmAction.message}
        needsPassword={confirmAction.needsPassword}
        confirmLabel={confirmAction.confirmLabel}
        onConfirm={()=>{confirmAction.onConfirm();setConfirmAction(null);}}
        onCancel={()=>setConfirmAction(null)} />}

      {/* ══════════ FORM ══════════ */}
      {screen==="form" && <>
        <header className="appbar">
          <div className="container container--entry appbar-inner">
            <div className="appbar-brand">
              <img className="appbar-logo" src="icons/logo-header.png" alt="" />
              <span className="card-title">
                {editTarget?"Edit entry":`${CONFIG.APP_NAME} — Booking`}
              </span>
            </div>
            <div className="appbar-actions">
              {!editTarget && <IconMenu trigger={typeMeta.icon} title="Change entry type" activeValue={entryType}
                items={CONFIG.ENTRY_TYPES.map(t=>({
                  value:t.key, icon:t.icon, label:t.label,
                  onSelect:()=>{ if(t.key!==entryType) setFormType(t.key); },
                }))} />}
              <button className="btn btn-sm" onClick={resetForm} title="Dashboard">📊 Dashboard</button>
            </div>
          </div>
        </header>

        {/* Form Body */}
        <div ref={containerRef} className="container container--entry page" style={{paddingBottom:0}}>
          <div style={{animation:shakeStep?"shake .4s ease":"springIn .3s ease"}}>

            {/* ── Step 0 — Customer + Booking Details ── */}
            {step===0&&<>
              <div className="entry-columns">
                <div className="entry-col">
                  <div className="section">
                    <SectionHeading label="Customer" />
                    <div className="form-grid">
                      <InputField label="Mobile" icon="📱" error={errors.phone}>
                        <div style={{position:"relative"}}>
                          <input className={`fld${errors.phone?" is-error":""}`} value={form.phone} placeholder="10-digit mobile" type="tel" inputMode="numeric"
                            onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,10);set("phone",v);if(v.length===10)lookupByPhone(v);}} />
                          {phoneLookupLoading && <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}><Spinner size={16} /></div>}
                        </div>
                      </InputField>
                      <InputField label="No. of Kids" icon="👶">
                        <NumberStepper value={form.numKids} onChange={v=>set("numKids",v)} min={1} max={10} />
                      </InputField>
                    </div>

                    {Array.from({length:form.numKids},(_,i)=>(
                      <div key={i} className="kid-group">
                        {form.numKids>1 && <div className="kid-group-label">Kid {i+1}</div>}
                        <InputField label={form.numKids>1?"Name":"Kids Name"} error={i===0?errors.customerName:undefined}>
                          <input className={`fld${i===0&&errors.customerName?" is-error":""}`}
                            value={i===0?form.customerName:((form.kidNames&&form.kidNames[i])||"")}
                            placeholder={`e.g. ${["Priya","Arjun","Meera","Ravi","Ananya"][i%5]}`}
                            onChange={e=>{
                              if(i===0) set("customerName",e.target.value);
                              else { const names=[...(form.kidNames||[])]; names[i]=e.target.value; set("kidNames",names); }
                            }} />
                        </InputField>
                        <InputField label="DOB">
                          <input className="fld"
                            value={i===0?form.dob:((form.dobs&&form.dobs[i])||"")}
                            type="date"
                            onChange={e=>{
                              if(i===0) set("dob",e.target.value);
                              else { const d=[...(form.dobs||[])]; d[i]=e.target.value; set("dobs",d); }
                            }} />
                        </InputField>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="entry-col">
                  <div className="section">
                    <SectionHeading icon={typeMeta.icon} label={isPlayArea?"Playtime":`${typeMeta.label} Booking`} />
                    <div className="form-grid">
                      <InputField label="Duration" icon="⏱️">
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <Dropdown flex={1}
                            value={form.hoursMode==="custom"?"custom":String(form.hours)}
                            options={[...CONFIG.HOUR_OPTIONS.map(o=>({value:o.value,label:o.label})),{value:"custom",label:"Custom…"}]}
                            onChange={v=>{
                              if(v==="custom"){ set("hoursMode","custom"); }
                              else { set("hoursMode","preset"); setHours(v,isPlayArea); }
                            }} />
                          {form.hoursMode==="custom" &&
                            <input className="fld" value={form.hours} onChange={e=>setHours(e.target.value.replace(/[^\d.]/g,""),isPlayArea)}
                              placeholder="hrs" type="tel" inputMode="decimal" style={{width:74,flexShrink:0,textAlign:"center"}} />}
                        </div>
                        <div className="time-row">
                          <span title="Start time">🕐</span>
                          <input className="fld fld-compact" value={form.timeIn} onChange={e=>set("timeIn",e.target.value)} type="time" />
                          {form.timeIn && <span>→ {formatTime12(computeTimeOut(form.timeIn,form.hours))}</span>}
                        </div>
                      </InputField>
                      <InputField label="Date" icon="📅">
                        <input className="fld" type="date" value={form.date} onChange={e=>set("date",e.target.value)} />
                      </InputField>

                      <InputField label={isPlayArea?"Playtime Amount":"Amount"} icon="💰" error={errors.amount}>
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className={`fld fld-lg${errors.amount?" is-error":""}`} value={form.amount} type="tel" inputMode="numeric" placeholder="300"
                            onChange={e=>set("amount",e.target.value.replace(/\D/g,""))} />
                        </div>
                        {isPlayArea && form.numKids>1 && <div className="field-hint">{form.numKids} kids × ₹{computeAmountForHours(form.hours)} per kid</div>}
                        {!isPlayArea && <div className="field-hint">Party pricing is set manually.</div>}
                      </InputField>
                    </div>
                  </div>

                  {isPlayArea && <div className="section">
                    <SectionHeading icon="🧦" label="Socks" />
                    <div className="form-grid">
                      <InputField label="Pairs">
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
                      {form.socks>0&&<InputField label="Socks Amount" icon="💰">
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className="fld fld-lg" value={form.socks} type="tel" inputMode="numeric" placeholder="15"
                            onChange={e=>set("socks",e.target.value===""?0:parseInt(e.target.value.replace(/\D/g,""))||0)} />
                        </div>
                      </InputField>}
                    </div>
                  </div>}
                </div>
              </div>
            </>}

            {/* ── Step 1 — Payment ── */}
            {step===1&&<>
              <div style={{maxWidth:540}}>
                <div className="card card-pad total-card" style={{marginBottom:24}}>
                  <div>
                    <div className="stat-label total-label">Total</div>
                    <div className="total-breakdown">₹{form.amount} playtime{socksCharge>0?` + ₹${socksCharge} socks`:""}</div>
                  </div>
                  <div className="total-value">₹{totalAmount.toLocaleString("en-IN")}</div>
                </div>

                <div className="section">
                  <SectionHeading icon="💳" label={`Playtime Payment · ₹${parseInt(form.amount)||0}`} />
                  <div className="form-grid">
                    <InputField label="Paid via" error={errors.playMop} className="field-tight">
                      <ChipSelect options={CONFIG.MOP_OPTIONS.map(o=>({value:o.value,label:o.label}))} value={form.playMop} onChange={v=>{
                        set("playMop",v);
                        if(v!=="UPI + Cash"){set("playUpiAmount","");set("playCashAmount","");}
                      }} />
                    </InputField>
                    {form.playMop==="UPI + Cash"&&<>
                      <InputField label="UPI Amount" icon="📱">
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className="fld fld-lg" value={form.playUpiAmount} type="tel" inputMode="numeric" placeholder="0"
                            onChange={e=>{
                              const v=e.target.value.replace(/\D/g,"");
                              const playAmt=parseInt(form.amount)||0;
                              set("playUpiAmount",v);
                              set("playCashAmount",String(Math.max(0,playAmt-(parseInt(v)||0))));
                            }} />
                        </div>
                      </InputField>
                      <InputField label="Cash Amount" icon="💵">
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className="fld fld-lg" value={form.playCashAmount} type="tel" inputMode="numeric" placeholder="0"
                            onChange={e=>{
                              const v=e.target.value.replace(/\D/g,"");
                              const playAmt=parseInt(form.amount)||0;
                              set("playCashAmount",v);
                              set("playUpiAmount",String(Math.max(0,playAmt-(parseInt(v)||0))));
                            }} />
                        </div>
                      </InputField>
                    </>}
                  </div>
                </div>

                {socksCharge>0 && <div className="section">
                  <SectionHeading icon="🧦" label={`Socks Payment · ₹${socksCharge}`} />
                  <div className="form-grid">
                    <InputField label="Paid via" error={errors.socksMop} className="field-tight">
                      <ChipSelect options={CONFIG.MOP_OPTIONS.map(o=>({value:o.value,label:o.label}))} value={form.socksMop} onChange={v=>{
                        set("socksMop",v);
                        if(v!=="UPI + Cash"){set("socksUpiAmount","");set("socksCashAmount","");}
                      }} />
                    </InputField>
                    {form.socksMop==="UPI + Cash"&&<>
                      <InputField label="UPI Amount" icon="📱">
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className="fld fld-lg" value={form.socksUpiAmount} type="tel" inputMode="numeric" placeholder="0"
                            onChange={e=>{
                              const v=e.target.value.replace(/\D/g,"");
                              set("socksUpiAmount",v);
                              set("socksCashAmount",String(Math.max(0,socksCharge-(parseInt(v)||0))));
                            }} />
                        </div>
                      </InputField>
                      <InputField label="Cash Amount" icon="💵">
                        <div style={{position:"relative"}}>
                          <span className="rupee-prefix">₹</span>
                          <input className="fld fld-lg" value={form.socksCashAmount} type="tel" inputMode="numeric" placeholder="0"
                            onChange={e=>{
                              const v=e.target.value.replace(/\D/g,"");
                              set("socksCashAmount",v);
                              set("socksUpiAmount",String(Math.max(0,socksCharge-(parseInt(v)||0))));
                            }} />
                        </div>
                      </InputField>
                    </>}
                  </div>
                </div>}
              </div>
            </>}

            {/* ── Step 2 — Invoice Review ── */}
            {step===2&&<>
              <div className="invoice">
                <div className="invoice-header">
                  <div>
                    <div className="invoice-brand">{CONFIG.APP_NAME}</div>
                    <div className="invoice-meta">{formatDateDDMMYYYY(form.date)} · {formatTime12(form.timeIn)}</div>
                  </div>
                  <div className="invoice-badge">{typeMeta.icon} {typeMeta.label}</div>
                </div>

                <div className="invoice-section">
                  <div className="invoice-section-title">Customer</div>
                  <div className="invoice-customer">
                    <div className="invoice-name">{form.customerName||"—"}</div>
                    {form.phone && <div className="invoice-phone">{form.phone}</div>}
                    {form.numKids>1 && <div className="invoice-kids">
                      {[form.customerName,...(form.kidNames||[]).slice(1,form.numKids)].filter(Boolean).map((n,i)=>
                        <span key={i} className="invoice-kid-tag">{n}{form.dobs&&form.dobs[i]?` · ${form.dobs[i]}`:i===0&&form.dob?` · ${form.dob}`:""}</span>
                      )}
                    </div>}
                    {form.numKids<=1 && form.dob && <div className="invoice-phone">DOB: {form.dob}</div>}
                  </div>
                </div>

                <div className="invoice-section">
                  <div className="invoice-section-title">Booking Details</div>
                  <table className="invoice-table">
                    <thead><tr><th>Item</th><th>Details</th><th>Amount</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>{isPlayArea?"Playtime":"Booking"}</td>
                        <td>
                          {form.numKids>1?`${form.numKids} kids × `:""}{formatHoursLabel(form.hours)}
                          <div className="invoice-cell-sub">{formatTime12(form.timeIn)} → {formatTime12(computeTimeOut(form.timeIn,form.hours))}</div>
                        </td>
                        <td className="invoice-amt">₹{parseInt(form.amount||0).toLocaleString("en-IN")}</td>
                      </tr>
                      {socksCharge>0 && <tr>
                        <td>Socks</td>
                        <td>{form.sockCount} pair{form.sockCount>1?"s":""}</td>
                        <td className="invoice-amt">₹{socksCharge}</td>
                      </tr>}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-section">
                  <div className="invoice-section-title">Payment</div>
                  <div className="invoice-pay-rows">
                    <div className="invoice-pay-row">
                      <span className="invoice-pay-item">Playtime</span>
                      {form.playMop==="UPI + Cash"
                        ?<span className="invoice-pay-detail">UPI ₹{form.playUpiAmount||0} + Cash ₹{form.playCashAmount||0}</span>
                        :<span className="invoice-pay-detail">{form.playMop}</span>}
                    </div>
                    {socksCharge>0 && <div className="invoice-pay-row">
                      <span className="invoice-pay-item">Socks</span>
                      {form.socksMop==="UPI + Cash"
                        ?<span className="invoice-pay-detail">UPI ₹{form.socksUpiAmount||0} + Cash ₹{form.socksCashAmount||0}</span>
                        :<span className="invoice-pay-detail">{form.socksMop}</span>}
                    </div>}
                  </div>
                </div>

                <div className="invoice-footer">
                  <div className="invoice-total">
                    <span className="invoice-total-label">Total</span>
                    <span className="invoice-total-value">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </>}

            {/* Actions */}
            <div className="form-actions">
              {step>0&&<button className="btn" onClick={prev}>Back</button>}
              <button className={`btn ${step===LAST_STEP?"btn-success":"btn-primary"}`} disabled={saving}
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
