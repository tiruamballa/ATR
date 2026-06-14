const mongoose = require('mongoose');

const DSAQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSATopic',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  leetcodeUrl: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  isSolved: {
    type: Boolean,
    default: false,
  },
  solvedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  revisionCount: {
    type: Number,
    default: 0,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  companyTags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

DSAQuestionSchema.index({ userId: 1, topicId: 1 });
DSAQuestionSchema.index({ userId: 1, isSolved: 1 });

module.exports = mongoose.model('DSAQuestion', DSAQuestionSchema);
