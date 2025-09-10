const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const { logger } = require('../config/logger');

class HRService {
  // Employee Management
  async createEmployee(employeeData) {
    try {
      // Transform flat structure to nested structure if needed
      const transformedData = this.transformEmployeeData(employeeData);
      
      const employee = new Employee(transformedData);
      await employee.save();
      
      // Update department employee count
      if (employee.employment.department) {
        await Department.findByIdAndUpdate(
          employee.employment.department,
          { $inc: { employeeCount: 1 } }
        );
      }
      
      logger.info(`Employee created: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error creating employee:', error);
      throw error;
    }
  }

  async getEmployeeById(employeeId) {
    try {
      const employee = await Employee.findById(employeeId)
        .populate('employment.department')
        .populate('employment.reportingTo')
        .populate('employment.directReports');
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return employee;
    } catch (error) {
      logger.error('Error getting employee:', error);
      throw error;
    }
  }

  async updateEmployee(employeeId, updateData) {
    try {
      // Transform flat structure to nested structure if needed
      const transformedData = this.transformEmployeeData(updateData);
      
      const employee = await Employee.findByIdAndUpdate(
        employeeId,
        { ...transformedData, 'metadata.updatedBy': updateData.updatedBy },
        { new: true, runValidators: true }
      );
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      logger.info(`Employee updated: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error updating employee:', error);
      throw error;
    }
  }

  // Helper method to transform flat data structure to nested structure
  transformEmployeeData(data) {
    const transformed = {};
    
    // Check if data is already in nested structure
    if (data.basicInfo || data.employment || data.compensation) {
      return data;
    }
    
    // Transform flat structure to nested structure
    if (data.firstName || data.lastName || data.email || data.phone) {
      transformed.basicInfo = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone
      };
    }
    
    if (data.department || data.position || data.hireDate || data.status) {
      transformed.employment = {
        department: data.department,
        position: data.position,
        hireDate: data.hireDate,
        status: data.status || 'active'
      };
    }
    
    if (data.salary) {
      transformed.compensation = {
        salary: data.salary
      };
    }
    
    // Copy other fields that don't need transformation
    if (data.roles) transformed.roles = data.roles;
    if (data.skills) transformed.skills = data.skills;
    if (data.emergencyContact) transformed.emergencyContact = data.emergencyContact;
    if (data.address) transformed.address = data.address;
    if (data.notes) transformed.notes = data.notes;
    
    return transformed;
  }

