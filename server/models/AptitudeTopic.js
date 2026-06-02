const mongoose = require('mongoose');

const AptitudeTopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  attempted: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  lastPracticed: {
    type: Date,
    default: Date.now,
  },
});

AptitudeTopicSchema.index({ userId: 1, topicName: 1 }, { unique: true });

module.exports = mongoose.model('AptitudeTopic', AptitudeTopicSchema);
