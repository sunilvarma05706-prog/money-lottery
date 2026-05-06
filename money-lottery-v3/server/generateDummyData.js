/**
 * generateDummyData.js
 * Run once:  node generateDummyData.js
 * Generates dummy lottery results for 2022-2026 (up to 12-Apr-2026 18:00)
 * Structure: one sheet per YEAR, columns = Date | Time Slot | Display | Number | Special | Posted At
 */

const XLSX = require("xlsx");
const path = require("path");

const EXCEL_FILE = path.join(__dirname, "lottery_data.xlsx");

// ─── Time slots 10:00→23:00 every 30 min ────────────────────────────────────
function makeSlots() {
  const slots = [];
  for (let m = 600; m <= 1380; m += 30) {
    const h = Math.floor(m / 60), mm = m % 60;
    const hh = String(h).padStart(2,"0"), mmm = String(mm).padStart(2,"0");
    const h12 = h > 12 ? h-12 : h===0 ? 12 : h;
    const ap  = h >= 12 ? "PM" : "AM";
    slots.push({ value:`${hh}:${mmm}`, label:`${String(h12).padStart(2,"0")}:${mmm} ${ap}` });
  }
  return slots;
}
const SLOTS = makeSlots(); // 27 slots

// ─── Random helpers ──────────────────────────────────────────────────────────
function rand(a, b) { return Math.floor(Math.random()*(b-a+1))+a; }
function pickSpecial() { return Math.random() < 0.12 ? "Yes" : "No"; }
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,"0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
function fmtPostedAt(d) {
  return d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",
    hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
function isLeap(y) { return (y%4===0&&y%100!==0)||(y%400===0); }
function daysInMonth(y,m) {
  return [31,isLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m];
}

// ─── Generate all days in a year (up to optional cutoff date+hour) ───────────
function genYear(year, cutoffDate, cutoffHour) {
  const rows = [];
  for (let month = 0; month < 12; month++) {
    const days = daysInMonth(year, month);
    for (let day = 1; day <= days; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = fmtDate(dateObj);
      // check cutoff
      if (cutoffDate) {
        if (dateObj > cutoffDate) break;
      }
      for (const slot of SLOTS) {
        // For cutoff day, only include slots up to cutoffHour
        if (cutoffDate && dateObj.getTime()===cutoffDate.getTime()) {
          const slotH = parseInt(slot.value.split(":")[0]);
          if (slotH > cutoffHour) continue;
        }
        // Simulate "posted" time = that date at slot time + rand seconds
        const [sh,sm] = slot.value.split(":").map(Number);
        const postedAt = new Date(year, month, day, sh, sm, rand(0,59));
        rows.push({
          "Date"        : dateStr,
          "Time Slot"   : slot.value,
          "Display Time": slot.label,
          "Number"      : rand(1, 99),
          "Special"     : pickSpecial(),
          "Posted At"   : fmtPostedAt(postedAt)
        });
      }
    }
    // if cutoff, check if we already broke out
    if (cutoffDate && new Date(year, month+1, 1) > cutoffDate) break;
  }
  return rows;
}

// ─── Build workbook ──────────────────────────────────────────────────────────
console.log("💰 Generating Money Lottery dummy data...");
console.time("Done in");

const wb = XLSX.utils.book_new();

const HEADERS = ["Date","Time Slot","Display Time","Number","Special","Posted At"];
const COL_W   = [{wch:14},{wch:12},{wch:14},{wch:10},{wch:10},{wch:22}];

// 2022 – 2025: full years
for (const year of [2022,2023,2024,2025]) {
  console.log(`  Generating ${year}...`);
  const rows = genYear(year, null, null);
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  ws["!cols"] = COL_W;
  XLSX.utils.book_append_sheet(wb, ws, String(year));
  console.log(`    → ${rows.length} rows`);
}

// 2026: Jan 1 → Apr 12 up to 18:00 (6 PM)
console.log("  Generating 2026 (Jan 1 – Apr 12, 6 PM)...");
const cutoff2026 = new Date(2026, 3, 12); // April 12 (month is 0-indexed)
const rows2026 = genYear(2026, cutoff2026, 18);
const ws2026 = XLSX.utils.json_to_sheet(rows2026, { header: HEADERS });
ws2026["!cols"] = COL_W;
XLSX.utils.book_append_sheet(wb, ws2026, "2026");
console.log(`    → ${rows2026.length} rows`);

XLSX.writeFile(wb, EXCEL_FILE);
console.timeEnd("Done in");
console.log(`\n✅ Excel saved: ${EXCEL_FILE}`);
console.log(`   Sheets: 2022, 2023, 2024, 2025, 2026`);
