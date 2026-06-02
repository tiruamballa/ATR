const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  studyHours: {
    type: Number,
    default: 0,
  },
  targetHours: {
    type: Number,
    default: 6, // Default baseline target hours
  },
});

AnalyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
