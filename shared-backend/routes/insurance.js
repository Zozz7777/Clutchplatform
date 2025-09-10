const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { ObjectId } = require('mongodb');

// ==================== INSURANCE MANAGEMENT ====================

// Upload insurance policy
router.post('/policies/upload', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            vehicleId, 
            policyNumber, 
            insuranceCompany, 
            policyType, 
            startDate, 
            endDate, 
            premium, 
            coverage, 
            documentUrl 
        } = req.body;

        if (!vehicleId || !policyNumber || !insuranceCompany || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, policy number, insurance company, start date, and end date are required'
            });
        }

        // Verify vehicle ownership
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: new ObjectId(vehicleId), 
            userId 
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        const insuranceCollection = await getCollection('insurance_policies');
        
        // Check if policy already exists
        const existingPolicy = await insuranceCollection.findOne({
            vehicleId,
            policyNumber,
            isActive: true
        });

        if (existingPolicy) {
            return res.status(400).json({
                success: false,
                error: 'POLICY_ALREADY_EXISTS',
                message: 'Insurance policy already exists for this vehicle'
            });
        }

        const policy = {
            userId,
            vehicleId,
            policyNumber,
            insuranceCompany,
            policyType: policyType || 'comprehensive',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            premium: parseFloat(premium) || 0,
            coverage: coverage || {},
            documentUrl: documentUrl || '',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await insuranceCollection.insertOne(policy);
        policy._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Insurance policy uploaded successfully',
            data: policy
        });
    } catch (error) {
        logger.error('Upload insurance policy error:', error);
        res.status(500).json({
            success: false,
            error: 'UPLOAD_POLICY_ERROR',
            message: 'Failed to upload insurance policy'
        });
    }
});

// Get user's insurance policies
router.get('/policies', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId, status } = req.query;

        const filters = { userId };
        if (vehicleId) filters.vehicleId = new ObjectId(vehicleId);
        if (status) filters.status = status;

        const insuranceCollection = await getCollection('insurance_policies');
        const policies = await insuranceCollection.find(filters)
            .sort({ createdAt: -1 })
            .toArray();

        // Get vehicle information for each policy
        const vehiclesCollection = await getCollection('vehicles');
        const enrichedPolicies = await Promise.all(
            policies.map(async (policy) => {
                const vehicle = await vehiclesCollection.findOne({ _id: new ObjectId(policy.vehicleId) });
                return {
                    ...policy,
                    vehicle: vehicle ? {
                        id: vehicle._id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: enrichedPolicies
        });
    } catch (error) {
        logger.error('Get insurance policies error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_POLICIES_ERROR',
            message: 'Failed to retrieve insurance policies'
        });
    }
});

// Get specific insurance policy
router.get('/policies/:policyId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { policyId } = req.params;

        const insuranceCollection = await getCollection('insurance_policies');
        const policy = await insuranceCollection.findOne({
            _id: new ObjectId(policyId),
            userId
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'Insurance policy not found'
            });
        }

        // Get vehicle information
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ _id: new ObjectId(policy.vehicleId) });

        const enrichedPolicy = {
            ...policy,
            vehicle: vehicle ? {
                id: vehicle._id,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
                licensePlate: vehicle.licensePlate
            } : null
        };

        res.json({
            success: true,
            data: enrichedPolicy
        });
    } catch (error) {
        logger.error('Get insurance policy error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_POLICY_ERROR',
            message: 'Failed to retrieve insurance policy'
        });
    }
});

// Update insurance policy
router.put('/policies/:policyId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { policyId } = req.params;
        const updates = req.body;

        const insuranceCollection = await getCollection('insurance_policies');
        const policy = await insuranceCollection.findOne({
            _id: new ObjectId(policyId),
            userId
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'Insurance policy not found'
            });
        }

        updates.updatedAt = new Date();

        await insuranceCollection.updateOne(
            { _id: new ObjectId(policyId) },
            { $set: updates }
        );

        res.json({
            success: true,
            message: 'Insurance policy updated successfully'
        });
    } catch (error) {
        logger.error('Update insurance policy error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_POLICY_ERROR',
            message: 'Failed to update insurance policy'
        });
    }
});

// Delete insurance policy
router.delete('/policies/:policyId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { policyId } = req.params;

        const insuranceCollection = await getCollection('insurance_policies');
        const policy = await insuranceCollection.findOne({
            _id: new ObjectId(policyId),
            userId
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'Insurance policy not found'
            });
        }

        await insuranceCollection.updateOne(
            { _id: new ObjectId(policyId) },
            { 
                $set: { 
                    status: 'inactive',
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Insurance policy deleted successfully'
        });
    } catch (error) {
        logger.error('Delete insurance policy error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_POLICY_ERROR',
            message: 'Failed to delete insurance policy'
        });
    }
});

// ==================== INSURANCE CLAIMS ====================

