const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  completedHistory: [{
    date: {
      type: String, // YYYY-MM-DD
    },
    completed: {
      type: Boolean,
      default: false,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

HabitSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Habit', HabitSchema);
