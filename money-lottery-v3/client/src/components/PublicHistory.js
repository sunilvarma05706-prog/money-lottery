import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const S = {
  wrap: {
    background:'#000',
    border:'2px solid #00aaaa',
    borderRadius:4,
    marginTop:6,
    overflow:'hidden',
  },
  header: {
    background:'linear-gradient(90deg,#003333,#004444)',
    padding:'10px 16px',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    flexWrap:'wrap',
    gap:8,
    cursor:'pointer',
  },
  headerTitle: {
    color:'#ffff00',
    fontSize:'1rem',
    fontWeight:800,
    letterSpacing:1,
  },
  headerSub: {
    color:'#aaa',
    fontSize:'0.72rem',
    marginTop:2,
  },
  body: {
    padding:'12px 10px',
    background:'#000',
  },
  // Stats row
  statsRow: {
    display:'flex',
    gap:8,
    flexWrap:'wrap',
    marginBottom:12,
  },
  statCard: {
    background:'#001a1a',
    border:'1px solid #003333',
    borderRadius:4,
    padding:'8px 14px',
    flex:'1 1 100px',
    textAlign:'center',
  },
  statYear: { color:'#00ffff', fontSize:'1rem', fontWeight:800 },
  statEntries: { color:'#ffff00', fontSize:'1.3rem', fontWeight:800, lineHeight:1.2 },
  statDays: { color:'#aaa', fontSize:'0.72rem' },
  // Filters
  filterRow: {
    display:'flex',
    gap:8,
    flexWrap:'wrap',
    marginBottom:10,
    alignItems:'flex-end',
  },
  filterGroup: { display:'flex', flexDirection:'column', gap:4 },
  filterLabel: { color:'#aaa', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:.5 },
  select: {
    background:'#001010',
    border:'2px solid #00aaaa',
    color:'#00ffff',
    padding:'7px 10px',
    borderRadius:4,
    fontFamily:"'Baloo 2',sans-serif",
    fontWeight:700,
    fontSize:'0.85rem',
    outline:'none',
    cursor:'pointer',
    minWidth:140,
  },
  searchInput: {
    background:'#001010',
    border:'2px solid #00aaaa',
    color:'#fff',
    padding:'7px 10px',
    borderRadius:4,
    fontFamily:"'Baloo 2',sans-serif",
    fontSize:'0.85rem',
    outline:'none',
    width:120,
  },
  btnFilter: {
    background:'linear-gradient(90deg,#006666,#00aaaa)',
    color:'#ffff00',
    border:'none',
    padding:'7px 16px',
    borderRadius:4,
    fontWeight:700,
    cursor:'pointer',
    fontFamily:"'Baloo 2',sans-serif",
    fontSize:'0.82rem',
  },
  btnDownload: {
    background:'linear-gradient(90deg,#006600,#00aa00)',
    color:'#ffff00',
    border:'none',
    padding:'7px 16px',
    borderRadius:4,
    fontWeight:700,
    cursor:'pointer',
    fontFamily:"'Baloo 2',sans-serif",
    fontSize:'0.82rem',
    textDecoration:'none',
    display:'inline-block',
  },
  // Table
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' },
  th: {
    background:'#003333',
    color:'#00ffff',
    padding:'6px 10px',
    border:'1px solid #005555',
    fontWeight:700,
    textAlign:'center',
    position:'sticky',
    top:0,
  },
  td: {
    padding:'5px 10px',
    border:'1px solid #001a1a',
    textAlign:'center',
    fontFamily:"'Rajdhani',monospace",
    fontWeight:600,
  },
  // Pagination
  pagRow: {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    gap:6,
    marginTop:10,
    flexWrap:'wrap',
  },
  pgBtn: {
    background:'#002222',
    border:'1px solid #005555',
    color:'#aaa',
    padding:'4px 10px',
    borderRadius:3,
    cursor:'pointer',
    fontFamily:"'Baloo 2',sans-serif",
    fontSize:'0.78rem',
  },
  pgBtnActive: {
    background:'#004444',
    border:'1px solid #00aaaa',
    color:'#ffff00',
    padding:'4px 10px',
    borderRadius:3,
    fontWeight:700,
    fontFamily:"'Baloo 2',sans-serif",
    fontSize:'0.78rem',
  },
  pgInfo: { color:'#555', fontSize:'0.74rem' },
};

