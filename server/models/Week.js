const mongoose = require('mongoose');

const WeekSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  globalWeekNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  plannedStartDate: {
    type: Date,
    required: true,
  },
  plannedEndDate: {
    type: Date,
    required: true,
  },
  actualCompletionDate: {
    type: Date,
    default: null,
  }
});

WeekSchema.index({ userId: 1, globalWeekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Week', WeekSchema);
