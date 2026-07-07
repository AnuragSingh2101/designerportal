import React from 'react';
import { Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '56px 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="footer-logo-badge">
            <Award size={16} style={{ color: '#ffffff' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)'
          }}>
            ATELIER<span style={{ fontWeight: '300', opacity: 0.85 }}>CONNECT</span>
          </span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '420px', lineHeight: '1.5' }}>
          Connecting visionaries with builders. Empowering architectural and interior leads to design the world.
        </p>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '500' }} suppressHydrationWarning>
          &copy; {new Date().getFullYear()} AtelierConnect Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
