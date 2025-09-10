// Mock API Server for testing Clutch Auto Parts System endpoints
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockData = {
    shops: {
        profile: {
            id: 'shop_001',
            name: 'متجر قطع الغيار المتقدم',
            name_en: 'Advanced Auto Parts Shop',
            address: 'شارع التحرير، القاهرة',
            phone: '+201234567890',
            email: 'shop@clutch.com',
            car_brands: ['Toyota', 'Honda', 'BMW', 'Mercedes'],
            location: {
                lat: 31.2001,
                lng: 29.9187
            },
            settings: {
                currency: 'EGP',
                language: 'ar',
                timezone: 'Africa/Cairo'
            }
        },
        stats: {
            total_inventory: 1250,
            total_customers: 450,
            total_sales: 12500.50,
            monthly_revenue: 3500.75,
            low_stock_items: 25,
            pending_orders: 8
        }
    },
    inventory: {
        items: [
            {
                id: 'item_001',
                name: 'فرامل أمامية',
                name_en: 'Front Brake Pads',
                part_number: 'BP001',
                category: 'Brakes',
                car_brand: 'Toyota',
                car_model: 'Camry',
                year: '2020',
                price: 150.00,
                cost: 100.00,
                stock_quantity: 25,
                min_stock: 5,
                supplier: 'Auto Parts Supplier',
                description: 'High quality brake pads for Toyota Camry 2020'
            },
            {
                id: 'item_002',
                name: 'فلتر زيت',
                name_en: 'Oil Filter',
                part_number: 'OF002',
                category: 'Engine',
                car_brand: 'Honda',
                car_model: 'Civic',
                year: '2019',
                price: 45.00,
                cost: 30.00,
                stock_quantity: 50,
                min_stock: 10,
                supplier: 'Engine Parts Co.',
                description: 'Premium oil filter for Honda Civic 2019'
            }
        ],
        alerts: [
            {
                item_id: 'item_003',
                item_name: 'Spark Plugs',
                current_stock: 3,
                min_stock: 5,
                urgency: 'high'
            }
        ]
    },
    sales: {
        transactions: [
            {
                id: 'sale_001',
                date: '2025-09-08T10:30:00Z',
                customer_id: 'cust_001',
                customer_name: 'أحمد محمد',
                items: [
                    {
                        item_id: 'item_001',
                        item_name: 'Front Brake Pads',
                        quantity: 2,
                        price: 150.00,
                        total: 300.00
                    }
                ],
                subtotal: 300.00,
                tax: 45.00,
                total: 345.00,
                payment_method: 'cash',
                status: 'completed'
            }
        ]
    },
    customers: [
        {
            id: 'cust_001',
            name: 'أحمد محمد',
            phone: '+201234567890',
            email: 'ahmed@email.com',
            address: 'شارع النيل، الجيزة',
            car_info: {
                brand: 'Toyota',
                model: 'Camry',
                year: '2020',
                plate_number: 'ABC-123'
            },
            total_purchases: 1250.00,
            last_visit: '2025-09-08T10:30:00Z'
        }
    ]
};

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: 'development',
            version: 'v1'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Clutch Platform API Server - Mock',
        version: 'v1',
        environment: 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        endpoints: {
            health: '/health',
            api: '/api/v1',
            docs: '/api-docs'
        },
        status: 'operational'
    });
});

// API v1 routes
app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        message: 'Clutch API v1 - Mock Server',
        endpoints: {
            auth: '/api/v1/auth/*',
            shops: '/api/v1/shops/*',
            inventory: '/api/v1/inventory/*',
            sales: '/api/v1/sales/*',
            customers: '/api/v1/customers/*',
            suppliers: '/api/v1/suppliers/*',
            ai: '/api/v1/ai/*',
            orders: '/api/v1/orders/*',
            market: '/api/v1/market/*',
            system: '/api/v1/system/*'
        }
    });
});

// Authentication endpoints
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'shop@clutch.com' && password === 'password') {
        res.json({
            success: true,
            data: {
                token: 'mock_jwt_token_12345',
                shop: mockData.shops.profile
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
        });
    }
});

app.post('/api/v1/auth/verify', (req, res) => {
    const { token } = req.body;
    
    if (token === 'mock_jwt_token_12345') {
        res.json({
            success: true,
            data: {
                valid: true,
                shop: mockData.shops.profile
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
        });
    }
});

// Shop endpoints
app.get('/api/v1/shops/profile', (req, res) => {
    res.json({
        success: true,
        data: mockData.shops.profile
    });
});

app.get('/api/v1/shops/stats', (req, res) => {
    res.json({
        success: true,
        data: mockData.shops.stats
    });
});

// Inventory endpoints
app.get('/api/v1/inventory/items', (req, res) => {
    const { page = 1, limit = 50, search, category, car_brand } = req.query;
    
    let items = mockData.inventory.items;
    
    // Apply filters
    if (search) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.name_en.toLowerCase().includes(search.toLowerCase()) ||
            item.part_number.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    if (category) {
        items = items.filter(item => item.category === category);
    }
    
    if (car_brand) {
        items = items.filter(item => item.car_brand === car_brand);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = items.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: {
            items: paginatedItems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: items.length,
                pages: Math.ceil(items.length / limit)
            }
        }
    });
});

