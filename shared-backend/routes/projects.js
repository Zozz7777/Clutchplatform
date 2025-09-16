const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const projectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many project requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(projectLimiter);
router.use(authenticateToken);

// ===== PROJECTS MANAGEMENT =====

// GET /api/v1/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { page = 1, limit = 10, status, priority, assignee } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await projectsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await projectsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const project = await projectsCollection.findOne({ _id: req.params.id });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/projects - Create new project
router.post('/', checkRole(['head_administrator', 'project_manager']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { name, description, status, priority, assignee, dueDate, tags } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }
    
    const project = {
      name,
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      assignee: assignee || req.user.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      tasks: [],
      timeTracking: []
    };
    
    const result = await projectsCollection.insertOne(project);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...project
      },
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/projects/:id - Update project
router.put('/:id', checkRole(['head_administrator', 'project_manager']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { name, description, status, priority, assignee, dueDate, tags, progress } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignee) updateData.assignee = assignee;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (tags) updateData.tags = tags;
    if (progress !== undefined) updateData.progress = progress;
    
    const result = await projectsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/projects/:id - Delete project
router.delete('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const result = await projectsCollection.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== PROJECT TASKS =====

// GET /api/v1/projects/:id/tasks - Get project tasks
router.get('/:id/tasks', async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const project = await projectsCollection.findOne({ _id: req.params.id });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project.tasks || []
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/projects/:id/tasks - Add task to project
router.post('/:id/tasks', checkRole(['head_administrator', 'project_manager']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { title, description, status, priority, assignee, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }
    
    const task = {
      id: Date.now().toString(),
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || req.user.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await projectsCollection.updateOne(
      { _id: req.params.id },
      { 
        $push: { tasks: task },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(201).json({
      success: true,
      data: task,
      message: 'Task added successfully'
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/projects/:id/tasks/:taskId - Update project task
router.put('/:id/tasks/:taskId', checkRole(['head_administrator', 'project_manager']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { title, description, status, priority, assignee, dueDate } = req.body;
    
    const updateFields = {};
    if (title) updateFields['tasks.$.title'] = title;
    if (description) updateFields['tasks.$.description'] = description;
    if (status) updateFields['tasks.$.status'] = status;
    if (priority) updateFields['tasks.$.priority'] = priority;
    if (assignee) updateFields['tasks.$.assignee'] = assignee;
    if (dueDate) updateFields['tasks.$.dueDate'] = new Date(dueDate);
    updateFields['tasks.$.updatedAt'] = new Date();
    updateFields.updatedAt = new Date();
    
    const result = await projectsCollection.updateOne(
      { _id: req.params.id, 'tasks.id': req.params.taskId },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project or task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/projects/:id/tasks/:taskId - Delete project task
router.delete('/:id/tasks/:taskId', checkRole(['head_administrator', 'project_manager']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const result = await projectsCollection.updateOne(
      { _id: req.params.id },
      { 
        $pull: { tasks: { id: req.params.taskId } },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== TIME TRACKING =====

// GET /api/v1/projects/:id/time-tracking - Get project time tracking
router.get('/:id/time-tracking', async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const project = await projectsCollection.findOne({ _id: req.params.id });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project.timeTracking || []
    });
  } catch (error) {
    console.error('Error fetching time tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/projects/:id/time-tracking - Add time entry
router.post('/:id/time-tracking', checkRole(['head_administrator', 'project_manager', 'employee']), async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const { taskId, description, duration, date } = req.body;
    
    if (!duration || !description) {
      return res.status(400).json({
        success: false,
        message: 'Duration and description are required'
      });
    }
    
    const timeEntry = {
      id: Date.now().toString(),
      taskId: taskId || null,
      description,
      duration: parseInt(duration), // in minutes
      date: date ? new Date(date) : new Date(),
      userId: req.user.userId,
      createdAt: new Date()
    };
    
    const result = await projectsCollection.updateOne(
      { _id: req.params.id },
      { 
        $push: { timeTracking: timeEntry },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Time entry added successfully'
    });
  } catch (error) {
    console.error('Error adding time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add time entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/projects/analytics - Get projects analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    
    const totalProjects = await projectsCollection.countDocuments();
    const activeProjects = await projectsCollection.countDocuments({ status: { $in: ['active', 'in_progress'] } });
    const completedProjects = await projectsCollection.countDocuments({ status: 'completed' });
    const overdueProjects = await projectsCollection.countDocuments({ 
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    
    // Get projects by status
    const statusStats = await projectsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get projects by priority
    const priorityStats = await projectsCollection.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          overdueProjects
        },
        statusStats,
        priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching projects analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;