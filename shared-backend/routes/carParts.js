const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant'
  };
  next();
};

// Create new car part
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, category, brand, make, model, year, price, stock, description } = req.body;
    
    if (!name || !category || !brand) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, category, and brand are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newPart = {
      id: `part-${Date.now()}`,
      name,
      category,
      brand,
      make: make || 'Universal',
      model: model || 'All',
      year: year || 'All',
      price: price || 0,
      stock: stock || 0,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newPart,
      message: 'Car part created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating car part:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_PART_FAILED',
      message: 'Failed to create car part',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all car parts
router.get('/', simpleAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, make, model, year, inStock } = req.query;
    const skip = (page - 1) * limit;
    
    // Mock car parts data
    const carParts = [
      {
        id: 'part-1',
        name: 'Brake Pads',
        category: 'Brakes',
        brand: 'Brembo',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        partNumber: 'BP-001',
        price: 89.99,
        inStock: true,
        stockQuantity: 25,
        description: 'High-performance brake pads for Toyota Camry',
        createdAt: new Date().toISOString()
      },
      {
        id: 'part-2',
        name: 'Oil Filter',
        category: 'Engine',
        brand: 'Fram',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        partNumber: 'OF-002',
        price: 12.99,
        inStock: true,
        stockQuantity: 50,
        description: 'Premium oil filter for Honda Civic',
        createdAt: new Date().toISOString()
      },
      {
        id: 'part-3',
        name: 'Air Filter',
        category: 'Engine',
        brand: 'K&N',
        make: 'Ford',
        model: 'F-150',
        year: 2023,
        partNumber: 'AF-003',
        price: 45.99,
        inStock: false,
        stockQuantity: 0,
        description: 'High-flow air filter for Ford F-150',
        createdAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredParts = carParts;
    if (category) {
      filteredParts = filteredParts.filter(part => part.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (brand) {
      filteredParts = filteredParts.filter(part => part.brand.toLowerCase().includes(brand.toLowerCase()));
    }
    if (make) {
      filteredParts = filteredParts.filter(part => part.make.toLowerCase().includes(make.toLowerCase()));
    }
    if (model) {
      filteredParts = filteredParts.filter(part => part.model.toLowerCase().includes(model.toLowerCase()));
    }
    if (year) {
      filteredParts = filteredParts.filter(part => part.year === parseInt(year));
    }
    if (inStock !== undefined) {
      const stockFilter = inStock === 'true';
      filteredParts = filteredParts.filter(part => part.inStock === stockFilter);
    }

    // Apply pagination
    const total = filteredParts.length;
    const paginatedParts = filteredParts.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedParts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching car parts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car parts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get car part by ID
router.get('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock car part data
    const carPart = {
      id: id,
      name: `Car Part ${id}`,
      category: 'Engine',
      brand: 'Generic',
      make: 'Universal',
      model: 'Universal',
      year: 2022,
      partNumber: `PART-${id}`,
      price: Math.floor(Math.random() * 200) + 50,
      inStock: Math.random() > 0.3,
      stockQuantity: Math.floor(Math.random() * 100),
      description: `High-quality car part ${id}`,
      specifications: {
        material: 'Steel',
        weight: '2.5 lbs',
        dimensions: '10x8x4 inches'
      },
      compatibility: [
        { make: 'Toyota', model: 'Camry', year: '2020-2023' },
        { make: 'Honda', model: 'Civic', year: '2019-2022' }
      ],
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: carPart,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching car part:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car part',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new car part
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { name, category, brand, make, model, year, partNumber, price, stockQuantity, description } = req.body;
    
    if (!name || !category || !brand || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, category, brand, and price are required',
        timestamp: new Date().toISOString()
      });
    }

    const carPart = {
      id: `part-${Date.now()}`,
      name,
      category,
      brand,
      make: make || 'Universal',
      model: model || 'Universal',
      year: year || new Date().getFullYear(),
      partNumber: partNumber || `PART-${Date.now()}`,
      price: parseFloat(price),
      inStock: (stockQuantity || 0) > 0,
      stockQuantity: stockQuantity || 0,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Car part created successfully',
      data: carPart,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating car part:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create car part',
      timestamp: new Date().toISOString()
    });
  }
});

// Update car part
router.put('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, make, model, year, partNumber, price, stockQuantity, description } = req.body;
    
    const carPart = {
      id: id,
      name: name || `Car Part ${id}`,
      category: category || 'Engine',
      brand: brand || 'Generic',
      make: make || 'Universal',
      model: model || 'Universal',
      year: year || new Date().getFullYear(),
      partNumber: partNumber || `PART-${id}`,
      price: price ? parseFloat(price) : Math.floor(Math.random() * 200) + 50,
      inStock: (stockQuantity || 0) > 0,
      stockQuantity: stockQuantity || 0,
      description: description || `Updated car part ${id}`,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Car part updated successfully',
      data: carPart,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating car part:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update car part',
      timestamp: new Date().toISOString()
    });
  }
});

// Update car part stock
router.patch('/:id/stock', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    
    if (stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Stock quantity is required',
        timestamp: new Date().toISOString()
      });
    }

    const carPart = {
      id: id,
      stockQuantity: parseInt(stockQuantity),
      inStock: parseInt(stockQuantity) > 0,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Car part stock updated successfully',
      data: carPart,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating car part stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update car part stock',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete car part
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Car part ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting car part:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete car part',
      timestamp: new Date().toISOString()
    });
  }
});

