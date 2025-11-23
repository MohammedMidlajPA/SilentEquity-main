import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <section className="payment-success" aria-labelledby="payment-success-title">
      <div className="payment-success__card">
        <p className="eyebrow">Payment successful</p>
        <h1 id="payment-success-title">Payment Successful 🎉</h1>
        <p>
          You&rsquo;re enrolled! Check your inbox for next steps, onboarding details, and the
          official confirmation email.
        </p>
        <Link className="cta" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
};

export default PaymentSuccess;










