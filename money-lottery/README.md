# 💰 Money Lottery — Full Stack Web Application

A complete lottery results website built with **Node.js (Express)** backend and **React** frontend.

---

## 📁 Project Structure

```
money-lottery/
├── server/                  # Node.js + Express Backend
│   ├── index.js             # Main server file
│   └── package.json
├── client/                  # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js    # Top header, ticker, navigation
│   │   │   ├── Footer.js    # Footer links
│   │   │   └── ResultCard.js# Lottery result card component
│   │   ├── pages/
│   │   │   ├── Home.js      # Homepage with today's results
│   │   │   ├── Results.js   # Full results page
│   │   │   ├── Upcoming.js  # Upcoming draws
│   │   │   ├── CheckTicket.js # Ticket checker tool
│   │   │   ├── HowToBuy.js  # How to buy guide
│   │   │   └── Contact.js   # Contact page
│   │   ├── App.js           # Main app with routing
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   └── package.json
└── package.json             # Root scripts
```

---

## 🚀 Setup & Run

### Step 1 — Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

### Step 2 — Start the Backend Server

```bash
cd server
npm start
# OR for development with auto-reload:
npm run dev
```

Server runs at: **http://localhost:5000**

---

### Step 3 — Start the React Frontend

```bash
cd client
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lotteries` | All lottery results |
| GET | `/api/lotteries/:id` | Single lottery result |
| GET | `/api/upcoming` | Upcoming draws |
| GET | `/api/check-ticket?number=XXXXX` | Check ticket number |

---

## ✨ Features

- 🏆 **Today's Results** — Full prize breakdown for all draws
- 📅 **Upcoming Draws** — Schedule and ticket prices
- 🔍 **Ticket Checker** — Enter number to check prize
- 📢 **Live Ticker** — Scrolling result announcements
- ⏰ **Live Clock** — Real-time clock in header
- 📱 **Responsive** — Works on mobile and desktop
- 🗺️ **Multi-page** — React Router navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Frontend | React 18, React Router v6 |
| HTTP Client | Axios / Fetch API |
| Fonts | Google Fonts (Baloo 2, Rajdhani) |
| Styling | Pure CSS with CSS Variables |

---

## 📞 Customization

To change lottery data, edit the `lotteries` and `upcomingDraws` arrays in **`server/index.js`**.

To change the API URL for production, set `REACT_APP_API_URL` in a `.env` file inside the `client/` folder:
```
REACT_APP_API_URL=https://your-api-domain.com
```

---

> ⚠️ **Disclaimer:** This application is for informational/demonstration purposes only. Lottery participation is only for persons aged 18+. Play responsibly.
