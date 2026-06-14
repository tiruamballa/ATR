const mongoose = require('mongoose');

const DSASubtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  questionsSolved: {
    type: Number,
    default: 0,
  },
  revisionCount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  }
});

const DSATopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  subtopics: [DSASubtopicSchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

DSATopicSchema.index({ userId: 1, topicName: 1 });

module.exports = mongoose.model('DSATopic', DSATopicSchema);

