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
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
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

// Note: email index is already defined in schema above (unique: true creates index)

module.exports = mongoose.model('User', userSchema);