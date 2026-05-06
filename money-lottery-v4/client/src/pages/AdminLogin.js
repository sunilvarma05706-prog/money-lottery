import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Username aur password daalein.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/api/login`, form);
      localStorage.setItem('ml_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <div className="login-card">
        <h2>💰 Money Lottery</h2>
        <div className="login-sub">Admin / Owner Login</div>
        {error && <div className="login-error">⚠️ {error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="admin" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : '🔑 LOGIN'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.7rem', color: '#333' }}>
          Default: admin / admin123
        </div>
      </div>
    </div>
  );
}
