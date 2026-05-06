const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");
const JWT_SECRET = "money_lottery_secret_2025";

// ─── Admin Credentials (hashed) ────────────────────────────────────────────
// Default: username=admin  password=admin123
const ADMIN = {
  username: "admin",
  passwordHash: bcrypt.hashSync("admin123", 10)
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function readData() {
  return fs.readJsonSync(DATA_FILE, { throws: false }) || { results: [], currentNumber: null };
}
function saveData(data) {
  fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
}
function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getDate()).padStart(2,"0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
function formatTime(d) {
  let h = d.getHours(), m = d.getMinutes();
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─── REST Routes ─────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("Money Lottery API Server is running. Please access the application through the frontend client (usually http://localhost:3000).");
});

// Public: get all data
app.get("/api/data", (req, res) => {
  res.json(readData());
});

// Admin login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN.username || !bcrypt.compareSync(password, ADMIN.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, message: "Login successful" });
});

// Admin: post new number
app.post("/api/number", authMiddleware, (req, res) => {
  const { number, special } = req.body;
  if (number === undefined || number === null || number === "") {
    return res.status(400).json({ error: "Number is required" });
  }
  const num = parseInt(number);
  if (isNaN(num) || num < 0 || num > 99) {
    return res.status(400).json({ error: "Number must be 0-99" });
  }

  const now = new Date();
  const data = readData();

  const entry = {
    date: formatDate(now),
    time: formatTime(now),
    number: num,
    special: special === true || special === "true"
  };

  data.results.unshift(entry); // newest first
  data.currentNumber = num;
  data.currentLabel = "मनी कड़ी";
  data.lastUpdated = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  saveData(data);

  // Broadcast to all connected clients in real-time
  io.emit("newNumber", { entry, currentNumber: num, lastUpdated: data.lastUpdated });

  res.json({ success: true, entry });
});

// Admin: clear all results
app.delete("/api/results", authMiddleware, (req, res) => {
  const data = readData();
  data.results = [];
  data.currentNumber = null;
  saveData(data);
  io.emit("clearResults");
  res.json({ success: true });
});

// Admin: change password
app.post("/api/change-password", authMiddleware, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  ADMIN.passwordHash = bcrypt.hashSync(newPassword, 10);
  res.json({ success: true, message: "Password updated" });
});

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  // Send current data immediately on connect
  socket.emit("init", readData());
  socket.on("disconnect", () => console.log(`Client disconnected: ${socket.id}`));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n💰 Money Lottery Server running on http://localhost:${PORT}`);
  console.log(`👤 Admin login: username=admin  password=admin123`);
  console.log(`🔑 Change password via POST /api/change-password\n`);
});
