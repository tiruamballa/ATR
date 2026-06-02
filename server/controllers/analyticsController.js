const Task = require('../models/Task');
const Phase = require('../models/Phase');
const Analytics = require('../models/Analytics');
const DSATopic = require('../models/DSATopic');
const AptitudeTopic = require('../models/AptitudeTopic');
const EnglishProgress = require('../models/EnglishProgress');

// @desc    Get aggregated analytics data for dashboard charts
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Weekly task completion (last 8 weeks)
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const endOfWeek = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const startOfWeek = new Date(endOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const countTotal = await Task.countDocuments({
        userId,
        deadline: { $gte: startOfWeek, $lte: endOfWeek }
      });
      const countCompleted = await Task.countDocuments({
        userId,
        status: 'Completed',
        deadline: { $gte: startOfWeek, $lte: endOfWeek }
      });

      const weekLabel = i === 0 ? 'This Week' : `${i}w ago`;
      weeklyData.push({
        week: weekLabel,
        completed: countCompleted,
        total: countTotal,
      });
    }

    // 2. Line chart - monthly progress trend (% complete per month for all 18 months)
    const phases = await Phase.find().sort({ monthIndex: 1 });
    const allTasks = await Task.find({ userId });
    
    const monthlyData = phases.map((phase) => {
      const phaseTasks = allTasks.filter(
        (t) => t.phaseId.toString() === phase._id.toString()
      );
      const total = phaseTasks.length;
      const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        month: `${phase.monthName.slice(0, 3)} '${String(phase.year).slice(-2)}`,
        percentage: completionPercentage,
      };
    });

    // 3. Radar chart - skill completion by category (DSA, English, Aptitude, Dev, AI)
    const categories = ['DSA', 'English', 'Aptitude', 'Development', 'AI'];
    const radarData = [];

    for (const cat of categories) {
      const catTasks = allTasks.filter(t => t.category === cat);
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.status === 'Completed').length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      radarData.push({
        category: cat,
        percentage: completionPercentage,
        fullMark: 100,
      });
    }

    // 4. Area chart - daily study hours log (last 30 days)
    const studyLogs = [];
    const dateList = [];
    
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      dateList.push(`${year}-${month}-${day}`);
    }

    // Fetch hours for these dates
    const hourlyRecords = await Analytics.find({
      userId,
      date: { $in: dateList }
    });

    dateList.forEach((dateStr) => {
      const record = hourlyRecords.find(r => r.date === dateStr);
      const studyHours = record ? record.studyHours : 0;
      const targetHours = record ? record.targetHours : 6; // default 6h target
      const diff = Number((studyHours - targetHours).toFixed(1));

      // Format date for chart tooltip (e.g. "Jun 02")
      const dObj = new Date(dateStr);
      const formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      studyLogs.push({
        date: formattedDate,
        dateKey: dateStr,
        actual: studyHours,
        target: targetHours,
        difference: diff,
      });
    });

    res.status(200).json({
      success: true,
      weeklyData,
      monthlyData,
      radarData,
      studyLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log daily study hours for a specific date
// @route   POST /api/analytics/study-hours
// @access  Private
exports.logStudyHours = async (req, res, next) => {
  try {
    const { date, studyHours, targetHours } = req.body;

    if (!date || studyHours === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date (YYYY-MM-DD) and studyHours',
      });
    }

    let record = await Analytics.findOne({ userId: req.user.id, date });

    if (!record) {
      record = await Analytics.create({
        userId: req.user.id,
        date,
        studyHours: Number(studyHours),
        targetHours: Number(targetHours || 6),
      });
    } else {
      record.studyHours = Number(studyHours);
      if (targetHours !== undefined) record.targetHours = Number(targetHours);
      await record.save();
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};
