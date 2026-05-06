import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Upcoming() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/upcoming`)
      .then(r => r.json())
      .then(d => { setDraws(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="section-header" style={{ background: 'linear-gradient(90deg, var(--green), var(--green-light))' }}>
          📅 Upcoming Lottery Draws
        </div>
        {loading ? (
          <div className="loading">Loading draws</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="upcoming-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lottery Name</th>
                  <th>Draw Date</th>
                  <th>Draw Time</th>
                  <th>Ticket Price</th>
                  <th>1st Prize</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>💰 {d.name}</td>
                    <td>{d.drawDate}</td>
                    <td style={{ fontWeight: 600 }}>{d.drawTime}</td>
                    <td style={{ color: 'var(--red)', fontWeight: 600 }}>{d.ticketPrice}</td>
                    <td style={{ fontWeight: 800, color: 'var(--green-light)' }}>{d.prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
