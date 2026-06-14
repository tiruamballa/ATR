const express = require('express');
const {
  getTodayChecklist,
  toggleChecklistItem,
  toggleDailyTaskItem,
  getStreak,
  resetDailyProgress,
  getDailyHistory,
} = require('../controllers/dailyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/today', getTodayChecklist);
router.post('/toggle', toggleChecklistItem);
router.post('/tasks/:id/toggle', toggleDailyTaskItem);
router.get('/streak', getStreak);
router.post('/reset', resetDailyProgress);
router.get('/history', getDailyHistory);

module.exports = router;

