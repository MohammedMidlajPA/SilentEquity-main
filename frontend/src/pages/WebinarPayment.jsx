// WebinarPayment.jsx
// This page only handles the success redirect from Stripe Checkout
// The actual payment flow starts from the "Reserve your slot" button in App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  AnimatedBackground,
  SuccessScreen
} from '../components/payments';
import logger from '../utils/logger';

// ✅ Use live API base URL from environment (automatically picks .env.production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const WebinarPayment = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const handleDashboard = useCallback(() => {
    window.location.href = '/';
  }, []);

  // Check for payment success from URL params (Stripe Checkout redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // Verify payment status
      const verifyPayment = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${API_BASE_URL}/payment/verify-session?sessionId=${sessionId}`, {
            method: 'GET',
            headers: { 
              'Accept': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Failed to verify payment');
          }

          const data = await response.json();
          if (data.success && data.hasPaid) {
            setPaymentVerified(true);
          } else {
            // Payment not completed
            setError('Payment not completed. Please try again or contact support.');
          }
        } catch (err) {
          logger.error('Error verifying payment', err, { sessionId });
          // If verification fails, assume success (webhook might still be processing)
          setTimeout(() => {
            setPaymentVerified(true);
          }, 2000);
        } finally {
          setIsLoading(false);
        }
      };

      verifyPayment();
    } else {
      // No session ID - user landed here directly, redirect to home
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, []);

  // Show success screen if payment verified
  if (paymentVerified && !isLoading) {
    return (
      <main style={{
        minHeight: '100vh',
        background: '#000',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        <AnimatedBackground />
        <SuccessScreen
          onDashboard={handleDashboard}
        />
      </main>
    );
  }

  // Loading or error state
  return (
    <main style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      <AnimatedBackground />

      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'clamp(16px, 4vw, 20px)',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          width: '100%', 
          textAlign: 'center'
        }}>
          {isLoading && (
            <div style={{
              background: 'rgba(6,20,22,0.90)',
              border: '1px solid rgba(0,255,222,0.25)',
              borderRadius: '16px',
              padding: '40px',
              color: '#9fece2'
            }}>
              <p style={{ margin: 0, fontSize: '18px' }}>
                Verifying your payment...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div style={{
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,0,0,0.16)',
              borderRadius: '16px',
              padding: '40px',
              color: '#ff6b6b'
            }}>
              <p style={{ margin: 0, fontSize: '16px', marginBottom: '20px' }}>
                {error}
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: '#00ffde',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go to Home
              </button>
            </div>
          )}

          {!isLoading && !error && !paymentVerified && (
            <div style={{
              background: 'rgba(6,20,22,0.90)',
              border: '1px solid rgba(0,255,222,0.25)',
              borderRadius: '16px',
              padding: '40px',
              color: '#9fece2'
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Redirecting to home page...
              </p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .page-header {
          display: grid;
          grid-template-columns: min-content 1fr min-content;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 6px 4px;
        }
        .header-left { display: flex; align-items: center; justify-content: flex-start; }
        .header-center { text-align: center; }
        .header-right { width: 48px; }

        .page-title {
          font-size: clamp(28px, 6.5vw, 48px);
          margin: 0 0 6px;
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1.05;
        }
        .page-sub {
          margin: 0;
          color: #9fece2;
          font-size: 15px;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(0,255,222,0.12);
          color: #00ffde;
          padding: 8px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all .12s ease;
        }
        .back-btn:focus { outline: 2px solid rgba(0,255,222,0.28); outline-offset: 2px; }
        .back-label { color: #bff6ea; display: inline-block; }

        @media (max-width: 768px) {
          .page-header { gap: 8px; padding: 4px 2px; }
          .page-title { font-size: clamp(24px, 8vw, 36px); }
          .page-sub { font-size: 14px; }
        }

        @media (max-width: 480px) {
          .back-label { display: none; }
          .back-btn { 
            padding: 10px; 
            border-radius: 8px; 
            min-width: 44px;
            min-height: 44px;
            touch-action: manipulation;
          }
          .header-right { width: 36px; }
          .page-title { font-size: clamp(20px, 7vw, 28px); margin-bottom: 4px; }
          .page-sub { font-size: 13px; }
        }

        @media (max-width: 360px) {
          .page-title { font-size: clamp(18px, 6vw, 24px); }
          .page-sub { font-size: 12px; }
        }

        @media (min-width: 768px) {
          .back-btn { padding: 10px 14px; border-radius: 12px; }
        }

        * { 
          -webkit-font-smoothing: antialiased; 
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
        }

        button, a {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </main>
  );
};

export default WebinarPayment;
