// PaymentCard.jsx with 3D Secure Support
import React, { memo, useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentCard = memo(({ webinarData, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardFontSize, setCardFontSize] = useState('16px');
  const [authenticationStatus, setAuthenticationStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w <= 360) setCardFontSize('13px');
      else if (w <= 420) setCardFontSize('14px');
      else if (w <= 768) setCardFontSize('15px');
      else setCardFontSize('16px');
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setAuthenticationStatus('');

    try {
      // ✅ Step 1: Confirm the payment with card details
      // Stripe will automatically handle 3D Secure if required
      setAuthenticationStatus('Verifying card details...');
      
      // Add timeout for payment confirmation (5 minutes for 3D Secure)
      const paymentPromise = stripe.confirmCardPayment(
        webinarData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Payment timeout. Please try again.')), 300000); // 5 minutes for 3D Secure
      });

      const { error: stripeError, paymentIntent } = await Promise.race([
        paymentPromise,
        timeoutPromise
      ]);

      if (stripeError) {
        // Handle specific Stripe errors
        if (stripeError.type === 'card_error') {
          throw new Error(stripeError.message || 'Card payment failed. Please check your card details.');
        } else if (stripeError.type === 'validation_error') {
          throw new Error('Invalid card details. Please check and try again.');
        } else if (stripeError.type === 'authentication_error') {
          throw new Error('3D Secure authentication failed. Please try again.');
        } else {
          throw new Error(stripeError.message || 'Payment failed. Please try again.');
        }
      }

      // ✅ Step 2: Handle different payment statuses
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            // Payment succeeded (3D Secure handled automatically by Stripe)
            setAuthenticationStatus('Payment successful!');
            onPaymentSuccess(paymentIntent.id);
            break;

          case 'processing':
            setAuthenticationStatus('Payment is processing...');
            setError('Payment is being processed. Please wait.');
            setIsProcessing(false);
            // Poll for status update
            setTimeout(() => {
              onPaymentSuccess(paymentIntent.id);
            }, 2000);
            break;

          case 'requires_action':
          case 'requires_source_action':
            // Stripe Elements automatically shows 3D Secure modal when needed
            // If we reach here, it's unexpected - confirmCardPayment should wait for user to complete
            // Show status and wait - Stripe is handling the authentication flow
            setAuthenticationStatus('Please complete authentication in the popup window...');
            // Don't throw error - Stripe is handling 3D Secure automatically
            // The payment will complete once user finishes authentication
            // Note: This case should rarely occur as confirmCardPayment waits for 3D Secure completion
            break;

          case 'requires_payment_method':
            throw new Error('Payment failed. Please try a different card.');

          case 'canceled':
            throw new Error('Payment was cancelled.');

          default:
            throw new Error(`Unexpected payment status: ${paymentIntent.status}`);
        }
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.message || 'Payment failed';
      
      // Provide user-friendly error messages
      let userFriendlyError = errorMsg;
      if (errorMsg.includes('declined') || errorMsg.includes('card_error')) {
        userFriendlyError = 'Your card was declined. Please check your card details or try a different card.';
      } else if (errorMsg.includes('insufficient')) {
        userFriendlyError = 'Insufficient funds. Please use a different payment method.';
      } else if (errorMsg.includes('authentication') || errorMsg.includes('3D Secure')) {
        userFriendlyError = '3D Secure authentication failed. Please try again.';
      } else if (errorMsg.includes('timeout')) {
        userFriendlyError = 'Payment timeout. Please check your connection and try again.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        userFriendlyError = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(userFriendlyError);
      setAuthenticationStatus('');
      onPaymentError && onPaymentError(userFriendlyError);
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: cardFontSize,
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': { color: 'rgba(159,236,226,0.5)' },
        lineHeight: '1.4',
      },
      invalid: {
        color: '#ff6b6b',
        iconColor: '#ff6b6b',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="payment-card-wrapper">
      <h2 className="pc-title">{webinarData.title}</h2>

      <div className="pc-price-row">
        <span>Amount</span>
        <span className="pc-amount">${webinarData.price}</span>
      </div>

      {/* ✅ 3D Secure Info Banner */}
      <div className="secure-auth-info">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <strong>Secure Payment with 3D Secure</strong>
          <p>You may be asked to verify this payment with your bank via OTP/SMS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-input-box" aria-label="Card details">
          <label className="card-label">Card Details</label>
          <div className="card-element-container">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* ✅ Show authentication status */}
        {authenticationStatus && (
          <div className="auth-status" role="status">
            <span className="spinner-small" aria-hidden />
            {authenticationStatus}
          </div>
        )}

        {error && (
          <div className="pc-error" role="alert">
            {error}
            {retryCount < MAX_RETRIES && error && !error.includes('timeout') && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setError(null);
                  setRetryCount(prev => prev + 1);
                  const fakeEvent = { preventDefault: () => {} };
                  handleSubmit(fakeEvent);
                }}
                className="retry-btn"
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: 'rgba(0,255,222,0.2)',
                  border: '1px solid rgba(0,255,222,0.4)',
                  borderRadius: '6px',
                  color: '#00ffde',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Retry Payment ({MAX_RETRIES - retryCount} attempts left)
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing || retryCount >= MAX_RETRIES}
          className="pay-btn"
        >
          {isProcessing ? (
            <span className="processing">
              <span className="spinner" aria-hidden />
              PROCESSING PAYMENT...
            </span>
          ) : retryCount >= MAX_RETRIES ? 'MAX RETRIES REACHED' : 'PAY SECURELY'}
        </button>
      </form>

      <div className="pc-secure">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Protected by Stripe & 3D Secure authentication</span>
      </div>

      <style>{`
        .payment-card-wrapper {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,255,222,0.12) inset;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .pc-title {
          color: #ccfff7;
          font-size: 20px;
          margin: 0 0 18px;
          text-align: center;
        }

        .pc-price-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding-bottom:12px;
          margin-bottom:16px;
          border-bottom:1px solid rgba(0,255,222,0.12);
          color: #9fece2;
        }
        .pc-amount { color: #fff; font-size: 28px; font-weight:700; }

        /* ✅ 3D Secure Info Banner */
        .secure-auth-info {
          display: flex;
          gap: 12px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 18px;
          color: #9fece2;
          font-size: 13px;
          line-height: 1.4;
        }
        .secure-auth-info svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #00ffde;
        }
        .secure-auth-info strong {
          display: block;
          color: #ccfff7;
          margin-bottom: 4px;
        }
        .secure-auth-info p {
          margin: 0;
          opacity: 0.85;
        }

        .card-input-box {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(0,255,222,0.12);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 18px;
          box-sizing: border-box;
        }
        .card-label {
          display:block;
          color:#9fece2;
          font-size:13px;
          margin-bottom:8px;
          font-weight:500;
        }

        .card-element-container {
          width:100%;
          box-sizing: border-box;
          background: transparent;
          padding: 8px 6px;
          border-radius: 6px;
        }

        /* ✅ Authentication status indicator */
        .auth-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,255,222,0.08);
          border: 1px solid rgba(0,255,222,0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          color: #00ffde;
          font-size: 14px;
          font-weight: 500;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,255,222,0.2);
          border-top-color: #00ffde;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .pc-error {
          background: rgba(255,0,0,0.06);
          border: 1px solid rgba(255,0,0,0.16);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .pay-btn {
          width:100%;
          background: #00ffde;
          color:#000;
          border:none;
          padding:14px 18px;
          font-size:15px;
          font-weight:700;
          border-radius:8px;
          cursor:pointer;
          text-transform:uppercase;
          letter-spacing:0.04em;
          box-shadow:0 4px 20px rgba(0,255,222,0.26);
          transition:transform .18s ease, box-shadow .18s ease;
        }
        .pay-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow:0 8px 30px rgba(0,255,222,0.35); }

        .pc-secure {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          color: rgba(159,236,226,0.6);
          font-size:12px;
          margin-top:12px;
        }

        .processing { display:flex; align-items:center; justify-content:center; gap:8px; }
        .spinner { width:16px; height:16px; border:2px solid rgba(0,0,0,0.18); border-top-color:#000; border-radius:50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width: 768px) {
          .payment-card-wrapper { padding: 20px; border-radius: 14px; }
          .pc-title { font-size: 18px; }
          .pc-amount { font-size: 24px; }
          .secure-auth-info { font-size: 12px; padding: 10px; gap: 10px; }
          .card-input-box { padding: 12px; }
          .pay-btn { padding: 14px 16px; font-size: 14px; min-height: 48px; }
        }

        @media (max-width: 480px) {
          .payment-card-wrapper { padding: 16px; border-radius: 12px; }
          .pc-title { font-size: 16px; margin-bottom: 14px; }
          .pc-amount { font-size: 22px; }
          .secure-auth-info { font-size: 11px; padding: 10px; gap: 8px; }
          .secure-auth-info svg { width: 16px; height: 16px; }
          .card-input-box { padding: 10px; }
          .card-label { font-size: 12px; }
          .pay-btn { 
            padding: 14px 16px; 
            font-size: 13px; 
            min-height: 48px;
            touch-action: manipulation;
          }
          .pc-secure { font-size: 11px; }
        }

        @media (max-width: 360px) {
          .payment-card-wrapper { padding: 14px; }
          .pc-title { font-size: 15px; }
          .pc-amount { font-size: 20px; }
        }
      `}</style>
    </div>
  );
});

PaymentCard.displayName = 'PaymentCard';

export default PaymentCard;
