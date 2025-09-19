// src/client/app.ts
import { i18nManager } from '../lib/i18n';

class ClutchApp {
  private currentView: string = 'dashboard';
  private isDarkMode: boolean = false;
  private isRTL: boolean = false;

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
      
      // Render the app
      this.render();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('Clutch Auto Parts App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
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
        return '<div class="card"><h3>Inventory Management</h3><p>Inventory features coming soon...</p></div>';
      case 'sales':
        return '<div class="card"><h3>Sales (POS)</h3><p>Sales features coming soon...</p></div>';
      case 'customers':
        return '<div class="card"><h3>Customer Management</h3><p>Customer features coming soon...</p></div>';
      case 'suppliers':
        return '<div class="card"><h3>Supplier Management</h3><p>Supplier features coming soon...</p></div>';
      case 'reports':
        return '<div class="card"><h3>Reports</h3><p>Reporting features coming soon...</p></div>';
      case 'ai':
        return '<div class="card"><h3>AI Insights</h3><p>AI features coming soon...</p></div>';
      case 'settings':
        return '<div class="card"><h3>Settings</h3><p>Settings features coming soon...</p></div>';
      default:
        return '<div class="card"><h3>Page Not Found</h3><p>The requested page could not be found.</p></div>';
    }
  }

  private toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    
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
