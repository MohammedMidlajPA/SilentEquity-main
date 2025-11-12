# Silent Equity - Webinar Payment System

A production-ready webinar registration and payment system built with React, Node.js, Express, MongoDB, and Stripe.

## 🚀 Features

- **Stripe Checkout Integration** - Secure payment processing with automatic receipt emails
- **User Registration** - Automatic user creation from Stripe Checkout
- **Email Notifications** - Custom branded emails with Google Form verification links
- **Mobile Responsive** - Optimized for all device sizes
- **Production Ready** - Security headers, rate limiting, input validation, and more

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB (Atlas or local)
- Stripe account (test or live keys)
- Email service (SMTP configured)

## 🛠️ Setup

### 1. Clone Repository

```bash
git clone YOUR_REPO_URL
cd SilentEquity-main
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Create .env file
# Edit .env with your configuration
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Create .env file
# Edit .env with your API URL
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.example.com
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=Your Name <email@example.com>
FRONTEND_URL=http://localhost:5173
WEBINAR_PRICE=4.5
WEBINAR_MEETING_LINK=https://zoom.us/...
DEFAULT_USD_TO_INR_RATE=83
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📝 Git Workflow

### Commit Changes (Interactive)

```bash
./commit-changes.sh
```

This script will:
- Show you what changes will be committed
- Ask for confirmation
- Prompt for a commit message
- Commit the changes

### Push to GitHub

```bash
./setup-github.sh
```

Or manually:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 🧪 Testing

Run automated tests:
```bash
node test-payment-auto.js
```

## 📚 Documentation

- `PRODUCTION_READY.md` - Production deployment checklist
- `TEST_GUIDE.md` - Testing instructions
- `FIXED_FINAL.md` - Recent fixes and updates

## 🔒 Security

- Environment variables are never committed
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configured for production
- Security headers with Helmet

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

