import React, { memo } from 'react';
import { Mail, Phone } from 'lucide-react';

/**
 * ContactInfo Component - Enhanced UI
 */
const ContactInfo = memo(() => {
  return (
    <div style={{
      background: 'rgba(6,20,22,0.92)',
      border: '1px solid rgba(0,255,222,0.12)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,255,222,0.03) inset',
      backdropFilter: 'blur(12px)'
    }}>
      {/* Header */}
      <h3 style={{
        color: '#ccfff7',
        fontSize: '17px',
        fontWeight: '600',
        margin: '0 0 10px',
        letterSpacing: '0.02em'
      }}>
        Need Help?
      </h3>
      
      {/* Description */}
      <p style={{
        color: 'rgba(159,236,226,0.6)',
        margin: '0 0 20px',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Questions about the webinar? Our team is here to help.
      </p>
      
      {/* Contact Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Email */}
        <a 
          href="mailto:contact@silentequity.com"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,255,222,0.12)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#9fece2',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,255,222,0.3)';
            e.currentTarget.style.background = 'rgba(0,255,222,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,255,222,0.12)';
            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
          }}
        >
          <Mail style={{ width: '18px', height: '18px', color: '#00ffde', flexShrink: 0 }} />
          <span>unmask@thesilentequity.com</span>
        </a>
        
        {/* Phone */}
        <a 
          href="tel:+1234567890"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,255,222,0.12)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#9fece2',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,255,222,0.3)';
            e.currentTarget.style.background = 'rgba(0,255,222,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,255,222,0.12)';
            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
          }}
        >
          <Phone style={{ width: '18px', height: '18px', color: '#00ffde', flexShrink: 0 }} />
          <span>+971547731813</span>
        </a>
      </div>
    </div>
  );
});

ContactInfo.displayName = 'ContactInfo';

export default ContactInfo;
