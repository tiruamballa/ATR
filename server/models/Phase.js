const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    required: true,
  },
  estimatedHours: {
    type: Number,
    required: true,
  },
  primarySkill: {
    type: String,
    required: true,
  },
  monthIndex: {
    type: Number,
    required: true,
    unique: true, // 0 to 17 for June 2026 to November 2027
  },
  year: {
    type: Number,
    required: true,
  },
  monthName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Phase', PhaseSchema);
