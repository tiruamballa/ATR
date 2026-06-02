const express = require('express');
const { getPhases, getPhaseDetails, getCurrentPhase } = require('../controllers/phaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getPhases);
router.route('/current').get(getCurrentPhase);
router.route('/:id').get(getPhaseDetails);

module.exports = router;
