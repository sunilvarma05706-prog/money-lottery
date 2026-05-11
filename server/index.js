process.env.TZ = "Asia/Kolkata";

const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const cors     = require("cors");
const jwt      = require("jsonwebtoken");
const bcrypt   = require("bcryptjs");
const XLSX     = require("xlsx");
const path     = require("path");
const fs       = require("fs");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*", methods: ["GET","POST","DELETE"] } });

app.use(cors());
app.use(express.json());

const PORT       = process.env.PORT || 5000;
const JWT_SECRET = "money_lottery_v3_secret";
const EXCEL_FILE = path.join(__dirname, "lottery_data.xlsx");
const PENDING_FILE = path.join(__dirname, "pending_entries.json");
const ADMIN      = { username: "admin", passwordHash: bcrypt.hashSync("admin123", 10) };

function loadPending(){
  return fs.existsSync(PENDING_FILE) ? JSON.parse(fs.readFileSync(PENDING_FILE)) : [];
}
function savePending(arr){
  fs.writeFileSync(PENDING_FILE, JSON.stringify(arr, null, 2));
}

// ─── Scheduled Publishing ──────────────────────────────────────────────────────
setInterval(() => {
  try {
    let pending = loadPending();
    if (pending.length === 0) return;
    const now = new Date();
    const currentMinutes = now.getHours()*60 + now.getMinutes();
    const dk = getDateKey(now);
    const yr = getYear(now);
    let changed = false;
    let newPending = [];
    
    for (let r of pending) {
      if (r["Date"] !== dk) {
        upsertEntry(r["Date"].split("-")[2], r["Date"], r);
        changed = true;
        continue;
      }
      const [sh,sm] = r["Time Slot"].split(":").map(Number);
      if (sh*60+sm <= currentMinutes) {
        upsertEntry(yr, dk, r);
        changed = true;
      } else {
        newPending.push(r);
      }
    }
    
    if (changed) {
      savePending(newPending);
      const todayRows = getDateRows(yr,dk);
      const active = getCurrentSlot();
      const curNum = active ? getSlotNumber(yr,dk,active.value) : null;
      io.emit("update",{ dateKey:dk, year:yr, activeSlot:active, currentNumber:curNum, rows:todayRows, slotMap:buildSlotMap(todayRows) });
    }
  } catch (err) {
    console.error("Interval Error:", err.message);
  }
}, 10000);

// ─── Time slots 10:07→22:07 every 30 min ─────────────────────────────────────
function generateTimeSlots() {
  const slots = [];
  for (let m = 605; m <= 1325; m += 30) {
    const h = Math.floor(m/60), mm = m%60;
    const hh = String(h).padStart(2,"0"), mmm = String(mm).padStart(2,"0");
    const h12 = h>12 ? h-12 : h===0 ? 12 : h;
    slots.push({ value:`${hh}:${mmm}`, label:`${String(h12).padStart(2,"0")}:${mmm} ${h>=12?"PM":"AM"}` });
  }
  return slots;
}

