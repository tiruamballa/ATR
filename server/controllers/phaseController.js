const Phase = require('../models/Phase');
const Week = require('../models/Week');
const Topic = require('../models/Topic');

// @desc    Get all phases for logged in user
// @route   GET /api/phases
// @access  Private
exports.getPhases = async (req, res, next) => {
  try {
    const phases = await Phase.find({ userId: req.user.id }).sort({ monthIndex: 1 });
    const allWeeks = await Week.find({ userId: req.user.id }).sort({ globalWeekNumber: 1 });
    const allTopics = await Topic.find({ userId: req.user.id });
    
    const phasesWithStats = phases.map(phase => {
      const phaseWeeks = allWeeks.filter(w => w.phaseId.toString() === phase._id.toString());
      let total = 0;
      let completed = 0;
      
      const weeklyProgress = {};
      const mappedWeeks = phaseWeeks.map(w => {
        const weekTopics = allTopics.filter(t => t.weekId.toString() === w._id.toString());
        const wTotal = weekTopics.length;
        const wCompleted = weekTopics.filter(t => t.isCompleted).length;
        total += wTotal;
        completed += wCompleted;
        weeklyProgress[w.weekNumber] = wTotal > 0 ? Math.round((wCompleted / wTotal) * 100) : 0;
        
        return {
          ...w.toObject(),
          topics: weekTopics
        };
      });

      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...phase.toObject(),
        weeks: mappedWeeks,
        totalTasks: total,
        completedTasks: completed,
        completionPercentage,
        weeklyProgress
      };
    });

    res.status(200).json({
      success: true,
      count: phasesWithStats.length,
      phases: phasesWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current active phase based on current date
// @route   GET /api/phases/current
// @access  Private
exports.getCurrentPhase = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find phase where now is between plannedStartDate and plannedEndDate
    let phase = await Phase.findOne({
      userId: req.user.id,
      plannedStartDate: { $lte: now },
      plannedEndDate: { $gte: now }
    });

    // Fallbacks
    if (!phase) {
      // Find the first phase
      phase = await Phase.findOne({ userId: req.user.id }).sort({ monthIndex: 1 });
    }

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'No phases found. Please run baseline seed.'
      });
    }

    const weeks = await Week.find({ userId: req.user.id, phaseId: phase._id }).sort({ weekNumber: 1 });
    const weekIds = weeks.map(w => w._id);
    const topics = await Topic.find({ userId: req.user.id, weekId: { $in: weekIds } });

    let total = 0;
    let completed = 0;
    const mappedWeeks = weeks.map(w => {
      const weekTopics = topics.filter(t => t.weekId.toString() === w._id.toString());
      total += weekTopics.length;
      completed += weekTopics.filter(t => t.isCompleted).length;
      return {
        ...w.toObject(),
        topics: weekTopics
      };
    });
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      phase: {
        ...phase.toObject(),
        weeks: mappedWeeks,
        completionPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single phase details
// @route   GET /api/phases/:id
// @access  Private
exports.getPhaseDetails = async (req, res, next) => {
  try {
    const phase = await Phase.findOne({ _id: req.params.id, userId: req.user.id });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    const weeks = await Week.find({ userId: req.user.id, phaseId: phase._id }).sort({ weekNumber: 1 });
    const weekIds = weeks.map(w => w._id);
    const topics = await Topic.find({ userId: req.user.id, weekId: { $in: weekIds } });

    let total = 0;
    let completed = 0;
    const mappedWeeks = weeks.map(w => {
      const weekTopics = topics.filter(t => t.weekId.toString() === w._id.toString());
      total += weekTopics.length;
      completed += weekTopics.filter(t => t.isCompleted).length;
      return {
        ...w.toObject(),
        topics: weekTopics
      };
    });
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      phase: {
        ...phase.toObject(),
        weeks: mappedWeeks,
        completionPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new custom phase
// @route   POST /api/phases
// @access  Private
exports.createPhase = async (req, res, next) => {
  try {
    const { name, goal, estimatedHours, primarySkill, startDate, endDate, monthIndex, year, monthName } = req.body;

    const count = await Phase.countDocuments({ userId: req.user.id });
    const finalMonthIndex = monthIndex !== undefined ? monthIndex : count;

    const phase = await Phase.create({
      userId: req.user.id,
      name,
      goal: goal || 'Custom target skill milestones',
      estimatedHours: estimatedHours || 120,
      primarySkill: primarySkill || 'Custom Skills',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      monthIndex: finalMonthIndex,
      year: year || new Date().getFullYear(),
      monthName: monthName || 'Custom Month',
      weeks: [
        { weekNumber: 1, name: 'Week 1 Focus', topics: [] },
        { weekNumber: 2, name: 'Week 2 Focus', topics: [] },
        { weekNumber: 3, name: 'Week 3 Focus', topics: [] },
        { weekNumber: 4, name: 'Week 4 Focus', topics: [] }
      ]
    });

    res.status(201).json({
      success: true,
      phase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a phase Details/Weeks/Topics
// @route   PUT /api/phases/:id
// @access  Private
exports.updatePhase = async (req, res, next) => {
  try {
    let phase = await Phase.findOne({ _id: req.params.id, userId: req.user.id });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    phase = await Phase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      phase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a phase
// @route   DELETE /api/phases/:id
// @access  Private
exports.deletePhase = async (req, res, next) => {
  try {
    const phase = await Phase.findOne({ _id: req.params.id, userId: req.user.id });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    await phase.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Phase deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle/Update a topic status inside a phase
// @route   PUT /api/phases/:id/weeks/:weekNumber/topics/:topicId
// @access  Private
exports.updateTopicStatus = async (req, res, next) => {
  try {
    const { isCompleted, notes } = req.body;
    const { id, weekNumber, topicId } = req.params;

    const phase = await Phase.findOne({ _id: id, userId: req.user.id });
    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    const week = phase.weeks.find(w => w.weekNumber === Number(weekNumber));
    if (!week) {
      return res.status(404).json({ success: false, message: 'Week not found' });
    }

    const topic = week.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    if (isCompleted !== undefined) topic.isCompleted = isCompleted;
    if (notes !== undefined) topic.notes = notes;

    await phase.save();

    res.status(200).json({
      success: true,
      phase
    });
  } catch (error) {
    next(error);
  }
};
