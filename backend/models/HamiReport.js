const mongoose = require('mongoose');
const hamiDaySchema = require('./HamiDay');

const hamiReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  days: {
    type: [hamiDaySchema],
    default: []
  },
  qa: {
    type: Object,
    default: {}
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique report per user per month
hamiReportSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('HamiReport', hamiReportSchema);