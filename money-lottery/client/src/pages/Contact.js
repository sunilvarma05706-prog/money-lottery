import React from 'react';

export default function Contact() {
  return (
    <div className="page-wrapper">
      <div className="two-col">
        <div className="card">
          <div className="section-header">📞 Contact Us</div>
          <div style={{ padding: 16 }}>
            {[
              { icon: '📞', label: 'Helpline', value: '1800-XXX-XXXX (Toll Free)' },
              { icon: '📧', label: 'Email', value: 'info@moneylottery.com' },
              { icon: '⏰', label: 'Office Hours', value: 'Mon–Sat: 9:00 AM – 6:00 PM' },
              { icon: '📍', label: 'Address', value: 'Money Lottery Office, India' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0', borderBottom: i < 3 ? '1px solid #eee' : 'none',
              }}>
                <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header">✉️ Send a Message</div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Your Name', 'Your Email', 'Phone Number'].map((ph, i) => (
              <input key={i} type="text" placeholder={ph} style={{
                padding: '9px 12px', border: '2px solid #ddd', borderRadius: 6,
                fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none',
              }} onFocus={e => e.target.style.borderColor = 'var(--gold-dark)'}
                onBlur={e => e.target.style.borderColor = '#ddd'} />
            ))}
            <textarea placeholder="Your Message" rows={4} style={{
              padding: '9px 12px', border: '2px solid #ddd', borderRadius: 6,
              fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', resize: 'vertical',
            }} onFocus={e => e.target.style.borderColor = 'var(--gold-dark)'}
              onBlur={e => e.target.style.borderColor = '#ddd'} />
            <button className="btn-check" style={{ alignSelf: 'flex-start' }}>
              📤 Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
