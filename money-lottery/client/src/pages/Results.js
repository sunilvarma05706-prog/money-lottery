import React, { useEffect, useState } from 'react';
import ResultCard from '../components/ResultCard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Results() {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/lotteries`)
      .then(r => r.json())
      .then(d => { setLotteries(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="section-header">🏆 Today's Complete Lottery Results — 12/04/2025</div>
        <div className="notice-box" style={{ margin: '12px 14px' }}>
          All results below are for <strong>12 April 2025</strong>. Results are published as soon as draws are completed.
        </div>
        {loading ? (
          <div className="loading">Loading results</div>
        ) : (
          <div style={{ padding: '0 14px 14px' }}>
            {lotteries.map(l => <ResultCard key={l.id} lottery={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
