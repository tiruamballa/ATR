const mongoose = require('mongoose');

const SubtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  actualCompletionDate: {
    type: Date,
    default: null,
  }
});

const TopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Development', 'DSA', 'Aptitude', 'IP Skills'],
    required: true,
  },
  subtopics: [SubtopicSchema],
  practiceTarget: {
    type: String,
    default: '',
  },
  weeklyDeliverable: {
    type: String,
    default: '',
  },
  miniProject: {
    type: String,
    default: '',
  },
  estimatedQuestions: {
    type: Number,
    default: 0,
  },
  completionCriteria: {
    type: String,
    default: '',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  actualCompletionDate: {
    type: Date,
    default: null,
  }
});

TopicSchema.index({ userId: 1, weekId: 1, category: 1 });

module.exports = mongoose.model('Topic', TopicSchema);
