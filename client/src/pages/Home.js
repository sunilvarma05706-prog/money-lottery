import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import PublicHistory from "../components/PublicHistory";

const API =
  process.env.REACT_APP_API_URL || "https://money-lottery-1.onrender.com";

export default function Home() {
  const [state, setState] = useState({
    rows: [],
    activeSlot: null,
    currentNumber: null,
    slotMap: {},
    timeSlots: [],
    allTimeSlots: [],
  });
  const [liveTime, setLiveTime] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [connected, setConnected] = useState(false);
  const [flashSlot, setFlashSlot] = useState(null);
  const socketRef = useRef(null);

  /* ── Live Clock ── */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLiveTime(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setLiveDate(
        d.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Visible slots (filter by current time) ── */
  const getVisibleSlots = (allSlots) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let activeD = new Date(now);
    if (currentMinutes < 10 * 60 + 5) {
      activeD.setDate(activeD.getDate() - 1);
    }
    
    if (activeD.getDate() !== now.getDate() || activeD.getMonth() !== now.getMonth()) {
      return allSlots || [];
    }

    return (allSlots || []).filter((slot) => {
      const [sh, sm] = slot.value.split(":").map(Number);
      return sh * 60 + sm <= currentMinutes;
    });
  };

  /* ── Socket ── */
  useEffect(() => {
    const socket = io(API, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("init", (d) => setState(d));
    socket.on("update", (d) => {
      setState((prev) => {
        const allSlots =
          d.allTimeSlots || prev.allTimeSlots || prev.timeSlots || [];
        return {
          ...prev,
          ...d,
          allTimeSlots: allSlots,
          slotMap: buildSlotMap(d.rows || prev.rows),
        };
      });
      if (d.slotValue) {
        setFlashSlot(d.slotValue);
        setTimeout(() => setFlashSlot(null), 2500);
      }
    });
    return () => socket.disconnect();
  }, []);

  function buildSlotMap(rows) {
    const m = {};
    (rows || []).forEach((r) => {
      m[r["Time Slot"]] = r;
    });
    return m;
  }

  const { rows, activeSlot, currentNumber, slotMap, allTimeSlots, timeSlots } =
    state;
  // Recompute visible slots every second via liveTime dependency
  const visibleSlots = getVisibleSlots(
    allTimeSlots.length > 0 ? allTimeSlots : timeSlots,
  );
  const getDigitSum = (n) => {
    if (n === null || n === undefined) return null;
    if (n === "Holiday") return "—";
    return String(n % 10).padStart(2, "0");
  };
  const prevNum = rows && rows.length > 1 ? rows[1]?.Number : null;

  const marqueeText = [
    "💰 Money Lottery - Live Results Updated",
    "🎯 आज का नंबर देखें - Money Lottery पर",
    "📢 हर 30 मिनट में नया नंबर आता है",
    "⚠️ किसी के नाम पर पैसे न दें - सावधान रहें",
    "🌟 10:05 AM से 10:05 PM तक - हर 30 मिनट",
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-center">
        {/* HEADER */}
        <div className="site-header">
          <div className="header-inner">
            <div className="logo-icon-box">💰</div>
            <div>
              <div className="site-title">MoneyLottery.live</div>
              <div style={{ fontSize: "0.68rem", marginTop: 2 }}>
                {connected ? (
                  <span style={{ color: "#00ff88" }}>
                    ● LIVE &nbsp;{liveTime}
                  </span>
                ) : (
                  <span style={{ color: "#ff4444" }}>● Connecting...</span>
                )}
              </div>
            </div>
            <div className="logo-icon-box">💰</div>
          </div>
          <div style={{ color: "#aaa", fontSize: "0.9rem", marginTop: 4 }}>
            {liveDate}
          </div>
        </div>

        {/* TOP MARQUEE */}
        <div className="marquee-box" style={{ borderColor: "var(--pink)" }}>
          <div className="marquee-inner" style={{ color: "var(--pink2)" }}>
            {[...marqueeText, ...marqueeText].map((t, i) => (
              <span key={i}>★ {t}</span>
            ))}
          </div>
        </div>

        {/* HERO RESULT BOX */}
        <div className="result-hero">
          <div className="time-label">Latest Results — Time: {liveTime}</div>
          {activeSlot && (
            <div className="slot-label">Current Slot: {activeSlot.label}</div>
          )}
          <div className="hindi-title">मनी कड़ी</div>
          <div className="number-display">
            {currentNumber !== null && currentNumber !== undefined ? (
              <>
                <span className="bracket">[</span>
                <span>{prevNum === "Holiday" ? "HL" : (prevNum ?? "--")}</span>
                <span className="bracket">]</span>
                <span className="arrow"> -&gt; </span>
                <span className="result-num">{getDigitSum(currentNumber)}</span>
              </>
            ) : (
              <span style={{ color: "#444", fontSize: "1.2rem" }}>
                {activeSlot
                  ? "Number आने का इंतज़ार करें..."
                  : "Draw 10:05 AM से शुरू होगा"}
              </span>
            )}
          </div>
        </div>

        {/* WARNING MARQUEE */}
        <div className="marquee-box" style={{ borderColor: "#ffcc00" }}>
          <div className="marquee-inner" style={{ color: "#ffcc00" }}>
            {[...Array(3)].map((_, i) => (
              <span key={i}>
                ⚠️ कृपया ध्यान दें — लीक गेम के नाम पर किसी को पैसे न दें —
                सावधान रहें
              </span>
            ))}
          </div>
        </div>

        {/* WARNING BOX */}
        <div className="info-box">
          <strong>⚠️ चेतावनी:</strong> कृपया ध्यान दें, लीक गेम के नाम पर किसी
          &nbsp;<strong style={{ color: "#cc0000" }}>को भी पैसे न दें</strong>,
          &nbsp;ना पहले ना बाद में। —<strong>प्रबंधन</strong>
        </div>

        {/* DISCLAIMER */}
        <div
          className="info-box dark"
          style={{ fontSize: "0.74rem", lineHeight: 1.7 }}
        >
          <strong style={{ color: "#ff8888" }}>Disclaimer:</strong> This website
          is an independent data portal. We do not promote any form of gaming.
          Information is for entertainment purposes only. &nbsp;
          <a href="#" style={{ color: "#00aaff" }}>
            moneylottery.live
          </a>
        </div>

        {/* SERVER NOTICE */}
        <div
          className="info-box server-notice"
          style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
        >
          कभी सर्वर डाउन हो तो देखिए खबर <strong>Money Lottery</strong> की
          &nbsp;<a href="#">MoneyLottery.live</a> 🪙 पर
        </div>

        {/* LINKS */}
        <div className="links-box">
          <a href="#">MoneybazaR.com</a>
          <a href="#">Moneylottery.live</a>
          <a href="#">Moneybazar.com</a>
          <div
            style={{
              marginTop: 4,
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#006600",
            }}
          >
            MoneyLottery.live
          </div>
          <div className="highlight-link">MONEYLOTTERY.LIVE</div>
        </div>

        <div className="banner green-banner">
          ✅ Registered for Nepal &amp; India
        </div>
        <div className="banner cyan-banner">
          Nepal's most favourite lottery &nbsp;|&nbsp; moneylottery.live
        </div>

        {/* CYAN MARQUEE */}
        <div className="marquee-box" style={{ borderColor: "var(--cyan)" }}>
          <div className="marquee-inner" style={{ color: "var(--cyan)" }}>
            {[...Array(4)].map((_, i) => (
              <span key={i}>
                ★ MONEYLOTTERY.LIVE ★ 10:05 AM - 10:05 PM ★ हर 30 मिनट नया नंबर
                ★
              </span>
            ))}
          </div>
        </div>

        {/* JOIN */}
        <div className="join-box">
          <div className="join-title">
            🔔 Join करें — Money Lottery Official Channel
          </div>
          <div className="join-btns">
            <a href="#" className="join-btn telegram">
              📱 Telegram
            </a>
            <a href="#" className="join-btn whatsapp">
              💬 WhatsApp
            </a>
          </div>
        </div>

        <div className="banner orange-banner">LINE ON LINE...</div>

        {/* ══ BIG NUMBER DISPLAY ══ */}
        <div className="number-box">
          <div className="nb-label">
            Number <span style={{ fontSize: "0.7rem" }}>**</span>
          </div>
          <div className="nb-slot">
            {activeSlot
              ? `Slot: ${activeSlot.label}`
              : "Draw Time: 10:05 AM – 10:05 PM"}
          </div>
          {currentNumber !== null && currentNumber !== undefined ? (
            <div
              className={`big-number${currentNumber === "Holiday" ? " holiday-text" : ""}`}
              style={
                currentNumber === "Holiday"
                  ? { fontSize: "3.5rem", textTransform: "uppercase" }
                  : {}
              }
            >
              {currentNumber === "Holiday"
                ? "Holiday"
                : String(currentNumber).padStart(2, "0")}
            </div>
          ) : (
            <div className="no-number">
              {activeSlot
                ? "नंबर आने का इंतज़ार करें..."
                : "Draw 10:05 AM से शुरू होगा"}
            </div>
          )}
        </div>

        {/* ══ RESULTS TABLE ══ */}
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Number</th>
              </tr>
            </thead>
            <tbody>
              {visibleSlots.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: "#444", padding: 20 }}>
                    Loading...
                  </td>
                </tr>
              )}
              {visibleSlots
                .slice()
                .reverse()
                .map((slot, i) => {
                  const row = slotMap[slot.value];
                  const isActive = activeSlot?.value === slot.value;
                  const isFlash = flashSlot === slot.value;
                  const dateKey = state.dateKey || "";
                  return (
                    <tr
                      key={i}
                      className={`${isActive ? "active-row-tr" : ""} ${isFlash ? "new-flash" : ""}`}
                    >
                      <td className="td-disp">
                        {row ? (
                          dateKey
                        ) : (
                          <span style={{ color: "#222" }}>—</span>
                        )}
                      </td>
                      <td
                        className={`td-time${isActive ? " active-row" : ""}`}
                        style={
                          isActive
                            ? { color: "var(--yellow)", fontWeight: 800 }
                            : {}
                        }
                      >
                        {slot.label}
                        {isActive && (
                          <span
                            style={{
                              color: "var(--green)",
                              fontSize: "0.65rem",
                              marginLeft: 4,
                            }}
                          >
                            ◀ LIVE
                          </span>
                        )}
                      </td>
                      <td
                        className={`td-num${row?.Special === "Yes" ? " special" : ""}${isActive ? " active-row" : ""}`}
                        style={
                          row?.Number === "Holiday"
                            ? { fontSize: "1.2rem", color: "var(--cyan)" }
                            : {}
                        }
                      >
                        {row ? (
                          row.Number === "Holiday" ? (
                            "Holiday"
                          ) : (
                            String(row.Number).padStart(2, "0")
                          )
                        ) : (
                          <span className="empty-slot">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 6 }}>
          <div className="marquee-box" style={{ borderColor: "var(--pink)" }}>
            <div
              className="marquee-inner"
              style={{ color: "var(--pink2)", fontWeight: 800 }}
            >
              {[...Array(3)].map((_, i) => (
                <span key={i}>🔥 MONEYLOTTERY.LIVE — SABSE TEZZZ 🔥</span>
              ))}
            </div>
          </div>
          <div className="banner pink-banner">
            🏆 Money Lottery — India &amp; Nepal's Most Trusted Result Portal
          </div>
          <div className="banner green-banner">
            मनी लॉटरी का असली चैनल 💰 | कोई दूसरा चैनल नहीं — अपना पैसा न गवाएं
          </div>
          <div className="footer-note" style={{ marginTop: 4 }}>
            Nepal's most favourite lottery &nbsp;|&nbsp; moneylottery.live
            &nbsp;|&nbsp; <a href="#">Telegram</a> &nbsp;|&nbsp;{" "}
            <a href="#">WhatsApp</a>
          </div>
          <div className="footer-note" style={{ marginTop: 2, color: "#444" }}>
            © 2025 MoneyLottery.live — For entertainment purposes only. 18+
            only. &nbsp;|&nbsp;{" "}
            <Link to="/admin/login" style={{ color: "#004444" }}>
              Admin Login
            </Link>
          </div>
        </div>

        {/* ══ PUBLIC HISTORY SECTION (bottom) ══ */}
        <PublicHistory />
      </div>
    </div>
  );
}
