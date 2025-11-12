import React, { memo, useState } from 'react';

const UPIPayment = memo(({ webinarData, onPaymentSuccess, onPaymentError, apiBaseUrl }) => {
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [authenticationStatus, setAuthenticationStatus] = useState('');

  const validateUPI = (upi) => {
    // UPI ID format: user@bank or phone@paytm, etc.
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upi.trim());
  };

  const handleUPIChange = (e) => {
    const value = e.target.value.trim();
    setUpiId(value);
    setValidationError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationError('');

    // Validate UPI ID
    if (!upiId.trim()) {
      setValidationError('UPI ID is required');
      return;
    }

    if (!validateUPI(upiId)) {
      setValidationError('Invalid UPI ID format. Example: yourname@paytm or 9876543210@ybl');
      return;
    }

    setIsProcessing(true);

    try {
      // Create UPI payment intent
      const response = await fetch(`${apiBaseUrl}/payment/create-upi-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          upiId: upiId.trim(),
          amount: webinarData.price,
          ...webinarData.userDetails
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to create UPI payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create UPI payment');
      }

      // For UPI, we might get a payment link or need to redirect
      if (data.paymentLink && data.requiresRedirect) {
        // Redirect to Stripe Checkout for UPI payment
        setAuthenticationStatus('Redirecting to payment page...');
        setTimeout(() => {
          window.location.href = data.paymentLink;
        }, 500);
      } else if (data.clientSecret) {
        // Some UPI implementations use client secret (Payment Intent)
        setAuthenticationStatus('Processing UPI payment...');
        // Poll for payment status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`${apiBaseUrl}/payment/status?paymentIntentId=${data.paymentIntentId}`);
            const statusData = await statusResponse.json();
            
            if (statusData.success && statusData.status === 'succeeded') {
              clearInterval(pollInterval);
              onPaymentSuccess(data.paymentIntentId);
            } else if (statusData.success && (statusData.status === 'failed' || statusData.status === 'canceled')) {
              clearInterval(pollInterval);
              throw new Error('Payment failed or was cancelled');
            }
          } catch (pollError) {
            clearInterval(pollInterval);
            throw pollError;
          }
        }, 2000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 300000);
      } else {
        throw new Error('Invalid payment response');
      }

    } catch (err) {
      console.error('UPI payment error:', err);
      const errorMsg = err.message || 'UPI payment failed. Please try again.';
      setError(errorMsg);
      onPaymentError && onPaymentError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="upi-payment-wrapper">
      <h2 className="upi-title">{webinarData.title}</h2>

      <div className="upi-price-row">
        <span>Amount</span>
        <span className="upi-amount">${webinarData.price}</span>
      </div>

      <div className="upi-info">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <div>
          <strong>UPI Payment</strong>
          <p>Enter your UPI ID to complete the payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="upi-input-box">
          <label htmlFor="upiId" className="upi-label">UPI ID</label>
          <input
            type="text"
            id="upiId"
            name="upiId"
            value={upiId}
            onChange={handleUPIChange}
            placeholder="yourname@paytm or 9876543210@ybl"
            disabled={isProcessing}
            autoComplete="off"
            inputMode="email"
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${validationError ? 'rgba(255,100,100,0.4)' : 'rgba(0,255,222,0.15)'}`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              outline: 'none',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
              minHeight: '44px',
              boxSizing: 'border-box',
              touchAction: 'manipulation'
            }}
            onFocus={(e) => {
              if (!validationError) e.target.style.borderColor = 'rgba(0,255,222,0.4)';
            }}
            onBlur={(e) => {
              if (!validationError) e.target.style.borderColor = 'rgba(0,255,222,0.15)';
            }}
          />
          {validationError && (
            <div className="upi-validation-error">{validationError}</div>
          )}
        </div>

        {authenticationStatus && (
          <div className="upi-auth-status" role="status">
            <span className="spinner-small" aria-hidden />
            {authenticationStatus}
          </div>
        )}

        {error && (
          <div className="upi-error" role="alert">{error}</div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !upiId.trim()}
          className="upi-pay-btn"
        >
          {isProcessing ? (
            <span className="processing">
              <span className="spinner" aria-hidden />
              PROCESSING...
            </span>
          ) : 'PAY WITH UPI'}
        </button>
      </form>

      <div className="upi-secure">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>Protected by Stripe secure payment</span>
      </div>

      <style>{`
        .upi-payment-wrapper {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,255,222,0.12) inset;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .upi-title {
          color: #ccfff7;
          font-size: 20px;
          margin: 0 0 18px;
          text-align: center;
        }

        .upi-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(0,255,222,0.12);
          color: #9fece2;
        }

        .upi-amount {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
        }

        .upi-info {
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

        .upi-info svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #00ffde;
        }

        .upi-info strong {
          display: block;
          color: #ccfff7;
          margin-bottom: 4px;
        }

        .upi-info p {
          margin: 0;
          opacity: 0.85;
        }

        .upi-input-box {
          margin-bottom: 18px;
        }

        .upi-label {
          display: block;
          color: #9fece2;
          font-size: 13px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .upi-validation-error {
          color: #ff6b6b;
          font-size: 11px;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .upi-auth-status {
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

        .upi-error {
          background: rgba(255,0,0,0.06);
          border: 1px solid rgba(255,0,0,0.16);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          color: #ff6b6b;
          font-size: 13px;
        }

        .upi-pay-btn {
          width: 100%;
          background: #00ffde;
          color: #000;
          border: none;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(0,255,222,0.26);
          transition: transform .18s ease, box-shadow .18s ease;
          min-height: 48px;
          touch-action: manipulation;
        }

        .upi-pay-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .upi-pay-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,255,222,0.35);
        }

        .upi-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(159,236,226,0.6);
          font-size: 12px;
          margin-top: 12px;
        }

        .processing {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.18);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .upi-payment-wrapper {
            padding: 16px;
            border-radius: 12px;
          }
          .upi-title {
            font-size: 16px;
            margin-bottom: 14px;
          }
          .upi-amount {
            font-size: 22px;
          }
          .upi-info {
            font-size: 11px;
            padding: 10px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
});

UPIPayment.displayName = 'UPIPayment';

export default UPIPayment;

