const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['DSA', 'English', 'Aptitude', 'Development', 'AI', 'Project', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['P1', 'P2', 'P3'],
    default: 'P2',
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  tags: [
    {
      type: String,
    }
  ],
  phaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to speed up lookups by user and status or phase
TaskSchema.index({ userId: 1, phaseId: 1 });
TaskSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);
