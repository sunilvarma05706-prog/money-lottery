import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultCard from '../components/ResultCard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Home() {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/lotteries`)
      .then(r => r.json())
      .then(d => { setLotteries(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* Notice */}
      <div className="notice-box">
        📢 <strong>Money Lottery</strong> — Official result portal. Results updated as soon as draws are completed. For queries call our helpline.
      </div>

      {/* Today's Results */}
      <div className="card">
        <div className="section-header">🏆 Today's Lottery Results — 12/04/2025</div>
        {loading ? (
          <div className="loading">Loading results</div>
        ) : (
          <div style={{ padding: '0 0 4px' }}>
            {lotteries.map(l => (
              <div key={l.id} style={{ padding: '12px 14px 0' }}>
                <ResultCard lottery={l} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-header">🎫 Quick Actions</div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '🔍 Check Your Ticket', path: '/check' },
              { label: '📅 Upcoming Draws', path: '/upcoming' },
              { label: '📋 All Results', path: '/results' },
              { label: '🛒 How to Buy', path: '/how-to-buy' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'linear-gradient(90deg, var(--red), #cc0000)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 6,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.target.style.opacity = 0.85}
                onMouseOut={e => e.target.style.opacity = 1}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header" style={{ background: 'linear-gradient(90deg, var(--green), var(--green-light))' }}>
            📊 Today's Prize Summary
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="upcoming-table">
              <thead>
                <tr>
                  <th>Lottery</th>
                  <th>Time</th>
                  <th>1st Prize</th>
                </tr>
              </thead>
              <tbody>
                {lotteries.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.name}</td>
                    <td>{l.drawTime}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green-light)' }}>{l.firstPrize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #cc0000 0%, #8B0000 100%)',
        color: 'white',
        padding: '20px 24px',
        borderRadius: 8,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '2.5rem' }}>💰</div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)' }}>
            Win Up to ₹5,00,00,000!
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: 4 }}>
            Money Lottery offers India's biggest jackpots. Check results daily and try your luck!
          </div>
        </div>
      </div>
    </div>
  );
}
