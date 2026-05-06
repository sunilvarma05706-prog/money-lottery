import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CheckTicket() {
  const [ticket, setTicket] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkTicket = async () => {
    if (!ticket.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/check-ticket?number=${ticket.trim()}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: 'Server error. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="section-header">🔍 Check Your Lottery Ticket</div>
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: 12 }}>
            Enter your ticket number below to check if you have won a prize in today's draws.
          </p>
          <div className="checker-form" style={{ padding: 0 }}>
            <input
              type="text"
              placeholder="Enter ticket number (e.g. 456789 or ML 456789)"
              value={ticket}
              onChange={e => setTicket(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkTicket()}
              style={{ minWidth: 240 }}
            />
            <button className="btn-check" onClick={checkTicket} disabled={loading}>
              {loading ? 'Checking...' : '🔍 Check Now'}
            </button>
          </div>

          {result && (
            <div className="checker-result" style={{ marginTop: 14, padding: 0 }}>
              {result.won ? (
                <div className="result-win">
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>
                    🎉 Congratulations! You have won!
                  </div>
                  {result.data.map((r, i) => (
                    <div key={i} style={{ marginBottom: 6, fontSize: '0.9rem' }}>
                      <strong>{r.lottery}</strong> → {r.prize}: <strong style={{ color: 'var(--green)' }}>{r.amount}</strong>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#555' }}>
                    ⚠️ Please visit the nearest lottery office with your original ticket to claim your prize.
                  </div>
                </div>
              ) : (
                <div className="result-loss">
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                    😔 Sorry, no prize found for ticket: <strong>{ticket}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    Please double-check your ticket number and try again. Results are for today's draws only.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="notice-box" style={{ marginTop: 16 }}>
            💡 <strong>Tip:</strong> Try entering <code>456789</code> or <code>ML 456789</code> to see a winning result demo.
          </div>
        </div>
      </div>

      {/* Prize Structure */}
      <div className="card">
        <div className="section-header">🏅 General Prize Structure</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="result-table">
            <thead>
              <tr>
                <th>Prize</th>
                <th>Amount (Approx.)</th>
                <th>How to Claim</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1st Prize', 'Up to ₹5,00,00,000', 'Lottery Office (Original Ticket Required)'],
                ['2nd Prize', 'Up to ₹25,00,000', 'Lottery Office (Original Ticket Required)'],
                ['3rd Prize', 'Up to ₹5,00,000', 'Lottery Office'],
                ['4th Prize', 'Up to ₹25,000', 'Authorised Retailer / Lottery Office'],
                ['5th Prize', 'Up to ₹5,000', 'Authorised Retailer'],
                ['Consolation', 'Up to ₹20,000', 'Lottery Office'],
              ].map(([prize, amount, how], i) => (
                <tr key={i}>
                  <td className="prize-name">{prize}</td>
                  <td className="prize-amount">{amount}</td>
                  <td style={{ fontSize: '0.82rem', color: '#555' }}>{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
