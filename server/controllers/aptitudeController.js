const AptitudeTopic = require('../models/AptitudeTopic');

// @desc    Get all Aptitude topics grouped by Part
// @route   GET /api/aptitude
// @access  Private
exports.getAptitudeTopics = async (req, res, next) => {
  try {
    const topics = await AptitudeTopic.find({ userId: req.user.id });

    // Group topics by partName
    const grouped = {};
    topics.forEach((topic) => {
      if (!grouped[topic.partName]) {
        grouped[topic.partName] = [];
      }
      
      const totalSub = topic.subtopics.length;
      const completedSub = topic.subtopics.filter(s => s.isCompleted).length;
      const progress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
      
      grouped[topic.partName].push({
        ...topic.toObject(),
        progress
      });
    });

    // Compute overall completion stats
    const total = topics.length;
    const completed = topics.filter((t) => t.isCompleted).length;
    const overallCompletionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      overall: {
        total,
        completed,
        percent: overallCompletionPercent
      },
      grouped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Aptitude topic progress, completion status, and notes
// @route   PUT /api/aptitude/:id
// @access  Private
exports.updateAptitudeTopic = async (req, res, next) => {
  try {
    const { isCompleted, notes, subtopicId, subCompleted, questionsSolved, accuracyPercent, revisionCount, subNotes } = req.body;

    const topic = await AptitudeTopic.findOne({ _id: req.params.id, userId: req.user.id });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Aptitude topic not found'
      });
    }

    if (notes !== undefined) topic.notes = notes;

    if (subtopicId) {
      const sub = topic.subtopics.id(subtopicId);
      if (sub) {
        if (subCompleted !== undefined) {
          sub.isCompleted = subCompleted;
        }
        if (questionsSolved !== undefined) {
          sub.questionsSolved = Number(questionsSolved);
        }
        if (accuracyPercent !== undefined) {
          sub.accuracyPercent = Number(accuracyPercent);
        }
        if (revisionCount !== undefined) {
          sub.revisionCount = Number(revisionCount);
        }
        if (subNotes !== undefined) {
          sub.notes = subNotes;
        }
      }
    }

    // Automatically check and set parent topic completion
    if (topic.subtopics && topic.subtopics.length > 0) {
      topic.isCompleted = topic.subtopics.every(s => s.isCompleted);
    } else if (isCompleted !== undefined) {
      topic.isCompleted = isCompleted;
    }

    await topic.save();

    const totalSub = topic.subtopics.length;
    const completedSub = topic.subtopics.filter(s => s.isCompleted).length;
    const progress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    res.status(200).json({
      success: true,
      topic: {
        ...topic.toObject(),
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};
