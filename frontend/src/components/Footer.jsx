import React from 'react';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', marginTop: '40px', background: 'var(--white)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            &copy; 2026 Countor. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/terms" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
        </div>
        
        {/* Compliance Footer */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>
            <strong>Scientific Instrument Attributions:</strong> "The Mental Health Continuum: From Languishing to Flourishing in Life" by Corey L. M. Keyes (2002). 
            PHQ-9 & GAD-7 developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. 
            No permission required to reproduce, translate, display or distribute.
          </p>
        </div>
      </div>
    </footer>
  );
}
