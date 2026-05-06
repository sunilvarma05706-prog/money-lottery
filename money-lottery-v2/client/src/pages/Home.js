import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Home() {
  const [data, setData]           = useState({ results: [], currentNumber: null, lastUpdated: '' });
  const [newRowId, setNewRowId]   = useState(null);
  const [connected, setConnected] = useState(false);
  const [liveTime, setLiveTime]   = useState('');
  const socketRef = useRef(null);

  /* live clock */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  /* socket */
  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('init', (d) => setData(d));

    socket.on('newNumber', ({ entry, currentNumber, lastUpdated }) => {
      setData(prev => ({
        ...prev,
        currentNumber,
        lastUpdated,
        results: [entry, ...prev.results]
      }));
      setNewRowId(Date.now());
      setTimeout(() => setNewRowId(null), 2500);
    });

    socket.on('clearResults', () => {
      setData(prev => ({ ...prev, results: [], currentNumber: null }));
    });

    return () => socket.disconnect();
  }, []);

  const results = data.results || [];
  const currentNum = data.currentNumber;

  /* derive last two digits sum display like [61]->03 */
  const prevNum = results.length > 1 ? results[1].number : null;
  const getDigitSum = (n) => {
    if (n === null || n === undefined) return null;
    const s = (n % 10);
    return String(s).padStart(2, '0');
  };

  const marqueeItems = [
    '💰 Money Lottery - Live Results Updated',
    '🎯 आज का नंबर देखें - Money Lottery पर',
    '📢 सर्वर डाउन हो तो moneylottery.com पर देखें',
    '⚠️ किसी के नाम पर पैसे न दें - सावधान रहें',
    '🌟 Money Lottery - Nepal & India का भरोसेमंद लॉटरी',
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="page-center">

        {/* ── HEADER ── */}
        <div className="site-header">
          <div className="header-inner">
            <div className="logo-icon-box">💰</div>
            <div>
              <div className="site-title">MoneyLottery.com</div>
              <div style={{ color: '#aaa', fontSize: '0.7rem', marginTop: 2 }}>
                {connected
                  ? <span style={{ color: '#00ff88' }}>● LIVE  {liveTime}</span>
                  : <span style={{ color: '#ff4444' }}>● Connecting...</span>
                }
              </div>
            </div>
            <div className="logo-icon-box">💰</div>
          </div>
        </div>

        {/* ── TOP MARQUEE ── */}
        <div className="marquee-box pink-text">
          <div className="marquee-inner">
            {[...marqueeItems, ...marqueeItems].map((m, i) => <span key={i}>★ {m}</span>)}
          </div>
        </div>

        {/* ── HERO RESULT BOX ── */}
        <div className="result-hero">
          <div className="time-label">
            Latest Results - Time: {data.lastUpdated || liveTime}
          </div>
          <div className="hindi-title">मनी कड़ी</div>
          <div className="number-display">
            {currentNum !== null && currentNum !== undefined ? (
              <>
                <span className="bracket">[</span>
                <span>{prevNum !== null ? prevNum : '--'}</span>
                <span className="bracket">]</span>
                <span className="arrow"> -&gt; </span>
                <span className="result-num">{getDigitSum(currentNum)}</span>
              </>
            ) : (
              <span style={{ color: '#555', fontSize: '1.2rem' }}>-- : --</span>
            )}
          </div>
        </div>

        {/* ── WARNING MARQUEE ── */}
        <div className="marquee-box">
          <div className="marquee-inner" style={{ color: '#ffcc00' }}>
            {[
              'कृपया ध्यान दें — लीक गेम के नाम पर किसी को पैसे न दें',
              'किसी एजेंट या बुकी को पैसे न दें — सावधान',
              'Money Lottery केवल परिणाम प्रकाशित करती है',
            ].flatMap((t, i) => [<span key={i}>⚠️ {t}</span>])}
          </div>
        </div>

        {/* ── WARNING BOX ── */}
        <div className="info-box">
          <strong>⚠️ चेतावनी:</strong> कृपया ध्यान दें, लीक गेम के नाम पर किसी
          &nbsp;<strong style={{ color: '#cc0000' }}>को भी पैसे न दें</strong>, ना पहले ना बाद में।
          &nbsp;—<strong>प्रबंधन</strong>
        </div>

        {/* ── DISCLAIMER ── */}
        <div className="info-box dark" style={{ fontSize: '0.75rem', lineHeight: 1.7 }}>
          <strong style={{ color: '#ff8888' }}>Disclaimer:</strong> This website is an independent data aggregation
          and media portal. We do not promote, endorse, or facilitate any form of online or offline gaming.
          The information provided is for entertainment and informational purposes only. We are not responsible
          for any decisions made based on this data.{' '}
          <a href="#" style={{ color: '#00aaff' }}>moneylottery.com</a>
        </div>

        {/* ── SERVER NOTICE ── */}
        <div className="info-box server-notice" style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
          कभी सर्वर डाउन या इंटरनेट डाउन हो जाए तो देखिए खबर <strong>Money Lottery</strong> की
          &nbsp;<a href="#">MoneyLottery.com</a>&nbsp;🪙 पर
        </div>

        {/* ── LINKS BOX ── */}
        <div className="links-box">
          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>Official Links:</div>
          <a href="#">MoneybazaR.com</a>
          <a href="#" className="main-link">Moneylottery.in</a>
          <a href="#">Moneybazar.com</a>
          <a href="#">Moneylottery.in</a>
          <a href="#">Moneybazar.com</a>
          <div className="main-link" style={{ marginTop: 6, fontSize: '1.1rem', fontWeight: 800, color: '#006600' }}>
            MoneyLottery.in
          </div>
          <div style={{ marginTop: 4, color: '#888', fontSize: '0.75rem' }}>RDX. SIR.</div>
          <div className="highlight-link">MONEYLOTTERY.COM</div>
        </div>

        {/* ── REGISTERED ── */}
        <div className="banner green-banner">✅ Registered for Nepal &amp; India</div>
        <div className="banner cyan-banner">Nepal's most favourite lottery &nbsp;|&nbsp; moneylottery.com</div>

        {/* ── COLORED MARQUEE BANNERS ── */}
        <div className="marquee-box cyan-text" style={{ borderColor: '#00ffff' }}>
          <div className="marquee-inner" style={{ color: '#00ffff' }}>
            {Array(4).fill('★ MONEYLOTTERY.COM ★ Live Results ★ Trusted Since 2020 ★').map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        <div className="marquee-box" style={{ borderColor: '#ff00ff' }}>
          <div className="marquee-inner" style={{ color: '#ff88ff' }}>
            {Array(4).fill('💰 Money Lottery ● Real Numbers ● Fast Results ● SABSE TEZZ 💰').map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── JOIN CHANNEL ── */}
        <div className="join-box">
          <div className="join-title">🔔 Join करें — Money Lottery Official Channel</div>
          <div className="join-btns">
            <a href="#" className="join-btn telegram">📱 Only Telegram Betting</a>
            <a href="#" className="join-btn whatsapp">💬 WhatsApp Chat</a>
          </div>
        </div>

        {/* ── LINE ON LINE ── */}
        <div className="banner orange-banner" style={{ fontSize: '1.4rem', letterSpacing: 3, padding: '8px' }}>
          LINE ON LINE...
        </div>

        <div className="marquee-box" style={{ borderColor: '#ff00ff', background: '#1a0033' }}>
          <div className="marquee-inner" style={{ color: '#ff88ff', fontWeight: 800 }}>
            {Array(4).fill('🔥 MONEYLOTTERY.COM — SABSE TEZZZ 🔥').map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════
            NUMBER DISPLAY BOX
        ══════════════════════════════ */}
        <div className="number-box">
          <div className="nb-label">Number <span>**</span></div>
          {currentNum !== null && currentNum !== undefined ? (
            <div className="big-number">{String(currentNum).padStart(2, '0')}</div>
          ) : (
            <div className="no-number">अभी कोई नंबर नहीं — प्रतीक्षा करें...</div>
          )}
        </div>

        {/* ══════════════════════════════
            RESULTS TABLE
        ══════════════════════════════ */}
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
              {results.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ color: '#555', padding: 20 }}>
                    कोई परिणाम नहीं — Result आने पर यहाँ दिखेगा
                  </td>
                </tr>
              ) : (
                results.map((row, i) => (
                  <tr key={i} className={i === 0 && newRowId ? 'new-entry' : ''}>
                    <td className="td-date">{row.date}</td>
                    <td className="td-time">{row.time}</td>
                    <td className={`td-number${row.special ? ' special' : ''}${i === 0 ? ' first-row' : ''}`}>
                      {String(row.number).padStart(2, '0')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER BANNERS ── */}
        <div className="footer-section">
          <div className="marquee-box pink-text" style={{ marginTop: 6 }}>
            <div className="marquee-inner" style={{ color: '#ff88ff' }}>
              {Array(3).fill('💰 Money Lottery ● Trusted ● Fast ● Accurate ● moneylottery.com').map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>

          <div className="banner pink-banner" style={{ marginTop: 4 }}>
            🏆 Money Lottery — India &amp; Nepal's Most Trusted Result Portal
          </div>

          <div className="marquee-box" style={{ borderColor: '#888', marginTop: 4 }}>
            <div className="marquee-inner" style={{ color: '#ffaa00' }}>
              {Array(3).fill('★ || ओरिजिनल केवल मनी लॉटरी || ★ Original RDX. SIR. ★').map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>

          <div className="banner green-banner">
            मनी लॉटरी का असली चैनल 💰 | कोई दूसरा चैनल लॉटरी का नहीं — अपना पैसा न गवाएं
          </div>

          <div className="footer-note" style={{ marginTop: 4 }}>
            Nepal's most favourite lottery &nbsp;|&nbsp; moneylottery.com
            &nbsp;|&nbsp; <a href="#">Telegram</a> &nbsp;|&nbsp; <a href="#">WhatsApp</a>
          </div>

          <div className="footer-note" style={{ marginTop: 2, color: '#555' }}>
            © 2025 MoneyLottery.com — For entertainment purposes only. 18+ only. Play responsibly. &nbsp;|&nbsp;
            <Link to="/admin/login" style={{ color: '#004444' }}>Admin</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
