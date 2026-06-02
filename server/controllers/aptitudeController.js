const AptitudeTopic = require('../models/AptitudeTopic');

// @desc    Get all Aptitude topics
// @route   GET /api/aptitude
// @access  Private
exports.getAptitudeTopics = async (req, res, next) => {
  try {
    let topics = await AptitudeTopic.find({ userId: req.user.id });

    // Re-initialize if none exist
    if (topics.length === 0) {
      const aptitudeTopics = [
        'Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance',
        'Probability', 'Permutation & Combination', 'Number Series', 'Data Interpretation'
      ];
      topics = await AptitudeTopic.insertMany(
        aptitudeTopics.map((topic) => ({ userId: req.user.id, topicName: topic }))
      );
    }

    res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update practice results for an Aptitude topic
// @route   PUT /api/aptitude/:id
// @access  Private
exports.updateAptitudeTopic = async (req, res, next) => {
  try {
    const { attempted, accuracy } = req.body;

    let topic = await AptitudeTopic.findOne({ _id: req.params.id, userId: req.user.id });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Aptitude topic not found or unauthorized access',
      });
    }

    if (attempted !== undefined) topic.attempted = Number(attempted);
    if (accuracy !== undefined) topic.accuracy = Number(accuracy);
    topic.lastPracticed = Date.now();

    await topic.save();

    res.status(200).json({
      success: true,
      topic,
    });
  } catch (error) {
    next(error);
  }
};
