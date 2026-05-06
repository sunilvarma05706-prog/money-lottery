# 💰 Money Lottery v3 — Time Slot System + Excel Storage

## 🚀 Setup

```bash
# 1. Backend
cd server
npm install
node index.js          # Port 5000

# 2. Frontend (new terminal)
cd client
npm install
npm start              # Port 3000
```

## 👤 Admin Login
- URL: http://localhost:3000/admin/login
- Username: admin  |  Password: admin123

## ⏰ Time Slots
10:00 AM → 11:00 PM  (every 30 minutes = 27 slots)

## 🔑 How Admin Posts a Number
1. Go to /admin/login → login
2. Select TIME SLOT from dropdown
3. Enter number (0–99)
4. Click POST LIVE → number shows instantly on public site

## 📊 Excel Storage
- File: server/lottery_data.xlsx
- Each day = separate sheet (e.g. "12-Apr-2026")
- Columns: Time Slot | Display Time | Number | Special | Posted At | Date

## ⚡ Real-Time
- Socket.io broadcasts every new number to all public visitors instantly
- Public page auto-detects current time slot and shows its number
