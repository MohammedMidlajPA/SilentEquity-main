# Testing Guide - Stripe Checkout Integration

## Prerequisites

1. **Environment Variables**: Ensure `.env` file in `backend/` directory has all required variables
2. **Stripe Test Keys**: Make sure you're using test keys (starting with `sk_test_` and `pk_test_`)
3. **MongoDB**: Database should be accessible
4. **Dependencies**: All npm packages installed

## Quick Test Steps

### 1. Start Backend Server

```bash
cd backend
npm install  # If not already installed
npm run dev   # or npm start
```

Expected output:
- ✅ MongoDB Connected
- ✅ All environment variables validated
- ✅ Stripe Connected: Account Active
- ✅ Server running on port 5000

### 2. Start Frontend (in a new terminal)

```bash
cd frontend  # or the frontend directory name
npm install  # If not already installed
npm run dev
```

Expected output:
- Frontend running on http://localhost:5173 (or similar)

### 3. Test Payment Flow

1. **Open Browser**: Navigate to `http://localhost:5173/payment` (or your frontend URL)

2. **Fill User Details**:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890

3. **Submit Form**: Click submit button

4. **Expected Behavior**:
   - Form submits
   - "Redirecting to secure payment page..." message appears
   - Browser redirects to Stripe Checkout page

5. **On Stripe Checkout Page**:
   - You should see the payment amount in INR
   - Payment methods: Card and UPI should be available
   - Product name: "Silent Edge Execution Masterclass"

### 4. Test Card Payment

**Use Stripe Test Card**:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Steps**:
1. Enter test card details
2. Click "Pay"
3. If 3D Secure is required, complete authentication
4. You'll be redirected back to your success page

**Expected Results**:
- ✅ Payment succeeds
- ✅ Redirect to success page with meeting link
- ✅ Stripe sends automatic receipt email
- ✅ Custom branded email sent (check email)
- ✅ Payment record created in database

### 5. Test UPI Payment (if available)

1. Select UPI payment method on Stripe Checkout
2. Enter UPI ID (test UPI IDs may vary by region)
3. Complete payment
4. Verify webhook processes async payment

### 6. Verify Backend Logs

Check backend console for:
- ✅ Checkout session created: `cs_...`
- ✅ Payment processed via checkout webhook
- ✅ Email sent successfully
- ✅ Exchange rate fetched (or using default)

### 7. Test Webhook (Optional - Manual)

If you want to test webhook manually:

1. **Get Webhook URL**: `http://your-domain.com/api/payment/webhook`
2. **Use Stripe CLI** (if installed):
   ```bash
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```
3. **Trigger test event**:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Test Scenarios

### ✅ Happy Path
- User fills form → Redirects to Stripe → Pays → Success page → Email received

### ✅ Error Handling
- Invalid email format → Validation error
- Network timeout → Error message displayed
- Payment cancellation → Returns to payment page

### ✅ Edge Cases
- Duplicate webhook events → Idempotent (no duplicate processing)
- Expired checkout session → Error handling
- Invalid session ID → 404 error

## Stripe Test Cards

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires 3D Secure authentication |
| 4000 0000 0000 9995 | Insufficient funds |

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads payment page
- [ ] Form validation works
- [ ] Checkout session created successfully
- [ ] Redirect to Stripe Checkout works
- [ ] Test card payment succeeds
- [ ] Success page displays after payment
- [ ] Webhook processes payment
- [ ] Email sent (check inbox)
- [ ] Payment record in database
- [ ] Exchange rate fetched/cached
- [ ] Error handling works for invalid inputs

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify MongoDB connection
- Check port 5000 is not in use

### Frontend won't start
- Check port 5173 is not in use
- Verify VITE_API_BASE_URL is set correctly

### Payment fails
- Verify Stripe test keys are correct
- Check webhook secret is configured
- Verify FRONTEND_URL matches your frontend URL

### Webhook not processing
- Check webhook endpoint is accessible
- Verify webhook secret in Stripe Dashboard
- Check webhook events are enabled in Stripe Dashboard

## Next Steps After Testing

1. **Production Deployment**:
   - Switch to live Stripe keys
   - Update FRONTEND_URL to production domain
   - Configure production webhook endpoint
   - Set up monitoring and logging

2. **Monitor**:
   - Payment success rates
   - Webhook processing times
   - Email delivery rates
   - Exchange rate API failures

