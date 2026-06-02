const express = require('express');
const { getEnglishStats, logSession } = require('../controllers/englishController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEnglishStats)
  .post(logSession);

module.exports = router;
