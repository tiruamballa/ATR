const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask,
  moveTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply JWT auth protection to all task routes
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/duplicate', duplicateTask);
router.put('/:id/move', moveTask);

module.exports = router;
