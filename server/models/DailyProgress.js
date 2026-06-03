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
      key: { type: String, required: true },
      title: { type: String, required: true },
      category: { type: String, required: true },
      completed: { type: Boolean, default: false },
      detail: { type: String, default: '' },
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
