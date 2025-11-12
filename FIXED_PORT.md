# ✅ Port Issue Fixed!

## Problem
Port 5000 was being used by macOS ControlCenter (AirPlay service), causing 403 Forbidden errors.

## Solution
Changed backend server port from **5000** to **5001**.

## Changes Made

1. **Backend Server** (`backend/server.js`):
   - Changed default port to 5001
   
2. **Frontend** (`frontend/src/App.jsx` and `frontend/src/pages/WebinarPayment.jsx`):
   - Updated API_BASE_URL default to `http://localhost:5001/api`

3. **CORS Configuration**:
   - Added more allowed origins for better compatibility

## How to Use

### Start Backend:
```bash
cd backend
npm start
# Server will run on http://localhost:5001
```

### Start Frontend:
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### Update Environment Variables (if needed):

**Backend `.env`:**
```
PORT=5001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env` (optional):**
```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Test the Button

1. Open browser: `http://localhost:5173`
2. Click "Join the webinar"
3. Click "Reserve your slot"
4. Should redirect to Stripe Checkout! ✅

## Verify Server is Running

```bash
curl http://localhost:5001/api/health
# Should return: {"success":true,"message":"Server is running",...}
```

