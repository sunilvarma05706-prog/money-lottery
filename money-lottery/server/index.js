const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─── Mock Lottery Data ──────────────────────────────────────────────────────

const lotteries = [
  {
    id: 1,
    name: "Money Morning Star",
    drawTime: "11:55 AM",
    drawDate: "12/04/2025",
    firstPrize: "₹1,00,00,000",
    ticketPrice: "₹50",
    results: [
      { prize: "1st Prize", amount: "₹1,00,00,000", number: "ML 456789" },
      { prize: "2nd Prize", amount: "₹5,00,000", number: "456789" },
      { prize: "3rd Prize", amount: "₹1,00,000", numbers: ["1234", "5678", "9012", "3456", "7890", "2345", "6789", "0123", "4567", "8901"] },
      { prize: "4th Prize", amount: "₹5,000", numbers: ["1111", "2222", "3333", "4444"] },
      { prize: "5th Prize", amount: "₹1,000", numbers: ["0001", "0002", "0003", "0004", "0005", "0006"] },
      { prize: "Consolation", amount: "₹8,000", numbers: ["456788", "456790", "456791"] }
    ]
  },
  {
    id: 2,
    name: "Money Gold",
    drawTime: "3:00 PM",
    drawDate: "12/04/2025",
    firstPrize: "₹50,00,000",
    ticketPrice: "₹40",
    results: [
      { prize: "1st Prize", amount: "₹50,00,000", number: "MG 789012" },
      { prize: "2nd Prize", amount: "₹2,00,000", number: "789012" },
      { prize: "3rd Prize", amount: "₹50,000", numbers: ["2233", "4455", "6677", "8899", "0011", "1122", "3344", "5566", "7788", "9900"] },
      { prize: "4th Prize", amount: "₹2,000", numbers: ["5555", "6666", "7777", "8888"] },
      { prize: "5th Prize", amount: "₹500", numbers: ["0010", "0020", "0030", "0040", "0050", "0060"] },
      { prize: "Consolation", amount: "₹5,000", numbers: ["789011", "789013", "789014"] }
    ]
  },
  {
    id: 3,
    name: "Money Jackpot",
    drawTime: "7:00 PM",
    drawDate: "12/04/2025",
    firstPrize: "₹2,00,00,000",
    ticketPrice: "₹100",
    results: [
      { prize: "1st Prize", amount: "₹2,00,00,000", number: "MJ 321654" },
      { prize: "2nd Prize", amount: "₹10,00,000", number: "321654" },
      { prize: "3rd Prize", amount: "₹2,00,000", numbers: ["9988", "7766", "5544", "3322", "1100", "9911", "8822", "7733", "6644", "5500"] },
      { prize: "4th Prize", amount: "₹10,000", numbers: ["9999", "0000", "1234", "4321"] },
      { prize: "5th Prize", amount: "₹2,000", numbers: ["1001", "2002", "3003", "4004", "5005", "6006"] },
      { prize: "Consolation", amount: "₹12,000", numbers: ["321653", "321655", "321656"] }
    ]
  },
  {
    id: 4,
    name: "Money Bumper",
    drawTime: "8:00 PM",
    drawDate: "12/04/2025",
    firstPrize: "₹5,00,00,000",
    ticketPrice: "₹200",
    results: [
      { prize: "1st Prize", amount: "₹5,00,00,000", number: "MB 654321" },
      { prize: "2nd Prize", amount: "₹25,00,000", number: "654321" },
      { prize: "3rd Prize", amount: "₹5,00,000", numbers: ["1357", "2468", "3579", "4680", "5791", "6802", "7913", "8024", "9135", "0246"] },
      { prize: "4th Prize", amount: "₹25,000", numbers: ["2222", "4444", "6666", "8888"] },
      { prize: "5th Prize", amount: "₹5,000", numbers: ["0101", "0202", "0303", "0404", "0505", "0606"] },
      { prize: "Consolation", amount: "₹20,000", numbers: ["654320", "654322", "654323"] }
    ]
  }
];

const upcomingDraws = [
  { id: 1, name: "Money Morning Star", drawTime: "11:55 AM", drawDate: "13/04/2025", ticketPrice: "₹50", prize: "₹1,00,00,000" },
  { id: 2, name: "Money Gold", drawTime: "3:00 PM", drawDate: "13/04/2025", ticketPrice: "₹40", prize: "₹50,00,000" },
  { id: 3, name: "Money Jackpot", drawTime: "7:00 PM", drawDate: "13/04/2025", ticketPrice: "₹100", prize: "₹2,00,00,000" },
  { id: 4, name: "Money Bumper", drawTime: "8:00 PM", drawDate: "13/04/2025", ticketPrice: "₹200", prize: "₹5,00,00,000" },
  { id: 5, name: "Money Super", drawTime: "9:00 PM", drawDate: "14/04/2025", ticketPrice: "₹150", prize: "₹3,00,00,000" }
];

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/api/lotteries", (req, res) => {
  res.json({ success: true, data: lotteries });
});

app.get("/api/lotteries/:id", (req, res) => {
  const lottery = lotteries.find(l => l.id === parseInt(req.params.id));
  if (!lottery) return res.status(404).json({ success: false, message: "Lottery not found" });
  res.json({ success: true, data: lottery });
});

app.get("/api/upcoming", (req, res) => {
  res.json({ success: true, data: upcomingDraws });
});

app.get("/api/check-ticket", (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ success: false, message: "Ticket number required" });

  let found = [];
  lotteries.forEach(lottery => {
    lottery.results.forEach(result => {
      if (result.number && result.number.includes(number)) {
        found.push({ lottery: lottery.name, prize: result.prize, amount: result.amount });
      }
      if (result.numbers && result.numbers.some(n => n === number || n.includes(number))) {
        found.push({ lottery: lottery.name, prize: result.prize, amount: result.amount });
      }
    });
  });

  if (found.length > 0) {
    res.json({ success: true, won: true, data: found });
  } else {
    res.json({ success: true, won: false, message: "No prize found for this ticket" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Money Lottery API is running!", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`💰 Money Lottery Server running on http://localhost:${PORT}`);
});
