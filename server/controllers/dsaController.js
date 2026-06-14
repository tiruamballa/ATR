const DSATopic = require('../models/DSATopic');
const DSAQuestion = require('../models/DSAQuestion');

// @desc    Get all DSA topics with aggregated solved/total metrics
// @route   GET /api/dsa/topics
// @access  Private
exports.getDSATopics = async (req, res, next) => {
  try {
    const topics = await DSATopic.find({ userId: req.user.id }).sort({ createdAt: 1 });

    const topicsWithStats = topics.map(topic => {
      const totalSub = topic.subtopics.length;
      const completedSub = topic.subtopics.filter(s => s.isCompleted).length;
      const progress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
      
      return {
        ...topic.toObject(),
        progress
      };
    });

    // Compute overall completion stats
    let totalSubCount = 0;
    let completedSubCount = 0;
    topics.forEach(t => {
      totalSubCount += t.subtopics.length;
      completedSubCount += t.subtopics.filter(s => s.isCompleted).length;
    });
    const overallCompletionPercent = totalSubCount > 0 ? Math.round((completedSubCount / totalSubCount) * 100) : 0;

    res.status(200).json({
      success: true,
      overall: {
        total: totalSubCount,
        completed: completedSubCount,
        percent: overallCompletionPercent
      },
      topics: topicsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update DSA topic / subtopic completion, questionsSolved, notes, revisions
// @route   PUT /api/dsa/topics/:id
// @access  Private
exports.updateDSATopic = async (req, res, next) => {
  try {
    const { isCompleted, notes, subtopicId, subCompleted, questionsSolved, revisionCount, subNotes } = req.body;

    const topic = await DSATopic.findOne({ _id: req.params.id, userId: req.user.id });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'DSA topic not found'
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

// @desc    Add a custom DSA topic
// @route   POST /api/dsa/topics
// @access  Private
exports.addCustomTopic = async (req, res, next) => {
  try {
    const { topicName } = req.body;

    if (!topicName || !topicName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic name'
      });
    }

    // Check duplication
    const existing = await DSATopic.findOne({
      userId: req.user.id,
      topicName: { $regex: new RegExp(`^${topicName.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A topic with this name already exists'
      });
    }

    const topic = await DSATopic.create({
      userId: req.user.id,
      topicName: topicName.trim(),
      isCustom: true,
      subtopics: [
        { name: 'Basics & Introductions', isCompleted: false },
        { name: 'Standard Implementation', isCompleted: false },
        { name: 'Advanced Sprints', isCompleted: false }
      ]
    });

    res.status(201).json({
      success: true,
      topic
    });
  } catch (error) {
    next(error);
  }
};

// Deprecated routes placeholders for backwards compatibility
exports.getTopicQuestions = async (req, res) => {
  res.status(200).json({ success: true, questions: [] });
};
exports.addCustomQuestion = async (req, res) => {
  res.status(200).json({ success: true, question: {} });
};
exports.updateQuestion = async (req, res) => {
  res.status(200).json({ success: true, question: {} });
};