  async deleteEmployee(employeeId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      // Update department employee count
      if (employee.employment.department) {
        await Department.findByIdAndUpdate(
          employee.employment.department,
          { $inc: { employeeCount: -1 } }
        );
      }
      
      await Employee.findByIdAndDelete(employeeId);
      logger.info(`Employee deleted: ${employee.basicInfo.email}`);
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      logger.error('Error deleting employee:', error);
      throw error;
    }
  }

  async getEmployees(filters = {}, options = {}) {
    try {
      const query = {};
      
      if (filters.department) {
        query['employment.department'] = filters.department;
      }
      
      if (filters.status) {
        query['employment.status'] = filters.status;
      }
      
      if (filters.position) {
        query['employment.position'] = filters.position;
      }
      
      if (filters.search) {
        query.$or = [
          { 'basicInfo.firstName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.lastName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.email': { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      // Only return active employees by default
      if (!filters.status) {
        query['employment.status'] = 'active';
      }
      
      const employees = await Employee.find(query)
        .populate('employment.department')
        .populate('employment.manager')
        .sort(options.sort || { 'basicInfo.firstName': 1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0)
        .select('-password'); // Exclude password field
      
      return employees;
    } catch (error) {
      logger.error('Error getting employees:', error);
      throw error;
    }
  }

  async getEmployeeAnalytics() {
    try {
      const analytics = await Employee.aggregate([
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            activeEmployees: {
              $sum: { $cond: [{ $eq: ['$employment.status', 'active'] }, 1, 0] }
            },
            averageSalary: { $avg: '$compensation.baseSalary' },
            totalSalary: { $sum: '$compensation.baseSalary' },
            departments: { $addToSet: '$employment.department' }
          }
        }
      ]);
      
      const departmentStats = await Employee.aggregate([
        {
          $group: {
            _id: '$employment.department',
            count: { $sum: 1 },
            averageSalary: { $avg: '$compensation.baseSalary' }
          }
        }
      ]);
      
      return {
        overview: analytics[0] || {},
        departmentStats
      };
    } catch (error) {
      logger.error('Error getting employee analytics:', error);
      throw error;
    }
  }

  // Department Management
  async createDepartment(departmentData) {
    try {
      const department = new Department(departmentData);
      await department.save();
      
      logger.info(`Department created: ${department.name}`);
      return department;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw error;
    }
  }

  async getDepartmentById(departmentId) {
    try {
      const department = await Department.findById(departmentId)
        .populate('departmentHead')
        .populate('deputyHead');
      
      if (!department) {
        throw new Error('Department not found');
      }
      
      return department;
    } catch (error) {
      logger.error('Error getting department:', error);
      throw error;
    }
  }

  async getDepartments() {
    try {
      const departments = await Department.find({ status: 'active' })
        .populate('departmentHead')
        .populate('deputyHead')
        .sort({ name: 1 });
      
      return departments;
    } catch (error) {
      logger.error('Error getting departments:', error);
      throw error;
    }
  }

  // Recruitment Management
  async createJobPosting(jobData) {
    try {
      const jobPosting = new JobPosting(jobData);
      await jobPosting.save();
      
      logger.info(`Job posting created: ${jobPosting.title}`);
      return jobPosting;
    } catch (error) {
      logger.error('Error creating job posting:', error);
      throw error;
    }
  }

  async getJobPostings(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const jobPostings = await JobPosting.find(query)
        .populate('department')
        .populate('hiringManager')
        .sort({ publishedDate: -1 });
      
      return jobPostings;
    } catch (error) {
      logger.error('Error getting job postings:', error);
      throw error;
    }
  }

  async updateJobPostingStatus(jobId, status) {
    try {
      const jobPosting = await JobPosting.findByIdAndUpdate(
        jobId,
        { status },
        { new: true }
      );
      
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }
      
      logger.info(`Job posting status updated: ${jobPosting.title} - ${status}`);
      return jobPosting;
    } catch (error) {
      logger.error('Error updating job posting status:', error);
      throw error;
    }
  }

  // Candidate Management
  async createCandidate(candidateData) {
    try {
      const candidate = new Candidate(candidateData);
      await candidate.save();
      
      logger.info(`Candidate created: ${candidate.basicInfo.email}`);
      return candidate;
    } catch (error) {
      logger.error('Error creating candidate:', error);
      throw error;
    }
  }

  async getCandidates(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.stage) {
        query['pipeline.currentStage'] = filters.stage;
      }
      
      if (filters.source) {
        query['source.primary'] = filters.source;
      }
      
      if (filters.search) {
        query.$or = [
          { 'basicInfo.firstName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.lastName': { $regex: filters.search, $options: 'i' } },
          { 'basicInfo.email': { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      const candidates = await Candidate.find(query)
        .populate('pipeline.assignedTo')
        .sort({ 'analytics.lastActivity': -1 });
      
      return candidates;
    } catch (error) {
      logger.error('Error getting candidates:', error);
      throw error;
    }
  }

  async updateCandidateStage(candidateId, newStage, reason) {
    try {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      await candidate.updateStage(newStage, reason);
      
      logger.info(`Candidate stage updated: ${candidate.basicInfo.email} - ${newStage}`);
      return candidate;
    } catch (error) {
      logger.error('Error updating candidate stage:', error);
      throw error;
    }
  }

  // Performance Management
  async addPerformanceReview(employeeId, reviewData) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      await employee.addPerformanceReview(reviewData);
      
      logger.info(`Performance review added for: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error adding performance review:', error);
      throw error;
    }
  }

  async getPerformanceReviews(employeeId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return employee.performance.reviews;
    } catch (error) {
      logger.error('Error getting performance reviews:', error);
      throw error;
    }
  }

  // Leave Management
  async requestLeave(employeeId, leaveRequest) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      await employee.requestLeave(leaveRequest);
      
      logger.info(`Leave request submitted for: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error requesting leave:', error);
      throw error;
    }
  }

  async approveLeaveRequest(employeeId, leaveIndex, approvedBy) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      if (!employee.timeTracking.leaveRequests[leaveIndex]) {
        throw new Error('Leave request not found');
      }
      
      employee.timeTracking.leaveRequests[leaveIndex].status = 'approved';
      employee.timeTracking.leaveRequests[leaveIndex].approvedBy = approvedBy;
      employee.timeTracking.leaveRequests[leaveIndex].approvedDate = new Date();
      
      await employee.save();
      
      logger.info(`Leave request approved for: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error approving leave request:', error);
      throw error;
    }
  }

  // Time Tracking
  async addTimeEntry(employeeId, timeEntry) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      employee.timeTracking.timeEntries.push(timeEntry);
      await employee.save();
      
      logger.info(`Time entry added for: ${employee.basicInfo.email}`);
      return employee;
    } catch (error) {
      logger.error('Error adding time entry:', error);
      throw error;
    }
  }

  async getTimeEntries(employeeId, filters = {}) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      let entries = employee.timeTracking.timeEntries;
      
      if (filters.startDate) {
        entries = entries.filter(entry => entry.date >= new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        entries = entries.filter(entry => entry.date <= new Date(filters.endDate));
      }
      
      if (filters.status) {
        entries = entries.filter(entry => entry.status === filters.status);
      }
      
      return entries;
    } catch (error) {
      logger.error('Error getting time entries:', error);
      throw error;
    }
  }

  // HR Analytics
  async getHRDashboardData() {
    try {
      const [
        employeeStats,
        departmentStats,
        recruitmentStats,
        leaveStats
      ] = await Promise.all([
        this.getEmployeeAnalytics(),
        this.getDepartmentAnalytics(),
        this.getRecruitmentAnalytics(),
        this.getLeaveAnalytics()
      ]);
      
      return {
        employeeStats,
        departmentStats,
        recruitmentStats,
        leaveStats
      };
    } catch (error) {
      logger.error('Error getting HR dashboard data:', error);
      throw error;
    }
  }

  async getDepartmentAnalytics() {
    try {
      const stats = await Department.aggregate([
        {
          $group: {
            _id: null,
            totalDepartments: { $sum: 1 },
            averageEmployeeCount: { $avg: '$employeeCount' },
            totalBudget: { $sum: '$budget.annual' }
          }
        }
      ]);
      
      return stats[0] || {};
    } catch (error) {
      logger.error('Error getting department analytics:', error);
      throw error;
    }
  }

  async getRecruitmentAnalytics() {
    try {
      const stats = await JobPosting.aggregate([
        {
          $group: {
            _id: null,
            totalPostings: { $sum: 1 },
            activePostings: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            totalApplications: { $sum: '$applicationsReceived' }
          }
        }
      ]);
      
      const candidateStats = await Candidate.aggregate([
        {
          $group: {
            _id: '$pipeline.currentStage',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        jobStats: stats[0] || {},
        candidateStats
      };
    } catch (error) {
      logger.error('Error getting recruitment analytics:', error);
      throw error;
    }
  }

  async getLeaveAnalytics() {
    try {
      const stats = await Employee.aggregate([
        {
          $unwind: '$timeTracking.leaveRequests'
        },
        {
          $group: {
            _id: '$timeTracking.leaveRequests.status',
            count: { $sum: 1 },
            totalDays: {
              $sum: {
                $divide: [
                  { $subtract: ['$timeTracking.leaveRequests.endDate', '$timeTracking.leaveRequests.startDate'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        }
      ]);
      
      return stats;
    } catch (error) {
      logger.error('Error getting leave analytics:', error);
      throw error;
    }
  }
}

module.exports = new HRService();
