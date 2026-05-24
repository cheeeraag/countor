import React from 'react';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', marginTop: '40px', background: 'var(--white)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          &copy; 2026 Countor. All Rights Reserved.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="/terms" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/privacy" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
