const express = require('express');
const router = express.Router();
const logger = require('../services/logger');

// GET /api/v1/docs/endpoints - Get all API endpoints
router.get('/endpoints', async (req, res) => {
  try {
    const endpoints = [
      {
        _id: "1",
        path: "/api/v1/auth/login",
        method: "POST",
        description: "Authenticate user and return access token",
        category: "Authentication",
        version: "v1",
        authentication: "none",
        parameters: {
          body: {
            email: { type: "string", required: true, description: "User email address" },
            password: { type: "string", required: true, description: "User password" },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            schema: {
              success: true,
              data: {
                user: { id: "string", email: "string", role: "string" },
                token: "string",
              },
            },
          },
          "401": {
            description: "Invalid credentials",
          },
        },
        examples: {
          request: `{
  "email": "user@example.com",
  "password": "password123"
}`,
          response: `{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`,
        },
        rateLimit: 100,
        tags: ["auth", "login"],
      },
      {
        _id: "2",
        path: "/api/v1/users",
        method: "GET",
        description: "Get all users with pagination and filtering",
        category: "User Management",
        version: "v1",
        authentication: "bearer",
        parameters: {
          query: {
            page: { type: "number", required: false, description: "Page number" },
            limit: { type: "number", required: false, description: "Items per page" },
            role: { type: "string", required: false, description: "Filter by user role" },
          },
        },
        responses: {
          "200": {
            description: "Users retrieved successfully",
            schema: {
              success: true,
              data: {
                users: [{ id: "string", email: "string", role: "string" }],
                pagination: { page: "number", limit: "number", total: "number" },
              },
            },
          },
        },
        examples: {
          request: "GET /api/v1/users?page=1&limit=10&role=admin",
          response: `{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123",
        "email": "admin@example.com",
        "role": "admin"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}`,
        },
        rateLimit: 1000,
        tags: ["users", "management"],
      },
      {
        _id: "3",
        path: "/api/v1/fleet/vehicles",
        method: "GET",
        description: "Get all fleet vehicles with status and location",
        category: "Fleet Management",
        version: "v1",
        authentication: "bearer",
        parameters: {
          query: {
            status: { type: "string", required: false, description: "Filter by vehicle status" },
            location: { type: "string", required: false, description: "Filter by location" },
          },
        },
        responses: {
          "200": {
            description: "Vehicles retrieved successfully",
            schema: {
              success: true,
              data: {
                vehicles: [{ id: "string", plate: "string", status: "string", location: "string" }],
              },
            },
          },
        },
        examples: {
          request: "GET /api/v1/fleet/vehicles?status=active",
          response: `{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "123",
        "plate": "ABC-123",
        "status": "active",
        "location": "Downtown"
      }
    ]
  }
}`,
        },
        rateLimit: 500,
        tags: ["fleet", "vehicles"],
      },
      {
        _id: "4",
        path: "/api/v1/payments",
        method: "GET",
        description: "Get payment transactions with filtering",
        category: "Payments",
        version: "v1",
        authentication: "bearer",
        parameters: {
          query: {
            status: { type: "string", required: false, description: "Filter by payment status" },
            dateFrom: { type: "string", required: false, description: "Start date (ISO format)" },
            dateTo: { type: "string", required: false, description: "End date (ISO format)" },
          },
        },
        responses: {
          "200": {
            description: "Payments retrieved successfully",
            schema: {
              success: true,
              data: {
                payments: [{ id: "string", amount: "number", status: "string", date: "string" }],
              },
            },
          },
        },
        examples: {
          request: "GET /api/v1/payments?status=completed&dateFrom=2024-01-01",
          response: `{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "123",
        "amount": 25.50,
        "status": "completed",
        "date": "2024-01-15T10:30:00Z"
      }
    ]
  }
}`,
        },
        rateLimit: 1000,
        tags: ["payments", "transactions"],
      },
      {
        _id: "5",
        path: "/api/v1/analytics/dashboard",
        method: "GET",
        description: "Get dashboard analytics and KPIs",
        category: "Analytics",
        version: "v1",
        authentication: "bearer",
        parameters: {},
        responses: {
          "200": {
            description: "Analytics retrieved successfully",
            schema: {
              success: true,
              data: {
                kpis: { totalUsers: "number", totalRevenue: "number", activeVehicles: "number" },
                charts: { revenue: "array", users: "array" },
              },
            },
          },
        },
        examples: {
          request: "GET /api/v1/analytics/dashboard",
          response: `{
  "success": true,
  "data": {
    "kpis": {
      "totalUsers": 1250,
      "totalRevenue": 125000,
      "activeVehicles": 45
    },
    "charts": {
      "revenue": [1000, 1200, 1100, 1300],
      "users": [100, 120, 110, 130]
    }
  }
}`,
        },
        rateLimit: 100,
        tags: ["analytics", "dashboard"],
      },
    ];

    res.json({
      success: true,
      data: endpoints,
      message: 'API endpoints retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get API endpoints error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_API_ENDPOINTS_FAILED',
      message: 'Failed to get API endpoints',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/docs/categories - Get API categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        _id: "1",
        name: "Authentication",
        description: "User authentication and authorization endpoints",
        icon: "Key",
        color: "blue",
        endpointCount: 5,
      },
      {
        _id: "2",
        name: "User Management",
        description: "User CRUD operations and management",
        icon: "Users",
        color: "green",
        endpointCount: 8,
      },
      {
        _id: "3",
        name: "Fleet Management",
        description: "Vehicle and fleet operations",
        icon: "Truck",
        color: "orange",
        endpointCount: 12,
      },
      {
        _id: "4",
        name: "Payments",
        description: "Payment processing and transactions",
        icon: "DollarSign",
        color: "green",
        endpointCount: 6,
      },
      {
        _id: "5",
        name: "Analytics",
        description: "Data analytics and reporting",
        icon: "BarChart3",
        color: "purple",
        endpointCount: 10,
      },
      {
        _id: "6",
        name: "Communication",
        description: "Chat, notifications, and messaging",
        icon: "MessageSquare",
        color: "blue",
        endpointCount: 7,
      },
      {
        _id: "7",
        name: "Security",
        description: "Security events and monitoring",
        icon: "Shield",
        color: "red",
        endpointCount: 4,
      },
      {
        _id: "8",
        name: "System",
        description: "System health and monitoring",
        icon: "Activity",
        color: "gray",
        endpointCount: 3,
      },
    ];

    res.json({
      success: true,
      data: categories,
      message: 'API categories retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Get API categories error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_API_CATEGORIES_FAILED',
      message: 'Failed to get API categories',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
