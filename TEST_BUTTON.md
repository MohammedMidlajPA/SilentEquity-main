# Testing the Reserve Button

## Quick Test Steps

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Click "Join the webinar" button**
3. **Click "Reserve your slot" button**
4. **Check Console** for:
   - `🔄 Creating checkout session...`
   - `📡 Response status: 200 OK` (or error)
   - `✅ Checkout session created:` (with checkoutUrl)
   - `🔗 Redirecting to Stripe:`

## If Button Doesn't Work

### Check Console Errors:
- **CORS Error**: Check if `http://localhost:5173` is in allowed origins
- **403 Forbidden**: Rate limiting or CORS issue
- **Network Error**: Backend server not running

### Manual Test:
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Check Backend:
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Test checkout endpoint
curl -X POST http://localhost:5000/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{}'
```

## Expected Behavior

1. Button shows "Redirecting to payment..." when clicked
2. Console shows checkout session creation
3. Browser redirects to Stripe Checkout page
4. User can pay on Stripe
5. Redirects back to success page

