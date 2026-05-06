import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { path: '/', label: '🏠 Home' },
    { path: '/results', label: '🏆 Today Results' },
    { path: '/upcoming', label: '📅 Upcoming Draws' },
    { path: '/check', label: '🔍 Check Ticket' },
    { path: '/how-to-buy', label: '🎫 How to Buy' },
    { path: '/contact', label: '📞 Contact Us' },
  ];

  const tickerItems = [
    '💰 Money Morning Star Result Declared - 1st Prize: ML 456789',
    '🏆 Money Gold Result Declared - 1st Prize: MG 789012',
    '🎯 Money Jackpot Result Declared - 1st Prize: MJ 321654',
    '🌟 Money Bumper Result Declared - 1st Prize: MB 654321',
    '📢 Next Draw: Money Morning Star - Tomorrow 11:55 AM',
    '⚠️ Lottery is for 18+ only | Play Responsibly',
  ];

  return (
    <>
      {/* Top Info Bar */}
      <div className="top-header">
        <span>📞 Helpline: 1800-XXX-XXXX</span>
        <span>|</span>
        <span>📧 info@moneylottery.com</span>
        <span>|</span>
        <span>⏰ Results Updated Daily</span>
      </div>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i}>★ {item}</span>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-icon">💰</div>
            <div className="logo-text">
              <h1><span>Money</span> Lottery</h1>
              <p>Official Results & Information</p>
            </div>
          </div>
          <div className="header-right">
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE RESULTS
            </div>
            <div className="header-time">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              &nbsp;&mdash;&nbsp;
              {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav>
        <div className="nav-inner">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
