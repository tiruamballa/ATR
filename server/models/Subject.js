const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  presentPeriods: {
    type: Number,
    default: 0,
  },
  totalPeriods: {
    type: Number,
    default: 0,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  schedule: [
    {
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      periods: {
        type: [Number], // e.g. [1, 2, 5] representing period numbers
        default: [],
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SubjectSchema.index({ semesterId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