// ─── Get slots visible up to current time ────────────────────────────────────
function getVisibleSlots(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return TIME_SLOTS.filter(s => {
    const [sh, sm] = s.value.split(":").map(Number);
    return sh * 60 + sm <= currentMinutes;
  });
}
const TIME_SLOTS = generateTimeSlots();
const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HEADERS    = ["Date","Time Slot","Display Time","Number","Special","Posted At"];
const COL_W      = [{wch:14},{wch:12},{wch:14},{wch:10},{wch:10},{wch:22}];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDateKey(d=new Date()){
  return `${String(d.getDate()).padStart(2,"0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
function getYear(d=new Date()){ return String(d.getFullYear()); }
function fmtPostedAt(d){
  return d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",
    hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
let cachedWb = null;
let cachedJson = {};

function invalidateCache(sn) {
  if (sn) delete cachedJson[sn];
  else cachedJson = {};
}

function loadWb(){
  if (cachedWb) return cachedWb;
  try {
    cachedWb = fs.existsSync(EXCEL_FILE) ? XLSX.readFile(EXCEL_FILE) : XLSX.utils.book_new();
    cachedJson = {};
    return cachedWb;
  } catch (e) {
    console.error(e);
    throw new Error("Cannot read excel file. Please close if open.");
  }
}
function saveWb(wb, snChanged){ 
  try {
    XLSX.writeFile(wb, EXCEL_FILE); 
    cachedWb = wb;
    if (snChanged) invalidateCache(snChanged);
  } catch (e) {
    console.error(e);
    if (e.code === 'EBUSY' || e.message.includes('EBUSY')) {
      throw new Error("Excel file is open. Please close lottery_data.xlsx and try again.");
    }
    throw new Error("Error saving excel file.");
  }
}

function parseDateKey(dk) {
  if (!dk || typeof dk !== 'string') return 0;
  const m = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
  const parts = dk.split('-');
  if(parts.length!==3) return 0;
  return new Date(parseInt(parts[2]), m[parts[1]], parseInt(parts[0])).getTime();
}

function getYearRows(year){
  const sn = String(year);
  if (cachedJson[sn]) return cachedJson[sn];
  const wb = loadWb();
  if (!wb.SheetNames.includes(sn)) return [];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval:"" });
  cachedJson[sn] = rows;
  return rows;
}
function getDateRows(year, dateKey){
  return getYearRows(year).filter(r => r["Date"]===dateKey);
}
function buildSlotMap(rows){
  const m={};
  rows.forEach(r=>{ m[r["Time Slot"]]=r; });
  return m;
}

function upsertEntry(year, dateKey, newRow){
  const wb = loadWb();
  const sn = String(year);
  let rows = [];
  if (wb.SheetNames.includes(sn)){
    rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval:"" });
    rows = rows.filter(r=>!(r["Date"]===dateKey && r["Time Slot"]===newRow["Time Slot"]));
  }
  rows.push(newRow);
  rows.sort((a,b)=>{
    const dtA = parseDateKey(a["Date"]);
    const dtB = parseDateKey(b["Date"]);
    if (dtA !== dtB) return dtB - dtA; // newest date first
    const tsA = a["Time Slot"] || "";
    const tsB = b["Time Slot"] || "";
    return tsB.localeCompare(tsA); // newest slots top in the same day
  });
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  ws["!cols"] = COL_W;
  if (wb.SheetNames.includes(sn)) wb.Sheets[sn]=ws;
  else XLSX.utils.book_append_sheet(wb, ws, sn);
  saveWb(wb, sn);
}

function deleteEntry(year, dateKey, slotValue){
  const wb=loadWb(); const sn=String(year);
  if (!wb.SheetNames.includes(sn)) return;
  let rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
  rows=rows.filter(r=>!(r["Date"]===dateKey&&r["Time Slot"]===slotValue));
  const ws=XLSX.utils.json_to_sheet(rows,{header:HEADERS});
  ws["!cols"]=COL_W; wb.Sheets[sn]=ws; saveWb(wb, sn);
}

function clearDate(year, dateKey){
  const wb=loadWb(); const sn=String(year);
  if (!wb.SheetNames.includes(sn)) return;
  let rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
  rows=rows.filter(r=>r["Date"]!==dateKey);
  const ws=XLSX.utils.json_to_sheet(rows,{header:HEADERS});
  ws["!cols"]=COL_W; wb.Sheets[sn]=ws; saveWb(wb, sn);
}

function getSlotNumber(year, dateKey, slotValue){
  const row=getDateRows(year,dateKey).find(r=>r["Time Slot"]===slotValue);
  return row ? row["Number"] : null;
}

function getCurrentSlot(){
  const now=new Date(); const total=now.getHours()*60+now.getMinutes();
  let active=null;
  for (const s of TIME_SLOTS){
    const [sh,sm]=s.value.split(":").map(Number);
    if (total>=sh*60+sm) active=s; else break;
  }
  return active;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
function auth(req,res,next){
  const h=req.headers.authorization;
  if (!h) return res.status(401).json({error:"No token"});
  try { req.user=jwt.verify(h.split(" ")[1],JWT_SECRET); next(); }
  catch { res.status(401).json({error:"Invalid token"}); }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Today live data
app.get("/api/today", (req,res)=>{
  const now=new Date(); const dateKey=getDateKey(now); const year=getYear(now);
  const rows=getDateRows(year,dateKey); const active=getCurrentSlot();
  const curNum=active?getSlotNumber(year,dateKey,active.value):null;
  const visibleSlots=getVisibleSlots(now);
  res.json({ dateKey,year,timeSlots:visibleSlots,allTimeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
    activeSlot:active,currentNumber:curNum,rows });
});

// Available years
app.get("/api/public/years", (req,res)=>{
  const wb=loadWb();
  const years=wb.SheetNames.filter(n=>/^\d{4}$/.test(n)).sort((a,b)=>b-a);
  res.json({ years });
});

// All unique dates in a year (newest first)
app.get("/api/public/dates/:year", (req,res)=>{
  const rows=getYearRows(req.params.year);
  const dates=[...new Set(rows.map(r=>r["Date"]))].sort((a,b)=>parseDateKey(b)-parseDateKey(a));
  res.json({ year:req.params.year, dates });
});

// Data for a year (optionally filtered by ?date=DD-Mon-YYYY), paginated
app.get("/api/public/data/:year", (req,res)=>{
  const { date, page=1, limit=50 } = req.query;
  let rows=getYearRows(req.params.year);
  
  rows.sort((a,b)=>{
    const dtA = parseDateKey(a["Date"]);
    const dtB = parseDateKey(b["Date"]);
    if (dtA !== dtB) return dtB - dtA;
    const tsA = a["Time Slot"] || "";
    const tsB = b["Time Slot"] || "";
    return tsB.localeCompare(tsA);
  });
  
  if (date) rows=rows.filter(r=>r["Date"]===date);
  const total=rows.length;
  const pg=Math.max(1,parseInt(page));
  const sz=Math.min(500,parseInt(limit));
  const paged=rows.slice((pg-1)*sz, (pg-1)*sz+sz);
  res.json({ year:req.params.year, date:date||null, total, page:pg,
    totalPages:Math.ceil(total/sz), rows:paged });
});

// Stats summary
app.get("/api/public/stats", (req,res)=>{
  const wb=loadWb();
  const years=wb.SheetNames.filter(n=>/^\d{4}$/.test(n)).sort();
  const stats=years.map(y=>{
    const rows=getYearRows(y);
    const dates=new Set(rows.map(r=>r["Date"]));
    return { year:y, totalEntries:rows.length, totalDays:dates.size };
  });
  res.json({ stats });
});

// Download Excel
app.get("/api/download/excel", (req,res)=>{
  if (!fs.existsSync(EXCEL_FILE)) return res.status(404).json({error:"Not found"});
  res.download(EXCEL_FILE, "MoneyLottery_AllData.xlsx");
});

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════════

app.post("/api/login", (req,res)=>{
  const {username,password}=req.body;
  if (username!==ADMIN.username||!bcrypt.compareSync(password,ADMIN.passwordHash))
    return res.status(401).json({error:"Invalid credentials"});
  res.json({ token:jwt.sign({username},JWT_SECRET,{expiresIn:"12h"}) });
});

app.post("/api/number", auth, (req,res)=>{
  const {slotValue,number,special}=req.body;
  if (!slotValue) return res.status(400).json({error:"Slot required"});
  
  let validNum = number;
  if (number !== "Holiday") {
    const num=parseInt(number);
    if (isNaN(num)||num<0||num>99) return res.status(400).json({error:"Number 0-99 or Holiday"});
    validNum = num;
  }
  
  const slotObj=TIME_SLOTS.find(s=>s.value===slotValue);
  if (!slotObj) return res.status(400).json({error:"Invalid slot"});

  const now=new Date(); const dateKey=getDateKey(now); const year=getYear(now);
  const newRow={
    "Date":dateKey, "Time Slot":slotValue, "Display Time":slotObj.label,
    "Number":validNum, "Special":(special && validNum !== "Holiday")?"Yes":"No", "Posted At":fmtPostedAt(now)
  };
  
  const [sh,sm] = slotValue.split(":").map(Number);
  const currentMinutes = now.getHours()*60 + now.getMinutes();

  if (sh*60+sm <= currentMinutes) {
    upsertEntry(year,dateKey,newRow);
    let pending = loadPending();
    pending = pending.filter(r => !(r["Date"]===dateKey && r["Time Slot"]===slotValue));
    savePending(pending);
    
    const todayRows=getDateRows(year,dateKey);
    const active=getCurrentSlot();
    const curNum=active?getSlotNumber(year,dateKey,active.value):null;
    io.emit("update",{ dateKey,year,slotValue,number:validNum,special:newRow["Special"]==="Yes",
      activeSlot:active,currentNumber:curNum,rows:todayRows,slotMap:buildSlotMap(todayRows) });
    res.json({ success:true, row:newRow, status:'live' });
  } else {
    let pending = loadPending();
    pending = pending.filter(r => !(r["Date"]===dateKey && r["Time Slot"]===slotValue));
    pending.push(newRow);
    savePending(pending);
    res.json({ success:true, row:newRow, status:'scheduled' });
  }
});

app.delete("/api/number/:slot", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  deleteEntry(yr,dk,req.params.slot);
  
  let pending = loadPending();
  pending = pending.filter(r => !(r["Date"]===dk && r["Time Slot"]===req.params.slot));
  savePending(pending);
  
  const rows=getDateRows(yr,dk); const active=getCurrentSlot();
  const curNum=active?getSlotNumber(yr,dk,active.value):null;
  io.emit("update",{dateKey:dk,year:yr,activeSlot:active,currentNumber:curNum,
    rows,slotMap:buildSlotMap(rows)});
  res.json({ success:true });
});

app.delete("/api/today", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  clearDate(yr,dk);
  
  let pending = loadPending();
  pending = pending.filter(r => r["Date"]!==dk);
  savePending(pending);

  io.emit("update",{dateKey:dk,year:yr,activeSlot:getCurrentSlot(),
    currentNumber:null,rows:[],slotMap:{}});
  res.json({ success:true });
});

app.get("/api/admin/today", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  let rows=getDateRows(yr,dk); 
  
  const pending = loadPending().filter(r => r["Date"]===dk);
  const pendingMap = buildSlotMap(pending);
  rows = rows.filter(r => !pendingMap[r["Time Slot"]]).concat(pending);
  rows.sort((a,b) => {
    const tsA = a["Time Slot"] || "";
    const tsB = b["Time Slot"] || "";
    return tsB.localeCompare(tsA);
  });
  
  const active=getCurrentSlot();
  const curNum=active?getSlotNumber(yr,dk,active.value):null;
  res.json({ dateKey:dk,year:yr,timeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
    activeSlot:active,currentNumber:curNum,rows,pending });
});

app.post("/api/change-password", auth, (req,res)=>{
  const {newPassword}=req.body;
  if (!newPassword||newPassword.length<6) return res.status(400).json({error:"Min 6 chars"});
  ADMIN.passwordHash=bcrypt.hashSync(newPassword,10);
  res.json({ success:true });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════════════════════════════════════════════
io.on("connection", socket=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  const rows=getDateRows(yr,dk); const active=getCurrentSlot();
  const curNum=active?getSlotNumber(yr,dk,active.value):null;
  const vs=getVisibleSlots(now);
  socket.emit("init",{ dateKey:dk,year:yr,timeSlots:vs,allTimeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
    activeSlot:active,currentNumber:curNum,rows });
  socket.on("disconnect",()=>{});
});

app.use((err, req, res, next) => {
  console.error("API Error:", err.message);
  res.status(500).json({ error: err.message });
});

server.listen(PORT,()=>{
  console.log(`\n💰 Money Lottery v3 → http://localhost:${PORT}`);
  console.log(`📊 Excel: ${EXCEL_FILE}`);
  console.log(`📥 Download: http://localhost:${PORT}/api/download/excel\n`);
});
