const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  phaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  youtubeLinks: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
  docLinks: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
  notes: {
    type: String,
    default: '',
  },
});

// Compound index to link resource to a user per phase
ResourceSchema.index({ phaseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Resource', ResourceSchema);
