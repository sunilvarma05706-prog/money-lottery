import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('ml_token')}` });

export default function AdminPanel() {
  const navigate = useNavigate();

  // State
  const [timeSlots,    setTimeSlots]    = useState([]);
  const [slotMap,      setSlotMap]      = useState({});
  const [activeSlot,   setActiveSlot]   = useState(null);
  const [rows,         setRows]         = useState([]);
  const [dateKey,      setDateKey]      = useState('');
  const [currentNum,   setCurrentNum]   = useState(null);

  // Form
  const [selSlot,  setSelSlot]  = useState('');
  const [valType,  setValType]  = useState('Number');
  const [number,   setNumber]   = useState('');
  const [special,  setSpecial]  = useState(false);
  const [posting,  setPosting]  = useState(false);
  const [msg,      setMsg]      = useState(null);

  // Password change
  const [pwForm, setPwForm] = useState({ np: '', cp: '' });
  const [pwMsg,  setPwMsg]  = useState(null);

  // History
  const [histDates, setHistDates] = useState([]);
  const [histDate,  setHistDate]  = useState('');
  const [histRows,  setHistRows]  = useState([]);

  /* ── Load today's data ── */
  const loadToday = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/today`, { headers: authH() });
      setTimeSlots(data.timeSlots || []);
      setSlotMap(data.slotMap    || {});
      setActiveSlot(data.activeSlot);
      setRows(data.rows          || []);
      setDateKey(data.dateKey    || '');
      setCurrentNum(data.currentNumber);
      // Default select: active slot or first slot
      if (!selSlot) {
        setSelSlot(data.activeSlot?.value || data.timeSlots?.[0]?.value || '');
      }
    } catch (e) {
      if (e.response?.status === 401) logout();
    }
  };

  useEffect(() => { loadToday(); }, []);

  /* ── Refresh active slot every 30s ── */
  useEffect(() => {
    const t = setInterval(loadToday, 30000);
    return () => clearInterval(t);
  }, [selSlot]);

  /* ── Load history dates ── */
  useEffect(() => {
    axios.get(`${API}/api/history`).then(r => setHistDates(r.data.dates || [])).catch(() => {});
  }, []);

  /* ── Load history for selected date ── */
  useEffect(() => {
    if (!histDate) return;
    axios.get(`${API}/api/history/${histDate}`)
      .then(r => setHistRows(r.data.rows || []))
      .catch(() => {});
  }, [histDate]);

  const logout = () => { localStorage.removeItem('ml_token'); navigate('/admin/login'); };

  /* ── POST number ── */
  const postNumber = async () => {
    if (!selSlot) { setMsg({ t: 'e', m: 'Time slot select करें।' }); return; }
    
    let subNum = number;
    if (valType === 'Holiday') {
      subNum = 'Holiday';
    } else {
      const n = parseInt(number);
      if (number === '' || isNaN(n) || n < 0 || n > 99) {
        setMsg({ t: 'e', m: 'Number 0–99 के बीच होना चाहिए।' }); return;
      }
      subNum = n;
    }
    
    setPosting(true); setMsg(null);
    try {
      await axios.post(`${API}/api/number`, { slotValue: selSlot, number: subNum, special: (valType==='Number'?special:false) }, { headers: authH() });
      setMsg({ t: 's', m: `✅ Entry slot ${timeSlots.find(s=>s.value===selSlot)?.label} पर post हो गई (Scheduled if future)!` });
      setNumber(''); setSpecial(false); setValType('Number');
      await loadToday();
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setMsg({ t: 'e', m: err.response?.data?.error || 'Post failed.' });
    }
    setPosting(false);
  };

  /* ── Delete one slot ── */
  const deleteSlot = async (slotVal) => {
    if (!window.confirm(`Slot ${slotVal} का number delete करें?`)) return;
    try {
      await axios.delete(`${API}/api/number/${slotVal}`, { headers: authH() });
      await loadToday();
    } catch (err) { if (err.response?.status === 401) logout(); }
  };

  /* ── Clear today ── */
  const clearToday = async () => {
    if (!window.confirm('आज की सभी entries delete करें?')) return;
    try {
      await axios.delete(`${API}/api/today`, { headers: authH() });
      await loadToday();
      setMsg({ t: 's', m: '✅ आज का सारा data clear हो गया।' });
    } catch { }
  };

  /* ── Change password ── */
  const changePass = async () => {
    if (pwForm.np !== pwForm.cp) { setPwMsg({ t:'e', m:'Passwords match नहीं हुए।' }); return; }
    if (pwForm.np.length < 6)    { setPwMsg({ t:'e', m:'Min 6 characters चाहिए।' }); return; }
    try {
      await axios.post(`${API}/api/change-password`, { newPassword: pwForm.np }, { headers: authH() });
      setPwMsg({ t:'s', m:'✅ Password बदल गया।' });
      setPwForm({ np:'', cp:'' });
    } catch { setPwMsg({ t:'e', m:'Failed.' }); }
  };

  /* ── Click slot cell to auto-select ── */
  const clickSlot = (val) => setSelSlot(val);

  const selSlotObj = timeSlots.find(s => s.value === selSlot);

  return (
    <div style={{ minHeight:'100vh', background:'#000010', paddingBottom:40 }}>
      <div className="admin-wrapper">

        {/* ── Top Bar ── */}
        <div className="admin-topbar">
          <div>
            <h2>💰 Money Lottery — Admin Panel</h2>
            <div style={{ color:'#555', fontSize:'0.7rem', marginTop:2 }}>
              Today: <span style={{ color:'var(--cyan)' }}>{dateKey}</span>
              &nbsp;|&nbsp; Active Slot: <span style={{ color:'var(--yellow)' }}>{activeSlot?.label || 'N/A'}</span>
              &nbsp;|&nbsp; Live Number: <span style={{ color:'var(--green)', fontWeight:800 }}>
                {currentNum !== null && currentNum !== undefined ? String(currentNum).padStart(2,'0') : '--'}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <a href="/" target="_blank" rel="noreferrer"
               style={{ color:'#00aaaa', fontSize:'0.78rem', textDecoration:'none', alignSelf:'center' }}>
              🌐 Site देखें
            </a>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* ── Current Number ── */}
        <div className="admin-card" style={{ textAlign:'center' }}>
          <h3 style={{ justifyContent:'center' }}>📡 अभी Website पर यह Number दिख रहा है</h3>
          <div style={{ fontSize:'5.5rem', fontWeight:800, color:'#ffff00',
            fontFamily:"'Rajdhani',monospace", textShadow:'0 0 30px rgba(255,255,0,.6)', lineHeight:1 }}>
            {currentNum !== null && currentNum !== undefined ? String(currentNum).padStart(2,'0') : '--'}
          </div>
          <div style={{ color:'#555', fontSize:'0.78rem', marginTop:6 }}>
            Slot: {activeSlot?.label || 'कोई active slot नहीं'} — Visitors को real-time में दिखता है
            <br/><span style={{color:'#ffaa00'}}>Scheduled entries (future slots) live time आने पर ही public को दिखेंगी।</span>
          </div>
        </div>

        {/* ══ POST NUMBER CARD ══ */}
        <div className="admin-card">
          <h3>📤 Number Post करें (Time Slot चुनें)</h3>

          <div className="post-row">
            {/* Time Slot Dropdown */}
            <div className="field-group">
              <label>⏰ Time Slot Select करें</label>
              <select className="slot-select" value={selSlot}
                onChange={e => setSelSlot(e.target.value)}>
                <option value="">— Slot चुनें —</option>
                {timeSlots.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}{slotMap[s.value] ? ` ✓ (${slotMap[s.value].Number==='Holiday'?'Holiday':String(slotMap[s.value].Number).padStart(2,'0')})` : ''}
                    {activeSlot?.value === s.value ? ' ◀ LIVE' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Number Input / Holiday Select */}
            <div className="field-group">
              <label>🔢 Type &amp; Value</label>
              <div style={{ display:'flex', gap:6 }}>
                <select className="slot-select" style={{ width:100 }}
                  value={valType} onChange={e=>setValType(e.target.value)}>
                  <option value="Number">Number</option>
                  <option value="Holiday">Holiday</option>
                </select>
                {valType === 'Number' && (
                  <input
                    type="number" className="num-input" style={{ width:80 }}
                    min={0} max={99} placeholder="00"
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && postNumber()}
                  />
                )}
              </div>
            </div>

            {/* Special + Post */}
            <div className="field-group" style={{ justifyContent:'flex-end' }}>
              <label className="special-chk">
                <input type="checkbox" checked={special}
                  onChange={e => setSpecial(e.target.checked)} />
                <span style={{ color:'var(--cyan)' }}>★ Special Number</span>
              </label>
              <button className="btn-post"
                onClick={postNumber}
                disabled={posting || !selSlot || (valType==='Number' && number === '')}>
                {posting ? '⏳ Posting...' : '📡 POST / SCHEDULE'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {selSlotObj && (valType === 'Holiday' || (number !== '' && !isNaN(parseInt(number)))) && (
            <div style={{ marginTop:10, background:'#001a00', border:'1px solid #006600',
              borderRadius:4, padding:'8px 14px', fontSize:'0.85rem', color:'#88ff88' }}>
              👁️ Preview: Slot <strong style={{ color:'var(--yellow)' }}>{selSlotObj.label}</strong>
              &nbsp;→ &nbsp;<strong style={{ color:'var(--yellow)', fontSize:'1.1rem' }}>
                {valType === 'Holiday' ? 'Holiday' : String(parseInt(number)).padStart(2,'0')}
              </strong>
              {valType === 'Number' && special && <span style={{ color:'var(--cyan)', marginLeft:8 }}>★ Special</span>}
            </div>
          )}

          {msg && (
            <div className={msg.t === 's' ? 'msg-success' : 'msg-error'} style={{ marginTop:10 }}>
              {msg.m}
            </div>
          )}
        </div>

        {/* ══ SLOTS GRID ══ */}
        <div className="admin-card">
          <h3>
            <span>🗓️ आज के सभी Slots ({rows.length}/{timeSlots.length} filled)</span>
            <button className="btn-danger-full" onClick={clearToday}>🗑 Clear All</button>
          </h3>
          <div style={{ fontSize:'0.72rem', color:'#555', marginBottom:8 }}>
            💡 किसी slot पर click करें उसे auto-select करने के लिए
          </div>
          <div className="slots-grid">
            {timeSlots.map(slot => {
              const row      = slotMap[slot.value];
              const isActive = activeSlot?.value === slot.value;
              const isSel    = selSlot === slot.value;
              return (
                <div key={slot.value}
                  className={`slot-cell${row ? ' filled' : ''}${isActive ? ' active-now' : ''}`}
                  onClick={() => clickSlot(slot.value)}
                  style={isSel ? { outline:'2px solid var(--cyan)', outlineOffset:2 } : {}}>
                  <div className="sc-time">
                    {slot.label}
                    {isActive && <span style={{ color:'var(--green)', fontSize:'0.6rem' }}> ●</span>}
                  </div>
                  {row
                    ? <div className={`sc-num${row.Special==='Yes' ? '' : ''}`}
                        style={{ color: row.Special==='Yes' ? 'var(--cyan)' : 'var(--yellow)', fontSize: row.Number==='Holiday'?'0.9rem':undefined }}>
                        {row.Number === 'Holiday' ? 'Holiday' : String(row.Number).padStart(2,'0')}
                        {row.Special==='Yes' && <span style={{ fontSize:'0.6rem', marginLeft:2 }}>★</span>}
                      </div>
                    : <div className="sc-empty">—</div>
                  }
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ TODAY'S TABLE ══ */}
        <div className="admin-card">
          <h3>📋 आज का Data (Excel में Save होता है)</h3>
          <div style={{ overflowX:'auto', maxHeight:320, overflowY:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Display Time</th>
                  <th>Number</th>
                  <th>Special</th>
                  <th>Posted At</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0
                  ? <tr><td colSpan={6} style={{ color:'#444', padding:16 }}>अभी कोई entry नहीं है</td></tr>
                  : rows.map((r, i) => (
                    <tr key={i}
                      className={activeSlot?.value === r['Time Slot'] ? 'active-tr' : ''}>
                      <td style={{ color:'var(--cyan)' }}>{r['Time Slot']}</td>
                      <td>{r['Display Time']}</td>
                      <td style={{ fontSize: r.Number==='Holiday' ? '0.9rem' : '1.1rem', fontWeight:800,
                        color: r.Special==='Yes' ? 'var(--cyan)' : 'var(--yellow)' }}>
                        {r.Number === 'Holiday' ? 'Holiday' : String(r.Number).padStart(2,'0')}
                        {r.Special==='Yes' && <span style={{ color:'var(--cyan)', marginLeft:4 }}>★</span>}
                      </td>
                      <td>{r.Special==='Yes'
                        ? <span style={{ color:'var(--cyan)' }}>Yes</span>
                        : <span style={{ color:'#333' }}>No</span>}
                      </td>
                      <td style={{ fontSize:'0.75rem', color:'#666' }}>{r['Posted At']}</td>
                      <td>
                        <button className="btn-sm" onClick={() => deleteSlot(r['Time Slot'])}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:8, fontSize:'0.72rem', color:'#444' }}>
            📊 यह data server पर <strong style={{ color:'#00aaaa' }}>lottery_data.xlsx</strong> file में store होता है।
            हर दिन अलग sheet बनती है।
          </div>
        </div>

        {/* ══ HISTORY ══ */}
        <div className="admin-card">
          <h3>📅 पिछले दिनों का Data देखें</h3>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:10 }}>
            <div className="field-group">
              <label>Date चुनें</label>
              <select className="slot-select" style={{ minWidth:160 }}
                value={histDate} onChange={e => setHistDate(e.target.value)}>
                <option value="">— Date चुनें —</option>
                {histDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {histRows.length > 0 && (
            <div style={{ overflowX:'auto', maxHeight:260, overflowY:'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr><th>Time Slot</th><th>Display</th><th>Number</th><th>Special</th><th>Posted At</th></tr>
                </thead>
                <tbody>
                  {histRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color:'var(--cyan)' }}>{r['Time Slot']}</td>
                      <td>{r['Display Time']}</td>
                      <td style={{ color: r.Special==='Yes' ? 'var(--cyan)' : 'var(--yellow)',
                        fontSize: r.Number==='Holiday' ? '0.9rem' : '1.1rem', fontWeight:800 }}>
                        {r.Number === 'Holiday' ? 'Holiday' : String(r.Number).padStart(2,'0')}
                      </td>
                      <td>{r.Special==='Yes' ? '★' : '—'}</td>
                      <td style={{ fontSize:'0.72rem', color:'#666' }}>{r['Posted At']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {histDate && histRows.length === 0 && (
            <div style={{ color:'#444', fontSize:'0.82rem', padding:'8px 0' }}>इस date का कोई data नहीं।</div>
          )}
        </div>

        {/* ══ CHANGE PASSWORD ══ */}
        <div className="admin-card">
          <h3>🔑 Password बदलें</h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div className="field-group" style={{ flex:1, minWidth:150 }}>
              <label>New Password</label>
              <input type="password" className="slot-select" style={{ fontSize:'0.9rem', padding:'9px 12px' }}
                placeholder="Min 6 characters"
                value={pwForm.np} onChange={e => setPwForm({ ...pwForm, np:e.target.value })} />
            </div>
            <div className="field-group" style={{ flex:1, minWidth:150 }}>
              <label>Confirm Password</label>
              <input type="password" className="slot-select" style={{ fontSize:'0.9rem', padding:'9px 12px' }}
                placeholder="Repeat password"
                value={pwForm.cp} onChange={e => setPwForm({ ...pwForm, cp:e.target.value })} />
            </div>
            <div className="field-group" style={{ justifyContent:'flex-end' }}>
              <label>&nbsp;</label>
              <button className="btn-post" style={{ fontSize:'0.85rem' }} onClick={changePass}>
                Update
              </button>
            </div>
          </div>
          {pwMsg && (
            <div className={pwMsg.t==='s' ? 'msg-success' : 'msg-error'} style={{ marginTop:10 }}>
              {pwMsg.m}
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', fontSize:'0.7rem', color:'#333' }}>
          💰 Money Lottery Admin v3 — Data saved to Excel | Socket.io Live Updates
        </div>

      </div>
    </div>
  );
}
