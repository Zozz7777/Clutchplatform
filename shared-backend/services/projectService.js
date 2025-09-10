const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const { logger } = require('../config/logger');

class ProjectService {
  // Project Management
  async createProject(projectData) {
    try {
      const project = new Project(projectData);
      await project.save();
      logger.info(`Project created: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  async getProjectById(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('client', 'name email phone')
        .populate('team.members', 'name email role')
        .populate('stakeholders', 'name email role')
        .populate('parentProject', 'name code');
      return project;
    } catch (error) {
      logger.error('Error getting project by ID:', error);
      throw error;
    }
  }

  async getAllProjects(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.client) query.client = filters.client;
      if (filters.teamLead) query['team.lead'] = filters.teamLead;
      if (filters.startDate) query.startDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) query.endDate = { $lte: new Date(filters.endDate) };
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { code: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const projects = await Project.find(query)
        .populate('client', 'name email')
        .populate('team.lead', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Project.countDocuments(query);

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting all projects:', error);
      throw error;
    }
  }

  async updateProject(projectId, updateData) {
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true, runValidators: true }
      ).populate('client team.members stakeholders');
      
      logger.info(`Project updated: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      const project = await Project.findByIdAndDelete(projectId);
      logger.info(`Project deleted: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  // Task Management
  async createTask(projectId, taskData) {
    try {
      const task = new Task({
        ...taskData,
        project: projectId
      });
      await task.save();

      // Update project task count
      await Project.findByIdAndUpdate(projectId, {
        $inc: { 'analytics.totalTasks': 1 }
      });

      logger.info(`Task created: ${task.title} for project ${projectId}`);
      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId)
        .populate('project', 'name code')
        .populate('assignedTo', 'name email')
        .populate('dependencies', 'title status');
      return task;
    } catch (error) {
      logger.error('Error getting task by ID:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId, filters = {}) {
    try {
      const query = { project: projectId };
      
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('dependencies', 'title status')
        .sort({ priority: -1, dueDate: 1 });

      return tasks;
    } catch (error) {
      logger.error('Error getting project tasks:', error);
      throw error;
    }
  }

  async updateTask(taskId, updateData) {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      ).populate('project assignedTo dependencies');
      
      logger.info(`Task updated: ${task.title}`);
      return task;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const task = await Task.findByIdAndDelete(taskId);
      
      if (task) {
        // Update project task count
        await Project.findByIdAndUpdate(task.project, {
          $inc: { 'analytics.totalTasks': -1 }
        });
      }

      logger.info(`Task deleted: ${task.title}`);
      return task;
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }

  // Milestone Management
  async createMilestone(projectId, milestoneData) {
    try {
      const milestone = new Milestone({
        ...milestoneData,
        project: projectId
      });
      await milestone.save();

      logger.info(`Milestone created: ${milestone.title} for project ${projectId}`);
      return milestone;
    } catch (error) {
      logger.error('Error creating milestone:', error);
      throw error;
    }
  }

  async getMilestoneById(milestoneId) {
    try {
      const milestone = await Milestone.findById(milestoneId)
        .populate('project', 'name code')
        .populate('tasks', 'title status');
      return milestone;
    } catch (error) {
      logger.error('Error getting milestone by ID:', error);
      throw error;
    }
  }

  async getProjectMilestones(projectId) {
    try {
      const milestones = await Milestone.find({ project: projectId })
        .populate('tasks', 'title status assignedTo')
        .sort({ dueDate: 1 });
      return milestones;
    } catch (error) {
      logger.error('Error getting project milestones:', error);
      throw error;
    }
  }

  async updateMilestone(milestoneId, updateData) {
    try {
      const milestone = await Milestone.findByIdAndUpdate(
        milestoneId,
        updateData,
        { new: true, runValidators: true }
      ).populate('project tasks');
      
      logger.info(`Milestone updated: ${milestone.title}`);
      return milestone;
    } catch (error) {
      logger.error('Error updating milestone:', error);
      throw error;
    }
  }

  async deleteMilestone(milestoneId) {
    try {
      const milestone = await Milestone.findByIdAndDelete(milestoneId);
      logger.info(`Milestone deleted: ${milestone.title}`);
      return milestone;
    } catch (error) {
      logger.error('Error deleting milestone:', error);
      throw error;
    }
  }

  // Team Management
  async addTeamMember(projectId, memberData) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if member already exists
      const existingMember = project.team.members.find(
        member => member.memberId.toString() === memberData.memberId
      );

      if (existingMember) {
        throw new Error('Team member already exists');
      }

      project.team.members.push(memberData);
      await project.save();

      logger.info(`Team member added to project ${projectId}: ${memberData.memberId}`);
      return project;
    } catch (error) {
      logger.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(projectId, memberId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      project.team.members = project.team.members.filter(
        member => member.memberId.toString() !== memberId
      );
      await project.save();

      logger.info(`Team member removed from project ${projectId}: ${memberId}`);
      return project;
    } catch (error) {
      logger.error('Error removing team member:', error);
      throw error;
    }
  }

  async updateTeamMemberRole(projectId, memberId, newRole) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const member = project.team.members.find(
        member => member.memberId.toString() === memberId
      );

      if (!member) {
        throw new Error('Team member not found');
      }

      member.role = newRole;
      await project.save();

      logger.info(`Team member role updated in project ${projectId}: ${memberId} -> ${newRole}`);
      return project;
    } catch (error) {
      logger.error('Error updating team member role:', error);
      throw error;
    }
  }

  // Project Analytics
  async getProjectAnalytics(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const tasks = await Task.find({ project: projectId });
      const milestones = await Milestone.find({ project: projectId });

      // Calculate task statistics
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length,
        pending: tasks.filter(task => task.status === 'pending').length,
        overdue: tasks.filter(task => 
          task.dueDate && task.status !== 'completed' && new Date() > task.dueDate
        ).length
      };

      // Calculate milestone statistics
      const milestoneStats = {
        total: milestones.length,
        completed: milestones.filter(milestone => milestone.status === 'completed').length,
        inProgress: milestones.filter(milestone => milestone.status === 'in_progress').length,
        pending: milestones.filter(milestone => milestone.status === 'pending').length,
        overdue: milestones.filter(milestone => 
          milestone.dueDate && milestone.status !== 'completed' && new Date() > milestone.dueDate
        ).length
      };

      // Calculate progress percentages
      const taskProgress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
      const milestoneProgress = milestoneStats.total > 0 ? (milestoneStats.completed / milestoneStats.total) * 100 : 0;

      // Calculate budget utilization
      const budgetUtilization = project.budget && project.budget.total > 0 
        ? (project.budget.spent / project.budget.total) * 100 
        : 0;

      // Calculate timeline progress
      const timelineProgress = project.startDate && project.endDate
        ? Math.min(100, Math.max(0, 
            ((new Date() - project.startDate) / (project.endDate - project.startDate)) * 100
          ))
        : 0;

      return {
        project: {
          id: project._id,
          name: project.name,
          code: project.code,
          status: project.status
        },
        taskStats,
        milestoneStats,
        progress: {
          tasks: taskProgress,
          milestones: milestoneProgress,
          timeline: timelineProgress,
          budget: budgetUtilization
        },
        team: {
          totalMembers: project.team.members.length,
          lead: project.team.lead
        },
        timeline: {
          startDate: project.startDate,
          endDate: project.endDate,
          duration: project.startDate && project.endDate 
            ? Math.ceil((project.endDate - project.startDate) / (1000 * 60 * 60 * 24))
            : null
        },
        budget: project.budget
      };
    } catch (error) {
      logger.error('Error getting project analytics:', error);
      throw error;
    }
  }

  async getDashboardAnalytics() {
    try {
      const projects = await Project.find();
      const tasks = await Task.find();
      const milestones = await Milestone.find();

      // Overall statistics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const overdueProjects = projects.filter(p => 
        p.endDate && p.status !== 'completed' && new Date() > p.endDate
      ).length;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => 
        t.dueDate && t.status !== 'completed' && new Date() > t.dueDate
      ).length;

      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.status === 'completed').length;
      const overdueMilestones = milestones.filter(m => 
        m.dueDate && m.status !== 'completed' && new Date() > m.dueDate
      ).length;

      // Recent activity
      const recentProjects = await Project.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('client', 'name');

      const recentTasks = await Task.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('project', 'name code')
        .populate('assignedTo', 'name');

      // Performance metrics
      const avgProjectDuration = projects.length > 0 
        ? projects.reduce((sum, p) => {
            if (p.startDate && p.endDate) {
              return sum + (p.endDate - p.startDate) / (1000 * 60 * 60 * 24);
            }
            return sum;
          }, 0) / projects.filter(p => p.startDate && p.endDate).length
        : 0;

      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

      return {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          overdueProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          totalMilestones,
          completedMilestones,
          overdueMilestones
        },
        performance: {
          avgProjectDuration: Math.round(avgProjectDuration),
          taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
          milestoneCompletionRate: Math.round(milestoneCompletionRate * 100) / 100
        },
        recentActivity: {
          projects: recentProjects,
          tasks: recentTasks
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }

  // Project Workflow
  async startProject(projectId) {
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        { 
          status: 'active',
          'workflow.currentPhase': 'execution',
          'workflow.phaseHistory': {
            phase: 'execution',
            startDate: new Date(),
            status: 'started'
          }
        },
        { new: true }
      );

      logger.info(`Project started: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error starting project:', error);
      throw error;
    }
  }

  async pauseProject(projectId, reason) {
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        { 
          status: 'paused',
          'workflow.currentPhase': 'paused',
          'workflow.phaseHistory': {
            phase: 'paused',
            startDate: new Date(),
            status: 'paused',
            notes: reason
          }
        },
        { new: true }
      );

      logger.info(`Project paused: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error pausing project:', error);
      throw error;
    }
  }

  async completeProject(projectId) {
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        { 
          status: 'completed',
          'workflow.currentPhase': 'completed',
          'workflow.phaseHistory': {
            phase: 'completed',
            startDate: new Date(),
            status: 'completed'
          }
        },
        { new: true }
      );

      logger.info(`Project completed: ${project.code} - ${project.name}`);
      return project;
    } catch (error) {
      logger.error('Error completing project:', error);
      throw error;
    }
  }

  // Risk Management
  async addRisk(projectId, riskData) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      project.riskManagement.risks.push({
        ...riskData,
        id: Date.now().toString(),
        createdAt: new Date()
      });

      await project.save();
      logger.info(`Risk added to project ${projectId}: ${riskData.title}`);
      return project;
    } catch (error) {
      logger.error('Error adding risk:', error);
      throw error;
    }
  }

  async updateRisk(projectId, riskId, updateData) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const risk = project.riskManagement.risks.find(r => r.id === riskId);
      if (!risk) {
        throw new Error('Risk not found');
      }

      Object.assign(risk, updateData, { updatedAt: new Date() });
      await project.save();

      logger.info(`Risk updated in project ${projectId}: ${riskId}`);
      return project;
    } catch (error) {
      logger.error('Error updating risk:', error);
      throw error;
    }
  }

  async removeRisk(projectId, riskId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      project.riskManagement.risks = project.riskManagement.risks.filter(r => r.id !== riskId);
      await project.save();

      logger.info(`Risk removed from project ${projectId}: ${riskId}`);
      return project;
    } catch (error) {
      logger.error('Error removing risk:', error);
      throw error;
    }
  }
}

module.exports = new ProjectService();
