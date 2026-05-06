const XLSX = require("xlsx");
const path = require("path");
const EXCEL_FILE = path.join(__dirname, "lottery_data.xlsx");

function rand(a, b) { return Math.floor(Math.random()*(b-a+1))+a; }
function pickSpecial() { return Math.random() < 0.12 ? "Yes" : "No"; }

function makeSlots() {
  const slots = [];
  for (let m = 605; m <= 1325; m += 30) {
    const h = Math.floor(m / 60), mm = m % 60;
    const hh = String(h).padStart(2,"0"), mmm = String(mm).padStart(2,"0");
    const h12 = h > 12 ? h-12 : h===0 ? 12 : h;
    const ap  = h >= 12 ? "PM" : "AM";
    slots.push({ value:`${hh}:${mmm}`, label:`${String(h12).padStart(2,"0")}:${mmm} ${ap}` });
  }
  return slots;
}
const SLOTS = makeSlots();

const wb = XLSX.readFile(EXCEL_FILE);
const sheetName = "2026";
let rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:"" });

const dateStr = "06-May-2026";

function fmtPostedAt(d) {
  return d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",
    hour:"2-digit",minute:"2-digit",second:"2-digit"});
}

const newRows = [];
for (const slot of SLOTS) {
  const [sh,sm] = slot.value.split(":").map(Number);
  const postedAt = new Date(2026, 4, 6, sh, sm, rand(0,59));
  newRows.push({
    "Date"        : dateStr,
    "Time Slot"   : slot.value,
    "Display Time": slot.label,
    "Number"      : rand(1, 99),
    "Special"     : pickSpecial(),
    "Posted At"   : fmtPostedAt(postedAt)
  });
}

rows = rows.filter(r => r["Date"] !== dateStr);
rows.push(...newRows);

rows.sort((a,b)=>{
  const pA = a["Date"].split("-");
  const pB = b["Date"].split("-");
  const mA = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
  const dta = new Date(parseInt(pA[2]), mA[pA[1]], parseInt(pA[0])).getTime();
  const dtb = new Date(parseInt(pB[2]), mA[pB[1]], parseInt(pB[0])).getTime();
  if (dta !== dtb) return dtb - dta;
  const tsA = a["Time Slot"] || "";
  const tsB = b["Time Slot"] || "";
  return tsB.localeCompare(tsA); 
});

const HEADERS = ["Date","Time Slot","Display Time","Number","Special","Posted At"];
const COL_W   = [{wch:14},{wch:12},{wch:14},{wch:10},{wch:10},{wch:22}];

const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
ws["!cols"] = COL_W;
wb.Sheets[sheetName] = ws;

XLSX.writeFile(wb, EXCEL_FILE);
console.log("Dummy data for May 6th, 2026 has been added and Excel sorted (descending by Time Slot).");
