import React, { useState } from 'react';

export default function ResultCard({ lottery }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      {/* Card Header */}
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <span>🏆 {lottery.name} — Draw Date: {lottery.drawDate} | Time: {lottery.drawTime}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'var(--gold)',
            color: 'var(--dark)',
            border: 'none',
            padding: '3px 12px',
            borderRadius: 4,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {expanded ? '▲ Collapse' : '▼ Full Result'}
        </button>
      </div>

      {/* 1st Prize Highlight */}
      <div style={{
        background: 'linear-gradient(135deg, #fff8cc 0%, #fffde7 100%)',
        padding: '14px 20px',
        borderBottom: '1px solid #e0d080',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', letterSpacing: 1 }}>
            🥇 1st Prize — {lottery.results[0]?.amount}
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--red)',
            letterSpacing: 4,
            fontFamily: "'Rajdhani', monospace",
          }}>
            {lottery.results[0]?.number}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', letterSpacing: 1 }}>Ticket Price</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green-light)' }}>{lottery.ticketPrice}</div>
        </div>
      </div>

      {/* Consolation */}
      {lottery.results.find(r => r.prize === 'Consolation') && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee', background: '#fff8f8' }}>
          <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.83rem' }}>
            🎁 Consolation Prize ({lottery.results.find(r => r.prize === 'Consolation')?.amount}):&nbsp;
          </span>
          <span style={{ fontSize: '0.83rem', fontFamily: "'Rajdhani', monospace", fontWeight: 600, letterSpacing: 1 }}>
            {lottery.results.find(r => r.prize === 'Consolation')?.numbers?.join(' | ')}
          </span>
        </div>
      )}

      {/* Full Result Table */}
      {expanded && (
        <div style={{ overflowX: 'auto' }}>
          <table className="result-table">
            <thead>
              <tr>
                <th>Prize</th>
                <th>Amount</th>
                <th>Winning Numbers</th>
              </tr>
            </thead>
            <tbody>
              {lottery.results.map((row, i) => (
                <tr key={i}>
                  <td className="prize-name">{row.prize}</td>
                  <td className="prize-amount">{row.amount}</td>
                  <td>
                    {row.number ? (
                      <span className="prize-number">{row.number}</span>
                    ) : (
                      <div className="numbers-wrap">
                        {row.numbers?.map((n, j) => (
                          <span key={j} className="num-badge">{n}</span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
