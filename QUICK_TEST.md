# Quick Test Instructions

## ✅ Server Status
Your backend server is **running**! (Process ID: 93282)

## 🧪 Manual Testing Steps

### Step 1: Start Frontend (if not running)

Open a new terminal and run:
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173` (or similar port)

### Step 2: Test Payment Flow

1. **Open Browser**: Go to `http://localhost:5173/payment`

2. **Fill the Form**:
   - Name: `Test User`
   - Email: `test@example.com` (or any valid email)
   - Phone: `+1234567890` (or any valid phone)

3. **Submit**: Click the submit button

4. **Expected Behavior**:
   - ✅ Form validates
   - ✅ Shows "Redirecting to secure payment page..."
   - ✅ Browser redirects to Stripe Checkout

### Step 3: Test Payment on Stripe Checkout

**Use Stripe Test Card**:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

**Steps**:
1. Enter the test card details
2. Click "Pay" or "Complete payment"
3. If 3D Secure appears, complete it
4. You'll be redirected back to your success page

### Step 4: Verify Results

**Check Backend Console** for:
- ✅ `Checkout session created: cs_...`
- ✅ `Exchange rate fetched: 1 USD = XX.XX INR` (or using default)
- ✅ `Payment processed via checkout webhook`
- ✅ `Email sent successfully`

**Check Your Email** (the email you used in the form):
- ✅ Stripe automatic receipt email
- ✅ Custom branded email with meeting link

**Check Success Page**:
- ✅ Shows success message
- ✅ Displays meeting link
- ✅ Payment confirmed

## 🐛 Troubleshooting

### If checkout session creation fails:
- Check backend console for errors
- Verify `.env` file has all required variables
- Ensure `STRIPE_SECRET_KEY` is a test key (starts with `sk_test_`)

### If redirect doesn't work:
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Verify frontend is running

### If payment fails:
- Use the correct test card: `4242 4242 4242 4242`
- Check Stripe Dashboard for payment status
- Verify webhook is configured in Stripe Dashboard

## 📊 Test Checklist

- [ ] Backend server running (✅ Confirmed)
- [ ] Frontend server running
- [ ] Payment form loads
- [ ] Form validation works
- [ ] Checkout session created
- [ ] Redirect to Stripe works
- [ ] Test card payment succeeds
- [ ] Success page displays
- [ ] Email received
- [ ] Webhook processed payment

## 🎯 Next: Test Different Scenarios

1. **Invalid Email**: Try `invalid-email` → Should show validation error
2. **Cancel Payment**: Click back on Stripe page → Should return to form
3. **3D Secure**: Use card `4000 0025 0000 3155` → Should trigger 3D Secure
4. **Declined Card**: Use card `4000 0000 0000 0002` → Should show decline message

## 📝 API Testing (Optional)

You can also test the API directly:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test checkout session creation
curl -X POST http://localhost:5000/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

This will return a JSON response with `checkoutUrl` that you can open in your browser.

