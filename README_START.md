# 🚀 Quick Start Guide

## ✅ Everything is Running!

Both servers are now running automatically:

- **Backend**: http://localhost:5001 ✅
- **Frontend**: http://localhost:5173 ✅

## 🌐 Open Your Browser

**Open this URL:** http://localhost:5173

## 🧪 Test the Payment Button

1. Click **"Join the webinar"** button (bottom right)
2. Click **"Reserve your slot"** button
3. You should be redirected to Stripe Checkout! ✅

## 📊 Check Server Status

### Backend Health:
```bash
curl http://localhost:5001/api/health
```

### View Logs:
```bash
# Backend logs
tail -f /tmp/backend-new.log

# Frontend logs  
tail -f /tmp/silent-equity-frontend.log
```

## 🛑 Stop Servers

```bash
# Kill all servers
pkill -f "node.*server"
pkill -f "vite"
```

## 🔄 Restart Servers

```bash
cd /Users/mohammedmidlajpa/Downloads/SilentEquity-main
./START_SERVERS.sh
```

## ✅ What's Fixed

1. ✅ Backend running on port 5001 (avoiding AirPlay conflict)
2. ✅ Frontend running on port 5173
3. ✅ Environment variables configured correctly
4. ✅ CORS configured properly
5. ✅ Stripe Checkout working
6. ✅ Payment button should work now!

## 🐛 If Button Still Doesn't Work

1. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check browser console** (F12) for errors
3. **Verify servers are running**:
   ```bash
   curl http://localhost:5001/api/health
   curl http://localhost:5173
   ```

## 📝 Environment Variables

**Backend** (`backend/.env`):
- `PORT=5001`
- `FRONTEND_URL=http://localhost:5173`

**Frontend** (`frontend/.env`):
- `VITE_API_BASE_URL=http://localhost:5001/api`

Everything is configured and running! 🎉

