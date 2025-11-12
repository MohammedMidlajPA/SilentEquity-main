import { useState, useEffect, useRef } from 'react';

/**
 * Hook to poll payment status for processing payments
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {string} apiBaseUrl - API base URL
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {object} - Payment status and polling state
 */
export const usePaymentStatus = (paymentIntentId, apiBaseUrl, enabled = true) => {
  const [status, setStatus] = useState('processing');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!paymentIntentId || !enabled) {
      return;
    }

    setIsPolling(true);
    setError(null);

    // Poll every 2 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/payment/status?paymentIntentId=${paymentIntentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();
        
        if (data.success && data.status) {
          setStatus(data.status);
          
          // Stop polling if payment is complete (succeeded or failed)
          if (data.status === 'succeeded' || data.status === 'failed' || data.status === 'canceled') {
            setIsPolling(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
        setError(err.message);
      }
    }, 2000);

    // Stop polling after 5 minutes
    timeoutRef.current = setTimeout(() => {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setError('Payment status check timeout. Please refresh the page.');
    }, 300000); // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [paymentIntentId, apiBaseUrl, enabled]);

  return { status, isPolling, error };
};

