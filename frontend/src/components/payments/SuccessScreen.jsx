import React, { memo } from 'react';
import { CheckCircle, Mail } from 'lucide-react';

/**
 * SuccessScreen Component - Payment Success with Email Emphasis
 */
const SuccessScreen = memo(({ onDashboard = () => console.log('Dashboard clicked') }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '10vh',
      padding: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0,255,222,0.3), 0 0 40px rgba(0,255,222,0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0,255,222,0.5), 0 0 60px rgba(0,255,222,0.3);
          }
        }
      `}</style>
      
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(6,20,22,0.92)',
        border: '1px solid rgba(0,255,222,0.18)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,222,0.05) inset',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        animation: 'fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Success Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'rgba(0,255,222,0.12)',
          borderRadius: '50%',
          marginBottom: '24px',
          animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards'
        }}>
          <CheckCircle style={{
            width: '44px',
            height: '44px',
            color: '#00ffde'
          }} />
        </div>

        {/* Success Title */}
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          margin: '0 0 16px',
          color: '#fff',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: '1.2'
        }}>
          PAYMENT SUCCESSFUL!
        </h1>

        {/* Success Message */}
        <p style={{
          color: '#9fece2',
          fontSize: 'clamp(14px, 3.5vw, 15px)',
          margin: '0 0 32px',
          lineHeight: '1.6'
        }}>
          Your payment has been processed successfully. Your spot in the webinar is now confirmed.
        </p>

        {/* IMPORTANT: Check Email Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,222,0.15) 0%, rgba(0,212,184,0.12) 100%)',
          border: '2px solid rgba(0,255,222,0.4)',
          borderRadius: '12px',
          padding: '24px 16px',
          marginBottom: '28px',
          animation: 'glow 2s ease-in-out infinite',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(0,255,222,0.1) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
          
          {/* Mail Icon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'rgba(0,255,222,0.15)',
            borderRadius: '50%',
            marginBottom: '16px',
            position: 'relative'
          }}>
            <Mail style={{
              width: '28px',
              height: '28px',
              color: '#00ffde'
            }} />
          </div>

          {/* Main Email Message */}
          <h3 style={{
            color: '#00ffde',
            fontSize: 'clamp(16px, 4.5vw, 22px)',
            fontWeight: '700',
            margin: '0 0 12px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            lineHeight: '1.3',
            position: 'relative'
          }}>
            CHECK YOUR EMAIL
          </h3>
          <p style={{
            color: '#9fece2',
            fontSize: 'clamp(13px, 3.5vw, 15px)',
            margin: '0',
            lineHeight: '1.5',
            position: 'relative'
          }}>
            You'll receive a receipt and a <strong style={{color: '#00ffde'}}>verification form link</strong>. Complete the form to finalize your registration.
          </p>
        </div>

        {/* Google Form Link */}
        <div style={{
          background: 'rgba(255,193,7,0.1)',
          border: '2px solid rgba(255,193,7,0.3)',
          borderRadius: '12px',
          padding: '20px 16px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#ffc107',
            fontSize: 'clamp(13px, 3.5vw, 15px)',
            margin: '0 0 12px',
            fontWeight: '600'
          }}>
            ⚠️ ACTION REQUIRED
          </p>
          <p style={{
            color: '#fff',
            fontSize: 'clamp(12px, 3vw, 14px)',
            margin: '0 0 16px',
            lineHeight: '1.5'
          }}>
            Complete the verification form in your email to receive Discord access.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#ffc107',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            📝 OPEN VERIFICATION FORM
          </a>
        </div>

        {/* Additional Info */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,255,222,0.1)',
          borderRadius: '10px',
          padding: '14px 12px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: 'rgba(159,236,226,0.7)',
            fontSize: 'clamp(11px, 3vw, 12px)',
            margin: '0',
            lineHeight: '1.5'
          }}>
            📧 Check your email (and spam folder) for receipt and verification form link.
          </p>
        </div>
      </div>
    </div>
  );
});

SuccessScreen.displayName = 'SuccessScreen';

export default SuccessScreen;
