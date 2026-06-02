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
  checklist: [
    {
      label: { type: String, required: true }, // e.g. DSA, English, Aptitude, Development, AI Learning, Project Work
      completed: { type: Boolean, default: false },
      detail: { type: String, default: '' }, // to show scheduled topic / activity
    }
  ],
  allCompleted: {
    type: Boolean,
    default: false,
  },
});

// Ensure a user only has one progress document per day
DailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', DailyProgressSchema);
