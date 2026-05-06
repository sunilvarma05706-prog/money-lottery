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
const ADMIN      = { username: "admin", passwordHash: bcrypt.hashSync("admin123", 10) };

// ─── Time slots 10:00→23:00 every 30 min ─────────────────────────────────────
function generateTimeSlots() {
  const slots = [];
  for (let m = 600; m <= 1380; m += 30) {
    const h = Math.floor(m/60), mm = m%60;
    const hh = String(h).padStart(2,"0"), mmm = String(mm).padStart(2,"0");
    const h12 = h>12 ? h-12 : h===0 ? 12 : h;
    slots.push({ value:`${hh}:${mmm}`, label:`${String(h12).padStart(2,"0")}:${mmm} ${h>=12?"PM":"AM"}` });
  }
  return slots;
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
function loadWb(){
  return fs.existsSync(EXCEL_FILE) ? XLSX.readFile(EXCEL_FILE) : XLSX.utils.book_new();
}
function saveWb(wb){ XLSX.writeFile(wb, EXCEL_FILE); }

function getYearRows(year){
  const wb = loadWb();
  if (!wb.SheetNames.includes(String(year))) return [];
  return XLSX.utils.sheet_to_json(wb.Sheets[String(year)], { defval:"" });
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
    const dc=a["Date"].localeCompare(b["Date"]);
    return dc!==0?dc:a["Time Slot"].localeCompare(b["Time Slot"]);
  });
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  ws["!cols"] = COL_W;
  if (wb.SheetNames.includes(sn)) wb.Sheets[sn]=ws;
  else XLSX.utils.book_append_sheet(wb, ws, sn);
  saveWb(wb);
}

function deleteEntry(year, dateKey, slotValue){
  const wb=loadWb(); const sn=String(year);
  if (!wb.SheetNames.includes(sn)) return;
  let rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
  rows=rows.filter(r=>!(r["Date"]===dateKey&&r["Time Slot"]===slotValue));
  const ws=XLSX.utils.json_to_sheet(rows,{header:HEADERS});
  ws["!cols"]=COL_W; wb.Sheets[sn]=ws; saveWb(wb);
}

function clearDate(year, dateKey){
  const wb=loadWb(); const sn=String(year);
  if (!wb.SheetNames.includes(sn)) return;
  let rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
  rows=rows.filter(r=>r["Date"]!==dateKey);
  const ws=XLSX.utils.json_to_sheet(rows,{header:HEADERS});
  ws["!cols"]=COL_W; wb.Sheets[sn]=ws; saveWb(wb);
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
  res.json({ dateKey,year,timeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
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
  const dates=[...new Set(rows.map(r=>r["Date"]))].sort((a,b)=>b.localeCompare(a));
  res.json({ year:req.params.year, dates });
});

// Data for a year (optionally filtered by ?date=DD-Mon-YYYY), paginated
app.get("/api/public/data/:year", (req,res)=>{
  const { date, page=1, limit=50 } = req.query;
  let rows=getYearRows(req.params.year);
  if (date) rows=rows.filter(r=>r["Date"]===date);
  rows=rows.slice().reverse(); // newest first
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
  const num=parseInt(number);
  if (isNaN(num)||num<0||num>99) return res.status(400).json({error:"Number 0-99"});
  const slotObj=TIME_SLOTS.find(s=>s.value===slotValue);
  if (!slotObj) return res.status(400).json({error:"Invalid slot"});

  const now=new Date(); const dateKey=getDateKey(now); const year=getYear(now);
  const newRow={
    "Date":dateKey, "Time Slot":slotValue, "Display Time":slotObj.label,
    "Number":num, "Special":special?"Yes":"No", "Posted At":fmtPostedAt(now)
  };
  upsertEntry(year,dateKey,newRow);
  const todayRows=getDateRows(year,dateKey);
  const active=getCurrentSlot();
  const curNum=active?getSlotNumber(year,dateKey,active.value):null;
  io.emit("update",{ dateKey,year,slotValue,number:num,special:special||false,
    activeSlot:active,currentNumber:curNum,rows:todayRows,slotMap:buildSlotMap(todayRows) });
  res.json({ success:true, row:newRow });
});

app.delete("/api/number/:slot", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  deleteEntry(yr,dk,req.params.slot);
  const rows=getDateRows(yr,dk); const active=getCurrentSlot();
  const curNum=active?getSlotNumber(yr,dk,active.value):null;
  io.emit("update",{dateKey:dk,year:yr,activeSlot:active,currentNumber:curNum,
    rows,slotMap:buildSlotMap(rows)});
  res.json({ success:true });
});

app.delete("/api/today", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  clearDate(yr,dk);
  io.emit("update",{dateKey:dk,year:yr,activeSlot:getCurrentSlot(),
    currentNumber:null,rows:[],slotMap:{}});
  res.json({ success:true });
});

app.get("/api/admin/today", auth, (req,res)=>{
  const now=new Date(); const dk=getDateKey(now); const yr=getYear(now);
  const rows=getDateRows(yr,dk); const active=getCurrentSlot();
  const curNum=active?getSlotNumber(yr,dk,active.value):null;
  res.json({ dateKey:dk,year:yr,timeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
    activeSlot:active,currentNumber:curNum,rows });
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
  socket.emit("init",{ dateKey:dk,year:yr,timeSlots:TIME_SLOTS,slotMap:buildSlotMap(rows),
    activeSlot:active,currentNumber:curNum,rows });
  socket.on("disconnect",()=>{});
});

server.listen(PORT,()=>{
  console.log(`\n💰 Money Lottery v3 → http://localhost:${PORT}`);
  console.log(`📊 Excel: ${EXCEL_FILE}`);
  console.log(`📥 Download: http://localhost:${PORT}/api/download/excel\n`);
});
