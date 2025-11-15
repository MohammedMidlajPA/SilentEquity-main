const mongoose = require('mongoose');
/**
 * Payment Schema
 * Stores payment transaction details
 */
const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User details (stored for quick access)
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  // Stripe payment details
  stripePaymentIntentId: {
    type: String,
    required: true
    // Not unique - UPI payments may use payment links with same ID
  },
  stripeChargeId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  // Webinar details
  webinarTitle: {
    type: String,
    default: 'Silent Edge Execution Masterclass'
  },
  meetingLink: {
    type: String
  },
  // Payment metadata
  paymentMethod: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  // Timestamps
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ userEmail: 1 });

// Update timestamp on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);