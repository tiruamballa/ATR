const mongoose = require('mongoose');

const EnglishProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  vocabularyCount: {
    type: Number,
    default: 0,
  },
  speakingSessions: {
    type: Number,
    default: 0,
  },
  readingSessions: {
    type: Number,
    default: 0,
  },
  writingSessions: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('EnglishProgress', EnglishProgressSchema);
