const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSmartRateLimit } = require('../middleware/smartRateLimit');
const { validate } = require('../middleware/inputValidation');
const projectService = require('../services/projectService');
const { logger } = require('../config/logger');

// Rate limiting
const projectRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many project requests from this IP, please try again later.'
});

// Apply rate limiting to all project routes
router.use(projectRateLimit);

// ==================== PROJECTS ROUTES ====================

// Get all projects
router.get('/', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // For now, return empty array until projects functionality is implemented
    res.json({
      success: true,
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    logger.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve projects. Please try again.'
    });
  }
});

// Create new project
router.post('/', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    // For now, return success until projects functionality is implemented
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { id: 'temp-id', ...req.body }
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create project. Please try again.'
    });
  }
});

// Get project by ID
router.get('/projects/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    logger.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Update project
router.put('/projects/:id', authenticateToken, requireRole(['admin', 'project_manager']), validate('projectUpdate'), async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get project analytics
router.get('/projects/:id/analytics', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const analytics = await projectService.getProjectAnalytics(req.params.id);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting project analytics:', error);
    res.status(500).json({ error: 'Failed to get project analytics' });
  }
});

// Update project status
router.put('/projects/:id/status', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const project = await projectService.updateProjectStatus(req.params.id, status, notes);
    res.json(project);
  } catch (error) {
    logger.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Update project progress
router.put('/projects/:id/progress', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const { progress, notes } = req.body;
    const project = await projectService.updateProjectProgress(req.params.id, progress, notes);
    res.json(project);
  } catch (error) {
    logger.error('Error updating project progress:', error);
    res.status(500).json({ error: 'Failed to update project progress' });
  }
});

// Add project risk
router.post('/projects/:id/risks', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), validate('risk'), async (req, res) => {
  try {
    const risk = await projectService.addProjectRisk(req.params.id, req.body);
    res.status(201).json(risk);
  } catch (error) {
    logger.error('Error adding project risk:', error);
    res.status(500).json({ error: 'Failed to add project risk' });
  }
});

// Update project risk
router.put('/projects/:id/risks/:riskId', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), validate('riskUpdate'), async (req, res) => {
  try {
    const risk = await projectService.updateProjectRisk(req.params.id, req.params.riskId, req.body);
    res.json(risk);
  } catch (error) {
    logger.error('Error updating project risk:', error);
    res.status(500).json({ error: 'Failed to update project risk' });
  }
});

// Delete project risk
router.delete('/projects/:id/risks/:riskId', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const risk = await projectService.deleteProjectRisk(req.params.id, req.params.riskId);
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project risk:', error);
    res.status(500).json({ error: 'Failed to delete project risk' });
  }
});

// ==================== TASK ROUTES ====================

// Get all tasks for a project
router.get('/projects/:id/tasks', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
    const filters = { status, priority, assignedTo };
    
    const result = await projectService.getProjectTasks(req.params.id, filters, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    logger.error('Error getting project tasks:', error);
    res.status(500).json({ error: 'Failed to get project tasks' });
  }
});