// File insurance claim
router.post('/claims/file', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            policyId, 
            vehicleId, 
            incidentDate, 
            incidentType, 
            description, 
            estimatedDamage, 
            location, 
            witnesses, 
            photos 
        } = req.body;

        if (!policyId || !vehicleId || !incidentDate || !incidentType || !description) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Policy ID, vehicle ID, incident date, type, and description are required'
            });
        }

        // Verify policy ownership
        const insuranceCollection = await getCollection('insurance_policies');
        const policy = await insuranceCollection.findOne({
            _id: new ObjectId(policyId),
            userId,
            status: 'active'
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'Active insurance policy not found'
            });
        }

        const claimsCollection = await getCollection('insurance_claims');
        
        const claim = {
            userId,
            policyId: policy._id,
            vehicleId: new ObjectId(vehicleId),
            incidentDate: new Date(incidentDate),
            incidentType,
            description,
            estimatedDamage: parseFloat(estimatedDamage) || 0,
            location: location || '',
            witnesses: witnesses || [],
            photos: photos || [],
            status: 'pending',
            claimNumber: generateClaimNumber(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await claimsCollection.insertOne(claim);
        claim._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Insurance claim filed successfully',
            data: {
                claimId: claim._id,
                claimNumber: claim.claimNumber,
                status: claim.status
            }
        });
    } catch (error) {
        logger.error('File insurance claim error:', error);
        res.status(500).json({
            success: false,
            error: 'FILE_CLAIM_ERROR',
            message: 'Failed to file insurance claim'
        });
    }
});

// Get user's insurance claims
router.get('/claims', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filters = { userId };
        if (status) filters.status = status;

        const claimsCollection = await getCollection('insurance_claims');
        const [claims, total] = await Promise.all([
            claimsCollection.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            claimsCollection.countDocuments(filters)
        ]);

        // Get policy and vehicle information for each claim
        const [insuranceCollection, vehiclesCollection] = await Promise.all([
            getCollection('insurance_policies'),
            getCollection('vehicles')
        ]);

        const enrichedClaims = await Promise.all(
            claims.map(async (claim) => {
                const [policy, vehicle] = await Promise.all([
                    insuranceCollection.findOne({ _id: claim.policyId }),
                    vehiclesCollection.findOne({ _id: claim.vehicleId })
                ]);

                return {
                    ...claim,
                    policy: policy ? {
                        id: policy._id,
                        policyNumber: policy.policyNumber,
                        insuranceCompany: policy.insuranceCompany,
                        policyType: policy.policyType
                    } : null,
                    vehicle: vehicle ? {
                        id: vehicle._id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: enrichedClaims,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get insurance claims error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CLAIMS_ERROR',
            message: 'Failed to retrieve insurance claims'
        });
    }
});

// Get specific insurance claim
router.get('/claims/:claimId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { claimId } = req.params;

        const claimsCollection = await getCollection('insurance_claims');
        const claim = await claimsCollection.findOne({
            _id: new ObjectId(claimId),
            userId
        });

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'CLAIM_NOT_FOUND',
                message: 'Insurance claim not found'
            });
        }

        // Get policy and vehicle information
        const [insuranceCollection, vehiclesCollection] = await Promise.all([
            getCollection('insurance_policies'),
            getCollection('vehicles')
        ]);

        const [policy, vehicle] = await Promise.all([
            insuranceCollection.findOne({ _id: claim.policyId }),
            vehiclesCollection.findOne({ _id: claim.vehicleId })
        ]);

        const enrichedClaim = {
            ...claim,
            policy: policy ? {
                id: policy._id,
                policyNumber: policy.policyNumber,
                insuranceCompany: policy.insuranceCompany,
                policyType: policy.policyType,
                coverage: policy.coverage
            } : null,
            vehicle: vehicle ? {
                id: vehicle._id,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
                licensePlate: vehicle.licensePlate
            } : null
        };

        res.json({
            success: true,
            data: enrichedClaim
        });
    } catch (error) {
        logger.error('Get insurance claim error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CLAIM_ERROR',
            message: 'Failed to retrieve insurance claim'
        });
    }
});

// Update insurance claim
router.put('/claims/:claimId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { claimId } = req.params;
        const updates = req.body;

        const claimsCollection = await getCollection('insurance_claims');
        const claim = await claimsCollection.findOne({
            _id: new ObjectId(claimId),
            userId
        });

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'CLAIM_NOT_FOUND',
                message: 'Insurance claim not found'
            });
        }

        updates.updatedAt = new Date();

        await claimsCollection.updateOne(
            { _id: new ObjectId(claimId) },
            { $set: updates }
        );

        res.json({
            success: true,
            message: 'Insurance claim updated successfully'
        });
    } catch (error) {
        logger.error('Update insurance claim error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_CLAIM_ERROR',
            message: 'Failed to update insurance claim'
        });
    }
});

// ==================== WARRANTY MANAGEMENT ====================

// Get warranty information for vehicle
router.get('/warranty/information/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId } = req.params;

        // Verify vehicle ownership
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: new ObjectId(vehicleId), 
            userId 
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        const warrantyCollection = await getCollection('warranties');
        const warranties = await warrantyCollection.find({ vehicleId }).toArray();

        // Get warranty information based on vehicle details
        const warrantyInfo = await generateWarrantyInfo(vehicle, warranties);

        res.json({
            success: true,
            data: {
                vehicleId,
                warranties,
                warrantyInfo,
                coverage: warrantyInfo.coverage || {},
                remainingWarranty: warrantyInfo.remainingWarranty || 0
            }
        });
    } catch (error) {
        logger.error('Get warranty information error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_WARRANTY_INFO_ERROR',
            message: 'Failed to retrieve warranty information'
        });
    }
});

