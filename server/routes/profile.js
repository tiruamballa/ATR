const express = require('express');
const {
  updateGithubStats,
  updateSkills,
  addResumeVersion,
  getReadinessScores,
  updateLeetcodeUsername,
  updateTargets
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/github', updateGithubStats);
router.post('/skills', updateSkills);
router.post('/resumes', addResumeVersion);
router.get('/readiness', getReadinessScores);
router.post('/leetcode-username', updateLeetcodeUsername);
router.put('/targets', updateTargets);

module.exports = router;
