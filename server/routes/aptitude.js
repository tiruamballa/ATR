const express = require('express');
const { getAptitudeTopics, updateAptitudeTopic } = require('../controllers/aptitudeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAptitudeTopics);

router.route('/:id')
  .put(updateAptitudeTopic);

module.exports = router;
