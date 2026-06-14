const express = require('express');
const { getAptitudeTopics, updateAptitudeTopic } = require('../controllers/aptitudeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/topics', getAptitudeTopics);
router.get('/', getAptitudeTopics);

router.put('/topics/:id', updateAptitudeTopic);
router.put('/:id', updateAptitudeTopic);

module.exports = router;
