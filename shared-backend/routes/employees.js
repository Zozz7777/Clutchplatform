const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, department, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (department) filters.department = department;
        if (status) filters.status = status;

        const collection = await getCollection('employees');
        const employees = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EMPLOYEES_FAILED',
            message: 'Failed to retrieve employees'
        });
    }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('employees');
        const employee = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'EMPLOYEE_NOT_FOUND',
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EMPLOYEE_FAILED',
            message: 'Failed to retrieve employee'
        });
    }
});

// Create employee
router.post('/', authenticateToken, async (req, res) => {
    try {
        const employeeData = {
            ...req.body,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('employees');
        const result = await collection.insertOne(employeeData);
        
        employeeData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employeeData
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_EMPLOYEE_FAILED',
            message: 'Failed to create employee'
        });
    }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('employees');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'EMPLOYEE_NOT_FOUND',
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_EMPLOYEE_FAILED',
            message: 'Failed to update employee'
        });
    }
});

// Deactivate employee
router.post('/:id/deactivate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const collection = await getCollection('employees');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'inactive',
                    deactivatedAt: new Date(),
                    deactivationReason: reason,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'EMPLOYEE_NOT_FOUND',
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate employee error:', error);
        res.status(500).json({
            success: false,
            error: 'DEACTIVATE_EMPLOYEE_FAILED',
            message: 'Failed to deactivate employee'
        });
    }
});

module.exports = router;
