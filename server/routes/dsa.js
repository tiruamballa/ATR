const express = require('express');
const { getDSATopics, updateDSATopic, syncLeetcode } = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDSATopics);

router.route('/:id')
  .put(updateDSATopic);

router.post('/sync', syncLeetcode);

module.exports = router;
