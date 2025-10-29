const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
 
  educationalInstitution: {
    type: String,
    trim: true,
    default: ''
  },
  class: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['hami', 'rafeeqa', 'umeedwar rukn', 'rukn'],
    trim: true,
    default: 'hami'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 