// Search car parts
router.get('/search/query', simpleAuth, async (req, res) => {
  try {
    const { q, category, brand, make, model, year } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        timestamp: new Date().toISOString()
      });
    }

    // Mock search results
    const searchResults = [
      {
        id: 'search-1',
        name: `Search Result for "${q}"`,
        category: category || 'Engine',
        brand: brand || 'Generic',
        make: make || 'Universal',
        model: model || 'Universal',
        year: year || 2022,
        partNumber: `SR-${Date.now()}`,
        price: Math.floor(Math.random() * 200) + 50,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        description: `Search result matching "${q}"`,
        relevanceScore: Math.random()
      }
    ];
    
    res.json({
      success: true,
      data: searchResults,
      query: q,
      total: searchResults.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error searching car parts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search car parts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get car parts by category
router.get('/category/:category', simpleAuth, async (req, res) => {
  try {
    const { category } = req.params;
    
    const categoryParts = [
      {
        id: `cat-${category}-1`,
        name: `${category} Part 1`,
        category: category,
        brand: 'Generic',
        make: 'Universal',
        model: 'Universal',
        year: 2022,
        partNumber: `CAT-${category.toUpperCase()}-001`,
        price: Math.floor(Math.random() * 200) + 50,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        description: `High-quality ${category} part`,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: categoryParts,
      category: category,
      total: categoryParts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching car parts by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car parts by category',
      timestamp: new Date().toISOString()
    });
  }
});

// Get car parts by brand
router.get('/brand/:brand', simpleAuth, async (req, res) => {
  try {
    const { brand } = req.params;
    
    const brandParts = [
      {
        id: `brand-${brand}-1`,
        name: `${brand} Part 1`,
        category: 'Engine',
        brand: brand,
        make: 'Universal',
        model: 'Universal',
        year: 2022,
        partNumber: `BRAND-${brand.toUpperCase()}-001`,
        price: Math.floor(Math.random() * 200) + 50,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        description: `High-quality ${brand} part`,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: brandParts,
      brand: brand,
      total: brandParts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching car parts by brand:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car parts by brand',
      timestamp: new Date().toISOString()
    });
  }
});

// Get compatible car parts
router.get('/compatible/:make/:model/:year', simpleAuth, async (req, res) => {
  try {
    const { make, model, year } = req.params;
    
    const compatibleParts = [
      {
        id: `comp-${make}-${model}-${year}-1`,
        name: `Compatible Part for ${make} ${model} ${year}`,
        category: 'Engine',
        brand: 'Generic',
        make: make,
        model: model,
        year: parseInt(year),
        partNumber: `COMP-${make.toUpperCase()}-${model.toUpperCase()}-${year}`,
        price: Math.floor(Math.random() * 200) + 50,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        description: `Compatible part for ${make} ${model} ${year}`,
        compatibility: {
          make: make,
          model: model,
          year: parseInt(year)
        },
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: compatibleParts,
      compatibility: { make, model, year: parseInt(year) },
      total: compatibleParts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching compatible car parts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compatible car parts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get low stock car parts
router.get('/low-stock/list', simpleAuth, async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockParts = [
      {
        id: 'low-stock-1',
        name: 'Low Stock Part 1',
        category: 'Engine',
        brand: 'Generic',
        make: 'Universal',
        model: 'Universal',
        year: 2022,
        partNumber: 'LOW-001',
        price: 99.99,
        inStock: true,
        stockQuantity: 5,
        description: 'Part with low stock',
        alertLevel: 'low',
        createdAt: new Date().toISOString()
      },
      {
        id: 'low-stock-2',
        name: 'Low Stock Part 2',
        category: 'Brakes',
        brand: 'Generic',
        make: 'Universal',
        model: 'Universal',
        year: 2022,
        partNumber: 'LOW-002',
        price: 149.99,
        inStock: true,
        stockQuantity: 3,
        description: 'Another part with low stock',
        alertLevel: 'critical',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: lowStockParts,
      threshold: parseInt(threshold),
      total: lowStockParts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching low stock car parts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock car parts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get car parts statistics
router.get('/stats/overview', simpleAuth, async (req, res) => {
  try {
    const stats = {
      totalParts: 1250,
      totalCategories: 15,
      totalBrands: 45,
      inStockParts: 1100,
      outOfStockParts: 150,
      lowStockParts: 75,
      totalValue: 125000.00,
      averagePrice: 100.00,
      topCategories: [
        { category: 'Engine', count: 300, percentage: 24 },
        { category: 'Brakes', count: 250, percentage: 20 },
        { category: 'Suspension', count: 200, percentage: 16 },
        { category: 'Electrical', count: 180, percentage: 14.4 },
        { category: 'Body', count: 150, percentage: 12 }
      ],
      topBrands: [
        { brand: 'Generic', count: 200, percentage: 16 },
        { brand: 'Brembo', count: 150, percentage: 12 },
        { brand: 'Fram', count: 120, percentage: 9.6 },
        { brand: 'K&N', count: 100, percentage: 8 },
        { brand: 'Bosch', count: 90, percentage: 7.2 }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching car parts statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car parts statistics',
      timestamp: new Date().toISOString()
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;