const mongoose = require('mongoose');

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
  solvedQuestions: {
    type: Number,
    default: 0,
  },
  targetQuestions: {
    type: Number,
    default: 30, // Default baseline per topic
  },
});

DSATopicSchema.index({ userId: 1, topicName: 1 }, { unique: true });

module.exports = mongoose.model('DSATopic', DSATopicSchema);
