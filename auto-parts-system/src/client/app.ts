// src/client/app.ts
import { i18nManager } from './i18n';

// Import components (these would be React components in a real app)
// For now, we'll create simple HTML-based components

class ClutchApp {
  private currentView: string = 'dashboard';
  private isDarkMode: boolean = false;
  private isRTL: boolean = false;
  private currentUser: any = null;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize i18n
      await i18nManager.initialize();
      
      // Set initial language and direction
      this.isRTL = i18nManager.isRTL();
      this.updateDirection();
      
      // Load design tokens
      await this.loadDesignTokens();
      
      // Render the app
      this.render();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('Clutch Auto Parts App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  private async loadDesignTokens(): Promise<void> {
    try {
      const response = await fetch('/src/assets/design.json');
      const designTokens = await response.json();
      
      // Apply design tokens to CSS custom properties
      this.applyDesignTokens(designTokens);
    } catch (error) {
      console.error('Failed to load design tokens:', error);
    }
  }

  private applyDesignTokens(designTokens: any): void {
    const root = document.documentElement;
    const theme = this.isDarkMode ? designTokens.theme.dark : designTokens.theme.light;
    
    // Apply color tokens
    Object.entries(theme.colors).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--${key}`, value.value);
    });
    
    // Apply shadow tokens
    Object.entries(theme.shadows).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply typography tokens
    root.style.setProperty('--font-sans', designTokens.typography['font-sans']);
    root.style.setProperty('--font-serif', designTokens.typography['font-serif']);
    root.style.setProperty('--font-mono', designTokens.typography['font-mono']);
    
    Object.entries(designTokens.typography.sizes).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(designTokens.typography.weights).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    Object.entries(designTokens.typography.lineHeights).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--line-height-${key}`, value);
    });
    
    // Apply spacing tokens
    root.style.setProperty('--spacing-base', designTokens.spacing.base);
    
    // Apply border tokens
    root.style.setProperty('--border-radius', designTokens.borders.radius);
    
    // Apply z-index tokens
    Object.entries(designTokens.zIndex).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--z-index-${key}`, value.toString());
    });
    
    // Apply motion tokens
    Object.entries(designTokens.motion.duration).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--motion-duration-${key}`, value);
    });
    
    Object.entries(designTokens.motion.easing).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--motion-easing-${key}`, value);
    });
    
    // Apply density tokens
    Object.entries(designTokens.density.comfortable).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--density-comfortable-${key}`, value);
    });
    
    Object.entries(designTokens.density.compact).forEach(([key, value]: [string, any]) => {
      root.style.setProperty(`--density-compact-${key}`, value);
    });
  }

  private render(): void {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('App div not found!');
      return;
    }

    appDiv.innerHTML = `
      <div class="app-container">
        <div class="sidebar">
          <div class="sidebar-header">
            <h2>Clutch</h2>
            <div class="theme-toggle">
              <button id="theme-toggle" class="theme-btn">🌙</button>
            </div>
          </div>
          <nav class="sidebar-nav">
            <div class="nav-item active" data-view="dashboard">
              <span class="nav-icon">📊</span>
              <span class="nav-text">${i18nManager.t('dashboard')}</span>
            </div>
            <div class="nav-item" data-view="inventory">
              <span class="nav-icon">📦</span>
              <span class="nav-text">${i18nManager.t('inventory')}</span>
            </div>
            <div class="nav-item" data-view="sales">
              <span class="nav-icon">💰</span>
              <span class="nav-text">${i18nManager.t('sales')}</span>
            </div>
            <div class="nav-item" data-view="customers">
              <span class="nav-icon">👥</span>
              <span class="nav-text">${i18nManager.t('customers')}</span>
            </div>
            <div class="nav-item" data-view="suppliers">
              <span class="nav-icon">🏭</span>
              <span class="nav-text">${i18nManager.t('suppliers')}</span>
            </div>
            <div class="nav-item" data-view="reports">
              <span class="nav-icon">📈</span>
              <span class="nav-text">${i18nManager.t('reports')}</span>
            </div>
            <div class="nav-item" data-view="ai">
              <span class="nav-icon">🤖</span>
              <span class="nav-text">${i18nManager.t('ai')}</span>
            </div>
            <div class="nav-item" data-view="settings">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text">${i18nManager.t('settings')}</span>
            </div>
          </nav>
        </div>
        <div class="main-content">
          <div class="content-header">
            <h1 id="page-title">${i18nManager.t('dashboard')}</h1>
            <div class="header-actions">
              <button id="lang-toggle" class="lang-btn">العربية</button>
            </div>
          </div>
          <div class="content-body" id="content-body">
            ${this.renderDashboard()}
          </div>
        </div>
      </div>
    `;
  }

  private renderDashboard(): string {
    return `
      <div class="dashboard-grid">
        <div class="card">
          <h3>${i18nManager.t('total_sales')}</h3>
          <div class="metric-value">$0.00</div>
        </div>
        <div class="card">
          <h3>${i18nManager.t('total_customers')}</h3>
          <div class="metric-value">0</div>
        </div>
        <div class="card">
          <h3>${i18nManager.t('low_stock_alerts')}</h3>
          <div class="metric-value">0</div>
        </div>
        <div class="card">
          <h3>Recent Sales</h3>
          <div class="metric-value">No recent sales</div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const view = target.dataset.view;
        if (view) {
          this.navigateToView(view);
        }
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Language toggle
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }
  }

  private navigateToView(view: string): void {
    this.currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = i18nManager.t(view);
    }
    
    // Update content
    const contentBody = document.getElementById('content-body');
    if (contentBody) {
      contentBody.innerHTML = this.renderView(view);
    }
  }

  private renderView(view: string): string {
    switch (view) {
      case 'dashboard':
        return this.renderDashboard();
      case 'inventory':
        return this.renderInventoryManager();
      case 'sales':
        return this.renderSalesManager();
      case 'customers':
        return this.renderCustomersManager();
      case 'suppliers':
        return this.renderSuppliersManager();
      case 'reports':
        return this.renderReportsManager();
      case 'ai':
        return this.renderAIManager();
      case 'settings':
        return this.renderSettingsManager();
      default:
        return '<div class="card"><h3>Page Not Found</h3><p>The requested page could not be found.</p></div>';
    }
  }

  private renderInventoryManager(): string {
    return `
      <div class="inventory-manager">
        <div class="inventory-header">
          <h2>${i18nManager.t('inventory')}</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="exportInventory()">
              📊 ${i18nManager.t('export_excel')}
            </button>
            <button class="btn btn-secondary" onclick="importInventory()">
              📥 ${i18nManager.t('import_excel')}
            </button>
            <button class="btn btn-primary" onclick="addProduct()">
              ➕ ${i18nManager.t('add_product')}
            </button>
          </div>
        </div>
        
        <div class="inventory-filters">
          <input type="text" placeholder="${i18nManager.t('search_products')}" class="search-input" id="inventory-search">
          <select class="filter-select" id="category-filter">
            <option value="">${i18nManager.t('all_categories')}</option>
          </select>
          <select class="filter-select" id="brand-filter">
            <option value="">${i18nManager.t('all_brands')}</option>
          </select>
        </div>
        
        <div class="inventory-stats">
          <div class="stat-card">
            <h3>${i18nManager.t('total_products')}</h3>
            <div class="stat-value" id="total-products">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('low_stock_items')}</h3>
            <div class="stat-value warning" id="low-stock-items">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('out_of_stock')}</h3>
            <div class="stat-value danger" id="out-of-stock-items">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('total_value')}</h3>
            <div class="stat-value" id="total-value">$0.00</div>
          </div>
        </div>
        
        <div class="products-table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>${i18nManager.t('sku')}</th>
                <th>${i18nManager.t('product_name')}</th>
                <th>${i18nManager.t('category')}</th>
                <th>${i18nManager.t('brand')}</th>
                <th>${i18nManager.t('stock_quantity')}</th>
                <th>${i18nManager.t('cost_price')}</th>
                <th>${i18nManager.t('selling_price')}</th>
                <th>${i18nManager.t('actions')}</th>
              </tr>
            </thead>
            <tbody id="products-table-body">
              <!-- Products will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderSalesManager(): string {
    return `
      <div class="sales-manager">
        <div class="sales-header">
          <h2>${i18nManager.t('sales')} (POS)</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="showCustomers()">
              👥 ${i18nManager.t('customers')}
            </button>
          </div>
        </div>
        
        <div class="sales-layout">
          <div class="products-section">
            <div class="search-section">
              <input type="text" placeholder="${i18nManager.t('search_products')}" class="search-input" id="sales-search">
              <input type="text" placeholder="${i18nManager.t('scan_barcode')}" class="barcode-input" id="barcode-input">
            </div>
            <div class="products-grid" id="sales-products-grid">
              <!-- Products will be loaded here -->
            </div>
          </div>
          
          <div class="cart-section">
            <div class="cart-header">
              <h3>${i18nManager.t('cart')}</h3>
              <span class="cart-count" id="cart-count">0 ${i18nManager.t('items')}</span>
            </div>
            
            <div class="cart-items" id="cart-items">
              <!-- Cart items will be loaded here -->
            </div>
            
            <div class="cart-summary" id="cart-summary" style="display: none;">
              <div class="summary-row">
                <span>${i18nManager.t('subtotal')}:</span>
                <span id="cart-subtotal">$0.00</span>
              </div>
              <div class="summary-row">
                <span>${i18nManager.t('tax')} (15%):</span>
                <span id="cart-tax">$0.00</span>
              </div>
              <div class="summary-row total">
                <span>${i18nManager.t('total')}:</span>
                <span id="cart-total">$0.00</span>
              </div>
            </div>
            
            <div class="customer-section">
              <h4>${i18nManager.t('customer')}</h4>
              <select class="customer-select" id="customer-select">
                <option value="">${i18nManager.t('walk_in_customer')}</option>
              </select>
            </div>
            
            <div class="payment-section">
              <h4>${i18nManager.t('payment_method')}</h4>
              <div class="payment-methods">
                <label class="payment-method">
                  <input type="radio" name="payment" value="Cash" checked>
                  ${i18nManager.t('cash')}
                </label>
                <label class="payment-method">
                  <input type="radio" name="payment" value="Visa">
                  ${i18nManager.t('visa')}
                </label>
                <label class="payment-method">
                  <input type="radio" name="payment" value="InstaPay">
                  ${i18nManager.t('instapay')}
                </label>
                <label class="payment-method">
                  <input type="radio" name="payment" value="Wallet">
                  ${i18nManager.t('wallet')}
                </label>
              </div>
            </div>
            
            <button class="btn btn-primary btn-large process-sale-btn" onclick="processSale()" disabled>
              ${i18nManager.t('process_sale')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderCustomersManager(): string {
    return `
      <div class="customers-manager">
        <div class="customers-header">
          <h2>${i18nManager.t('customers')}</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="addCustomer()">
              ➕ ${i18nManager.t('add_customer')}
            </button>
          </div>
        </div>
        
        <div class="customers-filters">
          <input type="text" placeholder="${i18nManager.t('search_customers')}" class="search-input" id="customers-search">
        </div>
        
        <div class="customers-stats">
          <div class="stat-card">
            <h3>${i18nManager.t('total_customers')}</h3>
            <div class="stat-value" id="total-customers">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('loyalty_members')}</h3>
            <div class="stat-value" id="loyalty-members">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('credit_customers')}</h3>
            <div class="stat-value" id="credit-customers">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('total_loyalty_points')}</h3>
            <div class="stat-value" id="total-loyalty-points">0</div>
          </div>
        </div>
        
        <div class="customers-table-container">
          <table class="customers-table">
            <thead>
              <tr>
                <th>${i18nManager.t('name')}</th>
                <th>${i18nManager.t('phone')}</th>
                <th>${i18nManager.t('email')}</th>
                <th>${i18nManager.t('loyalty_points')}</th>
                <th>${i18nManager.t('credit_limit')}</th>
                <th>${i18nManager.t('current_credit')}</th>
                <th>${i18nManager.t('member_since')}</th>
                <th>${i18nManager.t('actions')}</th>
              </tr>
            </thead>
            <tbody id="customers-table-body">
              <!-- Customers will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderSuppliersManager(): string {
    return `
      <div class="suppliers-manager">
        <div class="suppliers-header">
          <h2>${i18nManager.t('suppliers')}</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="addSupplier()">
              ➕ ${i18nManager.t('add_supplier')}
            </button>
          </div>
        </div>
        
        <div class="suppliers-filters">
          <input type="text" placeholder="${i18nManager.t('search_suppliers')}" class="search-input" id="suppliers-search">
        </div>
        
        <div class="suppliers-stats">
          <div class="stat-card">
            <h3>${i18nManager.t('total_suppliers')}</h3>
            <div class="stat-value" id="total-suppliers">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('active_suppliers')}</h3>
            <div class="stat-value" id="active-suppliers">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('pending_orders')}</h3>
            <div class="stat-value" id="pending-orders">0</div>
          </div>
          <div class="stat-card">
            <h3>${i18nManager.t('total_orders')}</h3>
            <div class="stat-value" id="total-orders">0</div>
          </div>
        </div>
        
        <div class="suppliers-table-container">
          <table class="suppliers-table">
            <thead>
              <tr>
                <th>${i18nManager.t('name')}</th>
                <th>${i18nManager.t('contact_person')}</th>
                <th>${i18nManager.t('phone')}</th>
                <th>${i18nManager.t('email')}</th>
                <th>${i18nManager.t('payment_terms')}</th>
                <th>${i18nManager.t('member_since')}</th>
                <th>${i18nManager.t('actions')}</th>
              </tr>
            </thead>
            <tbody id="suppliers-table-body">
              <!-- Suppliers will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderReportsManager(): string {
    return `
      <div class="reports-manager">
        <div class="reports-header">
          <h2>${i18nManager.t('reports')}</h2>
          <div class="header-actions">
            <div class="date-range">
              <input type="date" id="report-start-date">
              <span>${i18nManager.t('to')}</span>
              <input type="date" id="report-end-date">
            </div>
            <button class="btn btn-secondary" onclick="exportReport('excel')">
              📊 ${i18nManager.t('export_excel')}
            </button>
            <button class="btn btn-secondary" onclick="exportReport('pdf')">
              📄 ${i18nManager.t('export_pdf')}
            </button>
          </div>
        </div>
        
        <div class="reports-tabs">
          <button class="tab active" onclick="switchReportTab('sales')">
            📈 ${i18nManager.t('sales')}
          </button>
          <button class="tab" onclick="switchReportTab('inventory')">
            📦 ${i18nManager.t('inventory')}
          </button>
          <button class="tab" onclick="switchReportTab('customers')">
            👥 ${i18nManager.t('customers')}
          </button>
          <button class="tab" onclick="switchReportTab('financial')">
            💰 ${i18nManager.t('financial')}
          </button>
        </div>
        
        <div class="reports-content" id="reports-content">
          <!-- Report content will be loaded here -->
        </div>
      </div>
    `;
  }

  private renderAIManager(): string {
    return `
      <div class="ai-manager">
        <div class="ai-header">
          <h2>${i18nManager.t('ai')} ${i18nManager.t('insights')}</h2>
        </div>
        
        <div class="ai-insights">
          <div class="insight-card">
            <h3>${i18nManager.t('demand_forecasting')}</h3>
            <p>${i18nManager.t('ai_demand_forecast_description')}</p>
            <button class="btn btn-primary" onclick="generateDemandForecast()">
              ${i18nManager.t('generate_forecast')}
            </button>
          </div>
          
          <div class="insight-card">
            <h3>${i18nManager.t('pricing_optimization')}</h3>
            <p>${i18nManager.t('ai_pricing_optimization_description')}</p>
            <button class="btn btn-primary" onclick="optimizePricing()">
              ${i18nManager.t('optimize_prices')}
            </button>
          </div>
          
          <div class="insight-card">
            <h3>${i18nManager.t('inventory_optimization')}</h3>
            <p>${i18nManager.t('ai_inventory_optimization_description')}</p>
            <button class="btn btn-primary" onclick="optimizeInventory()">
              ${i18nManager.t('optimize_inventory')}
            </button>
          </div>
          
          <div class="insight-card">
            <h3>${i18nManager.t('customer_insights')}</h3>
            <p>${i18nManager.t('ai_customer_insights_description')}</p>
            <button class="btn btn-primary" onclick="generateCustomerInsights()">
              ${i18nManager.t('generate_insights')}
            </button>
          </div>
        </div>
        
        <div class="ai-suggestions" id="ai-suggestions">
          <!-- AI suggestions will be loaded here -->
        </div>
      </div>
    `;
  }

  private renderSettingsManager(): string {
    return `
      <div class="settings-manager">
        <div class="settings-header">
          <h2>${i18nManager.t('settings')}</h2>
        </div>
        
        <div class="settings-sections">
          <div class="settings-section">
            <h3>${i18nManager.t('general_settings')}</h3>
            <div class="setting-item">
              <label>${i18nManager.t('company_name')}</label>
              <input type="text" id="company-name" class="setting-input">
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('company_address')}</label>
              <textarea id="company-address" class="setting-textarea"></textarea>
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('company_phone')}</label>
              <input type="tel" id="company-phone" class="setting-input">
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('company_email')}</label>
              <input type="email" id="company-email" class="setting-input">
            </div>
          </div>
          
          <div class="settings-section">
            <h3>${i18nManager.t('business_settings')}</h3>
            <div class="setting-item">
              <label>${i18nManager.t('tax_rate')} (%)</label>
              <input type="number" id="tax-rate" class="setting-input" value="15" step="0.01">
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('currency')}</label>
              <select id="currency" class="setting-select">
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('timezone')}</label>
              <select id="timezone" class="setting-select">
                <option value="Asia/Riyadh">Asia/Riyadh</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>${i18nManager.t('sync_settings')}</h3>
            <div class="setting-item">
              <label>${i18nManager.t('auto_sync_interval')} (minutes)</label>
              <input type="number" id="sync-interval" class="setting-input" value="30">
            </div>
            <div class="setting-item">
              <label>${i18nManager.t('clutch_backend_url')}</label>
              <input type="url" id="backend-url" class="setting-input" value="https://clutch-main-nk7x.onrender.com">
            </div>
            <div class="setting-item">
              <button class="btn btn-primary" onclick="testConnection()">
                ${i18nManager.t('test_connection')}
              </button>
              <button class="btn btn-secondary" onclick="syncNow()">
                ${i18nManager.t('sync_now')}
              </button>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>${i18nManager.t('backup_settings')}</h3>
            <div class="setting-item">
              <label>${i18nManager.t('auto_backup_interval')} (hours)</label>
              <input type="number" id="backup-interval" class="setting-input" value="24">
            </div>
            <div class="setting-item">
              <button class="btn btn-primary" onclick="createBackup()">
                ${i18nManager.t('create_backup')}
              </button>
              <button class="btn btn-secondary" onclick="restoreBackup()">
                ${i18nManager.t('restore_backup')}
              </button>
            </div>
          </div>
        </div>
        
        <div class="settings-actions">
          <button class="btn btn-primary" onclick="saveSettings()">
            ${i18nManager.t('save_settings')}
          </button>
          <button class="btn btn-secondary" onclick="resetSettings()">
            ${i18nManager.t('reset_settings')}
          </button>
        </div>
      </div>
    `;
  }

  private async toggleTheme(): Promise<void> {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    
    // Reload design tokens with new theme
    await this.loadDesignTokens();
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = this.isDarkMode ? '☀️' : '🌙';
    }
  }

  private async toggleLanguage(): Promise<void> {
    const currentLang = i18nManager.getCurrentLanguage();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    
    await i18nManager.changeLanguage(newLang);
    this.isRTL = i18nManager.isRTL();
    this.updateDirection();
    
    // Re-render the app with new language
    this.render();
    this.setupEventListeners();
    
    // Update language button
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = newLang === 'ar' ? 'English' : 'العربية';
    }
  }

  private updateDirection(): void {
    document.body.classList.toggle('rtl', this.isRTL);
    document.documentElement.setAttribute('dir', this.isRTL ? 'rtl' : 'ltr');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ClutchApp();
});
