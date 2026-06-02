const Phase = require('../models/Phase');
const Task = require('../models/Task');
const Resource = require('../models/Resource');

// @desc    Get all phases with computed user progress statistics
// @route   GET /api/phases
// @access  Private
exports.getPhases = async (req, res, next) => {
  try {
    const phases = await Phase.find().sort({ monthIndex: 1 });
    
    // Fetch all tasks for the logged in user to aggregate progress
    const tasks = await Task.find({ userId: req.user.id });

    const phasesWithStats = phases.map((phase) => {
      const phaseTasks = tasks.filter(
        (task) => task.phaseId.toString() === phase._id.toString()
      );
      const total = phaseTasks.length;
      const completed = phaseTasks.filter((task) => task.status === 'Completed').length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Group tasks by week to count weekly stats
      const weeklyProgress = {};
      for (let w = 1; w <= 4; w++) {
        const weekTasks = phaseTasks.filter((t) => t.weekNumber === w);
        const wTotal = weekTasks.length;
        const wCompleted = weekTasks.filter((t) => t.status === 'Completed').length;
        weeklyProgress[w] = wTotal > 0 ? Math.round((wCompleted / wTotal) * 100) : 0;
      }

      return {
        _id: phase._id,
        name: phase.name,
        goal: phase.goal,
        estimatedHours: phase.estimatedHours,
        primarySkill: phase.primarySkill,
        monthIndex: phase.monthIndex,
        year: phase.year,
        monthName: phase.monthName,
        totalTasks: total,
        completedTasks: completed,
        completionPercentage,
        weeklyProgress,
      };
    });

    res.status(200).json({
      success: true,
      count: phasesWithStats.length,
      phases: phasesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single phase's full details (with tasks grouped by week and resources)
// @route   GET /api/phases/:id
// @access  Private
exports.getPhaseDetails = async (req, res, next) => {
  try {
    const phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found',
      });
    }

    // Fetch user's tasks for this phase
    const tasks = await Task.find({
      userId: req.user.id,
      phaseId: req.params.id,
    }).sort({ weekNumber: 1, createdAt: 1 });

    // Fetch resources (youtube, docs, notes) for this phase
    let resource = await Resource.findOne({
      userId: req.user.id,
      phaseId: req.params.id,
    });

    if (!resource) {
      // Return a blank template
      resource = {
        youtubeLinks: [],
        docLinks: [],
        notes: '',
      };
    }

    // Group tasks by week (1 to 4)
    const weeks = {};
    for (let w = 1; w <= 4; w++) {
      weeks[w] = tasks.filter((task) => task.weekNumber === w);
    }

    // Calculate completion metrics
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      phase: {
        ...phase.toObject(),
        completionPercentage,
      },
      weeks,
      resources: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the current active phase based on the current calendar date
// @route   GET /api/phases/current
// @access  Private
exports.getCurrentPhase = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonthName = months[currentMonthIndex];
    
    // Attempt to match by month and year
    let phase = await Phase.findOne({
      monthName: currentMonthName,
      year: currentYear
    });
    
    // Boundary checks & Fallbacks
    if (!phase) {
      if (currentYear < 2026 || (currentYear === 2026 && currentMonthIndex < 5)) {
        // Before timeline starts: return June 2026 (first phase)
        phase = await Phase.findOne({ monthIndex: 0 });
      } else {
        // After timeline ends: return November 2027 (last phase)
        phase = await Phase.findOne({ monthIndex: 17 });
      }
    }
    
    if (!phase) {
      phase = await Phase.findOne().sort({ monthIndex: 1 });
    }
    
    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'No phases found in database.',
      });
    }
    
    // Compute progress stats for this phase
    const tasks = await Task.find({
      userId: req.user.id,
      phaseId: phase._id,
    });
    
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    res.status(200).json({
      success: true,
      phase: {
        ...phase.toObject(),
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