export default function PublicHistory() {
  const [open,       setOpen]      = useState(false);
  const [stats,      setStats]     = useState([]);
  const [years,      setYears]     = useState([]);
  const [selYear,    setSelYear]   = useState('2026');
  const [dates,      setDates]     = useState([]);
  const [selDate,    setSelDate]   = useState('');
  const [numFilter,  setNumFilter] = useState('');
  const [rows,       setRows]      = useState([]);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages]= useState(1);
  const [page,       setPage]      = useState(1);
  const [loading,    setLoading]   = useState(false);

  // Load stats + years on mount
  useEffect(()=>{
    axios.get(`${API}/api/public/stats`).then(r=>setStats(r.data.stats||[])).catch(()=>{});
    axios.get(`${API}/api/public/years`).then(r=>{
      setYears(r.data.years||[]);
    }).catch(()=>{});
  },[]);

  // Load dates when year changes
  useEffect(()=>{
    if (!selYear) return;
    setSelDate(''); setPage(1);
    axios.get(`${API}/api/public/dates/${selYear}`)
      .then(r=>setDates(r.data.dates||[]))
      .catch(()=>{});
  },[selYear]);

  // Load data
  const loadData = useCallback((pg=1)=>{
    if (!selYear) return;
    setLoading(true);
    const params = new URLSearchParams({ page:pg, limit:50 });
    if (selDate) params.append('date', selDate);
    axios.get(`${API}/api/public/data/${selYear}?${params}`)
      .then(r=>{
        let filtered = r.data.rows||[];
        if (numFilter.trim()) {
          const nf = numFilter.trim().padStart(2,'0');
          filtered = filtered.filter(row=>String(row.Number).padStart(2,'0')===nf);
        }
        setRows(filtered);
        setTotal(r.data.total);
        setTotalPages(r.data.totalPages);
        setPage(r.data.page);
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[selYear, selDate, numFilter]);

  // Load when open + year change
  useEffect(()=>{
    if (open && selYear) loadData(1);
  },[open, selYear, selDate]);

  const handleSearch = ()=>loadData(1);
  const goPage = (p)=>{ loadData(p); };

  const numColor = (row) => {
    if (row.Special==='Yes') return '#00ffff';
    const n = parseInt(row.Number);
    if (n >= 90) return '#ff4444';
    if (n <= 9)  return '#ff8800';
    return '#ffffff';
  };

  // Pagination buttons
  const pageButtons = () => {
    const btns = [];
    const start = Math.max(1, page-2);
    const end   = Math.min(totalPages, page+2);
    if (start>1) btns.push(1,'...');
    for (let p=start; p<=end; p++) btns.push(p);
    if (end<totalPages) btns.push('...', totalPages);
    return btns;
  };

  return (
    <div style={S.wrap}>
      {/* ── Toggle Header ── */}
      <div style={S.header} onClick={()=>setOpen(o=>!o)}>
        <div>
          <div style={S.headerTitle}>
            📊 पूरा डेटा देखें — 2022 से 2026 तक &nbsp;
            <span style={{fontSize:'0.75rem', color:'#aaa'}}>
              ({open ? '▲ बंद करें' : '▼ खोलें'})
            </span>
          </div>
          <div style={S.headerSub}>
            All Historical Lottery Results | Excel Download Available
          </div>
        </div>
        <a
          href={`${API}/api/download/excel`}
          style={S.btnDownload}
          onClick={e=>e.stopPropagation()}
          download
        >
          📥 Excel Download
        </a>
      </div>

      {open && (
        <div style={S.body}>

          {/* ── Stats Cards ── */}
          <div style={S.statsRow}>
            {stats.map(s=>(
              <div key={s.year} style={{
                ...S.statCard,
                ...(s.year===selYear ? {borderColor:'#00ffff',background:'#001a2a'} : {})
              }} onClick={()=>setSelYear(s.year)} title={`Click to view ${s.year}`}>
                <div style={S.statYear}>{s.year}</div>
                <div style={S.statEntries}>{s.totalEntries.toLocaleString()}</div>
                <div style={S.statDays}>{s.totalDays} days</div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div style={S.filterRow}>
            {/* Year */}
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>📅 Year</span>
              <select style={S.select} value={selYear}
                onChange={e=>{setSelYear(e.target.value); setPage(1);}}>
                {years.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Date */}
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>🗓 Date</span>
              <select style={S.select} value={selDate}
                onChange={e=>{setSelDate(e.target.value); setPage(1);}}>
                <option value="">— सभी dates —</option>
                {dates.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Number Search */}
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>🔢 Number खोजें</span>
              <input type="number" min={0} max={99}
                style={S.searchInput} placeholder="0–99"
                value={numFilter}
                onChange={e=>setNumFilter(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSearch()}
              />
            </div>

            <div style={S.filterGroup}>
              <span style={S.filterLabel}>&nbsp;</span>
              <button style={S.btnFilter} onClick={handleSearch}>🔍 Search</button>
            </div>

            <div style={S.filterGroup}>
              <span style={S.filterLabel}>&nbsp;</span>
              <button style={{...S.btnFilter, background:'#330000', color:'#ff9999'}}
                onClick={()=>{setSelDate('');setNumFilter('');loadData(1);}}>
                ✕ Clear
              </button>
            </div>
          </div>

          {/* ── Info Bar ── */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
            marginBottom:8, flexWrap:'wrap', gap:6}}>
            <div style={{fontSize:'0.74rem',color:'#555'}}>
              {loading ? '⏳ Loading...' : (
                <>
                  <span style={{color:'#00aaaa'}}>{selYear}</span>
                  {selDate && <> &nbsp;›&nbsp; <span style={{color:'var(--yellow)' }}>{selDate}</span></>}
                  &nbsp;|&nbsp;
                  <span style={{color:'#aaa'}}>{rows.length} rows shown</span>
                  &nbsp;|&nbsp; Total in filter: <span style={{color:'#ffff00'}}>{total.toLocaleString()}</span>
                </>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{...S.tableWrap, maxHeight:400, overflowY:'auto'}}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Time Slot</th>
                  <th style={S.th}>Display</th>
                  <th style={S.th}>Number</th>
                  <th style={S.th}>Special</th>
                </tr>
              </thead>
              <tbody>
                {rows.length===0 && !loading && (
                  <tr><td colSpan={6} style={{...S.td,color:'#333',padding:20,textAlign:'center'}}>
                    कोई data नहीं मिला
                  </td></tr>
                )}
                {rows.map((r,i)=>(
                  <tr key={i} style={{background: i%2===0?'#001010':'#000c0c'}}>
                    <td style={{...S.td,color:'#333',fontSize:'0.72rem'}}>
                      {(page-1)*50+i+1}
                    </td>
                    <td style={{...S.td,color:'#aaa',fontSize:'0.78rem'}}>{r["Date"]}</td>
                    <td style={{...S.td,color:'#555'}}>{r["Time Slot"]}</td>
                    <td style={{...S.td,color:'#888'}}>{r["Display Time"]}</td>
                    <td style={{...S.td, color:numColor(r), fontSize:'1.1rem', fontWeight:800,
                      textShadow: r.Special==='Yes'?'0 0 8px rgba(0,255,255,.5)':'none'}}>
                      {String(r.Number).padStart(2,'0')}
                      {r.Special==='Yes' && <span style={{color:'#00ffff',fontSize:'0.65rem',marginLeft:3}}>★</span>}
                    </td>
                    <td style={{...S.td}}>
                      {r.Special==='Yes'
                        ? <span style={{color:'#00ffff',fontSize:'0.8rem'}}>★ Yes</span>
                        : <span style={{color:'#222'}}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages>1 && (
            <div style={S.pagRow}>
              <button style={S.pgBtn} onClick={()=>goPage(1)} disabled={page===1}>«</button>
              <button style={S.pgBtn} onClick={()=>goPage(page-1)} disabled={page===1}>‹</button>
              {pageButtons().map((b,i)=>
                b==='...'
                  ? <span key={`e${i}`} style={{color:'#333',fontSize:'0.74rem'}}>…</span>
                  : <button key={b} style={b===page?S.pgBtnActive:S.pgBtn}
                      onClick={()=>goPage(b)}>{b}</button>
              )}
              <button style={S.pgBtn} onClick={()=>goPage(page+1)} disabled={page===totalPages}>›</button>
              <button style={S.pgBtn} onClick={()=>goPage(totalPages)} disabled={page===totalPages}>»</button>
              <span style={S.pgInfo}>Page {page}/{totalPages}</span>
            </div>
          )}

          <div style={{marginTop:10,fontSize:'0.7rem',color:'#333',textAlign:'center'}}>
            💡 Data auto-saves to Excel when Admin number post करता है &nbsp;|&nbsp;
            <a href={`${API}/api/download/excel`} style={{color:'#004444'}} download>
              📥 Full Excel Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
