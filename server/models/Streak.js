const mongoose = require('mongoose');

const StreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: String, // Format: YYYY-MM-DD
    default: null,
  },
});

module.exports = mongoose.model('Streak', StreakSchema);
