const mongoose = require('mongoose');

const AptitudeSubtopicSchema = new mongoose.Schema({
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
  accuracyPercent: {
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

const AptitudeTopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partName: {
    type: String,
    required: true, // e.g. "PART 1 Quantitative Aptitude"
  },
  topicName: {
    type: String,
    required: true, // e.g. "Number System & Algebra"
  },
  subtopics: [AptitudeSubtopicSchema],
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

AptitudeTopicSchema.index({ userId: 1, partName: 1 });
AptitudeTopicSchema.index({ userId: 1, topicName: 1 });

module.exports = mongoose.model('AptitudeTopic', AptitudeTopicSchema);
