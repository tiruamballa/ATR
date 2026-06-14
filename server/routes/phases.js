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

// Public seed route
router.get('/seed-force', async (req, res, next) => {
  try {
    console.log('Force seeding database from route...');
    const seedDatabase = require('../seeds/roadmapSeed');
    await seedDatabase({ closeConnection: false });
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully via force route.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

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
