const express = require('express');
const {
  getTodayChecklist,
  toggleChecklistItem,
  getStreak,
  resetDailyProgress,
} = require('../controllers/dailyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/today', getTodayChecklist);
router.post('/toggle', toggleChecklistItem);
router.get('/streak', getStreak);
router.post('/reset', resetDailyProgress);

module.exports = router;

