const mongoose = require('mongoose');

const DailyTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Study Hours', 'DSA', 'Aptitude', 'IP Skill', 'Technical Skill', 'English Speaking', 'Other'],
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  estimatedMinutes: {
    type: Number,
    default: 30,
  },
  weekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
  },
  subtopicId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  generatedByRoadmap: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

DailyTaskSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('DailyTask', DailyTaskSchema);
