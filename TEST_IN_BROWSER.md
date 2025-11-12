# 🧪 Test Payment Button in Browser

## ✅ Stripe Works with Localhost!

**You DON'T need to host the app** - Stripe Checkout works perfectly with localhost.

## 🔍 Debug Steps

### 1. Open Browser Console
- Press **F12** (or Cmd+Option+I on Mac)
- Go to **Console** tab
- Click "Reserve your slot" button
- Look for error messages

### 2. Check Network Tab
- In browser DevTools, go to **Network** tab
- Click "Reserve your slot" button
- Look for the request to `/payment/create-checkout-session`
- Check if it shows:
  - Status: 200 (success) ✅
  - Status: 403/404/500 (error) ❌

### 3. Test API Directly in Browser Console

Open browser console and paste this:

```javascript
fetch('http://localhost:5001/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success:', data);
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;
  }
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error: ' + err.message);
});
```

This will:
- Test the API connection
- Show you the exact error
- Redirect to Stripe if it works

### 4. Common Issues & Fixes

#### Issue: "Failed to fetch"
**Cause**: Backend not running or wrong port
**Fix**: 
```bash
curl http://localhost:5001/api/health
# Should return: {"success":true,...}
```

#### Issue: CORS error
**Cause**: Browser blocking request
**Fix**: Already fixed - CORS now allows all origins in development

#### Issue: 403 Forbidden
**Cause**: Rate limiting or CORS
**Fix**: Wait 15 minutes or restart backend

#### Issue: Network error
**Cause**: Backend not accessible
**Fix**: Check if backend is running:
```bash
ps aux | grep "node.*server"
```

## 🎯 Quick Test

1. **Open**: http://localhost:5173
2. **Open Console**: F12 → Console tab
3. **Paste this code**:
```javascript
fetch('http://localhost:5001/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(d => d.checkoutUrl ? window.location.href = d.checkoutUrl : alert('No URL'))
.catch(e => alert('Error: ' + e.message));
```

4. **Press Enter**
5. **Should redirect to Stripe!** ✅

## 📊 Verify Servers

```bash
# Check backend
curl http://localhost:5001/api/health

# Check frontend  
curl http://localhost:5173

# Check if processes are running
ps aux | grep -E "node.*server|vite"
```

## ✅ Everything Should Work Now!

- ✅ CORS allows all origins in development
- ✅ Backend on port 5001
- ✅ Frontend on port 5173
- ✅ Stripe works with localhost (no hosting needed!)

Try the browser console test above - it will show you exactly what's wrong!

