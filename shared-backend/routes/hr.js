/**
 * HR Management Routes
 * Complete HR system with employee management, payroll, and recruitment
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const { ObjectId } = require('mongodb');

// Apply rate limiting
const hrRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 100 });

// ==================== EMPLOYEE MANAGEMENT ====================

// GET /api/v1/hr/employees - Get all employees
router.get('/employees', authenticateToken, checkRole(['head_administrator', 'platform_admin', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, department, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    const employeesCollection = await getCollection('employees');
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const employees = await employeesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await employeesCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Employees retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEES_FAILED',
      message: 'Failed to retrieve employees',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/hr/employees/:id - Get employee by ID
router.get('/employees/:id', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const employeesCollection = await getCollection('employees');
    
    const employee = await employeesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { employee },
      message: 'Employee retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_FAILED',
      message: 'Failed to retrieve employee',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/hr/employees - Create new employee
router.post('/employees', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      hireDate,
      managerId,
      address,
      emergencyContact
    } = req.body;
    
    if (!firstName || !lastName || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'First name, last name, email, department, and position are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const employeesCollection = await getCollection('employees');
    
    // Check if employee already exists
    const existingEmployee = await employeesCollection.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        error: 'EMPLOYEE_EXISTS',
        message: 'Employee with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate employee ID
    const employeeCount = await employeesCollection.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`;
    
    const newEmployee = {
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      department,
      position,
      salary: salary || null,
      hireDate: hireDate || new Date(),
      managerId: managerId || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await employeesCollection.insertOne(newEmployee);
    
    res.status(201).json({
      success: true,
      data: { employee: { ...newEmployee, _id: result.insertedId } },
      message: 'Employee created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_EMPLOYEE_FAILED',
      message: 'Failed to create employee',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/hr/employees/:id - Update employee
router.put('/employees/:id', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const employeesCollection = await getCollection('employees');
    
    const result = await employeesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const updatedEmployee = await employeesCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: { employee: updatedEmployee },
      message: 'Employee updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_EMPLOYEE_FAILED',
      message: 'Failed to update employee',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/hr/employees/:id - Delete employee
router.delete('/employees/:id', authenticateToken, checkRole(['head_administrator']), hrRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const employeesCollection = await getCollection('employees');
    
    const result = await employeesCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: { id },
      message: 'Employee deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_EMPLOYEE_FAILED',
      message: 'Failed to delete employee',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PAYROLL MANAGEMENT ====================

// GET /api/v1/hr/payroll - Get payroll data
router.get('/payroll', authenticateToken, checkRole(['head_administrator', 'hr_manager', 'finance_officer']), hrRateLimit, async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    const payrollCollection = await getCollection('payroll');
    
    // Build query
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    
    const payroll = await payrollCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate totals
    const totals = payroll.reduce((acc, record) => {
      acc.totalGross += record.grossSalary || 0;
      acc.totalDeductions += record.totalDeductions || 0;
      acc.totalNet += record.netSalary || 0;
      return acc;
    }, { totalGross: 0, totalDeductions: 0, totalNet: 0 });
    
    res.json({
      success: true,
      data: {
        payroll,
        totals,
        summary: {
          totalRecords: payroll.length,
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear()
        }
      },
      message: 'Payroll data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PAYROLL_FAILED',
      message: 'Failed to retrieve payroll data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/hr/payroll - Process payroll
router.post('/payroll', authenticateToken, checkRole(['head_administrator', 'hr_manager', 'finance_officer']), hrRateLimit, async (req, res) => {
  try {
    const { month, year, employeeIds } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Month and year are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const employeesCollection = await getCollection('employees');
    const payrollCollection = await getCollection('payroll');
    
    // Get employees to process
    const query = employeeIds ? { _id: { $in: employeeIds.map(id => new ObjectId(id)) } } : { status: 'active' };
    const employees = await employeesCollection.find(query).toArray();
    
    const payrollRecords = [];
    
    for (const employee of employees) {
      // Calculate payroll (simplified calculation)
      const grossSalary = employee.salary || 0;
      const taxRate = 0.2; // 20% tax
      const insuranceRate = 0.1; // 10% insurance
      
      const tax = grossSalary * taxRate;
      const insurance = grossSalary * insuranceRate;
      const totalDeductions = tax + insurance;
      const netSalary = grossSalary - totalDeductions;
      
      const payrollRecord = {
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        month: parseInt(month),
        year: parseInt(year),
        grossSalary,
        tax,
        insurance,
        totalDeductions,
        netSalary,
        status: 'pending',
        processedAt: new Date(),
        createdAt: new Date()
      };
      
      payrollRecords.push(payrollRecord);
    }
    
    // Insert payroll records
    const result = await payrollCollection.insertMany(payrollRecords);
    
    res.status(201).json({
      success: true,
      data: {
        payrollRecords: payrollRecords.map((record, index) => ({
          ...record,
          _id: result.insertedIds[index]
        })),
        summary: {
          totalRecords: payrollRecords.length,
          totalGross: payrollRecords.reduce((sum, r) => sum + r.grossSalary, 0),
          totalNet: payrollRecords.reduce((sum, r) => sum + r.netSalary, 0)
        }
      },
      message: 'Payroll processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'PROCESS_PAYROLL_FAILED',
      message: 'Failed to process payroll',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== RECRUITMENT MANAGEMENT ====================

// GET /api/v1/hr/recruitment - Get recruitment data
router.get('/recruitment', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { status, position, department } = req.query;
    const recruitmentCollection = await getCollection('recruitment');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (position) query.position = position;
    if (department) query.department = department;
    
    const candidates = await recruitmentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate statistics
    const stats = {
      total: candidates.length,
      applied: candidates.filter(c => c.status === 'applied').length,
      screening: candidates.filter(c => c.status === 'screening').length,
      interviewed: candidates.filter(c => c.status === 'interviewed').length,
      offered: candidates.filter(c => c.status === 'offered').length,
      hired: candidates.filter(c => c.status === 'hired').length,
      rejected: candidates.filter(c => c.status === 'rejected').length
    };
    
    res.json({
      success: true,
      data: {
        candidates,
        statistics: stats
      },
      message: 'Recruitment data retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get recruitment error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_RECRUITMENT_FAILED',
      message: 'Failed to retrieve recruitment data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/hr/recruitment - Add new candidate
router.post('/recruitment', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      experience,
      skills,
      resume,
      coverLetter
    } = req.body;
    
    if (!firstName || !lastName || !email || !position || !department) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'First name, last name, email, position, and department are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const recruitmentCollection = await getCollection('recruitment');
    
    // Check if candidate already exists
    const existingCandidate = await recruitmentCollection.findOne({ email: email.toLowerCase() });
    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        error: 'CANDIDATE_EXISTS',
        message: 'Candidate with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    const newCandidate = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      position,
      department,
      experience: experience || null,
      skills: skills || [],
      resume: resume || null,
      coverLetter: coverLetter || null,
      status: 'applied',
      appliedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await recruitmentCollection.insertOne(newCandidate);
    
    res.status(201).json({
      success: true,
      data: { candidate: { ...newCandidate, _id: result.insertedId } },
      message: 'Candidate added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'ADD_CANDIDATE_FAILED',
      message: 'Failed to add candidate',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== HR ANALYTICS ====================

// GET /api/v1/hr/analytics - Get HR analytics
router.get('/analytics', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const employeesCollection = await getCollection('employees');
    const payrollCollection = await getCollection('payroll');
    const recruitmentCollection = await getCollection('recruitment');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));
    
    // Employee statistics
    const totalEmployees = await employeesCollection.countDocuments();
    const activeEmployees = await employeesCollection.countDocuments({ status: 'active' });
    const newHires = await employeesCollection.countDocuments({
      hireDate: { $gte: startDate, $lte: endDate }
    });
    
    // Department distribution
    const departmentStats = await employeesCollection.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Payroll statistics
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyPayroll = await payrollCollection.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, totalGross: { $sum: '$grossSalary' }, totalNet: { $sum: '$netSalary' } } }
    ]).toArray();
    
    // Recruitment statistics
    const recruitmentStats = await recruitmentCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    const analytics = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newHires,
        departmentDistribution: departmentStats
      },
      payroll: {
        monthlyTotal: monthlyPayroll[0] || { totalGross: 0, totalNet: 0 },
        month: currentMonth,
        year: currentYear
      },
      recruitment: {
        statusDistribution: recruitmentStats
      },
      period,
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'HR analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get HR analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HR_ANALYTICS_FAILED',
      message: 'Failed to retrieve HR analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== JOB APPLICATIONS ====================

// GET /api/v1/hr/applications - Get job applications
router.get('/applications', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const { status, position, department } = req.query;
    const applicationsCollection = await getCollection('job_applications');
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (position) query.position = position;
    if (department) query.department = department;
    
    const applications = await applicationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: { applications },
      message: 'Job applications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_APPLICATIONS_FAILED',
      message: 'Failed to retrieve job applications',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== HR STATISTICS ====================

// GET /api/v1/hr/stats - Get HR statistics
router.get('/stats', authenticateToken, checkRole(['head_administrator', 'hr_manager']), hrRateLimit, async (req, res) => {
  try {
    const employeesCollection = await getCollection('employees');
    const applicationsCollection = await getCollection('job_applications');
    const recruitmentCollection = await getCollection('recruitment');
    
    // Get employee statistics
    const totalEmployees = await employeesCollection.countDocuments();
    const activeEmployees = await employeesCollection.countDocuments({ status: 'active' });
    const newHires = await employeesCollection.countDocuments({
      hireDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Get application statistics
    const totalApplications = await applicationsCollection.countDocuments();
    const pendingApplications = await applicationsCollection.countDocuments({ status: 'pending' });
    const reviewedApplications = await applicationsCollection.countDocuments({ status: 'reviewed' });
    
    // Get recruitment statistics
    const totalCandidates = await recruitmentCollection.countDocuments();
    const hiredCandidates = await recruitmentCollection.countDocuments({ status: 'hired' });
    
    const stats = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newHires
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        reviewed: reviewedApplications
      },
      recruitment: {
        total: totalCandidates,
        hired: hiredCandidates
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: { stats },
      message: 'HR statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get HR stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_HR_STATS_FAILED',
      message: 'Failed to retrieve HR statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/hr - Get HR overview
router.get('/', authenticateToken, checkRole(['head_administrator', 'platform_admin', 'hr_manager']), hrRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'HR Management API is running',
    endpoints: {
      employees: '/api/v1/hr/employees',
      payroll: '/api/v1/hr/payroll',
      recruitment: '/api/v1/hr/recruitment',
      applications: '/api/v1/hr/applications',
      stats: '/api/v1/hr/stats',
      analytics: '/api/v1/hr/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
