const Task = require('../models/Task');
const Phase = require('../models/Phase');

// @desc    Get user tasks with filters & sorting
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { category, priority, status, phaseId, weekNumber, sortBy, search } = req.query;
    
    // Build query object
    const query = { userId: req.user.id };

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (phaseId) query.phaseId = phaseId;
    if (weekNumber) query.weekNumber = Number(weekNumber);

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Determine sorting options
    let sortOption = {};
    if (sortBy === 'deadline') {
      sortOption = { deadline: 1 };
    } else if (sortBy === 'priority') {
      sortOption = { priority: 1 }; // P1 -> P2 -> P3
    } else {
      sortOption = { createdAt: -1 }; // default
    }

    const tasks = await Task.find(query).sort(sortOption).populate('phaseId', 'name');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, deadline, phaseId, weekNumber, isCustom, progress, tags } = req.body;

    if (!title || !category || !deadline || !phaseId || !weekNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, category, deadline, phaseId, weekNumber',
      });
    }

    // Verify Phase exists
    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Associated phase not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      category,
      priority: priority || 'P2',
      deadline,
      status: req.body.status || 'Not Started',
      progress: progress || 0,
      tags: tags || [],
      phaseId,
      weekNumber: Number(weekNumber),
      isCustom: isCustom === undefined ? true : isCustom, // If created by api/UI custom task is true by default
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    // Automatically set progress to 100 if completed, or update status if progress is changed
    if (req.body.status === 'Completed') {
      req.body.progress = 100;
    } else if (req.body.progress === 100) {
      req.body.status = 'Completed';
    } else if (req.body.progress > 0 && task.status === 'Not Started') {
      req.body.status = 'In Progress';
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a task
// @route   POST /api/tasks/:id/duplicate
// @access  Private
exports.duplicateTask = async (req, res, next) => {
  try {
    const originalTask = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    const duplicatedTask = await Task.create({
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      category: originalTask.category,
      priority: originalTask.priority,
      deadline: originalTask.deadline,
      status: 'Not Started',
      progress: 0,
      tags: originalTask.tags,
      phaseId: originalTask.phaseId,
      weekNumber: originalTask.weekNumber,
      isCustom: true,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      task: duplicatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move task to another phase or week
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res, next) => {
  try {
    const { phaseId, weekNumber } = req.body;

    if (!phaseId || !weekNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target phaseId and weekNumber',
      });
    }

    // Verify Phase exists
    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Target phase not found',
      });
    }

    let task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized access',
      });
    }

    task.phaseId = phaseId;
    task.weekNumber = Number(weekNumber);
    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};