// File warranty claim
router.post('/warranty/claims/file', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            vehicleId, 
            warrantyId, 
            issueDescription, 
            component, 
            symptoms, 
            photos 
        } = req.body;

        if (!vehicleId || !issueDescription || !component) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Vehicle ID, issue description, and component are required'
            });
        }

        // Verify vehicle ownership
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: new ObjectId(vehicleId), 
            userId 
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        const warrantyClaimsCollection = await getCollection('warranty_claims');
        
        const claim = {
            userId,
            vehicleId: new ObjectId(vehicleId),
            warrantyId: warrantyId ? new ObjectId(warrantyId) : null,
            issueDescription,
            component,
            symptoms: symptoms || [],
            photos: photos || [],
            status: 'pending',
            claimNumber: generateWarrantyClaimNumber(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await warrantyClaimsCollection.insertOne(claim);
        claim._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Warranty claim filed successfully',
            data: {
                claimId: claim._id,
                claimNumber: claim.claimNumber,
                status: claim.status
            }
        });
    } catch (error) {
        logger.error('File warranty claim error:', error);
        res.status(500).json({
            success: false,
            error: 'FILE_WARRANTY_CLAIM_ERROR',
            message: 'Failed to file warranty claim'
        });
    }
});

// Get warranty claims
router.get('/warranty/claims', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filters = { userId };
        if (status) filters.status = status;

        const warrantyClaimsCollection = await getCollection('warranty_claims');
        const [claims, total] = await Promise.all([
            warrantyClaimsCollection.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            warrantyClaimsCollection.countDocuments(filters)
        ]);

        // Get vehicle information for each claim
        const vehiclesCollection = await getCollection('vehicles');
        const enrichedClaims = await Promise.all(
            claims.map(async (claim) => {
                const vehicle = await vehiclesCollection.findOne({ _id: claim.vehicleId });
                return {
                    ...claim,
                    vehicle: vehicle ? {
                        id: vehicle._id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: enrichedClaims,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get warranty claims error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_WARRANTY_CLAIMS_ERROR',
            message: 'Failed to retrieve warranty claims'
        });
    }
});

// Get warranty coverage analysis
router.get('/warranty/coverage/:vehicleId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { vehicleId } = req.params;

        // Verify vehicle ownership
        const vehiclesCollection = await getCollection('vehicles');
        const vehicle = await vehiclesCollection.findOne({ 
            _id: new ObjectId(vehicleId), 
            userId 
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'VEHICLE_NOT_FOUND',
                message: 'Vehicle not found'
            });
        }

        // Analyze warranty coverage
        const coverage = await analyzeWarrantyCoverage(vehicle);

        res.json({
            success: true,
            data: {
                vehicleId,
                coverage,
                recommendations: coverage.recommendations || [],
                coveragePercentage: coverage.coveragePercentage || 0
            }
        });
    } catch (error) {
        logger.error('Get warranty coverage error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_WARRANTY_COVERAGE_ERROR',
            message: 'Failed to get warranty coverage analysis'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function generateClaimNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLM-${timestamp}-${random}`;
}

function generateWarrantyClaimNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WCLM-${timestamp}-${random}`;
}

async function generateWarrantyInfo(vehicle, warranties) {
    // Generate warranty information based on vehicle details
    const warrantyInfo = {
        manufacturerWarranty: {
            basic: {
                years: 3,
                miles: 36000,
                remaining: Math.max(0, 3 - (new Date().getFullYear() - vehicle.year)),
                remainingMiles: Math.max(0, 36000 - (vehicle.mileage || 0))
            },
            powertrain: {
                years: 5,
                miles: 60000,
                remaining: Math.max(0, 5 - (new Date().getFullYear() - vehicle.year)),
                remainingMiles: Math.max(0, 60000 - (vehicle.mileage || 0))
            }
        },
        extendedWarranties: warranties.filter(w => w.type === 'extended'),
        coverage: {
            engine: true,
            transmission: true,
            electrical: true,
            suspension: false,
            brakes: false
        },
        remainingWarranty: Math.max(0, 3 - (new Date().getFullYear() - vehicle.year)) * 365
    };

    return warrantyInfo;
}

async function analyzeWarrantyCoverage(vehicle) {
    // Analyze warranty coverage for vehicle
    const coverage = {
        coveragePercentage: 75,
        coveredComponents: [
            'Engine',
            'Transmission',
            'Electrical System',
            'Fuel System'
        ],
        uncoveredComponents: [
            'Brakes',
            'Suspension',
            'Tires',
            'Exhaust System'
        ],
        recommendations: [
            'Consider extended warranty for older vehicle',
            'Review coverage for high-mileage components',
            'Check manufacturer recalls'
        ],
        estimatedValue: 2500
    };

    return coverage;
}

module.exports = router;
