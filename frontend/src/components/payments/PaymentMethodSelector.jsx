import React, { memo } from 'react';

const PaymentMethodSelector = memo(({ selectedMethod, onMethodChange, isLoading }) => {
  return (
    <div className="payment-method-selector">
      <label className="method-selector-label">Select Payment Method</label>
      <div className="method-options">
        <label className={`method-option ${selectedMethod === 'card' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={selectedMethod === 'card'}
            onChange={(e) => onMethodChange(e.target.value)}
            disabled={isLoading}
          />
          <div className="method-option-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Credit / Debit Card</span>
          </div>
        </label>

        <label className={`method-option ${selectedMethod === 'upi' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="upi"
            checked={selectedMethod === 'upi'}
            onChange={(e) => onMethodChange(e.target.value)}
            disabled={isLoading}
          />
          <div className="method-option-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>UPI</span>
          </div>
        </label>
      </div>

      <style>{`
        .payment-method-selector {
          background: rgba(6,20,22,0.90);
          border: 1px solid rgba(0,255,222,0.25);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .method-selector-label {
          display: block;
          color: #9fece2;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .method-options {
          display: flex;
          gap: 12px;
        }

        .method-option {
          flex: 1;
          position: relative;
          cursor: pointer;
        }

        .method-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .method-option-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: rgba(0,0,0,0.3);
          border: 2px solid rgba(0,255,222,0.15);
          border-radius: 10px;
          color: #9fece2;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .method-option input[type="radio"]:checked + .method-option-content,
        .method-option.active .method-option-content {
          background: rgba(0,255,222,0.1);
          border-color: rgba(0,255,222,0.4);
          color: #00ffde;
        }

        .method-option:hover:not(:has(input:disabled)) .method-option-content {
          border-color: rgba(0,255,222,0.3);
          background: rgba(0,0,0,0.4);
        }

        .method-option input[type="radio"]:disabled + .method-option-content {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .method-option svg {
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .method-options {
            flex-direction: column;
            gap: 10px;
          }
          .method-option-content {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
});

PaymentMethodSelector.displayName = 'PaymentMethodSelector';

export default PaymentMethodSelector;

