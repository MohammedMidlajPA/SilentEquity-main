# 📁 Codebase Structure - Silent Equity

## 🗂️ Project Organization

```
SilentEquity-main/
├── backend/                    # Backend API (Node.js/Express)
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   └── stripe.js           # Stripe configuration
│   ├── controllers/            # Request handlers
│   │   └── paymentController.js
│   ├── middleware/             # Express middleware
│   │   ├── validatePayment.js
│   │   └── webhookMiddleware.js
│   ├── models/                 # MongoDB models
│   │   ├── Payment.js
│   │   └── User.js
│   ├── routes/                 # API routes
│   │   └── paymentRoutes.js
│   ├── utils/                  # Utility functions
│   │   ├── currency.js         # Currency conversion
│   │   ├── email.js            # Email sending
│   │   ├── envValidator.js     # Environment validation
│   │   ├── logger.js           # Logging utilities
│   │   └── validation.js       # Input validation
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env                    # Environment variables (not in Git)
│
├── frontend/                   # Frontend (React/Vite)
│   ├── public/                 # Static assets
│   │   ├── fonts/              # Custom fonts
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # React components
│   │   │   └── payments/       # Payment-related components
│   │   │       ├── AnimatedBackground.jsx
│   │   │       ├── ContactInfo.jsx
│   │   │       ├── PaymentCard.jsx
│   │   │       ├── PaymentMethodSelector.jsx
│   │   │       ├── SuccessScreen.jsx
│   │   │       ├── UPIPayment.jsx
│   │   │       └── UserDetailsForm.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── usePaymentStatus.js
│   │   ├── pages/              # Page components
│   │   │   └── WebinarPayment.jsx
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # React entry point
│   │   └── style.css           # Global styles
│   ├── index.html
│   ├── vite.config.js          # Vite configuration
│   ├── package.json
│   └── .env                    # Environment variables (not in Git)
│
├── docs/                       # Documentation (to be organized)
│   ├── deployment/             # Deployment guides
│   ├── security/               # Security documentation
│   └── guides/                 # User guides
│
├── scripts/                    # Utility scripts
│   ├── deploy-to-vps.sh
│   ├── check-vps-status.sh
│   └── cleanup-old-files.sh
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Main README
└── SECURITY_AUDIT_REPORT.md    # Security audit results
```

---

## 📂 Directory Structure Details

### Backend Structure

```
backend/
├── config/              # Configuration modules
│   ├── db.js           # MongoDB connection & error handling
│   └── stripe.js       # Stripe initialization & validation
│
├── controllers/        # Business logic handlers
│   └── paymentController.js
│       ├── createCheckoutSession()
│       ├── verifySession()
│       └── handleWebhook()
│
├── middleware/         # Express middleware
│   ├── validatePayment.js    # Payment request validation
│   └── webhookMiddleware.js  # Webhook signature verification
│
├── models/            # MongoDB schemas
│   ├── Payment.js     # Payment document schema
│   └── User.js        # User document schema
│
├── routes/            # API route definitions
│   └── paymentRoutes.js
│       ├── POST /api/payment/create-checkout-session
│       ├── GET /api/payment/verify-session
│       └── POST /api/payment/webhook
│
└── utils/             # Utility functions
    ├── currency.js     # USD to INR conversion
    ├── email.js        # Email sending (Nodemailer)
    ├── envValidator.js # Environment variable validation
    ├── logger.js       # Structured logging
    └── validation.js   # Input validation helpers
```

### Frontend Structure

```
frontend/
├── public/            # Static assets (served as-is)
│   ├── fonts/        # Custom fonts
│   └── favicon.ico    # Favicon
│
└── src/
    ├── components/    # Reusable React components
    │   └── payments/ # Payment flow components
    │       ├── AnimatedBackground.jsx
    │       ├── PaymentCard.jsx
    │       ├── SuccessScreen.jsx
    │       └── ...
    │
    ├── hooks/         # Custom React hooks
    │   └── usePaymentStatus.js
    │
    ├── pages/         # Page-level components
    │   └── WebinarPayment.jsx
    │
    ├── App.jsx        # Main app component (routing)
    ├── main.jsx       # React entry point
    └── style.css      # Global styles
```

---

## 🔄 Data Flow

### Payment Flow

```
1. User clicks "Reserve your slot"
   ↓
2. Frontend: App.jsx → handleJoin()
   ↓
3. API Call: POST /api/payment/create-checkout-session
   ↓
4. Backend: paymentController.createCheckoutSession()
   ↓
5. Stripe: Create checkout session
   ↓
6. Redirect: User → Stripe Checkout
   ↓
7. Payment: User completes payment
   ↓
8. Redirect: Stripe → /payment?session_id=xxx
   ↓
9. Frontend: WebinarPayment.jsx → verifySession()
   ↓
10. Backend: paymentController.verifySession()
    ↓
11. Webhook: Stripe → /api/payment/webhook
    ↓
12. Backend: paymentController.handleWebhook()
    ↓
13. Email: Send confirmation email
    ↓
14. Frontend: Show SuccessScreen
```

---

## 🔐 Security Layers

### Backend Security

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS protection
4. **Input Validation** - XSS/SQL injection prevention
5. **Webhook Verification** - Stripe signature verification
6. **Environment Variables** - Secret management

### Frontend Security

1. **Vite Proxy** - API request proxying
2. **Environment Variables** - Public key only
3. **Stripe.js** - Secure payment handling
4. **Input Validation** - Client-side validation

---

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `PaymentCard.jsx`)
- **Utilities**: camelCase (e.g., `envValidator.js`)
- **Config**: camelCase (e.g., `stripe.js`)
- **Routes**: camelCase (e.g., `paymentRoutes.js`)
- **Models**: PascalCase (e.g., `Payment.js`)

---

## 🧹 Cleanup Recommendations

### Files to Organize

1. **Documentation Files** (root directory)
   - Move to `docs/` directory
   - Organize by category

2. **Script Files** (root directory)
   - Move to `scripts/` directory
   - Keep only essential scripts

3. **Test Files** (root directory)
   - Move to `tests/` directory
   - Or remove if not needed

### Recommended Structure

```
SilentEquity-main/
├── backend/
├── frontend/
├── docs/
│   ├── deployment/
│   ├── security/
│   └── guides/
├── scripts/
│   ├── deployment/
│   └── utilities/
└── tests/
```

---

## ✅ Code Quality Standards

### Backend

- ✅ ES6+ JavaScript
- ✅ Async/await for async operations
- ✅ Error handling with try/catch
- ✅ Input validation
- ✅ Environment variable validation
- ✅ Structured logging

### Frontend

- ✅ React 19+ with hooks
- ✅ Functional components
- ✅ Proper error boundaries
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility considerations

---

## 📊 Code Statistics

- **Backend Files**: ~15 files
- **Frontend Files**: ~20 files
- **Total Lines**: ~5000+ lines
- **Dependencies**: 26 (backend) + 24 (frontend)
- **Security Score**: 95/100

---

**Last Updated**: $(date)

