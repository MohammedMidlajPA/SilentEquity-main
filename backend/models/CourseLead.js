const mongoose = require('mongoose');

const CourseLeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  discordLink: {
    type: String,
    required: true,
    trim: true,
  },
  storageDriver: {
    type: String,
    enum: ['supabase', 'mongodb'],
    default: 'mongodb',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.CourseLead || mongoose.model('CourseLead', CourseLeadSchema);










