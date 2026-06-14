const express = require('express');
const {
  getPhases,
  getPhaseDetails,
  getCurrentPhase,
  createPhase,
  updatePhase,
  deletePhase,
  updateTopicStatus
} = require('../controllers/phaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPhases)
  .post(createPhase);

router.route('/current')
  .get(getCurrentPhase);

router.route('/:id')
  .get(getPhaseDetails)
  .put(updatePhase)
  .delete(deletePhase);

router.route('/:id/weeks/:weekNumber/topics/:topicId')
  .put(updateTopicStatus);

module.exports = router;
