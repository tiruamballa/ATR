const mongoose = require('mongoose');

const DailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  studyHoursTarget: {
    type: Number,
    default: 4,
  },
  studyHoursCompleted: {
    type: Boolean,
    default: false,
  },
  dsaTarget: {
    type: Number,
    default: 4,
  },
  dsaCompleted: {
    type: Boolean,
    default: false,
  },
  aptitudeCompleted: {
    type: Boolean,
    default: false,
  },
  englishCompleted: {
    type: Boolean,
    default: false,
  },
  wentToCollege: {
    type: Boolean,
    default: false,
  },
  isHoliday: {
    type: Boolean,
    default: false,
  },
  completionPercentage: {
    type: Number,
    default: 0,
  },
  activeAptitudeTopic: {
    type: String,
    default: '',
  },
  activeTechnicalTopic: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Ensure a user only has one progress document per day
DailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', DailyProgressSchema);
