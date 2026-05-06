import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-col">
          <h4>💰 Money Lottery</h4>
          <p>India's trusted lottery information portal. We provide accurate and timely lottery results for all major draws.</p>
          <p style={{ marginTop: 8 }}>All results are for informational purposes only.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/results">Today Results</Link>
          <Link to="/upcoming">Upcoming Draws</Link>
          <Link to="/check">Check Ticket</Link>
          <Link to="/how-to-buy">How to Buy</Link>
        </div>
        <div className="footer-col">
          <h4>Lottery Draws</h4>
          <a>Money Morning Star (11:55 AM)</a>
          <a>Money Gold (3:00 PM)</a>
          <a>Money Jackpot (7:00 PM)</a>
          <a>Money Bumper (8:00 PM)</a>
          <a>Money Super (9:00 PM)</a>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>📞 Helpline: 1800-XXX-XXXX</p>
          <p>📧 info@moneylottery.com</p>
          <p>📍 India</p>
          <p style={{ marginTop: 8, color: '#ff9999' }}>⚠️ For 18+ only. Play Responsibly.</p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 <span>Money Lottery</span>. All Rights Reserved. |
        Lottery results are published for informational purposes only. |
        <span> Play Responsibly</span>
      </div>
    </footer>
  );
}
