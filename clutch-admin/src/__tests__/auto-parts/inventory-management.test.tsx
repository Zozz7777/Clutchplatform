import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../setup';
import { InventoryManagement } from '@/components/auto-parts/InventoryManagement';

// Mock data
const mockParts = [
  {
    id: '1',
    name: 'Brake Pad',
    partNumber: 'BP001',
    price: 50.00,
    stock: 100,
    category: 'Brakes',
    brand: 'ACME',
    status: 'active'
  },
  {
    id: '2',
    name: 'Oil Filter',
    partNumber: 'OF002',
    price: 15.00,
    stock: 50,
    category: 'Engine',
    brand: 'FilterPro',
    status: 'active'
  }
];

const mockCategories = [
  { id: '1', name: 'Brakes' },
  { id: '2', name: 'Engine' },
  { id: '3', name: 'Transmission' }
];

const mockBrands = [
  { id: '1', name: 'ACME' },
  { id: '2', name: 'FilterPro' },
  { id: '3', name: 'TransMax' }
];

describe('Auto Parts Inventory Management Tests', () => {
  beforeEach(() => {
    // Setup MSW handlers
    server.use(
      rest.get('/api/v1/auto-parts/inventory', (req, res, ctx) => {
        return res(ctx.json({ parts: mockParts, total: mockParts.length }));
      }),
      rest.get('/api/v1/auto-parts/categories', (req, res, ctx) => {
        return res(ctx.json({ categories: mockCategories }));
      }),
      rest.get('/api/v1/auto-parts/brands', (req, res, ctx) => {
        return res(ctx.json({ brands: mockBrands }));
      })
    );
  });

  test('should display inventory list correctly', async () => {
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
      expect(screen.getByText('Oil Filter')).toBeInTheDocument();
    });
    
    // Verify part details are displayed
    expect(screen.getByText('BP001')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
  });

  test('should add new part successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful part creation
    server.use(
      rest.post('/api/v1/auto-parts/inventory', (req, res, ctx) => {
        return res(ctx.json({ 
          success: true, 
          part: { 
            id: '3', 
            name: 'Air Filter', 
            partNumber: 'AF003',
            price: 25.00,
            stock: 75,
            category: 'Engine',
            brand: 'AirMax',
            status: 'active'
          } 
        }));
      })
    );
    
    render(<InventoryManagement />);
    
    // Click add part button
    await user.click(screen.getByTestId('add-part-button'));
    
    // Fill form
    await user.type(screen.getByTestId('part-name-input'), 'Air Filter');
    await user.type(screen.getByTestId('part-number-input'), 'AF003');
    await user.type(screen.getByTestId('part-price-input'), '25.00');
    await user.type(screen.getByTestId('part-stock-input'), '75');
    await user.selectOptions(screen.getByTestId('part-category-select'), 'Engine');
    await user.selectOptions(screen.getByTestId('part-brand-select'), 'AirMax');
    
    // Submit form
    await user.click(screen.getByTestId('submit-part-button'));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Part added successfully')).toBeInTheDocument();
    });
  });

  test('should update part stock correctly', async () => {
    const user = userEvent.setup();
    
    // Mock successful stock update
    server.use(
      rest.put('/api/v1/auto-parts/inventory/:id/stock', (req, res, ctx) => {
        return res(ctx.json({ 
          success: true, 
          part: { 
            ...mockParts[0], 
            stock: 150 
          } 
        }));
      })
    );
    
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
    });
    
    // Click edit stock button for first part
    const editStockButton = screen.getAllByTestId('edit-stock-button')[0];
    await user.click(editStockButton);
    
    // Update stock value
    const stockInput = screen.getByTestId('stock-input');
    await user.clear(stockInput);
    await user.type(stockInput, '150');
    
    // Submit update
    await user.click(screen.getByTestId('update-stock-button'));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Stock updated successfully')).toBeInTheDocument();
    });
  });

  test('should search parts by name', async () => {
    const user = userEvent.setup();
    
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
    });
    
    // Search for brake pad
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Brake');
    
    // Verify only brake pad is shown
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
      expect(screen.queryByText('Oil Filter')).not.toBeInTheDocument();
    });
  });

  test('should filter parts by category', async () => {
    const user = userEvent.setup();
    
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
    });
    
    // Filter by Engine category
    const categoryFilter = screen.getByTestId('category-filter');
    await user.selectOptions(categoryFilter, 'Engine');
    
    // Verify only engine parts are shown
    await waitFor(() => {
      expect(screen.getByText('Oil Filter')).toBeInTheDocument();
      expect(screen.queryByText('Brake Pad')).not.toBeInTheDocument();
    });
  });

  test('should handle low stock alerts', async () => {
    // Mock parts with low stock
    const lowStockParts = [
      {
        ...mockParts[0],
        stock: 5, // Low stock
        minStock: 10
      },
      {
        ...mockParts[1],
        stock: 2, // Very low stock
        minStock: 5
      }
    ];
    
    server.use(
      rest.get('/api/v1/auto-parts/inventory', (req, res, ctx) => {
        return res(ctx.json({ parts: lowStockParts, total: lowStockParts.length }));
      })
    );
    
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
    });
    
    // Verify low stock alerts are displayed
    expect(screen.getByTestId('low-stock-alert')).toBeInTheDocument();
    expect(screen.getByText('2 parts have low stock')).toBeInTheDocument();
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.get('/api/v1/auto-parts/inventory', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
      })
    );
    
    render(<InventoryManagement />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load inventory')).toBeInTheDocument();
    });
    
    // Verify retry button is available
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  test('should validate form inputs correctly', async () => {
    const user = userEvent.setup();
    
    render(<InventoryManagement />);
    
    // Click add part button
    await user.click(screen.getByTestId('add-part-button'));
    
    // Try to submit empty form
    await user.click(screen.getByTestId('submit-part-button'));
    
    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText('Part name is required')).toBeInTheDocument();
      expect(screen.getByText('Part number is required')).toBeInTheDocument();
      expect(screen.getByText('Price is required')).toBeInTheDocument();
      expect(screen.getByText('Stock quantity is required')).toBeInTheDocument();
    });
  });

  test('should handle bulk operations', async () => {
    const user = userEvent.setup();
    
    // Mock successful bulk update
    server.use(
      rest.put('/api/v1/auto-parts/inventory/bulk', (req, res, ctx) => {
        return res(ctx.json({ 
          success: true, 
          updated: 2,
          message: 'Bulk update completed successfully'
        }));
      })
    );
    
    render(<InventoryManagement />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Brake Pad')).toBeInTheDocument();
    });
    
    // Select multiple parts
    const checkboxes = screen.getAllByTestId('part-checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    
    // Click bulk update button
    await user.click(screen.getByTestId('bulk-update-button'));
    
    // Select bulk action
    await user.selectOptions(screen.getByTestId('bulk-action-select'), 'update-price');
    
    // Set new price
    await user.type(screen.getByTestId('bulk-price-input'), '55.00');
    
    // Submit bulk update
    await user.click(screen.getByTestId('submit-bulk-update-button'));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Bulk update completed successfully')).toBeInTheDocument();
    });
  });
});
