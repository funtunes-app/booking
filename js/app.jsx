// =============================================================================
// FunTunes Hi-Fi App — Main Application
// =============================================================================

const { useState, useEffect, useCallback, useRef } = React;

function formatDateDDMMYYYY(d) { return d ? d.split("-").reverse().join("/") : ""; }
function formatTime12(t) {
  if (!t) return "";
  const [h,m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h%12||12}:${String(m).padStart(2,"0")} ${ampm}`;
}
function getCurrentDate() {
  const d = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}
function getCurrentTime12() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function computeAmountForHours(h) {
  const n = parseFloat(h);
  if (n <= 0.5) return CONFIG.RATE_PER_HALF_HOUR;
  return Math.round(n * CONFIG.RATE_PER_HOUR);
}
function formatHoursLabel(h) {
  const n = parseFloat(h);
  if (n === 0.5) return "30 min";
  if (n === 1) return "1 hour";
  return `${n} hours`;
}

const SECTIONS = ["home","entries","cash-register","expenses","birthdays","staff","attendance"];

function App() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState("today");
  const [section, setSection] = useState("home");
  const [screen, setScreen] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [entryType, setEntryType] = useState("funzone");
  const [formState, setFormState] = useState(getDefaultForm);
  const form = formState;
  const [errors, setErrors] = useState({});
  const [shakeStep, setShakeStep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [todayEntries, setTodayEntries] = useState([]);
  const [filterDate, setFilterDate] = useState(()=>new Date().toISOString().slice(0,10));
  const [calMode, setCalMode] = useState("day");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [entrySearch, setEntrySearch] = useState("");
  const [entryMopFilter, setEntryMopFilter] = useState("all");
  const [exportPinPrompt, setExportPinPrompt] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState(()=>new Date().getMonth()+1);
  const [birthdayYear, setBirthdayYear] = useState(()=>new Date().getFullYear());
  const [bdayViewMode, setBdayViewMode] = useState("week");
  const [bdayStatusFilter, setBdayStatusFilter] = useState("all");
  const [showBooked, setShowBooked] = useState(false);
  const [bdaySearch, setBdaySearch] = useState("");
  const [bdaySearchResults, setBdaySearchResults] = useState(null);
  const bdaySearchTimer = React.useRef(null);
  const [statsUnlocked, setStatsUnlocked] = useState(false);
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [enquiry, setEnquiry] = useState(null);
  const [enquirySaving, setEnquirySaving] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expensePopup, setExpensePopup] = useState(null);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [monthlyExp, setMonthlyExp] = useState([]);
  const [monthlyExpMonth, setMonthlyExpMonth] = useState(new Date().getMonth()+1);
  const [monthlyExpYear, setMonthlyExpYear] = useState(new Date().getFullYear());
  const [monthlyExpLoading, setMonthlyExpLoading] = useState(false);
  const [monthlyExpPopup, setMonthlyExpPopup] = useState(null);
  const [monthlyExpSaving, setMonthlyExpSaving] = useState(false);
  const [pnlEntries, setPnlEntries] = useState([]);
  const [pnlExpenses, setPnlExpenses] = useState([]);
  const [pnlLoading, setPnlLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [staffAtt, setStaffAtt] = useState([]);
  const [staffMonth, setStaffMonth] = useState(new Date().getMonth()+1);
  const [staffYear, setStaffYear] = useState(new Date().getFullYear());
  const [staffAttDate, setStaffAttDate] = useState(new Date().toISOString().slice(0,10));
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffPopup, setStaffPopup] = useState(null);
  const [activePass, setActivePass] = useState(null);
  const [buyPassType, setBuyPassType] = useState(null);
  const [passPopup, setPassPopup] = useState(null);
  const [passSaving, setPassSaving] = useState(false);
  const containerRef = useRef(null);
  const lastLookedUpPhone = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  function getDefaultForm() {
    const n = new Date();
    const hours = CONFIG.DEFAULT_HOURS, socksCount = CONFIG.DEFAULT_SOCK_COUNT;
    return {
      customerName:"", amount:String(computeAmountForHours(hours)), numKids:1,
      hours:hours, hoursMode:"preset",
      timeIn:`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,
      socks:socksCount*CONFIG.SOCKS_RATE, sockCount:socksCount, sockMode:"preset",
      phone:"", dob:"", date:n.toISOString().slice(0,10),
      kidNames:[], dobs:[],
      playMop:CONFIG.DEFAULT_MOP, playUpiAmount:"", playCashAmount:"",
      socksMop:CONFIG.DEFAULT_MOP, socksUpiAmount:"", socksCashAmount:""
    };
  }

  const set = useCallback((key,val) => {
    setFormState(f => {
      const next = {...f, [key]:val};
      if (key === "numKids" && entryType === "funzone") {
        next.amount = String(computeAmountForHours(next.hours) * val);
      }
      return next;
    });
    setErrors(e => ({...e, [key]:undefined}));
  }, [entryType]);

  const setHours = useCallback((v, autoPrice) => {
    setFormState(f => autoPrice ? {...f, hours:v, amount:String(computeAmountForHours(v)*f.numKids)} : {...f, hours:v});
    if (autoPrice) setErrors(e => ({...e, amount:undefined}));
  }, []);

  const setSockCount = useCallback((n) => {
    setFormState(f => ({...f, sockCount:n, socks:n*CONFIG.SOCKS_RATE,
      socksMop:n>0?(f.socksMop||f.playMop):""}));
  }, []);

  const showToastMsg = (msg, type) => { setToast({msg, type:type||"info"}); setTimeout(()=>setToast(null), 3000); };

  useEffect(() => {
    fetchEntries();
    checkBirthdaysCache();
  }, []);

  function switchTab(t) {
    setTab(t);
    setMoreOpen(false);
    if (t === "today") { setSection("home"); setScreen("home"); }
    else if (t === "entries") { setSection("entries"); setScreen("home"); }
    else if (t === "birthdays") { setSection("birthdays"); setScreen("home"); checkBirthdaysCache(); }
  }

  function switchSection(s) {
    setMoreOpen(false);
    if (s !== "cash-register" && s !== "expenses" && s !== "staff") setStatsUnlocked(false);
    setSection(s);
    setScreen("home");
    if (s === "home") setTab("today");
    else if (s === "entries") setTab("entries");
    else if (s === "birthdays") { setTab("birthdays"); checkBirthdaysCache(); }
    else setTab("more");
    if (s === "staff" || s === "attendance") fetchStaffData();
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
  function bdayPrevMonth() {
    let m = birthdayMonth - 1, y = birthdayYear;
    if (m < 1) { m = 12; y--; }
    setBirthdayMonth(m); setBirthdayYear(y); fetchBirthdays(m, y);
  }
  function bdayNextMonth() {
    let m = birthdayMonth + 1, y = birthdayYear;
    if (m > 12) { m = 1; y++; }
    setBirthdayMonth(m); setBirthdayYear(y); fetchBirthdays(m, y);
  }
  function bdayToday() {
    const now = new Date();
    setBirthdayMonth(now.getMonth()+1); setBirthdayYear(now.getFullYear());
    setBdayViewMode("week");
    setBdaySearch(""); setBdaySearchResults(null);
    fetchBirthdays(now.getMonth()+1, now.getFullYear());
  }
  function onBdaySearchChange(val) {
    setBdaySearch(val);
    clearTimeout(bdaySearchTimer.current);
    if (!val.trim()) { setBdaySearchResults(null); return; }
    bdaySearchTimer.current = setTimeout(async () => {
      const res = await api.searchBirthdays(val.trim());
      if (res.success) setBdaySearchResults(res.data);
    }, 400);
  }

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
        month: monthlyExpMonth, year: monthlyExpYear,
        category: monthlyExpPopup.category || "misc",
        amount: monthlyExpPopup.amount, description: monthlyExpPopup.description || "",
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

  async function fetchStaffData(month, year) {
    const m = month || staffMonth, y = year || staffYear;
    setStaffLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        api.readStaff(),
        api.readAttendance(m, y),
      ]);
      if (staffRes.success) setStaffList(staffRes.data || []);
      else showToastMsg("Error: "+(staffRes.error||"unknown"),"error");
      if (attRes.success) setStaffAtt(attRes.data || []);
    } catch(e) { console.error("Staff fetch:",e); showToastMsg("Could not load staff data","error"); }
    finally { setStaffLoading(false); }
  }

  function onStaffMonthChange(m) { setStaffMonth(m); fetchStaffData(m, staffYear); }
  function onStaffYearChange(y) { setStaffYear(y); fetchStaffData(staffMonth, y); }

  async function handleAddStaff(data) {
    setStaffSaving(true);
    try {
      const res = staffPopup?.id
        ? await api.updateStaff(staffPopup.id, data)
        : await api.addStaff(data);
      if (res.success) {
        showToastMsg(staffPopup?.id ? "Staff updated!" : "Staff added!", "success");
        setStaffPopup(null);
        fetchStaffData();
      } else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Save staff:",e); showToastMsg("Could not save","error"); }
    finally { setStaffSaving(false); }
  }

  function handleDeleteStaff(staff) {
    setConfirmAction({
      message: "Delete " + staff.name + " from staff?",
      needsPassword: true,
      onConfirm: async () => {
        try {
          const res = await api.deleteStaff(staff.id);
          if (res.success) { showToastMsg("Deleted","success"); fetchStaffData(); }
          else showToastMsg("Error: "+(res.error||"unknown"),"error");
        } catch(e) { console.error("Delete staff:",e); showToastMsg("Could not delete","error"); }
      }
    });
  }

  async function handleMarkAttendance(staffId, date, status, checkIn, checkOut) {
    setStaffSaving(true);
    try {
      const record = {staff_id: staffId, date, status};
      if (checkIn !== undefined) record.check_in = checkIn;
      if (checkOut !== undefined) record.check_out = checkOut;
      const res = await api.upsertAttendance(record);
      if (res.success) {
        setStaffAtt(prev => {
          const filtered = prev.filter(a => !(a.staff_id === staffId && a.date === date));
          return [...filtered, res.data];
        });
      } else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Mark attendance:",e); showToastMsg("Could not save","error"); }
    finally { setStaffSaving(false); }
  }

  async function fetchEntries(date, mode, rs, re) {
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
        res = await api.readEntries(y, m, md==="month"?"all":dd);
        if (md==="month") {
          const mm=String(m).padStart(2,"0");
          startDate=y+"-"+mm+"-01";
          endDate=y+"-"+mm+"-"+String(new Date(y,m,0).getDate()).padStart(2,"0");
        } else { startDate=d; endDate=d; }
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
  function onCalToday() { const t=new Date().toISOString().slice(0,10); setFilterDate(t); fetchEntries(t,calMode); }

  async function lookupByPhone(phone) {
    if (phone.length !== 10 || phone === lastLookedUpPhone.current) return;
    lastLookedUpPhone.current = phone;
    setPhoneLookupLoading(true);
    setActivePass(null);
    try {
      const [res, passRes] = await Promise.all([
        api.lookupPhone(phone),
        api.getActivePass(phone),
      ]);
      if (res.success && res.found) {
        setFormState(f => ({
          ...f,
          customerName: f.customerName || res.customerName || f.customerName,
          dob: f.dob || res.dob || f.dob,
        }));
        if (res.customerName || res.dob) showToastMsg("Found previous entry — autofilled","success");
      }
      if (passRes.success && passRes.found) {
        setActivePass(passRes.pass);
        setBuyPassType(null);
        const pt = CONFIG.PASS_TYPES.find(p=>p.key===passRes.pass.pass_type);
        const label = pt ? pt.label : passRes.pass.pass_type;
        if (passRes.pass.hours_remaining != null) {
          showToastMsg(`${label} pass active — ${passRes.pass.hours_remaining}h left`,"success");
        } else {
          showToastMsg(`${label} pass active`,"success");
        }
      }
    } catch(e) { console.error("Phone lookup:",e); }
    finally { setPhoneLookupLoading(false); }
  }

  const computeTimeOut = (timeIn, hours) => {
    if(!timeIn) return "";
    const [h,m] = timeIn.split(":").map(Number);
    const dur = parseFloat(hours)||1;
    const t = h*60+m+dur*60;
    return `${String(Math.floor(t/60)%24).padStart(2,"0")}:${String(Math.round(t%60)).padStart(2,"0")}`;
  };

  const socksCharge = entryType === "funzone" ? (form.socks||0) : 0;
  const buyPassMeta = buyPassType ? CONFIG.PASS_TYPES.find(p=>p.key===buyPassType) : null;
  const totalAmount = (parseInt(form.amount)||0) + socksCharge;

  const usingPass = activePass && isPlayArea && !editTarget;

  const validate = () => {
    const errs = {};
    if (!form.phone || form.phone.length !== 10) errs.phone = "10 digits required";
    if (!form.customerName.trim()) errs.customerName = "Required";
    if (!usingPass && !buyPassType) {
      if (!form.amount || parseInt(form.amount) <= 0) errs.amount = "Enter amount";
    }
    if (!usingPass && !buyPassType && !form.playMop) errs.playMop = "Select payment mode";
    if (buyPassType && !form.playMop) errs.playMop = "Select payment mode";
    if (socksCharge > 0 && !form.socksMop) errs.socksMop = "Select mode";
    setErrors(errs);
    if (Object.keys(errs).length) { setShakeStep(true); setTimeout(()=>setShakeStep(false),500); }
    return !Object.keys(errs).length;
  };

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
    if (!validate()) return;
    const timeOut = computeTimeOut(form.timeIn, form.hours);
    const usePass = usingPass;
    const isBuyingPass = !!buyPassType && isPlayArea && !editTarget;
    const totalAmt = usePass ? 0 : (parseInt(form.amount)||0);
    const perKidAmt = usePass ? 0 : isBuyingPass ? totalAmt : (form.numKids>1 ? Math.round(totalAmt/form.numKids) : totalAmt);
    const kidNames = form.kidNames || [];
    const playMopStr = usePass ? "Pass" : getPlayMopString();
    const socksMopStr = getSocksMopString();
    const pay = usePass ? {playUpi:0,playCash:0,socksUpi:0,socksCash:0} : computePaymentCols();
    if ((usePass || isBuyingPass) && socksCharge > 0) {
      if(form.socksMop==="UPI") pay.socksUpi=socksCharge;
      else if(form.socksMop==="Cash") pay.socksCash=socksCharge;
      else if(form.socksMop==="UPI + Cash"){pay.socksUpi=parseInt(form.socksUpiAmount)||0;pay.socksCash=parseInt(form.socksCashAmount)||0;}
    }

    setSaving(true);
    try {
      let createdPass = null;
      if (isBuyingPass && buyPassMeta) {
        const today = new Date();
        const expiry = new Date(today); expiry.setDate(expiry.getDate() + buyPassMeta.durationDays);
        const hoursAfterFirstVisit = buyPassMeta.hours != null
          ? Math.max(0, parseFloat((buyPassMeta.hours - (parseFloat(form.hours)||1)*form.numKids).toFixed(1)))
          : null;
        const passRes = await api.createPass({
          phone: form.phone,
          customer_name: form.customerName,
          pass_type: buyPassType,
          amount: parseInt(form.amount)||0,
          mop: playMopStr,
          start_date: today.toISOString().slice(0,10),
          expiry_date: expiry.toISOString().slice(0,10),
          hours_remaining: hoursAfterFirstVisit,
        });
        if (!passRes.success) { showToastMsg("Error creating pass: "+(passRes.error||"unknown"),"error"); setSaving(false); return; }
        createdPass = passRes.data;
        if (hoursAfterFirstVisit != null && hoursAfterFirstVisit <= 0 && createdPass) {
          await api.updatePass(createdPass.id, {active: false});
        }
      }

      const entryMop = isBuyingPass ? `Pass (${playMopStr})` : playMopStr;
      const entryAmt = isBuyingPass ? totalAmt : (usePass ? 0 : perKidAmt);

      if (form.numKids <= 1) {
        const entry = {...form, mop:entryMop, socksMop:socksMopStr, entryType, timeIn:form.timeIn, timeOut:timeOut,
          amount:entryAmt, numKids:1, socks:socksCharge,
          playUpi:pay.playUpi, playCash:pay.playCash, socksUpi:pay.socksUpi, socksCash:pay.socksCash};
        const res = await api.addEntry(entry);
        if(res.success) { showToastMsg(isBuyingPass ? `Pass created + entry saved!` : "Entry saved!","success"); setShowSuccess(true); fetchEntries(); }
        else { showToastMsg("Error: "+(res.error||"unknown"),"error"); setSaving(false); return; }
      } else {
        let ok = 0;
        for (let k=0; k<form.numKids; k++) {
          const name = k===0 ? (form.customerName||"") : (kidNames[k]||form.customerName+" - Kid "+(k+1));
          const dob = k===0 ? (form.dob||"") : ((form.dobs&&form.dobs[k])||"");
          const kidPU = Math.round(pay.playUpi/form.numKids);
          const kidPC = Math.round(pay.playCash/form.numKids);
          const entry = {...form, mop:k===0?entryMop:playMopStr, socksMop:k===0?socksMopStr:"", entryType, timeIn:form.timeIn, timeOut:timeOut,
            customerName:name, dob:dob, amount:k===0?entryAmt:0, numKids:1,
            socks: k===0 ? socksCharge : 0,
            playUpi:kidPU, playCash:kidPC,
            socksUpi: k===0 ? pay.socksUpi : 0, socksCash: k===0 ? pay.socksCash : 0};
          const res = await api.addEntry(entry);
          if(res.success) ok++;
        }
        showToastMsg(isBuyingPass ? `Pass created + ${ok} entries saved!` : `${ok} entries saved!`,"success"); setShowSuccess(true); fetchEntries();
      }
      if (usePass && activePass) {
        const updates = {};
        if (activePass.hours_remaining != null) {
          const hoursUsed = (parseFloat(form.hours)||1) * form.numKids;
          updates.hours_remaining = Math.max(0, parseFloat((activePass.hours_remaining - hoursUsed).toFixed(1)));
          if (updates.hours_remaining <= 0) updates.active = false;
        }
        if (Object.keys(updates).length) {
          await api.updatePass(activePass.id, updates);
          setActivePass(prev => prev ? {...prev, ...updates} : null);
        }
      }
    } catch(e) { console.error("Save:",e); showToastMsg("Could not save — check internet","error"); }
    finally { setSaving(false); }
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
      const su=parseInt(entry.socksUpi)||0, sc2=parseInt(entry.socksCash)||0;
      if(su>0&&sc2>0){editSocksMop="UPI + Cash";editSocksUpi=String(su);editSocksCash=String(sc2);}
      else if(sc2>0) editSocksMop="Cash";
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
      playMop:editPlayMop, playUpiAmount:editPlayUpi, playCashAmount:editPlayCash,
      socksMop:editSocksMop, socksUpiAmount:editSocksUpi, socksCashAmount:editSocksCash,
      numKids:1, hours:hours,
      hoursMode:CONFIG.HOUR_OPTIONS.some(o=>o.value===hours)?"preset":"custom",
      timeIn:timeIn, socks:socksTotal, sockCount:sockCount,
      sockMode:CONFIG.SOCK_COUNT_OPTIONS.includes(sockCount)?"preset":"custom",
      phone:String(entry.phone||entry["Phone number"]||""),
      dob:entry.dob||entry["DOB"]||"",
      date:entry.date||new Date().toISOString().slice(0,10),
      kidNames:[], dobs:[],
    });
    setEntryType(entry.entryType||entry["Entry Type"]||"funzone");
    setScreen("form");
  }

  function handleEdit(entry) {
    const today = new Date().toISOString().slice(0,10);
    const isPast = entry.date && entry.date !== today;
    if (isPast) {
      setConfirmAction({
        message: "Edit this past entry" + (entry.customerName ? " for " + entry.customerName : "") + "?",
        needsPassword: true, confirmLabel: "Confirm",
        onConfirm: () => doEdit(entry),
      });
    } else { doEdit(entry); }
  }

  async function handleUpdateSubmit() {
    if (!validate()) return;
    const timeOut = computeTimeOut(form.timeIn, form.hours);
    const pay = computePaymentCols();
    const entry = {...form, mop:getPlayMopString(), socksMop:getSocksMopString(), entryType, timeIn:form.timeIn, timeOut:timeOut,
      amount:parseInt(form.amount)||0, numKids:1, socks:socksCharge,
      playUpi:pay.playUpi, playCash:pay.playCash, socksUpi:pay.socksUpi, socksCash:pay.socksCash};
    if(!editTarget?.id) { showToastMsg("Cannot identify entry","error"); resetForm(); return; }
    setSaving(true);
    try {
      const res = await api.updateEntry(editTarget.id, entry);
      if(res.success) { showToastMsg("Updated!","success"); fetchEntries(); }
      else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Update:",e); showToastMsg("Could not update","error"); }
    finally { setSaving(false); resetForm(); }
  }

  function handleDelete(entry) {
    if(!entry.id) { showToastMsg("Cannot identify entry","error"); return; }
    const today = new Date().toISOString().slice(0,10);
    const isPast = entry.date && entry.date !== today;
    setConfirmAction({
      message: "Delete this entry" + (entry.customerName ? " for " + entry.customerName : "") + "?",
      needsPassword: isPast,
      onConfirm: async () => {
        setSaving(true);
        try {
          const res = await api.deleteEntry(entry.id);
          if(res.success) { showToastMsg("Deleted","info"); fetchEntries(); }
          else showToastMsg("Error: "+(res.error||"unknown"),"error");
        } catch(e) { console.error("Delete:",e); showToastMsg("Could not delete","error"); }
        finally { setSaving(false); }
      }
    });
  }

  function resetForm() {
    setFormState(getDefaultForm()); setErrors({}); setShowSuccess(false);
    setEditTarget(null); setScreen("home"); setEntryType("funzone");
    setActivePass(null); setBuyPassType(null); lastLookedUpPhone.current = "";
  }

  function openPassSale() {
    setPassPopup({phone:"",customer_name:"",pass_type:"10_hours",mop:"UPI"});
  }

  async function savePass() {
    if (!passPopup) return;
    if (!passPopup.phone || passPopup.phone.length !== 10) { showToastMsg("Enter valid 10-digit phone","error"); return; }
    if (!passPopup.customer_name.trim()) { showToastMsg("Enter customer name","error"); return; }
    const pt = CONFIG.PASS_TYPES.find(p=>p.key===passPopup.pass_type);
    if (!pt) return;
    const today = new Date();
    const expiry = new Date(today); expiry.setDate(expiry.getDate() + pt.durationDays);
    setPassSaving(true);
    try {
      const res = await api.createPass({
        phone: passPopup.phone,
        customer_name: passPopup.customer_name,
        pass_type: passPopup.pass_type,
        amount: pt.amount,
        mop: passPopup.mop,
        start_date: today.toISOString().slice(0,10),
        expiry_date: expiry.toISOString().slice(0,10),
        hours_remaining: pt.hours != null ? pt.hours : null,
      });
      if (res.success) {
        showToastMsg(`${pt.label} pass created for ₹${pt.amount}`,"success");
        setPassPopup(null);
      } else showToastMsg("Error: "+(res.error||"unknown"),"error");
    } catch(e) { console.error("Pass:",e); showToastMsg("Could not save pass","error"); }
    finally { setPassSaving(false); }
  }

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

  function setFormType(type) {
    setEntryType(type);
    setFormState(f => {
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

  const todayKids = todayEntries.reduce((a,e) => a + (parseInt(e.numKids)||1), 0);
  const todayRevenue = todayEntries.reduce((a,e) => a + (parseInt(e.amount)||0) + (parseInt(e.socks)||0), 0);
  const todayUpi = todayEntries.reduce((a,e) => a + (parseInt(e.playUpi)||0) + (parseInt(e.socksUpi)||0), 0);
  const todayCash = todayEntries.reduce((a,e) => a + (parseInt(e.playCash)||0) + (parseInt(e.socksCash)||0), 0);
  const todaySocks = todayEntries.reduce((a,e) => {
    const s = parseInt(e.socks)||0;
    return a + (s > 0 && CONFIG.SOCKS_RATE > 0 ? Math.round(s/CONFIG.SOCKS_RATE) : 0);
  }, 0);
  const todayExpenseTotal = expenses.reduce((a,e) => a + (parseInt(e.amount)||0), 0);

  const activeNow = todayEntries.filter(e => {
    if (!e.timeIn || !e.timeOut) return false;
    const now = new Date();
    if ((e.date||"") !== now.toISOString().slice(0,10)) return false;
    const nowMin = now.getHours()*60 + now.getMinutes();
    return nowMin >= parseTime24ToMinutes(e.timeIn) && nowMin < parseTime24ToMinutes(e.timeOut) && !isCheckedOut(e.id);
  });

  function getMinutesLeft(e) {
    if (!e.timeOut) return 0;
    const now = new Date();
    const nowMin = now.getHours()*60 + now.getMinutes();
    const outMin = parseTime24ToMinutes(e.timeOut);
    return Math.max(0, outMin - nowMin);
  }
  function getProgressPct(e) {
    if (!e.timeIn || !e.timeOut) return 0;
    const now = new Date();
    const nowMin = now.getHours()*60 + now.getMinutes();
    const inMin = parseTime24ToMinutes(e.timeIn);
    const outMin = parseTime24ToMinutes(e.timeOut);
    const total = outMin - inMin;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((nowMin - inMin) / total) * 100));
  }

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="ft-app">

      {/* ── Splash ── */}
      {splash && (
        <div className="ft-splash">
          <div className="ft-splash-center">
            <div className="ft-splash-ripple"><div></div><div></div><div></div></div>
            <div className="ft-splash-icon ft-splash-bounce"><img src="icons/logo.png" alt="FunTunes" /></div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="ft-toast" style={{
        background: toast.type==="success"?C.green : toast.type==="error"?C.danger : C.accent
      }}>{toast.msg}</div>}

      {/* ── Saving overlay ── */}
      {saving && <div className="ft-confirm-overlay" style={{zIndex:200}}>
        <div className="ft-confirm-dialog" style={{padding:"24px 30px",maxWidth:200,textAlign:"center"}}>
          <Spinner size={28} /><div style={{marginTop:10,fontSize:13,fontWeight:700,color:C.textMid}}>Saving...</div>
        </div>
      </div>}

      {/* ── Success ── */}
      {showSuccess && <div className="ft-confirm-overlay" style={{zIndex:180}}>
        <div className="ft-confirm-dialog" style={{textAlign:"center",maxWidth:320}}>
          <div style={{width:64,height:64,margin:"0 auto 16px",borderRadius:"50%",background:C.greenSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M10 20 L17 27 L30 14" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{fontSize:19,fontWeight:800,marginBottom:6}}>Entry saved</div>
          <div style={{fontSize:13,color:C.textMid,marginBottom:4}}><strong>{form.customerName}</strong>{form.numKids>1?` x ${form.numKids} kids`:""}</div>
          <div style={{fontSize:26,fontWeight:800,color:C.green,marginBottom:20}}>₹{totalAmount.toLocaleString("en-IN")}</div>
          <button className="ft-btn-primary" style={{width:"100%",marginBottom:8}}
            onClick={()=>{setFormState(getDefaultForm());setShowSuccess(false);setEntryType("funzone");}}>+ Add another</button>
          <button className="ft-btn-secondary" style={{width:"100%"}} onClick={resetForm}>Go to dashboard</button>
        </div>
      </div>}

      {/* ── Desktop Icon Rail ── */}
      {screen === "home" && (
        <nav className="ft-rail">
          <div className="ft-rail-logo" onClick={() => switchSection("home")}><img src="icons/logo-header.png" alt="FunTunes" /></div>
          {[
            {key:"home", icon:<TabIconToday active={section==="home"} />, label:"Today"},
            {key:"entries", icon:<TabIconEntries active={section==="entries"} />, label:"Entries"},
            {key:"birthdays", icon:<TabIconBirthdays active={section==="birthdays"} />, label:"Birthdays"},
            {key:"cash-register", icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={section==="cash-register"?"#5d2a99":"#a099b5"} strokeWidth="1.7"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 8h14"/><path d="M8 8v9"/></svg>, label:"Cash"},
            {key:"expenses", icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={section==="expenses"?"#5d2a99":"#a099b5"} strokeWidth="1.7"><path d="M3 17V5a2 2 0 012-2h10a2 2 0 012 2v12"/><path d="M7 8h6M7 11h4"/></svg>, label:"P&L"},
            {key:"staff", icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={section==="staff"?"#5d2a99":"#a099b5"} strokeWidth="1.7"><circle cx="10" cy="7" r="3"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>, label:"Staff"},
            {key:"attendance", icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={section==="attendance"?"#5d2a99":"#a099b5"} strokeWidth="1.7"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14"/><path d="M7 2v4M13 2v4"/></svg>, label:"Attend."},
          ].map(item => (
            <button key={item.key} className={`ft-rail-item${section===item.key?" ft-rail-item--active":""}`}
              onClick={() => switchSection(item.key)}>
              {item.icon}
              <span className="ft-rail-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── Main Content Area ── */}
      <div className="ft-main">

        {/* ══════════ TODAY DASHBOARD ══════════ */}
        {screen === "home" && section === "home" && (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Today</div>
                <div className="ft-header-sub">{dateDisplay} · open since {timeDisplay}</div>
              </div>
              <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                <ShieldIcon />
              </button>
            </div>

            {/* Hero quick links */}
            <div className="ft-hero-row">
              <button className="ft-hero-card ft-hero-card--primary" onClick={()=>startNewEntry("funzone")}>
                <div className="ft-hero-icon">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M10 4v12M4 10h12"/></svg>
                </div>
                <div>
                  <div className="ft-hero-title">New booking</div>
                  <div className="ft-hero-sub">Log a walk-in · 3 fields</div>
                </div>
              </button>
              <button className="ft-hero-card" onClick={()=>{setExpensePopup({date:filterDate,amount:"",description:"",category:"misc"});}}>
                <div className="ft-hero-icon ft-hero-icon--muted">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#6d3f9c" strokeWidth="1.7"><circle cx="10" cy="10" r="6.5"/><path d="M10 6.5v7"/></svg>
                </div>
                <div>
                  <div className="ft-hero-title" style={{color:C.text}}>Add expense</div>
                  <div className="ft-hero-sub" style={{color:C.textLight}}>cash out</div>
                </div>
              </button>
            </div>

            {/* Stat tiles */}
            <div className="ft-stat-grid">
              <div className="ft-stat-card">
                <div className="ft-stat-label">KIDS IN TODAY</div>
                <div className="ft-stat-value">{todayKids || 0}</div>
                <div className="ft-stat-mini-bars">
                  {[20,35,28,42,55,48,70].map((h,i) => (
                    <span key={i} style={{height:`${h}%`,background:i===6?"linear-gradient(180deg,#9a63dd,#5d2a99)":"rgba(124,63,196,0.15)",flex:1,borderRadius:2}} />
                  ))}
                </div>
              </div>
              <div className="ft-stat-card">
                <div className="ft-stat-label">COLLECTED</div>
                <div className="ft-stat-value" style={{color:C.deepest}}>
                  ₹{todayRevenue.toLocaleString("en-IN")}
                  {todayRevenue > 0 && <span className="ft-stat-delta">+{Math.round((todayRevenue/(todayRevenue+1000))*100)}%</span>}
                </div>
                <div className="ft-stat-sub"><span>UPI ₹{todayUpi.toLocaleString("en-IN")}</span><span style={{marginLeft:"auto"}}>Cash ₹{todayCash.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="ft-stat-card">
                <div className="ft-stat-label">CASH IN DRAWER</div>
                <div className="ft-stat-value" style={{color:C.deepest}}>₹{todayCash.toLocaleString("en-IN")}</div>
                <div className="ft-stat-sub">
                  <span>opening float</span><span style={{marginLeft:"auto"}}>₹500</span>
                </div>
                <div className="ft-stat-sub">
                  <span>expenses</span><span style={{marginLeft:"auto"}}>₹{todayExpenseTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="ft-stat-card">
                <div className="ft-stat-label">SOCKS SOLD</div>
                <div className="ft-stat-value">{todaySocks || 0}</div>
                <div className="ft-entry-progress-bar" style={{marginTop:8}}>
                  <div className="ft-entry-progress-fill" style={{background:"linear-gradient(90deg,#7c3fc4,#5d2a99)",width:`${Math.min(100,(todaySocks/100)*100)}%`}} />
                </div>
                <div className="ft-stat-sub" style={{marginTop:6}}>{Math.max(0,100-todaySocks)} pairs left</div>
              </div>
            </div>

            {/* Playing now dark card */}
            <div className="ft-playing">
              <div className="ft-playing-header">
                <div className="ft-playing-pulse"></div>
                <span className="ft-playing-count">Playing now</span>
                <span className="ft-playing-count" style={{opacity:.6}}>{activeNow.length} sessions</span>
                <span className="ft-playing-revenue">click a row to extend or check out</span>
              </div>
              {activeNow.length > 0 ? (
                <div className="ft-playing-list">
                  {activeNow.slice(0,6).map(e => {
                    const mLeft = getMinutesLeft(e);
                    const pct = getProgressPct(e);
                    const isDue = mLeft <= 5;
                    const hasCashDue = (e.mop||"").toLowerCase().includes("cash") && !e.paid;
                    return (
                      <div key={e.id} className="ft-playing-row" onClick={()=>handleEdit(e)} style={{cursor:"pointer"}}>
                        <span className="name">
                          {e.customerName||"Guest"}
                          {hasCashDue && <span className="cash-due">CASH DUE</span>}
                        </span>
                        <span className="time">{formatTime12(e.timeIn)} → {formatTime12(e.timeOut)}</span>
                        <div className="ft-progress-bar">
                          <div className="ft-progress-fill" style={{width:`${pct}%`,background:isDue?"linear-gradient(90deg,#ff9db4,#e84393)":"linear-gradient(90deg,#a97ae0,#e6d4ff)"}} />
                        </div>
                        <span className="ft-playing-meta">{mLeft} min left</span>
                        <button className="ft-playing-extend" onClick={ev=>{ev.stopPropagation();handleEdit(e);}}>Extend</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{padding:"18px 0",textAlign:"center",color:"#b3a3cd",fontSize:13}}>No active sessions right now</div>
              )}
              <div className="ft-playing-chart-section">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,fontFamily:"var(--ft-mono)",color:"#8b7daa",letterSpacing:".08em"}}>BY HOUR</span>
                  <span style={{fontSize:9,fontFamily:"var(--ft-mono)",color:"#8b7daa"}}>3p–10p</span>
                </div>
                <div className="ft-playing-bars" style={{marginTop:8}}>
                  {(() => {
                    const hourCounts = [0,0,0,0,0,0,0];
                    todayEntries.forEach(e => {
                      const tIn = e.timeIn;
                      if (!tIn) return;
                      const h = parseInt(tIn.split(":")[0])||0;
                      if (h >= 15 && h <= 21) hourCounts[h-15]++;
                    });
                    const maxC = Math.max(...hourCounts, 1);
                    return hourCounts.map((c,i) => {
                      const pctH = Math.max(12, (c/maxC)*100);
                      const now = new Date().getHours();
                      const isCurrentHour = now === i+15;
                      const isPast = now > i+15;
                      let bg = `rgba(255,255,255,${0.10 + (c/maxC)*0.08})`;
                      if (c > 0 && isPast) bg = `rgba(160,140,200,${0.3 + (c/maxC)*0.4})`;
                      if (c > 0 && isCurrentHour) bg = "linear-gradient(180deg,#c9a3ff,#7c3fc4)";
                      if (c > 0 && i >= 5) bg = `linear-gradient(180deg,${c/maxC>0.7?"#8affe0,#33c9a6":"#c9a3ff,#7c3fc4"})`;
                      return <span key={i} className="ft-playing-bar" style={{height:`${pctH}%`,background:bg}} />;
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom 2-col: Birthdays + Admin */}
            <div className="ft-dash-bottom">
              {/* Birthdays widget */}
              <div className="ft-bday-widget ft-bday-widget--dash">
                <div className="ft-bday-widget-header">
                  <span className="title">Birthdays this week</span>
                  <span className="count">{birthdays.length} · {birthdays.filter(b=>(b.status||"not_contacted")!=="not_contacted").length} contacted</span>
                  <span className="ft-bday-view-all" onClick={()=>switchSection("birthdays")}>View all →</span>
                </div>
                {birthdays.length > 0 ? (
                  <div className="ft-bday-widget-list">
                    {birthdays.slice(0,4).map((b,i) => {
                      const age = b.year ? (new Date().getFullYear() - parseInt(b.year)) : "";
                      return (
                        <div key={b.key||i} className="ft-bday-widget-row">
                          <div className="ft-bday-day">{b.day||"?"}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:13}}>{b.kidName||"—"}</div>
                            <div style={{fontSize:10.5,fontFamily:"var(--ft-mono)",color:C.textLight}}>
                              {b.phone||""}{age ? ` · turns ${age}` : ""}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:5}}>
                            {b.phone && <a href={`tel:${b.phone}`} className="ft-dash-action-btn">Call</a>}
                            {b.phone && <a href={`https://wa.me/91${b.phone}`} target="_blank" rel="noopener" className="ft-dash-action-btn">WhatsApp</a>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{padding:"16px 0",textAlign:"center",color:C.textLight,fontSize:12}}>No birthdays this week</div>
                )}
              </div>

              {/* Admin panel */}
              <div className="ft-admin-widget">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <ShieldIcon />
                  <span style={{fontWeight:700,fontSize:14}}>Admin only</span>
                  <span style={{marginLeft:"auto",fontSize:11,fontFamily:"var(--ft-mono)",color:C.textLight}}>PIN</span>
                </div>
                {[
                  {key:"cash-register",label:"Cash Register",icon:"💰"},
                  {key:"expenses",label:"Profit / Loss",icon:"📊"},
                  {key:"staff",label:"Staff salary",icon:"👥"},
                ].map(item => (
                  <button key={item.key} className="ft-admin-row" onClick={()=>switchSection(item.key)}>
                    <span>{item.label}</span>
                    <span style={{color:C.textLight,fontSize:12,fontFamily:"var(--ft-mono)"}}>₹ ····</span>
                  </button>
                ))}
                <button className="ft-btn-primary ft-btn-primary--lg" style={{marginTop:14}} onClick={()=>switchSection("cash-register")}>
                  Unlock admin mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ENTRIES ══════════ */}
        {screen === "home" && section === "entries" && (() => {
          const sq = entrySearch.trim().toLowerCase();
          const filteredEntries = todayEntries.filter(e => {
            if (sq) {
              const n = (e.customerName||e["Customer name"]||"").toLowerCase();
              const p = (e.phone||e["Phone number"]||"");
              if (!n.includes(sq) && !p.includes(sq)) return false;
            }
            if (entryMopFilter !== "all") {
              const mop = (e.mop||e["MOP"]||"").toLowerCase();
              if (entryMopFilter === "upi" && !mop.includes("upi")) return false;
              if (entryMopFilter === "cash" && !mop.includes("cash")) return false;
              if (entryMopFilter === "pass" && !mop.includes("pass")) return false;
              if (entryMopFilter === "unpaid") {
                const paid = e.paid !== false && e.paid !== "false";
                if (paid && mop) return false;
              }
            }
            return true;
          });
          const sortedEntries = [...filteredEntries].sort((a,b)=>(a.id||0)-(b.id||0));
          const totalAmt = filteredEntries.reduce((s,e)=>s+(parseInt(e.amount||0))+(parseInt(e.socks||0)),0);

          const fd = new Date(filterDate+"T00:00:00");
          const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          const monthLabel = monthNames[fd.getMonth()] + " " + fd.getFullYear();

          function doExportCsv() {
            const rows = [["Name","Phone","Date","Time In","Time Out","Hours","Kids","MOP","Amount"]];
            filteredEntries.forEach(e => {
              rows.push([
                e.customerName||"", e.phone||"", e.date||"",
                e.timeIn||"", e.timeOut||"", e.hours||"",
                e.numKids||1, e.mop||"", (parseInt(e.amount||0)+parseInt(e.socks||0))
              ]);
            });
            const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
            const blob = new Blob([csv],{type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download=`entries-${filterDate}.csv`; a.click();
            URL.revokeObjectURL(url);
          }
          function handleExport() {
            if (statsUnlocked) { doExportCsv(); return; }
            setExportPinPrompt(true);
          }

          function prevMonth() {
            const d = new Date(fd); d.setMonth(d.getMonth()-1);
            const v = d.toISOString().slice(0,10);
            setFilterDate(v); setCalMode("month"); fetchEntries(v,"month");
          }
          function nextMonth() {
            const d = new Date(fd); d.setMonth(d.getMonth()+1);
            const v = d.toISOString().slice(0,10);
            setFilterDate(v); setCalMode("month"); fetchEntries(v,"month");
          }
          function prevDay() {
            const d = new Date(fd); d.setDate(d.getDate()-1);
            const v = d.toISOString().slice(0,10);
            setFilterDate(v); fetchEntries(v,"day");
          }
          function nextDay() {
            const d = new Date(fd); d.setDate(d.getDate()+1);
            const v = d.toISOString().slice(0,10);
            setFilterDate(v); fetchEntries(v,"day");
          }
          const dayShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
          const monShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const dayLabel = `${dayShort[fd.getDay()]}, ${fd.getDate()} ${monShort[fd.getMonth()]} ${fd.getFullYear()}`;

          return (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Entries</div>
                <div className="ft-header-sub">every logged walk-in</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                <button className="ft-btn-primary" onClick={()=>startNewEntry("funzone")}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M10 4v12M4 10h12"/></svg>
                  New entry
                </button>
                <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                  <ShieldIcon />
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="ft-filters">
              <div className="ft-filters-top">
                <div className="ft-seg">
                  {[{v:"day",l:"Day"},{v:"month",l:"Month"},{v:"range",l:"Period"}].map(t => (
                    <button key={t.v} className={`ft-seg-item${calMode===t.v?" ft-seg-item--active":""}`}
                      onClick={() => onCalModeChange(t.v)}>{t.l}</button>
                  ))}
                </div>

                {calMode === "month" && (
                  <div className="ft-date-nav">
                    <button className="ft-date-nav-btn" onClick={prevMonth}>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1L1 6l5 5"/></svg>
                    </button>
                    <span className="ft-date-nav-label">{monthLabel}</span>
                    <button className="ft-date-nav-btn" onClick={nextMonth}>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l5 5-5 5"/></svg>
                    </button>
                  </div>
                )}
                {calMode === "day" && (
                  <div className="ft-date-nav">
                    <button className="ft-date-nav-btn" onClick={prevDay}>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1L1 6l5 5"/></svg>
                    </button>
                    <span className="ft-date-nav-label">{dayLabel}</span>
                    <button className="ft-date-nav-btn" onClick={nextDay}>
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l5 5-5 5"/></svg>
                    </button>
                  </div>
                )}
                {calMode === "range" && (
                  <div className="ft-range-inputs">
                    <input className="fld ft-date-input" type="date" value={rangeStart||""} onChange={e => onCalRangeChange(e.target.value, rangeEnd)} />
                    <span className="ft-range-to">to</span>
                    <input className="fld ft-date-input" type="date" value={rangeEnd||""} onChange={e => onCalRangeChange(rangeStart, e.target.value)} />
                  </div>
                )}

                <button className="ft-today-btn" onClick={onCalToday} title="Jump to today">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14"/><path d="M7 2v4M13 2v4"/><circle cx="10" cy="13" r="1.5" fill="currentColor" stroke="none"/></svg>
                </button>

                <div className="ft-search-box">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#a099b5" strokeWidth="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
                  <input type="text" placeholder="Name or mobile" value={entrySearch} onChange={e=>setEntrySearch(e.target.value)} />
                </div>
              </div>

              <div className="ft-filters-bottom">
                <div className="ft-summary-strip">
                  <span className="ft-summary-count">{filteredEntries.length}</span>
                  <span className="ft-summary-label">entries</span>
                  <span className="ft-summary-dot">·</span>
                  <span className="ft-summary-amt">₹{totalAmt.toLocaleString("en-IN")}</span>
                  <span className="ft-summary-label">total</span>
                  <button className="ft-export-btn" onClick={handleExport} title="Export CSV">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14v2a2 2 0 002 2h10a2 2 0 002-2v-2M7 10l3 3 3-3M10 3v10"/></svg>
                  </button>
                </div>

                <div className="ft-mop-chips">
                  {[{v:"all",l:"All"},{v:"upi",l:"UPI"},{v:"cash",l:"Cash"},{v:"pass",l:"Pass"},{v:"unpaid",l:"Unpaid"}].map(f => (
                    <button key={f.v} className={`ft-chip${entryMopFilter===f.v?" ft-chip--active":""}`}
                      onClick={()=>setEntryMopFilter(f.v)}>{f.l}</button>
                  ))}
                </div>
              </div>
            </div>

            {exportPinPrompt && (
              <div className="ft-pin-overlay" onClick={()=>setExportPinPrompt(false)}>
                <div className="ft-pin-modal" onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:16,textAlign:"center"}}>Enter PIN to export</div>
                  <PasswordGate onUnlock={()=>{setExportPinPrompt(false);setStatsUnlocked(true);doExportCsv();}} />
                </div>
              </div>
            )}

            <LiveEntryList entries={sortedEntries} onEdit={handleEdit} onDelete={handleDelete} onCheckout={handleCheckout} loading={loading} />
          </div>
          );
        })()}

        {/* ══════════ BIRTHDAYS ══════════ */}
        {screen === "home" && section === "birthdays" && (() => {
          const newCount = birthdays.filter(b=>(b.status||"not_contacted")==="not_contacted").length;
          const naCount = birthdays.filter(b=>b.status==="na").length;
          const warmCount = birthdays.filter(b=>b.status==="warm").length;
          const bookedCount = birthdays.filter(b=>b.status==="booking").length;
          const bookedList = birthdays.filter(b=>b.status==="booking");

          const isSearching = bdaySearch.trim().length > 0;
          let filteredBdays = isSearching && bdaySearchResults ? bdaySearchResults : birthdays;

          const daysInMonth = new Date(birthdayYear, birthdayMonth, 0).getDate();
          const firstDow = (new Date(birthdayYear, birthdayMonth-1, 1).getDay() + 6) % 7;
          const bdayDays = new Set(birthdays.map(b=>b.day));
          const newBdayDays = new Set(birthdays.filter(b=>(b.status||"not_contacted")==="not_contacted").map(b=>b.day));
          const todayDate = new Date();
          const isCurrentMonth = birthdayMonth === todayDate.getMonth()+1 && birthdayYear === todayDate.getFullYear();

          return (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Birthdays</div>
                <div className="ft-header-sub">{isSearching ? `${filteredBdays.length} results` : `${birthdays.length} this month`}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                <button className="ft-btn-primary" onClick={openEnquiry}>+ Enquiry</button>
                <button className="ft-entry-act-btn" onClick={()=>fetchBirthdays()} disabled={birthdaysLoading} title="Refresh">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.65 6.35A7.96 7.96 0 0010 2a8 8 0 108 8h-2a6 6 0 11-1.76-4.24"/><path d="M18 2v5h-5"/></svg>
                </button>
              </div>
            </div>

            {/* Search + Booked button row */}
            <div className="ft-bday-action-row">
              {/* Mobile: dropdown filter */}
              <div className="ft-bday-mobile-filters">
                <select className="ft-bday-mobile-select" value={bdayStatusFilter}
                  onChange={e=>setBdayStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="not_contacted">New ({newCount})</option>
                  <option value="na">NA ({naCount})</option>
                  <option value="warm">Follow ({warmCount})</option>
                </select>
              </div>
              <button className={`ft-bday-booked-btn${showBooked?" is-active":""}`}
                onClick={()=>setShowBooked(!showBooked)}>
                {showBooked
                  ? <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2z"/><path d="M7 8l2 2 4-4"/></svg>}
                Booked{bookedCount > 0 ? ` (${bookedCount})` : ""}
              </button>
              <div className="ft-bday-search-row">
                <div className="ft-search-box ft-bday-search-box">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#a099b5" strokeWidth="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg>
                  <input id="bday-search-input" type="text" placeholder="Name or number" value={bdaySearch} onChange={e=>onBdaySearchChange(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="ft-bday-layout">
              <div className="ft-bday-cal-sidebar">
                <div className="ft-bday-minical">
                  <div className="ft-bday-minical-header">
                    <button className="ft-date-nav-btn" onClick={bdayPrevMonth}>
                      <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1L1 6l5 5"/></svg>
                    </button>
                    <span className="ft-bday-minical-title">{MONTH_NAMES[birthdayMonth-1]}</span>
                    <button className="ft-date-nav-btn" onClick={bdayNextMonth}>
                      <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l5 5-5 5"/></svg>
                    </button>
                  </div>
                  <div className="ft-bday-minical-grid">
                    {["M","T","W","T","F","S","S"].map((d,i) => <span key={i} className="ft-bday-minical-dow">{d}</span>)}
                    {Array.from({length:firstDow}).map((_,i) => <span key={"e"+i} />)}
                    {Array.from({length:daysInMonth}).map((_,i) => {
                      const d = i+1;
                      const hasBday = bdayDays.has(d);
                      const hasNew = newBdayDays.has(d);
                      const isToday = isCurrentMonth && d === todayDate.getDate();
                      return <span key={d}
                        className={`ft-bday-minical-day${hasBday?" has-bday":""}${isToday?" is-today":""}${hasNew?" has-new":""}`}
                        style={{cursor:hasNew?"pointer":"default"}}
                        onClick={()=>{if(hasNew){setShowBooked(false);setBdayStatusFilter("all");const el=document.getElementById("bday-day-"+d);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});}}}
                      >{d}</span>;
                    })}
                  </div>
                </div>
              </div>

              <div className="ft-bday-main">
                <BirthdayKanban birthdays={filteredBdays} month={birthdayMonth} year={birthdayYear}
                  loading={birthdaysLoading} onSave={saveBirthdayCall} isSearching={isSearching}
                  mobileFilter={bdayStatusFilter!=="all"?bdayStatusFilter:null}
                  showBooked={showBooked} bookedList={bookedList} />
              </div>
            </div>
          </div>
          );
        })()}

        {/* ══════════ CASH REGISTER ══════════ */}
        {screen === "home" && section === "cash-register" && (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Cash Register</div>
                <div className="ft-header-sub">daily income & expenses</div>
              </div>
              <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                <ShieldIcon />
              </button>
            </div>
            {!statsUnlocked
              ? <PasswordGate onUnlock={()=>setStatsUnlocked(true)} />
              : <>
                <div style={{marginBottom:16}}>
                  <CalendarFilter mode={calMode} date={filterDate}
                    rangeStart={rangeStart} rangeEnd={rangeEnd}
                    onModeChange={onCalModeChange} onDateChange={onCalDateChange}
                    onRangeChange={onCalRangeChange} onToday={onCalToday} />
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,padding:"0 22px"}}>
                    {!loading && <span style={{fontSize:12,color:C.textLight}}>{todayEntries.length} entries</span>}
                    <button className="ft-chip" onClick={()=>setExpensePopup({date:filterDate,amount:"",description:"",category:"misc"})}>+ Expense</button>
                    <button className="ft-chip" onClick={()=>fetchEntries()} disabled={loading}>Refresh</button>
                  </div>
                </div>
                {loading ? <div className="ft-empty"><Spinner size={24} /><div style={{marginTop:10}}>Loading...</div></div>
                  : <div className="ft-section-pad"><StatsDashboard entries={todayEntries} expenses={expenses} onDeleteExpense={handleDeleteExpense} /></div>}
              </>}
          </div>
        )}

        {/* ══════════ PROFIT / LOSS ══════════ */}
        {screen === "home" && section === "expenses" && (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Profit & Loss</div>
                <div className="ft-header-sub">monthly revenue & expenses</div>
              </div>
              <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                <ShieldIcon />
              </button>
            </div>
            {!statsUnlocked
              ? <PasswordGate onUnlock={()=>{setStatsUnlocked(true);fetchMonthlyExpenses();fetchPnl();}} />
              : <div className="ft-section-pad">
                <PnLReport entries={pnlEntries} expenses={pnlExpenses} monthlyExpenses={monthlyExp}
                  month={monthlyExpMonth} year={monthlyExpYear}
                  onChangeMonth={onPnlSectionMonthChange} onChangeYear={onPnlSectionYearChange}
                  loading={pnlLoading||monthlyExpLoading} />
                <div style={{marginTop:24}}>
                  <MonthlyExpensesDashboard
                    expenses={monthlyExp}
                    month={monthlyExpMonth} year={monthlyExpYear}
                    onChangeMonth={onPnlSectionMonthChange} onChangeYear={onPnlSectionYearChange}
                    onAdd={()=>setMonthlyExpPopup({amount:"",category:"rent",description:""})}
                    onDelete={handleDeleteMonthlyExpense}
                    loading={monthlyExpLoading}
                    hideFilter={true} />
                </div>
              </div>}
          </div>
        )}

        {/* ══════════ STAFF ══════════ */}
        {screen === "home" && section === "staff" && (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Staff & Salary</div>
                <div className="ft-header-sub">manage team & payroll</div>
              </div>
              <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                <ShieldIcon />
              </button>
            </div>
            {!statsUnlocked
              ? <PasswordGate onUnlock={()=>{setStatsUnlocked(true);fetchStaffData();}} />
              : <div className="ft-section-pad"><StaffSection
                  staffList={staffList} attendance={staffAtt}
                  month={staffMonth} year={staffYear}
                  onChangeMonth={onStaffMonthChange} onChangeYear={onStaffYearChange}
                  onAddStaff={()=>setStaffPopup({})} onEditStaff={s=>setStaffPopup(s)} onDeleteStaff={handleDeleteStaff}
                  loading={staffLoading} /></div>}
          </div>
        )}

        {/* ══════════ ATTENDANCE ══════════ */}
        {screen === "home" && section === "attendance" && (
          <div className="ft-page">
            <div className="ft-header">
              <div>
                <div className="ft-header-title">Attendance</div>
                <div className="ft-header-sub">daily check-in tracker</div>
              </div>
              <button className="ft-header-shield" onClick={() => switchSection("cash-register")}>
                <ShieldIcon />
              </button>
            </div>
            <div className="ft-section-pad"><AttendanceSection
              staffList={staffList} attendance={staffAtt}
              month={staffMonth} year={staffYear}
              attDate={staffAttDate}
              onChangeMonth={onStaffMonthChange} onChangeYear={onStaffYearChange}
              onChangeAttDate={setStaffAttDate}
              onMarkAttendance={handleMarkAttendance}
              loading={staffLoading} saving={staffSaving} /></div>
          </div>
        )}

        {/* ══════════ BOOKING FORM (single-scroll) ══════════ */}
        {screen === "form" && (
          <div className="ft-page ft-form-scroll" ref={containerRef}>
            <div className="ft-header">
              <button className="ft-header-back" onClick={resetForm}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div>
                <div className="ft-header-title">{editTarget ? "Edit Entry" : "New Booking"}</div>
                <div className="ft-header-sub">{dateDisplay} · {timeDisplay}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                {!editTarget && <IconMenu trigger={typeMeta.icon} title="Change entry type" activeValue={entryType}
                  items={CONFIG.ENTRY_TYPES.map(t=>({
                    value:t.key, icon:t.icon, label:t.label,
                    onSelect:()=>{ if(t.key!==entryType) setFormType(t.key); },
                  }))} />}
              </div>
            </div>

            <div className="ft-form-body" style={{animation:shakeStep?"shakeX .4s ease":"fadeIn .3s ease"}}>
              <div className="ft-form-desktop-grid">

              {/* ── LEFT COLUMN: Customer ── */}
              <div>
                <div className="ft-form-section">
                  <div className="ft-form-section-label">Customer</div>

                  {/* Phone */}
                  <div style={{marginBottom:14}}>
                    <label className="field-label">Phone {errors.phone && <span className="err-msg">{errors.phone}</span>}</label>
                    <div className="ft-phone-wrap">
                      <input className={`fld${errors.phone?" is-error":""}`} value={form.phone} placeholder="10-digit mobile" type="tel" inputMode="numeric"
                        style={{borderWidth:"1.5px",borderColor:errors.phone?"var(--ft-danger)":"var(--ft-accent-hover)",boxShadow:errors.phone?"0 0 0 3px rgba(194,96,122,.1)":"0 0 0 3px var(--ft-purple-glow)"}}
                        onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,10);set("phone",v);if(v.length===10)lookupByPhone(v);}} />
                      {phoneLookupLoading && <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}><Spinner size={16} /></div>}
                      {form.phone.length===10 && !phoneLookupLoading && (
                        lastLookedUpPhone.current===form.phone
                          ? <span className="ft-phone-badge">RETURNING</span>
                          : <span className="ft-phone-badge ft-phone-badge--new">FIRST VISIT</span>
                      )}
                    </div>
                  </div>

                  {/* Kid rows */}
                  <div style={{marginBottom:14}}>
                    <label className="field-label">Kids {errors.customerName && <span className="err-msg">{errors.customerName}</span>}</label>
                    {Array.from({length:form.numKids},(_,i)=>(
                      <div key={i} className="ft-kid-row">
                        <div className="ft-kid-num">{i+1}</div>
                        <input className={`fld${i===0&&errors.customerName?" is-error":""}`}
                          value={i===0?form.customerName:((form.kidNames&&form.kidNames[i])||"")}
                          placeholder={i===0?"Kid's name":`Kid ${i+1} name`}
                          onChange={e=>{
                            if(i===0) set("customerName",e.target.value);
                            else { const names=[...(form.kidNames||[])]; names[i]=e.target.value; set("kidNames",names); }
                          }} />
                        <input className="fld fld-date"
                          value={i===0?form.dob:((form.dobs&&form.dobs[i])||"")}
                          type="date"
                          onChange={e=>{
                            if(i===0) set("dob",e.target.value);
                            else { const d2=[...(form.dobs||[])]; d2[i]=e.target.value; set("dobs",d2); }
                          }} />
                        {i > 0 ? <button type="button" className="ft-kid-remove" onClick={()=>{
                          const names=[...(form.kidNames||[])]; names.splice(i,1);
                          const d2=[...(form.dobs||[])]; d2.splice(i,1);
                          setFormState(f=>({...f, numKids:f.numKids-1, kidNames:names, dobs:d2,
                            amount:String(computeAmountForHours(f.hours)*(f.numKids-1))}));
                        }}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h12M8 6V4h4v2M6 6v10a1 1 0 001 1h6a1 1 0 001-1V6M9 9v5M11 9v5"/></svg>
                        </button> : <div className="ft-kid-remove-spacer"/>}
                      </div>
                    ))}
                    {form.numKids < 10 && <button type="button" className="ft-add-kid-btn" onClick={()=>set("numKids",form.numKids+1)}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 4v12M4 10h12"/></svg>
                      Add kid
                    </button>}
                  </div>

                  {/* Socks */}
                  {isPlayArea && <div style={{marginTop:18}}>
                    <div className="ft-form-section-label">Socks</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <NumberStepper value={form.sockCount||0} onChange={v=>{set("sockMode","preset");setSockCount(Math.max(0,v));}} min={0} max={20} />
                      {(form.sockCount||0) > 0 && <div style={{position:"relative",flex:"0 0 100px"}}>
                        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:600,color:C.textMid,fontSize:12}}>₹</span>
                        <input className="fld" type="tel" inputMode="numeric" value={form.socks||""} placeholder="0"
                          style={{paddingLeft:24,height:36,fontSize:13,fontWeight:600,textAlign:"right",paddingRight:10}}
                          onChange={e=>{
                            const v=e.target.value.replace(/\D/g,"");
                            setFormState(f=>({...f, socks:parseInt(v)||0, sockMode:"custom"}));
                          }} />
                      </div>}
                    </div>
                    {socksCharge > 0 && <div style={{marginTop:10}}>
                      <label className="field-label">Socks paid via {errors.socksMop && <span className="err-msg">{errors.socksMop}</span>}</label>
                      <div className="ft-pay-chips">
                        {[{value:"UPI",label:"UPI"},{value:"Cash",label:"Cash"},{value:"UPI + Cash",label:"Split"}].map(o=>(
                          <button key={o.value} type="button" className={`ft-pay-chip${form.socksMop===o.value?" is-active":""}`}
                            onClick={()=>{
                              set("socksMop",o.value);
                              if(o.value!=="UPI + Cash"){set("socksUpiAmount","");set("socksCashAmount","");}
                            }}>{o.label}</button>
                        ))}
                      </div>
                      {form.socksMop==="UPI + Cash" && <div className="ft-split-row">
                        <div>
                          <div className="ft-split-label">UPI</div>
                          <div style={{position:"relative"}}>
                            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:600,color:C.textMid,fontSize:12}}>₹</span>
                            <input className="fld" value={form.socksUpiAmount} type="tel" inputMode="numeric" placeholder="0"
                              style={{paddingLeft:26,height:40,fontSize:13.5,fontWeight:600}}
                              onChange={e=>{
                                const v=e.target.value.replace(/\D/g,"");
                                set("socksUpiAmount",v);
                                set("socksCashAmount",String(Math.max(0,socksCharge-(parseInt(v)||0))));
                              }} />
                          </div>
                        </div>
                        <div>
                          <div className="ft-split-label">Cash</div>
                          <div style={{position:"relative"}}>
                            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:600,color:C.textMid,fontSize:12}}>₹</span>
                            <input className="fld" value={form.socksCashAmount} type="tel" inputMode="numeric" placeholder="0"
                              style={{paddingLeft:26,height:40,fontSize:13.5,fontWeight:600}}
                              onChange={e=>{
                                const v=e.target.value.replace(/\D/g,"");
                                set("socksCashAmount",v);
                                set("socksUpiAmount",String(Math.max(0,socksCharge-(parseInt(v)||0))));
                              }} />
                          </div>
                        </div>
                      </div>}
                    </div>}
                  </div>}
                </div>
              </div>

              {/* ── RIGHT COLUMN: Playtime ── */}
              <div>
                <div className="ft-form-section">
                  <div className="ft-form-section-label">{isPlayArea?"Playtime":`${typeMeta.label} Booking`}</div>

                  {/* Duration chips */}
                  <div className="ft-dur-chips">
                    {CONFIG.HOUR_OPTIONS.filter(o=>["0.5","1","2"].includes(o.value)).map(o=>{
                      const isActive = form.hoursMode!=="custom" && String(form.hours)===o.value;
                      return <button key={o.value} type="button" className={`ft-dur-chip${isActive?" is-active":""}`}
                        onClick={()=>{set("hoursMode","preset");setHours(o.value,isPlayArea);}}>{o.label}</button>;
                    })}
                    <button type="button" className={`ft-dur-chip${form.hoursMode==="custom"?" is-active":""}`}
                      onClick={()=>set("hoursMode","custom")}>Custom</button>
                  </div>

                  {/* Custom duration inputs */}
                  {form.hoursMode==="custom" && (
                    <div className="ft-custom-dur">
                      <input className="fld" value={Math.floor(parseFloat(form.hours)||0)} type="tel" inputMode="numeric" placeholder="0"
                        onChange={e=>{
                          const hrs=parseInt(e.target.value.replace(/\D/g,""))||0;
                          const mins=Math.round(((parseFloat(form.hours)||0)%1)*60);
                          setHours(String(hrs+mins/60),isPlayArea);
                        }} />
                      <span className="ft-custom-dur-label">hr</span>
                      <input className="fld" value={Math.round(((parseFloat(form.hours)||0)%1)*60)} type="tel" inputMode="numeric" placeholder="0"
                        onChange={e=>{
                          const mins=parseInt(e.target.value.replace(/\D/g,""))||0;
                          const hrs=Math.floor(parseFloat(form.hours)||0);
                          setHours(String(hrs+Math.min(mins,59)/60),isPlayArea);
                        }} />
                      <span className="ft-custom-dur-label">min</span>
                    </div>
                  )}

                  {/* Time FROM → TO */}
                  <div className="ft-time-row">
                    <span className="ft-time-label">From</span>
                    <input className="fld" value={form.timeIn} onChange={e=>set("timeIn",e.target.value)} type="time" />
                    <span className="ft-time-arrow">→</span>
                    <span className="ft-time-label">To</span>
                    <input className="fld" value={computeTimeOut(form.timeIn,form.hours)} type="time" readOnly
                      style={{background:"var(--ft-accent-soft)",color:"var(--ft-deep)"}} />
                  </div>

                  {/* Pass status */}
                  {usingPass && activePass && (() => {
                    const pt = CONFIG.PASS_TYPES.find(p=>p.key===activePass.pass_type);
                    return <div className="ft-pass-active-badge">
                      <span>🎫 {pt?pt.label:activePass.pass_type} Pass</span>
                      <span className="ft-pass-active-hours">{activePass.hours_remaining != null ? `${activePass.hours_remaining}h left` : "Unlimited"}</span>
                      <button className="ft-pass-active-switch" onClick={()=>setActivePass(null)}>Pay instead</button>
                    </div>;
                  })()}

                  {/* Buy Pass toggle — only when no active pass */}
                  {isPlayArea && !usingPass && !editTarget && (
                    <div style={{marginTop:14}}>
                      <button type="button" className={`ft-pass-toggle${buyPassType?" is-active":""}`}
                        onClick={()=>{
                          if(buyPassType){setBuyPassType(null);set("amount",String(computeAmountForHours(form.hours)*form.numKids));}
                          else{const pt0=CONFIG.PASS_TYPES[0];setBuyPassType("10_hours");if(pt0)set("amount",String(pt0.amount));}
                        }}>
                        <span>🎫</span>
                        <span>{buyPassType ? "Pass selected" : "Buy a Pass"}</span>
                        {buyPassType && <span className="ft-pass-toggle-x" onClick={e=>{e.stopPropagation();setBuyPassType(null);set("amount",String(computeAmountForHours(form.hours)*form.numKids));}}>✕</span>}
                      </button>
                      {buyPassType && (
                        <div className="ft-pass-type-chips">
                          {CONFIG.PASS_TYPES.map(pt=>(
                            <button key={pt.key} type="button" className={`ft-pay-chip${buyPassType===pt.key?" is-active":""}`}
                              style={{flex:1}} onClick={()=>{setBuyPassType(pt.key);set("amount",String(pt.amount));}}>
                              <div style={{fontWeight:600}}>{pt.label}</div>
                              <div style={{fontSize:11,opacity:.7}}>₹{pt.amount} · {pt.durationDays}d</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount */}
                  {!usingPass && <div style={{marginTop:14}}>
                    <label className="field-label">{buyPassType?"Pass Amount":isPlayArea?"Playtime Amount":"Amount"} {errors.amount && <span className="err-msg">{errors.amount}</span>}</label>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontWeight:700,color:C.textMid}}>₹</span>
                      <input className={`fld${errors.amount?" is-error":""}`}
                        value={form.amount}
                        type="tel" inputMode="numeric" placeholder="300"
                        style={{paddingLeft:28,fontSize:18,fontWeight:700}}
                        onChange={e=>set("amount",e.target.value.replace(/\D/g,""))} />
                    </div>
                    {!buyPassType && isPlayArea && form.numKids>1 && <div className="ft-form-helper">{form.numKids} kids x ₹{computeAmountForHours(form.hours)} per kid</div>}
                  </div>}

                  {/* Amount disabled for pass users */}
                  {usingPass && <div style={{marginTop:14}}>
                    <label className="field-label">Amount</label>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontWeight:700,color:C.textMid}}>₹</span>
                      <input className="fld" value="0" type="tel" readOnly
                        style={{paddingLeft:28,fontSize:18,fontWeight:700,opacity:.5,background:"var(--ft-accent-soft)"}} />
                    </div>
                  </div>}

                  {/* Payment */}
                  {!usingPass && <div style={{marginTop:18}}>
                    <div className="ft-form-section-label">Payment</div>
                    <label className="field-label">{buyPassType ? "Pass paid via" : "Playtime paid via"} {errors.playMop && <span className="err-msg">{errors.playMop}</span>}</label>
                    <div className="ft-pay-chips">
                      {[{value:"UPI",label:"UPI"},{value:"Cash",label:"Cash"},{value:"UPI + Cash",label:"Split"}].map(o=>(
                        <button key={o.value} type="button" className={`ft-pay-chip${form.playMop===o.value?" is-active":""}`}
                          onClick={()=>{
                            set("playMop",o.value);
                            if(o.value!=="UPI + Cash"){set("playUpiAmount","");set("playCashAmount","");}
                          }}>{o.label}</button>
                      ))}
                    </div>

                    {/* Split amounts */}
                    {form.playMop==="UPI + Cash" && (
                      <div className="ft-split-row">
                        <div>
                          <div className="ft-split-label">UPI</div>
                          <div style={{position:"relative"}}>
                            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:600,color:C.textMid,fontSize:12}}>₹</span>
                            <input className="fld" value={form.playUpiAmount} type="tel" inputMode="numeric" placeholder="0"
                              style={{paddingLeft:26,height:40,fontSize:13.5,fontWeight:600}}
                              onChange={e=>{
                                const v=e.target.value.replace(/\D/g,"");
                                const playAmt=parseInt(form.amount)||0;
                                set("playUpiAmount",v);
                                set("playCashAmount",String(Math.max(0,playAmt-(parseInt(v)||0))));
                              }} />
                          </div>
                        </div>
                        <div>
                          <div className="ft-split-label">Cash</div>
                          <div style={{position:"relative"}}>
                            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:600,color:C.textMid,fontSize:12}}>₹</span>
                            <input className="fld" value={form.playCashAmount} type="tel" inputMode="numeric" placeholder="0"
                              style={{paddingLeft:26,height:40,fontSize:13.5,fontWeight:600}}
                              onChange={e=>{
                                const v=e.target.value.replace(/\D/g,"");
                                const playAmt=parseInt(form.amount)||0;
                                set("playCashAmount",v);
                                set("playUpiAmount",String(Math.max(0,playAmt-(parseInt(v)||0))));
                              }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>}

                  {/* Bill summary card */}
                  <div className="ft-bill-card">
                    {usingPass ? <>
                      <div className="ft-bill-line">
                        <span>Playtime · {formatHoursLabel(form.hours)}{form.numKids>1?` × ${form.numKids} kids`:""}</span>
                        <span style={{textDecoration:"line-through",opacity:.5}}>₹{(parseInt(form.amount)||0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="ft-bill-line" style={{color:"#a3f7bf"}}>
                        <span>🎫 Pass applied</span>
                        <span>₹0</span>
                      </div>
                      {activePass && activePass.hours_remaining != null && <div className="ft-bill-line" style={{opacity:.7}}>
                        <span>Hours after this visit</span>
                        <span>{Math.max(0,parseFloat((activePass.hours_remaining - (parseFloat(form.hours)||1)*form.numKids).toFixed(1)))}h</span>
                      </div>}
                    </> : buyPassType && buyPassMeta ? <>
                      <div className="ft-bill-line">
                        <span>🎫 {buyPassMeta.label} Pass</span>
                        <span>₹{(parseInt(form.amount)||0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="ft-bill-line" style={{opacity:.7}}>
                        <span>First visit · {formatHoursLabel(form.hours)}{form.numKids>1?` × ${form.numKids} kids`:""}</span>
                        <span>included</span>
                      </div>
                      {buyPassMeta.hours != null && <div className="ft-bill-line" style={{opacity:.7}}>
                        <span>Hours after this visit</span>
                        <span>{Math.max(0,parseFloat((buyPassMeta.hours - (parseFloat(form.hours)||1)*form.numKids).toFixed(1)))}h</span>
                      </div>}
                    </> : <div className="ft-bill-line">
                      <span>Playtime · {formatHoursLabel(form.hours)}{form.numKids>1?` × ${form.numKids} kids`:""}</span>
                      <span>₹{(parseInt(form.amount)||0).toLocaleString("en-IN")}</span>
                    </div>}
                    {socksCharge > 0 && <div className="ft-bill-line">
                      <span>Socks · {form.sockCount||0} pair{(form.sockCount||0)!==1?"s":""}</span>
                      <span>₹{socksCharge.toLocaleString("en-IN")}</span>
                    </div>}
                    <div className="ft-bill-total">
                      <span>Total</span>
                      <span>₹{(usingPass ? socksCharge : totalAmount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              </div>{/* end desktop-grid */}
            </div>

            {/* Pinned submit footer */}
            <div className="ft-form-footer">
              <div className="ft-form-footer-total">
                <span className="label">{usingPass ? "Pass" : buyPassType ? "Pass" : "Total"}</span>
                <span className="value">₹{(usingPass ? socksCharge : totalAmount).toLocaleString("en-IN")}</span>
              </div>
              {!editTarget && <button className="ft-btn-outline" disabled={saving}
                onClick={async()=>{
                  await submitEntry();
                  setTimeout(()=>{setFormState(prev=>({...getDefaultForm(),phone:prev.phone,date:prev.date}));setShowSuccess(false);setErrors({});},100);
                }}>
                Save & add another
              </button>}
              <button className={editTarget?"ft-btn-primary ft-btn-primary--lg":"ft-btn-start"} disabled={saving}
                onClick={editTarget ? handleUpdateSubmit : submitEntry}>
                {editTarget ? "Update entry" : "Start playtime"}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Tab Bar (mobile) ── */}
      {screen === "home" && (
        <nav className="ft-tabs">
          <button className={`ft-tab${tab==="today"?" ft-tab--active":""}`} onClick={()=>switchTab("today")}>
            <TabIconToday active={tab==="today"} />
            <span>Today</span>
          </button>
          <button className={`ft-tab${tab==="entries"?" ft-tab--active":""}`} onClick={()=>switchTab("entries")}>
            <TabIconEntries active={tab==="entries"} />
            <span>Entries</span>
          </button>
          <button className={`ft-tab${tab==="birthdays"?" ft-tab--active":""}`} onClick={()=>switchTab("birthdays")}>
            <TabIconBirthdays active={tab==="birthdays"} />
            <span>Birthdays</span>
          </button>
          <button className={`ft-tab${tab==="more"?" ft-tab--active":""}`} onClick={()=>setMoreOpen(!moreOpen)}>
            <TabIconMore active={tab==="more"} />
            <span>More</span>
          </button>
        </nav>
      )}

      {/* ── More menu (bottom sheet) ── */}
      {moreOpen && <>
        <div style={{position:"fixed",inset:0,zIndex:90,background:"rgba(0,0,0,.3)"}} onClick={()=>setMoreOpen(false)} />
        <div className="ft-more-menu ft-more-menu--bottom">
          {[
            {key:"cash-register",icon:"💰",label:"Cash Register"},
            {key:"expenses",icon:"📊",label:"Profit / Loss"},
            {key:"staff",icon:"👥",label:"Staff & Salary"},
            {key:"attendance",icon:"📋",label:"Attendance"},
          ].map(item => (
            <button key={item.key} className={`ft-more-item${section===item.key?" ft-more-item--active":""}`}
              onClick={()=>switchSection(item.key)}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      </>}

      {/* ══════════ POPUPS ══════════ */}

      {/* Enquiry */}
      {enquiry && <div className="ft-confirm-overlay" onClick={()=>!enquirySaving&&setEnquiry(null)}>
        <div className="ft-confirm-dialog" style={{maxWidth:460,textAlign:"left"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15}}>Birthday enquiry</span>
            <button className="ft-entry-act-btn" onClick={()=>setEnquiry(null)} disabled={enquirySaving}>✕</button>
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
            <InputField label="Kid's DOB" icon="🎂">
              <input className="fld" value={enquiry.dob} type="date" onChange={e=>setEnquiry({...enquiry,dob:e.target.value})} />
            </InputField>
            <InputField label="Preferred Party Date" icon="📅">
              <input className="fld" value={enquiry.preferredDate} type="date" onChange={e=>setEnquiry({...enquiry,preferredDate:e.target.value})} />
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
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="ft-btn-secondary" onClick={()=>setEnquiry(null)} disabled={enquirySaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="ft-btn-primary" onClick={saveEnquiry} disabled={enquirySaving} style={{flex:1}}>
              {enquirySaving?"Saving...":"Save enquiry"}
            </button>
          </div>
        </div>
      </div>}

      {/* Expense */}
      {expensePopup && <div className="ft-confirm-overlay" onClick={()=>!expenseSaving&&setExpensePopup(null)}>
        <div className="ft-confirm-dialog" style={{maxWidth:400,textAlign:"left"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15}}>New Expense</span>
            <button className="ft-entry-act-btn" onClick={()=>setExpensePopup(null)} disabled={expenseSaving}>✕</button>
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
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="ft-btn-secondary" onClick={()=>setExpensePopup(null)} disabled={expenseSaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="ft-btn-primary" onClick={handleSaveExpense} disabled={expenseSaving} style={{flex:1}}>
              {expenseSaving?"Saving...":"Save expense"}
            </button>
          </div>
        </div>
      </div>}

      {/* Monthly Expense */}
      {monthlyExpPopup && <div className="ft-confirm-overlay" onClick={()=>!monthlyExpSaving&&setMonthlyExpPopup(null)}>
        <div className="ft-confirm-dialog" style={{maxWidth:400,textAlign:"left"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:15}}>Monthly Expense</span>
            <button className="ft-entry-act-btn" onClick={()=>setMonthlyExpPopup(null)} disabled={monthlyExpSaving}>✕</button>
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
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="ft-btn-secondary" onClick={()=>setMonthlyExpPopup(null)} disabled={monthlyExpSaving} style={{flex:"0 0 90px"}}>Cancel</button>
            <button className="ft-btn-primary" onClick={handleSaveMonthlyExpense} disabled={monthlyExpSaving} style={{flex:1}}>
              {monthlyExpSaving?"Saving...":"Save expense"}
            </button>
          </div>
        </div>
      </div>}

      {/* Staff Popup */}
      {staffPopup && <StaffFormPopup
        staff={staffPopup.id ? staffPopup : null}
        onSave={handleAddStaff}
        onCancel={()=>setStaffPopup(null)}
        saving={staffSaving} />}

      {/* Confirm Dialog */}
      {confirmAction && <ConfirmDialog
        message={confirmAction.message}
        needsPassword={confirmAction.needsPassword}
        confirmLabel={confirmAction.confirmLabel}
        onConfirm={()=>{confirmAction.onConfirm();setConfirmAction(null);}}
        onCancel={()=>setConfirmAction(null)} />}

    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
