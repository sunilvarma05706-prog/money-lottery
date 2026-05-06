# 💰 Money Lottery v2 — Real-Time Full Stack App

Dark starry UI with live number posting by admin. Built with **Node.js + Socket.io + React**.

---

## 📁 Project Structure

```
money-lottery-v2/
├── server/
│   ├── index.js        # Express + Socket.io server
│   ├── data.json       # Persistent results storage (auto-created)
│   └── package.json
├── client/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Home.js        # Public lottery page (real-time)
│   │       ├── AdminLogin.js  # Owner login
│   │       └── AdminPanel.js  # Post numbers live
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Run

### Step 1 — Install dependencies

```bash
# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

---

### Step 2 — Start Backend (Port 5000)

```bash
cd server
node index.js

# OR with auto-reload:
npx nodemon index.js
```

---

### Step 3 — Start Frontend (Port 3000)

```bash
cd client
npm start
```

Open browser: **http://localhost:3000**

---

## 👤 Admin Login

Go to: **http://localhost:3000/admin/login**

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> Change your password from the Admin Panel after first login!

---

## ⚡ How Real-Time Works

1. Owner logs into Admin Panel (`/admin`)
2. Types a number (0–99) and clicks **POST LIVE**
3. Number is sent to server via REST API
4. Server saves to `data.json` and broadcasts via **Socket.io**
5. All public visitors see the new number **instantly** without refresh

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/data`            | No  | Get all results + current number |
| POST | `/api/login`           | No  | Admin login → returns JWT token |
| POST | `/api/number`          | Yes | Post new number (broadcasts live) |
| DELETE | `/api/results`       | Yes | Clear all results |
| POST | `/api/change-password` | Yes | Change admin password |

---

## 🎨 Features

- ⭐ **Dark starry background** matching original design
- 📡 **Real-time updates** via Socket.io — no refresh needed
- 💰 **Money Lottery** branding throughout
- 📊 **Results table** with Date / Time / Number
- 🌟 **Special number** highlight (cyan color)
- 🔑 **JWT-secured** admin panel
- 🎯 **Live clock** in header
- 📢 **Scrolling marquee** ticker
- 🔒 **Password change** from admin panel
- 📱 **Mobile responsive**

---

## ⚙️ Production Deployment

Set environment variable for client:
```
REACT_APP_API_URL=https://your-server-domain.com
```

Build frontend:
```bash
cd client
npm run build
```

Serve `client/build` folder with Express or Nginx.

---

> ⚠️ For entertainment/informational purposes only. 18+ only.
