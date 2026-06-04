const mongoose = require('mongoose');

const AttendanceEntrySchema = new mongoose.Schema({
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
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  entryType: {
    type: String,
    enum: ['Day', 'SubjectWise'],
    default: 'SubjectWise',
  },
  dayStatus: {
    type: String,
    enum: ['Present', 'Absent', 'Holiday', 'NoClasses'],
  },
  subjects: [
    {
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
      status: {
        type: String,
        enum: ['Present', 'Absent', 'Holiday', 'Free'],
        required: true,
      },
      periodsCount: {
        type: Number,
        required: true,
        default: 1,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique attendance log per user per date
AttendanceEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceEntry', AttendanceEntrySchema);
