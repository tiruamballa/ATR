const express = require('express');
const {
  getPhaseResources,
  addYoutubeLink,
  addDocLink,
  updateNotes,
  deleteLink,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/phase/:phaseId')
  .get(getPhaseResources);

router.post('/phase/:phaseId/youtube', addYoutubeLink);
router.post('/phase/:phaseId/doc', addDocLink);
router.put('/phase/:phaseId/notes', updateNotes);
router.delete('/phase/:phaseId/link/:type/:linkId', deleteLink);

module.exports = router;
