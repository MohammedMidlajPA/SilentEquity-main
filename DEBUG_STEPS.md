# 🔍 Debug Steps - "Failed to fetch" Error

## ✅ Backend is Working!

- ✅ Backend running on port 5001
- ✅ CORS allows port 5174
- ✅ API responds correctly
- ✅ Tested and verified

## 🧪 Test in Browser Console

Open browser console (F12) and paste this:

```javascript
fetch('http://localhost:5001/api/payment/create-checkout-session', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{}',
  mode: 'cors'
})
.then(r => r.json())
.then(d => {
  console.log('✅ Success:', d);
  if (d.checkoutUrl) {
    window.location.href = d.checkoutUrl;
  }
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('Error: ' + e.message);
});
```

This will show you the EXACT error.

## 🔧 Common Issues & Fixes

### Issue 1: Browser Cache
**Fix:** Hard refresh
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`
- Or: Close tab and open new one

### Issue 2: Frontend Not Reloaded
**Fix:** Restart frontend
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### Issue 3: Network Blocked
**Check:** Browser console (F12) → Network tab
- Look for the request to `/payment/create-checkout-session`
- Check if it's blocked or shows an error

### Issue 4: Mixed Content
**Check:** Make sure you're using `http://` not `https://`

## 🧪 Test Page

Open this in your browser:
```
http://localhost:5174/test-connection.html
```

This will test the connection directly.

## 📋 Current Status

- ✅ Backend: Running (port 5001)
- ✅ Frontend: Running (port 5174)
- ✅ CORS: Configured correctly
- ✅ API: Working (tested)

**The issue is likely browser cache or frontend not reloaded.**

## 🎯 Quick Fix

1. **Close ALL browser tabs** with localhost:5174
2. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Open fresh:** http://localhost:5174
4. **Try button again**




