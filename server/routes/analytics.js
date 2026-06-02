const express = require('express');
const { getAnalytics, logStudyHours } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnalytics);

router.post('/study-hours', logStudyHours);

module.exports = router;
