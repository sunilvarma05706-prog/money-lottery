import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('ml_token')}` };
}

export default function AdminPanel() {
  const [number, setNumber]       = useState('');
  const [special, setSpecial]     = useState(false);
  const [results, setResults]     = useState([]);
  const [currentNum, setCurrentNum] = useState(null);
  const [msg, setMsg]             = useState(null); // { type:'success'|'error', text }
  const [posting, setPosting]     = useState(false);
  const [pwForm, setPwForm]       = useState({ newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg]         = useState(null);
  const navigate = useNavigate();

  /* load initial data */
  useEffect(() => {
    axios.get(`${API}/api/data`)
      .then(r => {
        setResults(r.data.results || []);
        setCurrentNum(r.data.currentNumber);
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem('ml_token');
    navigate('/admin/login');
  };

  /* POST number */
  const postNumber = async () => {
    const n = parseInt(number);
    if (number === '' || isNaN(n) || n < 0 || n > 99) {
      setMsg({ type: 'error', text: 'Please enter a valid number (0–99).' });
      return;
    }
    setPosting(true);
    setMsg(null);
    try {
      const { data } = await axios.post(
        `${API}/api/number`,
        { number: n, special },
        { headers: authHeader() }
      );
      setResults(prev => [data.entry, ...prev]);
      setCurrentNum(n);
      setMsg({ type: 'success', text: `✅ Number ${String(n).padStart(2,'0')} posted successfully! Live on website.` });
      setNumber('');
      setSpecial(false);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to post number.' });
      }
    }
    setPosting(false);
  };

  /* Clear results */
  const clearResults = async () => {
    if (!window.confirm('Are you sure you want to clear ALL results?')) return;
    try {
      await axios.delete(`${API}/api/results`, { headers: authHeader() });
      setResults([]);
      setCurrentNum(null);
      setMsg({ type: 'success', text: '✅ All results cleared.' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to clear results.' });
    }
  };

  /* Change password */
  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      await axios.post(`${API}/api/change-password`,
        { newPassword: pwForm.newPassword },
        { headers: authHeader() }
      );
      setPwMsg({ type: 'success', text: '✅ Password changed successfully.' });
      setPwForm({ newPassword: '', confirm: '' });
    } catch {
      setPwMsg({ type: 'error', text: 'Failed to change password.' });
    }
  };

  /* keyboard enter */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') postNumber();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000010', padding: '10px 0 40px' }}>
      <div className="admin-wrapper">

        {/* ── Header ── */}
        <div className="admin-header">
          <div>
            <h2>💰 Money Lottery — Admin Panel</h2>
            <div style={{ color: '#666', fontSize: '0.72rem', marginTop: 2 }}>
              Owner Control Center
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/" target="_blank" rel="noreferrer"
               style={{ color: '#00aaaa', fontSize: '0.78rem', textDecoration: 'none' }}>
              🌐 View Site
            </a>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* ── Current Number ── */}
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ textAlign: 'left' }}>📊 Currently Showing on Website</h3>
          <div style={{
            fontSize: '5rem', fontWeight: 800, color: '#ffff00',
            fontFamily: "'Rajdhani', monospace",
            textShadow: '0 0 30px rgba(255,255,0,0.6)',
            lineHeight: 1
          }}>
            {currentNum !== null && currentNum !== undefined
              ? String(currentNum).padStart(2, '0')
              : '--'}
          </div>
          <div style={{ color: '#555', fontSize: '0.78rem', marginTop: 4 }}>
            Live on public website
          </div>
        </div>

        {/* ── Post Number ── */}
        <div className="admin-card">
          <h3>📤 Post New Number (Live)</h3>

          <div className="number-input-row">
            {/* Big number input */}
            <input
              type="number"
              className="big-input"
              min={0} max={99}
              placeholder="00"
              value={number}
              onChange={e => setNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* Meta */}
            <div className="input-meta">
              <label>Draw Label</label>
              <input type="text" defaultValue="मनी कड़ी" readOnly style={{ color: '#aaa' }} />
              <label className="special-toggle" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={special}
                  onChange={e => setSpecial(e.target.checked)}
                />
                <span style={{ color: '#00ffff', fontWeight: 600 }}>★ Special / Highlighted Number</span>
              </label>
            </div>

            {/* Post button */}
            <button
              className="btn-post"
              onClick={postNumber}
              disabled={posting || number === ''}
            >
              {posting ? '⏳ Posting...' : '📡 POST LIVE'}
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#444', marginTop: 10 }}>
            💡 Enter number 0–99 and click POST LIVE. It will appear instantly on the public website via Socket.io.
          </div>

          {msg && (
            <div className={msg.type === 'success' ? 'post-success' : 'post-error'} style={{ marginTop: 10 }}>
              {msg.text}
            </div>
          )}
        </div>

        {/* ── Recent Results ── */}
        <div className="admin-card">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Recent Results ({results.length} entries)</span>
            <button className="btn-danger" onClick={clearResults}>🗑 Clear All</button>
          </h3>
          <div style={{ overflowY: 'auto', maxHeight: 340 }}>
            <table className="admin-results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Number</th>
                  <th>Special</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={5} style={{ color: '#444', padding: 16 }}>No results yet</td></tr>
                ) : (
                  results.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: '#555' }}>{i + 1}</td>
                      <td>{r.date}</td>
                      <td>{r.time}</td>
                      <td style={{ color: r.special ? '#00ffff' : '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        {String(r.number).padStart(2, '0')}
                      </td>
                      <td>{r.special ? <span style={{ color: '#00ffff' }}>★</span> : <span style={{ color: '#333' }}>—</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div className="admin-card">
          <h3>🔑 Change Admin Password</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 0 }}>
              <button className="btn-post" style={{ fontSize: '0.85rem', padding: '9px 18px' }} onClick={changePassword}>
                Update
              </button>
            </div>
          </div>
          {pwMsg && (
            <div className={pwMsg.type === 'success' ? 'post-success' : 'post-error'} style={{ marginTop: 10 }}>
              {pwMsg.text}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#333', marginTop: 10 }}>
          💰 Money Lottery Admin Panel — All changes are live instantly
        </div>

      </div>
    </div>
  );
}