app.get('/api/v1/inventory/alerts', (req, res) => {
    res.json({
        success: true,
        data: {
            alerts: mockData.inventory.alerts
        }
    });
});

app.get('/api/v1/inventory/recommendations', (req, res) => {
    res.json({
        success: true,
        data: {
            recommendations: [
                {
                    type: 'restock',
                    item_id: 'item_002',
                    item_name: 'Oil Filter',
                    reason: 'High demand predicted',
                    suggested_quantity: 50
                }
            ]
        }
    });
});

// Sales endpoints
app.get('/api/v1/sales/transactions', (req, res) => {
    res.json({
        success: true,
        data: {
            transactions: mockData.sales.transactions,
            pagination: {
                page: 1,
                limit: 50,
                total: mockData.sales.transactions.length,
                pages: 1
            }
        }
    });
});

app.get('/api/v1/sales/analytics', (req, res) => {
    res.json({
        success: true,
        data: {
            daily_sales: [
                { date: '2025-09-01', amount: 1250.00 },
                { date: '2025-09-02', amount: 1350.00 },
                { date: '2025-09-03', amount: 1100.00 }
            ],
            top_selling_items: [
                { item_id: 'item_001', name: 'Front Brake Pads', quantity_sold: 45 },
                { item_id: 'item_002', name: 'Oil Filter', quantity_sold: 38 }
            ],
            revenue_by_category: [
                { category: 'Brakes', revenue: 2500.00 },
                { category: 'Engine', revenue: 1800.00 }
            ]
        }
    });
});

// Customer endpoints
app.get('/api/v1/customers', (req, res) => {
    res.json({
        success: true,
        data: {
            customers: mockData.customers,
            pagination: {
                page: 1,
                limit: 50,
                total: mockData.customers.length,
                pages: 1
            }
        }
    });
});

app.get('/api/v1/customers/analytics', (req, res) => {
    res.json({
        success: true,
        data: {
            total_customers: 450,
            new_customers_this_month: 25,
            repeat_customers: 380,
            average_purchase_value: 125.50
        }
    });
});

// AI endpoints
app.get('/api/v1/ai/demand-forecast', (req, res) => {
    res.json({
        success: true,
        data: {
            forecasts: [
                {
                    item_id: 'item_001',
                    item_name: 'Front Brake Pads',
                    predicted_demand: 45,
                    confidence: 0.85,
                    timeframe: 'next_30_days'
                }
            ]
        }
    });
});

app.get('/api/v1/ai/price-optimization', (req, res) => {
    res.json({
        success: true,
        data: {
            suggestions: [
                {
                    item_id: 'item_001',
                    current_price: 150.00,
                    suggested_price: 165.00,
                    expected_increase: '10%',
                    reason: 'High demand, low competition'
                }
            ]
        }
    });
});

// System endpoints
app.get('/api/v1/system/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: 'v1'
        }
    });
});

app.get('/api/v1/system/ping', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'pong',
            timestamp: new Date().toISOString()
        }
    });
});

app.get('/api/v1/system/time', (req, res) => {
    res.json({
        success: true,
        data: {
            timestamp: new Date().toISOString(),
            timezone: 'UTC'
        }
    });
});

app.get('/api/v1/system/version', (req, res) => {
    res.json({
        success: true,
        data: {
            version: 'v1',
            build: '2025.09.08',
            environment: 'development'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
    console.log(`   - API v1: http://localhost:${PORT}/api/v1`);
    console.log(`   - Auth: http://localhost:${PORT}/api/v1/auth/*`);
    console.log(`   - Shops: http://localhost:${PORT}/api/v1/shops/*`);
    console.log(`   - Inventory: http://localhost:${PORT}/api/v1/inventory/*`);
    console.log(`   - Sales: http://localhost:${PORT}/api/v1/sales/*`);
    console.log(`   - Customers: http://localhost:${PORT}/api/v1/customers/*`);
    console.log(`   - AI: http://localhost:${PORT}/api/v1/ai/*`);
    console.log(`   - System: http://localhost:${PORT}/api/v1/system/*`);
    console.log(`\n🎯 Test credentials: shop@clutch.com / password`);
});
