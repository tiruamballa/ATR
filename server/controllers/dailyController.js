const DailyProgress = require('../models/DailyProgress');
const Streak = require('../models/Streak');
const Phase = require('../models/Phase');
const Task = require('../models/Task');

// Helper to get date string in YYYY-MM-DD
const getDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to calculate date difference
const isYesterday = (lastDateStr, todayDateStr) => {
  if (!lastDateStr) return false;
  const last = new Date(lastDateStr);
  const today = new Date(todayDateStr);
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Helper to get active daily topics from current phase
const getTodayTopics = async (userId) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[today.getMonth()];

    // Find Phase for current month/year
    const phase = await Phase.findOne({ monthName, year });
    if (!phase) {
      return {
        dsa: 'Arrays — Two Pointers Technique',
        english: 'Vocabulary & Daily Speaking Session',
        aptitude: 'Percentages & Calculation Speed'
      };
    }

    // Determine week based on day of month (1-7 = W1, 8-14 = W2, 15-21 = W3, 22+ = W4)
    const day = today.getDate();
    let weekNumber = 1;
    if (day > 21) weekNumber = 4;
    else if (day > 14) weekNumber = 3;
    else if (day > 7) weekNumber = 2;

    // Fetch tasks for this phase and week
    const tasks = await Task.find({ userId, phaseId: phase._id, weekNumber });

    const dsaTask = tasks.find(t => t.category === 'DSA');
    const englishTask = tasks.find(t => t.category === 'English');
    const aptitudeTask = tasks.find(t => t.category === 'Aptitude');

    return {
      dsa: dsaTask ? dsaTask.title.replace('DSA: ', '') : 'Arrays & Subarrays',
      english: englishTask ? englishTask.title.replace('English: ', '') : 'Speaking & Grammar Session',
      aptitude: aptitudeTask ? aptitudeTask.title.replace('Aptitude: ', '') : 'Profit & Loss Practice'
    };
  } catch (error) {
    return {
      dsa: 'Arrays — Practice problems',
      english: 'Vocabulary logs & Speech practice',
      aptitude: 'Aptitude core topics practice'
    };
  }
};

// @desc    Get today's daily checklist (creates if not existing)
// @route   GET /api/daily/today
// @access  Private
exports.getTodayChecklist = async (req, res, next) => {
  try {
    const dateStr = getDateString();
    let progress = await DailyProgress.findOne({ userId: req.user.id, date: dateStr });

    if (!progress) {
      // Fetch dynamic topic labels based on current calendar schedule
      const topics = await getTodayTopics(req.user.id);

      const checklist = [
        { key: 'dsa', title: 'DSA', category: 'DSA', detail: topics.dsa, completed: false },
        { key: 'english', title: 'English', category: 'English', detail: topics.english, completed: false },
        { key: 'aptitude', title: 'Aptitude', category: 'Aptitude', detail: topics.aptitude, completed: false },
        { key: 'dev', title: 'Development', category: 'Development', detail: 'Coding and full stack project work', completed: false },
        { key: 'github', title: 'GitHub', category: 'GitHub', detail: 'Commit code and push updates', completed: false },
        { key: 'hours', title: 'Study Hours', category: 'Study Hours', detail: 'Log 6 target hours of continuous study', completed: false }
      ];

      progress = await DailyProgress.create({
        userId: req.user.id,
        date: dateStr,
        checklist,
        allCompleted: false,
      });
    }

    // Get current streak
    let streakObj = await Streak.findOne({ userId: req.user.id });
    if (!streakObj) {
      streakObj = await Streak.create({ userId: req.user.id });
    }

    res.status(200).json({
      success: true,
      progress,
      streak: streakObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a checklist item
// @route   POST /api/daily/toggle
// @access  Private
exports.toggleChecklistItem = async (req, res, next) => {
  try {
    const { itemKey } = req.body;
    const dateStr = getDateString();

    if (!itemKey) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the itemKey to toggle',
      });
    }

    const progress = await DailyProgress.findOne({ userId: req.user.id, date: dateStr });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No daily checklist found for today. Get today first.',
      });
    }

    // Find the item and update status
    const item = progress.checklist.find(i => i.key === itemKey);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Checklist item not found',
      });
    }
    item.completed = !item.completed;

    // Check if all are now completed
    const wasAllCompleted = progress.allCompleted;
    const isNowAllCompleted = progress.checklist.every(i => i.completed);
    progress.allCompleted = isNowAllCompleted;

    await progress.save();

    // Streak logic
    let streakObj = await Streak.findOne({ userId: req.user.id });
    if (!streakObj) {
      streakObj = new Streak({ userId: req.user.id });
    }

    if (isNowAllCompleted && !wasAllCompleted) {
      // Transitioned to completed
      const lastDate = streakObj.lastCompletedDate;
      const todayStr = dateStr;

      if (lastDate !== todayStr) {
        if (isYesterday(lastDate, todayStr)) {
          // Increment streak
          streakObj.currentStreak += 1;
        } else {
          // Streak broken or brand new
          streakObj.currentStreak = 1;
        }
        streakObj.longestStreak = Math.max(streakObj.longestStreak, streakObj.currentStreak);
        streakObj.lastCompletedDate = todayStr;
        await streakObj.save();
      }
    } else if (!isNowAllCompleted && wasAllCompleted) {
      // User unchecked an item after completing everything today
      if (streakObj.lastCompletedDate === dateStr) {
        streakObj.currentStreak = Math.max(0, streakObj.currentStreak - 1);
        streakObj.lastCompletedDate = null;
        await streakObj.save();
      }
    }

    res.status(200).json({
      success: true,
      progress,
      streak: streakObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user streak info
// @route   GET /api/daily/streak
// @access  Private
exports.getStreak = async (req, res, next) => {
  try {
    let streakObj = await Streak.findOne({ userId: req.user.id });
    if (!streakObj) {
      streakObj = await Streak.create({ userId: req.user.id });
    }

    // Reset current streak if lastCompletedDate was before yesterday (streak broken)
    const dateStr = getDateString();
    if (streakObj.lastCompletedDate && streakObj.lastCompletedDate !== dateStr && !isYesterday(streakObj.lastCompletedDate, dateStr)) {
      streakObj.currentStreak = 0;
      await streakObj.save();
    }

    res.status(200).json({
      success: true,
      streak: streakObj,
    });
  } catch (error) {
    next(error);
  }
};