// Create new task
router.post('/projects/:id/tasks', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), validate('task'), async (req, res) => {
  try {
    const task = await projectService.createTask(req.params.id, req.body);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get task by ID
router.get('/tasks/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const task = await projectService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    logger.error('Error getting task:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// Update task
router.put('/tasks/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), validate('taskUpdate'), async (req, res) => {
  try {
    const task = await projectService.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/tasks/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const task = await projectService.deleteTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Update task status
router.put('/tasks/:id/status', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await projectService.updateTaskStatus(req.params.id, status, notes);
    res.json(task);
  } catch (error) {
    logger.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Assign task
router.put('/tasks/:id/assign', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const { assignedTo, notes } = req.body;
    const task = await projectService.assignTask(req.params.id, assignedTo, notes);
    res.json(task);
  } catch (error) {
    logger.error('Error assigning task:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

// ==================== MILESTONE ROUTES ====================

// Get all milestones for a project
router.get('/projects/:id/milestones', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filters = { status };
    
    const result = await projectService.getProjectMilestones(req.params.id, filters, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    logger.error('Error getting project milestones:', error);
    res.status(500).json({ error: 'Failed to get project milestones' });
  }
});

// Create new milestone
router.post('/projects/:id/milestones', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), validate('milestone'), async (req, res) => {
  try {
    const milestone = await projectService.createMilestone(req.params.id, req.body);
    res.status(201).json(milestone);
  } catch (error) {
    logger.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Get milestone by ID
router.get('/milestones/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead', 'team_member']), async (req, res) => {
  try {
    const milestone = await projectService.getMilestoneById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (error) {
    logger.error('Error getting milestone:', error);
    res.status(500).json({ error: 'Failed to get milestone' });
  }
});

// Update milestone
router.put('/milestones/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), validate('milestoneUpdate'), async (req, res) => {
  try {
    const milestone = await projectService.updateMilestone(req.params.id, req.body);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (error) {
    logger.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Delete milestone
router.delete('/milestones/:id', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const milestone = await projectService.deleteMilestone(req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    logger.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// Update milestone status
router.put('/milestones/:id/status', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const milestone = await projectService.updateMilestoneStatus(req.params.id, status, notes);
    res.json(milestone);
  } catch (error) {
    logger.error('Error updating milestone status:', error);
    res.status(500).json({ error: 'Failed to update milestone status' });
  }
});

// ==================== TEAM MANAGEMENT ROUTES ====================

// Get project team
router.get('/projects/:id/team', authenticateToken, requireRole(['admin', 'project_manager', 'team_lead']), async (req, res) => {
  try {
    const team = await projectService.getProjectTeam(req.params.id);
    res.json(team);
  } catch (error) {
    logger.error('Error getting project team:', error);
    res.status(500).json({ error: 'Failed to get project team' });
  }
});

// Add team member to project
router.post('/projects/:id/team-members', authenticateToken, requireRole(['admin', 'project_manager']), validate('teamMember'), async (req, res) => {
  try {
    const teamMember = await projectService.addTeamMember(req.params.id, req.body);
    res.status(201).json(teamMember);
  } catch (error) {
    logger.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Remove team member from project
router.delete('/projects/:id/team-members/:memberId', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const result = await projectService.removeTeamMember(req.params.id, req.params.memberId);
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    logger.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Update team member role
router.put('/projects/:id/team-members/:memberId/role', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { role } = req.body;
    const teamMember = await projectService.updateTeamMemberRole(req.params.id, req.params.memberId, role);
    res.json(teamMember);
  } catch (error) {
    logger.error('Error updating team member role:', error);
    res.status(500).json({ error: 'Failed to update team member role' });
  }
});

// ==================== PROJECT ANALYTICS ROUTES ====================

// Get project analytics dashboard
router.get('/analytics/dashboard', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const analytics = await projectService.getProjectAnalyticsDashboard();
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting project analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to get project analytics dashboard' });
  }
});

// Get project performance analytics
router.get('/analytics/performance', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const analytics = await projectService.getProjectPerformanceAnalytics(startDate, endDate, projectId);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting project performance analytics:', error);
    res.status(500).json({ error: 'Failed to get project performance analytics' });
  }
});

// Get team productivity analytics
router.get('/analytics/team-productivity', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { startDate, endDate, projectId, teamMember } = req.query;
    const analytics = await projectService.getTeamProductivityAnalytics(startDate, endDate, projectId, teamMember);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting team productivity analytics:', error);
    res.status(500).json({ error: 'Failed to get team productivity analytics' });
  }
});

// Get project timeline analytics
router.get('/analytics/timeline', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { projectId } = req.query;
    const analytics = await projectService.getProjectTimelineAnalytics(projectId);
    res.json(analytics);
  } catch (error) {
    logger.error('Error getting project timeline analytics:', error);
    res.status(500).json({ error: 'Failed to get project timeline analytics' });
  }
});

// ==================== PROJECT REPORTING ROUTES ====================

// Get project status report
router.get('/reports/status', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { projectId, format = 'json' } = req.query;
    const report = await projectService.generateProjectStatusReport(projectId, format);
    res.json(report);
  } catch (error) {
    logger.error('Error generating project status report:', error);
    res.status(500).json({ error: 'Failed to generate project status report' });
  }
});

// Get project progress report
router.get('/reports/progress', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { projectId, format = 'json' } = req.query;
    const report = await projectService.generateProjectProgressReport(projectId, format);
    res.json(report);
  } catch (error) {
    logger.error('Error generating project progress report:', error);
    res.status(500).json({ error: 'Failed to generate project progress report' });
  }
});

// Get team performance report
router.get('/reports/team-performance', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const { projectId, startDate, endDate, format = 'json' } = req.query;
    const report = await projectService.generateTeamPerformanceReport(projectId, startDate, endDate, format);
    res.json(report);
  } catch (error) {
    logger.error('Error generating team performance report:', error);
    res.status(500).json({ error: 'Failed to generate team performance report' });
  }
});

// ==================== PROJECT SETTINGS ROUTES ====================

// Get project settings
router.get('/settings', authenticateToken, requireRole(['admin', 'project_manager']), async (req, res) => {
  try {
    const settings = await projectService.getProjectSettings();
    res.json(settings);
  } catch (error) {
    logger.error('Error getting project settings:', error);
    res.status(500).json({ error: 'Failed to get project settings' });
  }
});

// Update project settings
router.put('/settings', authenticateToken, requireRole(['admin', 'project_manager']), validate('projectSettings'), async (req, res) => {
  try {
    const settings = await projectService.updateProjectSettings(req.body);
    res.json(settings);
  } catch (error) {
    logger.error('Error updating project settings:', error);
    res.status(500).json({ error: 'Failed to update project settings' });
  }
});

module.exports = router;
