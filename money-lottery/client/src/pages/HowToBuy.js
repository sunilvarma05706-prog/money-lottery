import React from 'react';

export default function HowToBuy() {
  const steps = [
    { icon: '🏪', title: 'Find an Authorised Retailer', desc: 'Visit your nearest authorised Money Lottery retailer. Look for the official Money Lottery signboard.' },
    { icon: '🎫', title: 'Choose Your Lottery', desc: 'Select the lottery draw you want to participate in. Each lottery has different prize amounts and ticket prices.' },
    { icon: '💵', title: 'Purchase Your Ticket', desc: 'Pay the ticket price to the retailer and receive your official Money Lottery ticket with a unique number.' },
    { icon: '🔒', title: 'Keep Your Ticket Safe', desc: 'Store your ticket in a safe place. You need the original ticket to claim any prize. Do not damage or lose it.' },
    { icon: '📺', title: 'Check the Results', desc: 'Check results on this website after the draw time. Results are published immediately after every draw.' },
    { icon: '🏆', title: 'Claim Your Prize', desc: 'If you win, visit the nearest lottery office with your original ticket within the claim period.' },
  ];

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="section-header">🛒 How to Buy Money Lottery Ticket</div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: i % 2 === 0 ? '#fff8cc' : '#fff0f0',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>
                    Step {i + 1}: {s.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#444', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="notice-box" style={{ marginTop: 16 }}>
            ⚠️ <strong>Important:</strong> Only purchase tickets from authorised retailers. Money Lottery is only for persons aged 18 and above. Play responsibly.
          </div>
        </div>
      </div>

      {/* Available Lotteries */}
      <div className="card">
        <div className="section-header">💰 Available Money Lottery Draws</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="result-table">
            <thead>
              <tr>
                <th>Lottery Name</th>
                <th>Draw Time</th>
                <th>Ticket Price</th>
                <th>1st Prize</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Money Morning Star', '11:55 AM', '₹50', '₹1,00,00,000'],
                ['Money Gold', '3:00 PM', '₹40', '₹50,00,000'],
                ['Money Jackpot', '7:00 PM', '₹100', '₹2,00,00,000'],
                ['Money Bumper', '8:00 PM', '₹200', '₹5,00,00,000'],
                ['Money Super', '9:00 PM', '₹150', '₹3,00,00,000'],
              ].map(([name, time, price, prize], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>💰 {name}</td>
                  <td>{time}</td>
                  <td style={{ color: 'var(--red)', fontWeight: 700 }}>{price}</td>
                  <td style={{ color: 'var(--green-light)', fontWeight: 800 }}>{prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
