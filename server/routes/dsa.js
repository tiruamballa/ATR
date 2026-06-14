const express = require('express');
const {
  getDSATopics,
  getTopicQuestions,
  addCustomQuestion,
  addCustomTopic,
  updateQuestion,
  updateDSATopic
} = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/topics', getDSATopics);
router.post('/topics', addCustomTopic);
router.put('/topics/:id', updateDSATopic);
router.get('/topics/:topicId/questions', getTopicQuestions);
router.post('/questions', addCustomQuestion);
router.put('/questions/:questionId', updateQuestion);

module.exports = router;
