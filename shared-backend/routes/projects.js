/**
 * Project Management Routes
 * Complete project management system with tasks, time tracking, and resource allocation
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const projectRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== PROJECT MANAGEMENT ====================

// GET /api/v1/projects - Get all projects
router.get('/', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, priority, manager, search } = req.query;
    const skip = (page - 1) * limit;
    
    const projectsCollection = await getCollection('projects');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (manager) query.managerId = manager;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const projects = await projectsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await projectsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Projects retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECTS_FAILED',
      message: 'Failed to retrieve projects',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/projects/:id - Get project by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const projectsCollection = await getCollection('projects');
    
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { project },
      message: 'Project retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECT_FAILED',
      message: 'Failed to retrieve project',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/projects - Create new project
router.post('/', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      priority,
      managerId,
      teamMembers,
      client,
      deliverables
    } = req.body;
    
    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, description, start date, and end date are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const projectsCollection = await getCollection('projects');
    
    // Generate project code
    const projectCount = await projectsCollection.countDocuments();
    const projectCode = `PRJ${String(projectCount + 1).padStart(4, '0')}`;
    
    const newProject = {
      projectCode,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || null,
      priority: priority || 'medium',
      managerId: managerId || req.user.userId,
      teamMembers: teamMembers || [],
      client: client || null,
      deliverables: deliverables || [],
      status: 'planning',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await projectsCollection.insertOne(newProject);
    
    res.status(201).json({
      success: true,
      data: { project: { ...newProject, _id: result.insertedId } },
      message: 'Project created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PROJECT_FAILED',
      message: 'Failed to create project',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/projects/:id - Update project
router.put('/:id', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const projectsCollection = await getCollection('projects');
    
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedProject = await projectsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { project: updatedProject },
      message: 'Project updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PROJECT_FAILED',
      message: 'Failed to update project',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== TASK MANAGEMENT ====================

// GET /api/v1/projects/:id/tasks - Get project tasks
router.get('/:id/tasks', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignee, priority } = req.query;
    
    const tasksCollection = await getCollection('tasks');
    
    // Build query
    const query = { projectId: new ObjectId(id) };
    if (status) query.status = status;
    if (assignee) query.assigneeId = assignee;
    if (priority) query.priority = priority;
    
    const tasks = await tasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { tasks },
      message: 'Project tasks retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECT_TASKS_FAILED',
      message: 'Failed to retrieve project tasks',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/projects/:id/tasks - Create project task
router.post('/:id/tasks', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assigneeId,
      priority,
      dueDate,
      estimatedHours,
      dependencies
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Title and description are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const tasksCollection = await getCollection('tasks');
    
    const newTask = {
      projectId: new ObjectId(id),
      title,
      description,
      assigneeId: assigneeId || null,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours || null,
      dependencies: dependencies || [],
      status: 'todo',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };
    
    const result = await tasksCollection.insertOne(newTask);
    
    res.status(201).json({
      success: true,
      data: { task: { ...newTask, _id: result.insertedId } },
      message: 'Task created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_TASK_FAILED',
      message: 'Failed to create task',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== TIME TRACKING ====================

// GET /api/v1/projects/:id/time-tracking - Get project time tracking
router.get('/:id/time-tracking', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, userId } = req.query;
    
    const timeTrackingCollection = await getCollection('time_tracking');
    
    // Build query
    const query = { projectId: new ObjectId(id) };
    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const timeEntries = await timeTrackingCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();
    
    // Calculate totals
    const totals = timeEntries.reduce((acc, entry) => {
      acc.totalHours += entry.hours || 0;
      acc.totalMinutes += entry.minutes || 0;
      return acc;
    }, { totalHours: 0, totalMinutes: 0 });
    
    res.json({
      success: true,
      data: {
        timeEntries,
        totals: {
          totalHours: totals.totalHours + Math.floor(totals.totalMinutes / 60),
          totalMinutes: totals.totalMinutes % 60
        }
      },
      message: 'Time tracking data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get time tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TIME_TRACKING_FAILED',
      message: 'Failed to retrieve time tracking data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/projects/:id/time-tracking - Log time entry
router.post('/:id/time-tracking', authenticateToken, requireRole(['admin', 'manager', 'project_manager', 'employee']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      taskId,
      hours,
      minutes,
      description,
      date
    } = req.body;
    
    if (!hours && !minutes) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TIME_DATA',
        message: 'Hours or minutes are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const timeTrackingCollection = await getCollection('time_tracking');
    
    const newTimeEntry = {
      projectId: new ObjectId(id),
      taskId: taskId ? new ObjectId(taskId) : null,
      userId: req.user.userId,
      hours: hours || 0,
      minutes: minutes || 0,
      description: description || null,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await timeTrackingCollection.insertOne(newTimeEntry);
    
    res.status(201).json({
      success: true,
      data: { timeEntry: { ...newTimeEntry, _id: result.insertedId } },
      message: 'Time entry logged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Log time entry error:', error);
    res.status(500).json({
      success: false,
      error: 'LOG_TIME_ENTRY_FAILED',
      message: 'Failed to log time entry',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== RESOURCE ALLOCATION ====================

// GET /api/v1/projects/:id/resources - Get project resources
router.get('/:id/resources', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const resourcesCollection = await getCollection('project_resources');
    
    const resources = await resourcesCollection
      .find({ projectId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { resources },
      message: 'Project resources retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get project resources error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECT_RESOURCES_FAILED',
      message: 'Failed to retrieve project resources',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/projects/:id/resources - Allocate resource to project
router.post('/:id/resources', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resourceType,
      resourceId,
      allocation,
      startDate,
      endDate,
      cost
    } = req.body;
    
    if (!resourceType || !resourceId || !allocation) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Resource type, resource ID, and allocation are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const resourcesCollection = await getCollection('project_resources');
    
    const newResource = {
      projectId: new ObjectId(id),
      resourceType,
      resourceId,
      allocation: parseFloat(allocation),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      cost: cost || null,
      status: 'allocated',
      createdAt: new Date(),
      updatedAt: new Date(),
      allocatedBy: req.user.userId
    };
    
    const result = await resourcesCollection.insertOne(newResource);
    
    res.status(201).json({
      success: true,
      data: { resource: { ...newResource, _id: result.insertedId } },
      message: 'Resource allocated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Allocate resource error:', error);
    res.status(500).json({
      success: false,
      error: 'ALLOCATE_RESOURCE_FAILED',
      message: 'Failed to allocate resource',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PROJECT ANALYTICS ====================

// GET /api/v1/projects/:id/analytics - Get project analytics
router.get('/:id/analytics', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    const projectsCollection = await getCollection('projects');
    const tasksCollection = await getCollection('tasks');
    const timeTrackingCollection = await getCollection('time_tracking');
    const resourcesCollection = await getCollection('project_resources');
    
    // Get project
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Task statistics
    const totalTasks = await tasksCollection.countDocuments({ projectId: new ObjectId(id) });
    const completedTasks = await tasksCollection.countDocuments({ 
      projectId: new ObjectId(id), 
      status: 'completed' 
    });
    const inProgressTasks = await tasksCollection.countDocuments({ 
      projectId: new ObjectId(id), 
      status: 'in_progress' 
    });
    
    // Time tracking statistics
    const timeEntries = await timeTrackingCollection.find({ projectId: new ObjectId(id) }).toArray();
    const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0) + (entry.minutes || 0) / 60, 0);
    
    // Resource statistics
    const resources = await resourcesCollection.find({ projectId: new ObjectId(id) }).toArray();
    const totalCost = resources.reduce((sum, resource) => sum + (resource.cost || 0), 0);
    
    // Progress calculation
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const analytics = {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
        progress: Math.round(progress * 100) / 100
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        remaining: totalTasks - completedTasks - inProgressTasks
      },
      timeTracking: {
        totalHours: Math.round(totalTime * 100) / 100,
        entries: timeEntries.length
      },
      resources: {
        total: resources.length,
        totalCost: totalCost
      },
      budget: {
        allocated: project.budget || 0,
        spent: totalCost,
        remaining: (project.budget || 0) - totalCost
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Project analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECT_ANALYTICS_FAILED',
      message: 'Failed to retrieve project analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/projects/analytics/overview - Get projects overview analytics
router.get('/analytics/overview', authenticateToken, requireRole(['admin', 'manager', 'project_manager']), projectRateLimit, async (req, res) => {
  try {
    const projectsCollection = await getCollection('projects');
    const tasksCollection = await getCollection('tasks');
    
    // Project statistics
    const totalProjects = await projectsCollection.countDocuments();
    const activeProjects = await projectsCollection.countDocuments({ status: 'active' });
    const completedProjects = await projectsCollection.countDocuments({ status: 'completed' });
    const overdueProjects = await projectsCollection.countDocuments({
      endDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    
    // Task statistics
    const totalTasks = await tasksCollection.countDocuments();
    const completedTasks = await tasksCollection.countDocuments({ status: 'completed' });
    
    // Project status distribution
    const statusDistribution = await projectsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const overview = {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        overdue: overdueProjects,
        statusDistribution
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: overview,
      message: 'Projects overview analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get projects overview analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROJECTS_OVERVIEW_ANALYTICS_FAILED',
      message: 'Failed to retrieve projects overview analytics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
