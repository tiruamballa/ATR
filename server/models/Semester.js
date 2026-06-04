const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SemesterSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Semester', SemesterSchema);
