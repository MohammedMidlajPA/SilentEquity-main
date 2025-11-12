const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user information collected during payment
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  registeredWebinars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);