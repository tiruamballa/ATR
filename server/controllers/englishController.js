const EnglishProgress = require('../models/EnglishProgress');

// @desc    Log an English practice session (vocabulary, speaking, reading, writing)
// @route   POST /api/english/log
// @access  Private
exports.logSession = async (req, res, next) => {
  try {
    const { vocabularyCount, speakingSessions, readingSessions, writingSessions } = req.body;

    // Create a new progress entry for this logging event
    const log = await EnglishProgress.create({
      userId: req.user.id,
      vocabularyCount: Number(vocabularyCount || 0),
      speakingSessions: Number(speakingSessions || 0),
      readingSessions: Number(readingSessions || 0),
      writingSessions: Number(writingSessions || 0),
    });

    res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get English practice statistics (totals)
// @route   GET /api/english
// @access  Private
exports.getEnglishStats = async (req, res, next) => {
  try {
    const stats = await EnglishProgress.find({ userId: req.user.id });

    // Aggregate totals
    let totalVocab = 0;
    let totalSpeaking = 0;
    let totalReading = 0;
    let totalWriting = 0;

    stats.forEach(item => {
      totalVocab += item.vocabularyCount;
      totalSpeaking += item.speakingSessions;
      totalReading += item.readingSessions;
      totalWriting += item.writingSessions;
    });

    // Provide weekly target comparisons (e.g. Target: Vocab: 50/week, Speaking: 5/week, etc.)
    res.status(200).json({
      success: true,
      totals: {
        vocabulary: totalVocab,
        speaking: totalSpeaking,
        reading: totalReading,
        writing: totalWriting,
      },
      targets: {
        vocabulary: 100, // Monthly target values
        speaking: 15,
        reading: 15,
        writing: 15,
      },
      logs: stats.slice(-10), // Return last 10 log entries
    });
  } catch (error) {
    next(error);
  }
};
