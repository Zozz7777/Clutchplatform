// Main Application Logic for Clutch Auto Parts System
const { ipcRenderer } = require('electron');

// Load all required modules
const simpleDatabase = require('./simple-database.js');
const apiManager = require('./api.js');
const uiManager = require('./ui.js');
const backendConfig = require('./backend-config.js');
const connectionManager = require('./connection-manager.js');
const websocketManager = require('./websocket-manager.js');
const syncManager = require('./sync-manager.js');
const aiInsightsManager = require('./ai-insights-manager.js');
const signinManager = require('./signin-manager.js');
const dashboardManager = require('./dashboard-manager.js');
const inventoryManager = require('./inventory-manager.js');
const importManager = require('./import-manager.js');
const salesManager = require('./sales-manager.js');
const customerManager = require('./customer-manager.js');
const supplierManager = require('./supplier-manager.js');
const reportsManager = require('./reports-manager.js');
const deploymentManager = require('./deployment-manager.js');
const connectionStatusManager = require('./connection-status-manager.js');
const settingsManager = require('./settings-manager.js');

class AutoPartsApp {
    constructor() {
        this.currentLanguage = 'ar';
        this.currentPage = 'dashboard';
        this.shopInfo = null;
        this.settings = {};
        this.isOnline = navigator.onLine;
        this.syncStatus = 'disconnected';
        
        // Store manager references
        this.managers = {
            database: simpleDatabase,
            api: apiManager,
            ui: uiManager,
            backend: backendConfig,
            connection: connectionManager,
            websocket: websocketManager,
            sync: syncManager,
            signin: signinManager,
            dashboard: dashboardManager,
            inventory: inventoryManager,
            import: importManager,
            sales: salesManager,
            customer: customerManager,
            supplier: supplierManager,
            aiInsights: aiInsightsManager,
            reports: reportsManager,
            deployment: deploymentManager,
            connectionStatus: connectionStatusManager,
            settings: settingsManager
        };
        
        // Make API manager available globally for other managers
        window.apiManager = this.managers.api;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Clutch Auto Parts System...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core systems
            await this.initializeCore();
            
            // Check authentication
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                this.redirectToSignin();
                return;
            }
            
            // Initialize managers
            await this.initializeManagers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial page
            await this.loadPage(this.currentPage);
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('System initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize system:', error);
            this.showError('فشل في تهيئة النظام', error.message);
        }
    }

    async initializeCore() {
        try {
            // Initialize database
            if (this.managers.database) {
                await this.managers.database.init();
            }
            
            // Set demo mode immediately if no credentials are found
            const credentials = this.getSavedCredentials();
            if (!credentials) {
                console.log('No credentials found, enabling demo mode');
                this.enableDemoMode();
            }
            
            // Initialize backend configuration
            if (this.managers.backend) {
                await this.managers.backend.initialize();
            }
            
            // Initialize connection manager
            if (this.managers.connection) {
                await this.managers.connection.initialize();
            }
            
            console.log('Core systems initialized');
        } catch (error) {
            console.error('Failed to initialize core systems:', error);
            throw error;
        }
    }

    async initializeManagers() {
        try {
            // Initialize all managers
            const managerPromises = [];
            
            if (this.managers.signin) {
                managerPromises.push(this.managers.signin.init(this));
            }
            if (this.managers.dashboard) {
                managerPromises.push(this.managers.dashboard.init());
            }
            if (this.managers.inventory) {
                managerPromises.push(this.managers.inventory.init());
            }
            if (this.managers.sales) {
                managerPromises.push(this.managers.sales.init());
            }
            if (this.managers.customer) {
                managerPromises.push(this.managers.customer.init());
            }
            if (this.managers.supplier) {
                managerPromises.push(this.managers.supplier.init());
            }
            if (this.managers.aiInsights) {
                managerPromises.push(this.managers.aiInsights.init());
            }
            if (this.managers.reports) {
                managerPromises.push(this.managers.reports.init());
            }
            if (this.managers.settings) {
                managerPromises.push(this.managers.settings.init());
            }
            
            await Promise.all(managerPromises);
            console.log('All managers initialized');
        } catch (error) {
            console.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    // Authentication methods
    async checkAuthentication() {
        try {
            // Check for saved credentials
            const credentials = this.getSavedCredentials();
            if (!credentials) {
                console.log('No saved credentials found');
                return false;
            }

            // Validate credentials format
            if (!credentials.shopId || !credentials.apiKey) {
                console.log('Invalid credentials format');
                return false;
            }

            // Check if this is demo mode
            const isDemoMode = credentials.apiKey === 'demo-api-key' && credentials.shopId === 'demo-shop-id';
            
            if (isDemoMode) {
                console.log('Running in demo mode - skipping API connection test');
                return true;
            }

            // Test API connection with saved credentials
            const connectionTest = await this.testAPIConnection(credentials);
            if (!connectionTest.success) {
                console.log('API connection test failed:', connectionTest.message);
                // If backend is unavailable, allow demo mode
                console.log('Backend unavailable - enabling demo mode');
                this.enableDemoMode();
                return true;
            }

            console.log('Authentication successful');
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            // If there's an error, enable demo mode
            console.log('Authentication error - enabling demo mode');
            this.enableDemoMode();
            return true;
        }
    }

    getSavedCredentials() {
        try {
            // Try localStorage first, then sessionStorage
            let savedCredentials = localStorage.getItem('clutch_credentials');
            if (!savedCredentials) {
                savedCredentials = sessionStorage.getItem('clutch_credentials');
            }

            if (savedCredentials) {
                return JSON.parse(savedCredentials);
            }
            return null;
        } catch (error) {
            console.error('Error loading saved credentials:', error);
            return null;
        }
    }

    async testAPIConnection(credentials) {
        try {
            const response = await fetch('https://clutch-main-nk7x.onrender.com/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shop-ID': credentials.shopId,
                    'X-API-Key': credentials.apiKey
                },
                timeout: 10000
            });

            if (response.ok) {
                return { success: true, message: 'Connection successful' };
            } else {
                return { 
                    success: false, 
                    message: `Connection failed (${response.status})` 
                };
            }
        } catch (error) {
            console.error('API connection test failed:', error);
            return { 
                success: false, 
                message: 'Connection error' 
            };
        }
    }

    redirectToSignin() {
        console.log('Redirecting to signin page');
        this.showSignInPage();
    }

    showSignInPage() {
        // Hide main app and show signin page
        const appContainer = document.getElementById('app');
        const signinPage = document.getElementById('signin-page');
        
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        if (signinPage) {
            signinPage.style.display = 'block';
            // Load signin page content
            this.loadSignInPage();
        }
    }

    loadSignInPage() {
        // Load signin page content
        const signinPage = document.getElementById('signin-page');
        if (signinPage) {
            // Load the signin page HTML content
            fetch('pages/signin.html')
                .then(response => response.text())
                .then(html => {
                    signinPage.innerHTML = html;
                    // Initialize signin manager
                    if (window.signinManager) {
                        window.signinManager.init();
                    }
                })
                .catch(error => {
                    console.error('Error loading signin page:', error);
                });
        }
    }

    signOut() {
        try {
            // Clear saved credentials
            localStorage.removeItem('clutch_credentials');
            sessionStorage.removeItem('clutch_credentials');
            
            // Clear other app data
            localStorage.removeItem('clutch_language');
            sessionStorage.clear();
            
            console.log('Signed out successfully');
            
            // Redirect to signin page
            this.redirectToSignin();
        } catch (error) {
            console.error('Error during sign out:', error);
            // Still redirect even if there's an error
            this.redirectToSignin();
        }
    }

    showUserMenu() {
        // Create user menu dropdown
        const userMenu = document.getElementById('user-menu');
        const existingDropdown = document.querySelector('.user-dropdown');
        
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="user-info">
                <div class="user-name">${this.shopInfo?.name || 'المتجر'}</div>
                <div class="user-role">مدير المتجر</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="profile-btn">
                <span class="item-icon">👤</span>
                <span class="item-text">الملف الشخصي</span>
            </button>
            <button class="dropdown-item" id="settings-btn">
                <span class="item-icon">⚙️</span>
                <span class="item-text">الإعدادات</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="signout-btn">
                <span class="item-icon">🚪</span>
                <span class="item-text">تسجيل الخروج</span>
            </button>
        `;

        // Position dropdown
        const rect = userMenu.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = (rect.bottom + 5) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.style.zIndex = '1000';

        document.body.appendChild(dropdown);

        // Add event listeners
        dropdown.querySelector('#profile-btn').addEventListener('click', () => {
            this.navigateToPage('settings');
            dropdown.remove();
        });

        dropdown.querySelector('#settings-btn').addEventListener('click', () => {
            this.navigateToPage('settings');
            dropdown.remove();
        });

        dropdown.querySelector('#signout-btn').addEventListener('click', () => {
            this.signOut();
        });

        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    }

    async init() {
        try {
            // Check authentication first
            if (!await this.checkAuthentication()) {
                this.redirectToSignin();
                return;
            }

            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize components
            await this.initializeDatabase();
            await this.loadSettings();
            await this.loadShopInfo();
            
            // Initialize backend connections
            await this.initializeBackendConnections();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Start sync monitoring
            this.startSyncMonitoring();
            
            console.log('Auto Parts System initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('خطأ في تهيئة النظام', 'حدث خطأ أثناء تحميل النظام. يرجى إعادة المحاولة.');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    async initializeDatabase() {
        try {
            await databaseManager.init();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            this.settings = await databaseManager.getAllSettings();
            this.currentLanguage = this.settings.language?.value || 'ar';
            console.log('Settings loaded:', this.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadShopInfo() {
        try {
            this.shopInfo = await databaseManager.getShopInfo();
            if (this.shopInfo) {
                this.updateShopInfoDisplay();
            }
            console.log('Shop info loaded:', this.shopInfo);
        } catch (error) {
            console.error('Error loading shop info:', error);
        }
    }

    async initializeBackendConnections() {
        try {
            console.log('Initializing backend connections...');
            
            // Initialize backend configuration
            await window.backendConfig.initialize();
            
            // Initialize connection manager
            await window.connectionManager.init();
            
            // Initialize API manager
            await window.apiManager.initialize();
            
            // Initialize WebSocket manager
            // WebSocket manager is already initialized
            
            // Initialize sync manager
            await window.syncManager.initialize();
            
            // Start real-time sync
            await window.syncManager.startRealTimeSync();
            
            console.log('Backend connections initialized successfully');
            
        } catch (error) {
            console.error('Error initializing backend connections:', error);
            // Don't throw error, allow app to continue in offline mode
        }
    }

    updateShopInfoDisplay() {
        const shopNameElement = document.querySelector('.shop-name');
        const shopLocationElement = document.querySelector('.shop-location');
        
        if (shopNameElement && this.shopInfo) {
            shopNameElement.textContent = this.currentLanguage === 'ar' ? this.shopInfo.name : this.shopInfo.name_en;
        }
        
        if (shopLocationElement && this.shopInfo) {
            shopLocationElement.textContent = this.shopInfo.address || 'الموقع غير محدد';
        }
    }

    setupEventListeners() {
        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // User menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => this.showUserMenu());
        }

        // Navigation menu
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Quick action buttons
        const quickSaleBtn = document.getElementById('quick-sale-btn');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => this.openQuickSale());
        }

        const importInventoryBtn = document.getElementById('import-inventory-btn');
        if (importInventoryBtn) {
            importInventoryBtn.addEventListener('click', () => this.openImportInventory());
        }

        // Modal close
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.getElementById('modal-overlay');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));

        // IPC event listeners
        ipcRenderer.on('menu-new-shop', () => this.openNewShopDialog());
        ipcRenderer.on('menu-open-shop', () => this.openShopSelector());
        ipcRenderer.on('menu-import-inventory', () => this.openImportInventory());
        ipcRenderer.on('menu-export-data', () => this.exportData());
        ipcRenderer.on('menu-change-language', (event, language) => this.setLanguage(language));
    }

    initializeUI() {
        // Set initial language
        this.setLanguage(this.currentLanguage);
        
        // Set initial page
        this.navigateToPage('dashboard');
        
        // Update sync status
        this.updateSyncStatus();
    }

    async loadDashboardData() {
        try {
            const stats = await databaseManager.getDashboardStats();
            this.updateDashboardStats(stats);
            
            const recentSales = await databaseManager.getSales({ limit: 10 });
            this.updateRecentSalesTable(recentSales);
            
            const lowStockItems = await databaseManager.getInventoryItems({ low_stock: true });
            this.updateLowStockAlerts(lowStockItems);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats(stats) {
        const totalItemsElement = document.getElementById('total-items');
        const todaySalesElement = document.getElementById('today-sales');
        const lowStockElement = document.getElementById('low-stock');
        const totalCustomersElement = document.getElementById('total-customers');

        if (totalItemsElement) totalItemsElement.textContent = stats.totalItems || 0;
        if (todaySalesElement) todaySalesElement.textContent = this.formatCurrency(stats.todaySales || 0);
        if (lowStockElement) lowStockElement.textContent = stats.lowStock || 0;
        if (totalCustomersElement) totalCustomersElement.textContent = stats.totalCustomers || 0;
    }

    updateRecentSalesTable(sales) {
        const tbody = document.querySelector('#recent-sales-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد مبيعات حديثة</td></tr>';
            return;
        }

        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.invoice_number}</td>
                <td>${sale.customer_name || sale.customer_name_full || 'عميل نقدي'}</td>
                <td>${this.formatCurrency(sale.total_amount)}</td>
                <td>${this.formatDate(sale.created_at)}</td>
                <td><span class="status-badge ${sale.payment_status}">${this.getStatusText(sale.payment_status)}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    updateLowStockAlerts(items) {
        const alertContainer = document.getElementById('low-stock-alerts');
        if (!alertContainer) return;

        alertContainer.innerHTML = '';

        if (items.length === 0) {
            alertContainer.innerHTML = '<div class="alert-item"><div class="alert-icon">✅</div><div class="alert-content"><div class="alert-title">ممتاز!</div><div class="alert-message">جميع الأصناف متوفرة بكميات كافية</div></div></div>';
            return;
        }

        items.forEach(item => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-title">${item.name}</div>
                    <div class="alert-message">المخزون الحالي: ${item.stock_quantity} - الحد الأدنى: ${item.min_stock_level}</div>
                </div>
            `;
            alertContainer.appendChild(alertDiv);
        });
    }

    toggleLanguage() {
        const newLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        this.setLanguage(newLanguage);
    }

    setLanguage(language) {
        this.currentLanguage = language;
        
        // Update document attributes
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        
        // Update language toggle button
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            const langText = languageToggle.querySelector('.lang-text');
            if (langText) {
                langText.textContent = language === 'ar' ? 'EN' : 'AR';
            }
        }
        
        // Update all UI text
        this.updateUIText(language);
        
        // Save language setting
        window.databaseManager.setSetting('language', language);
        
        // Reload current page content
        this.reloadCurrentPage();
        
        console.log('Language changed to:', language);
    }
    
    updateUIText(language) {
        const translations = {
            ar: {
                'app-title': 'نظام إدارة قطع غيار السيارات',
                'sidebar-title': 'القائمة الرئيسية',
                'dashboard': 'لوحة التحكم',
                'inventory': 'إدارة المخزون',
                'sales': 'المبيعات',
                'customers': 'العملاء',
                'suppliers': 'الموردين',
                'ai-insights': 'الذكاء الاصطناعي',
                'reports': 'التقارير',
                'performance': 'الأداء',
                'settings': 'الإعدادات',
                'shop-name': 'اسم المتجر',
                'shop-location': 'الموقع',
                'sync-text': 'متصل',
                'loading-text': 'جاري تحميل النظام...',
                'loading-subtext': 'Loading System...'
            },
            en: {
                'app-title': 'Auto Parts Management System',
                'sidebar-title': 'Main Menu',
                'dashboard': 'Dashboard',
                'inventory': 'Inventory',
                'sales': 'Sales',
                'customers': 'Customers',
                'suppliers': 'Suppliers',
                'ai-insights': 'AI Insights',
                'reports': 'Reports',
                'performance': 'Performance',
                'settings': 'Settings',
                'shop-name': 'Shop Name',
                'shop-location': 'Location',
                'sync-text': 'Connected',
                'loading-text': 'Loading System...',
                'loading-subtext': 'Loading System...'
            }
        };
        
        const texts = translations[language] || translations.ar;
        
        // Update main elements
        Object.keys(texts).forEach(key => {
            const elements = document.querySelectorAll(`[data-translate="${key}"]`);
            elements.forEach(element => {
                element.textContent = texts[key];
            });
        });
        
        // Update specific elements by class or ID
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.textContent = texts['app-title'];
            console.log('Updated app title:', texts['app-title']);
        } else {
            console.log('App title element not found');
        }
        
        const sidebarTitle = document.querySelector('.sidebar-title');
        if (sidebarTitle) {
            sidebarTitle.textContent = texts['sidebar-title'];
            console.log('Updated sidebar title:', texts['sidebar-title']);
        } else {
            console.log('Sidebar title element not found');
        }
        
        const shopName = document.querySelector('.shop-name');
        if (shopName) {
            shopName.textContent = texts['shop-name'];
            console.log('Updated shop name:', texts['shop-name']);
        } else {
            console.log('Shop name element not found');
        }
        
        const shopLocation = document.querySelector('.shop-location');
        if (shopLocation) {
            shopLocation.textContent = texts['shop-location'];
            console.log('Updated shop location:', texts['shop-location']);
        } else {
            console.log('Shop location element not found');
        }
        
        const syncText = document.querySelector('.sync-text');
        if (syncText) {
            syncText.textContent = texts['sync-text'];
            console.log('Updated sync text:', texts['sync-text']);
        } else {
            console.log('Sync text element not found');
        }
        
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = texts['loading-text'];
            console.log('Updated loading text:', texts['loading-text']);
        } else {
            console.log('Loading text element not found');
        }
        
        const loadingSubtext = document.querySelector('.loading-subtext');
        if (loadingSubtext) {
            loadingSubtext.textContent = texts['loading-subtext'];
            console.log('Updated loading subtext:', texts['loading-subtext']);
        } else {
            console.log('Loading subtext element not found');
        }
        
        // Update menu items
        const menuItems = document.querySelectorAll('.menu-text');
        console.log('Found menu items:', menuItems.length);
        menuItems.forEach(item => {
            const page = item.closest('.menu-item').dataset.page;
            if (texts[page]) {
                item.textContent = texts[page];
                console.log('Updated menu item:', page, 'to:', texts[page]);
            } else {
                console.log('No translation found for page:', page);
            }
        });
        
        // Update page content if it exists
        this.updatePageContent(language);
        
        // Force update the document title
        document.title = language === 'ar' ? 'نظام إدارة قطع غيار السيارات - Clutch' : 'Auto Parts Management System - Clutch';
        
        console.log('UI Text updated for language:', language);
    }
    
    updatePageContent(language) {
        // Update dashboard content
        if (this.currentPage === 'dashboard') {
            this.updateDashboardContent(language);
        }
        
        // Update other page content as needed
        // This will be called when pages are loaded
    }
    
    updateDashboardContent(language) {
        const dashboardTranslations = {
            ar: {
                'dashboard-title': 'لوحة التحكم',
                'total-products': 'إجمالي المنتجات',
                'total-sales': 'إجمالي المبيعات',
                'total-customers': 'إجمالي العملاء',
                'recent-sales': 'المبيعات الأخيرة',
                'low-stock': 'مخزون منخفض',
                'quick-actions': 'إجراءات سريعة',
                'new-sale': 'بيع جديد',
                'add-product': 'إضافة منتج',
                'view-reports': 'عرض التقارير'
            },
            en: {
                'dashboard-title': 'Dashboard',
                'total-products': 'Total Products',
                'total-sales': 'Total Sales',
                'total-customers': 'Total Customers',
                'recent-sales': 'Recent Sales',
                'low-stock': 'Low Stock',
                'quick-actions': 'Quick Actions',
                'new-sale': 'New Sale',
                'add-product': 'Add Product',
                'view-reports': 'View Reports'
            }
        };
        
        const texts = dashboardTranslations[language] || dashboardTranslations.ar;
        
        // Update dashboard elements
        Object.keys(texts).forEach(key => {
            const elements = document.querySelectorAll(`[data-translate="${key}"]`);
            elements.forEach(element => {
                element.textContent = texts[key];
            });
        });
    }

    navigateToPage(pageName) {
        // Update active menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // Load page-specific data
            this.loadPageData(pageName);
        }
    }

    async loadPageData(pageName) {
        this.currentPage = pageName;
        
        // Update page content with current language
        this.updatePageContent(this.currentLanguage);
        
        switch (pageName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'inventory':
                await this.loadInventoryData();
                break;
            case 'sales':
                await this.loadSalesData();
                break;
            case 'customers':
                await this.loadCustomersData();
                break;
            case 'suppliers':
                await this.loadSuppliersData();
                break;
            case 'ai-insights':
                await this.loadAIInsightsData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'performance':
                await this.loadPerformanceData();
                break;
            case 'deployment':
                await this.loadDeploymentData();
                break;
            case 'connection-status':
                await this.loadConnectionStatusData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    reloadCurrentPage() {
        this.loadPageData(this.currentPage);
    }

    // Page-specific data loading methods
    async loadInventoryData() {
        try {
            // Load inventory page content
            const inventoryPage = document.getElementById('inventory-page');
            if (inventoryPage) {
                const response = await fetch('pages/inventory.html');
                const html = await response.text();
                inventoryPage.innerHTML = html;
                
                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Load inventory data
                await this.managers.inventory.loadInventoryData();
            }
        } catch (error) {
            console.error('Error loading inventory page:', error);
        }
    }

    async loadSalesData() {
        try {
            // Load sales page content
            const salesPage = document.getElementById('sales-page');
            if (salesPage) {
                const response = await fetch('pages/sales.html');
                const html = await response.text();
                salesPage.innerHTML = html;
                
                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Load sales data
                await this.managers.sales.loadSalesData();
            }
        } catch (error) {
            console.error('Error loading sales page:', error);
        }
    }

    async loadCustomersData() {
        try {
            // Load customers page content
            const customersPage = document.getElementById('customers-page');
            if (customersPage) {
                const response = await fetch('pages/customers.html');
                const html = await response.text();
                customersPage.innerHTML = html;
                
                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Load customers data
                await this.managers.customer.loadCustomersData();
            }
        } catch (error) {
            console.error('Error loading customers page:', error);
        }
    }

    async loadSuppliersData() {
        try {
            // Load suppliers page content
            const suppliersPage = document.getElementById('suppliers-page');
            if (suppliersPage) {
                const response = await fetch('pages/suppliers.html');
                const html = await response.text();
                suppliersPage.innerHTML = html;
                
                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Load suppliers data
                await this.managers.supplier.loadSuppliersData();
            }
        } catch (error) {
            console.error('Error loading suppliers page:', error);
        }
    }

    async loadAIInsightsData() {
        try {
            // Load AI insights page content
            const aiInsightsPage = document.getElementById('ai-insights-page');
            if (aiInsightsPage) {
                const response = await fetch('pages/ai-insights.html');
                const html = await response.text();
                aiInsightsPage.innerHTML = html;
                
                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Load AI insights data
                await this.managers.aiInsights.loadAIInsights();
            }
        } catch (error) {
            console.error('Error loading AI insights page:', error);
        }
    }

    async loadReportsData() {
        try {
            // Load reports page content
            const reportsPage = document.getElementById('reports-page');
            if (reportsPage) {
                const response = await fetch('pages/reports.html');
                const html = await response.text();
                reportsPage.innerHTML = html;
                
                // Load reports data
                await this.managers.reports.loadOverviewData();
            }
        } catch (error) {
            console.error('Error loading reports page:', error);
        }
    }

    async loadPerformanceData() {
        try {
            // Load performance page content
            const performancePage = document.getElementById('performance-page');
            if (performancePage) {
                const response = await fetch('pages/performance.html');
                const html = await response.text();
                performancePage.innerHTML = html;
                
                // Initialize performance monitor
                const performanceMonitor = require('./performance-monitor');
                
                // Load performance data
                await performanceMonitor.loadMonitoringData();
            }
        } catch (error) {
            console.error('Error loading performance page:', error);
        }
    }

    async loadDeploymentData() {
        try {
            // Load deployment page content
            const deploymentPage = document.getElementById('deployment-page');
            if (deploymentPage) {
                const response = await fetch('pages/deployment.html');
                const html = await response.text();
                deploymentPage.innerHTML = html;
                
                // Load deployment data
                await this.managers.deployment.checkDeploymentStatus();
            }
        } catch (error) {
            console.error('Error loading deployment page:', error);
        }
    }

    async loadConnectionStatusData() {
        try {
            // Load connection status page content
            const connectionStatusPage = document.getElementById('connection-status-page');
            if (connectionStatusPage) {
                const response = await fetch('pages/connection-status.html');
                const html = await response.text();
                connectionStatusPage.innerHTML = html;
                
                // Load connection status data
                await this.managers.connectionStatus.updateConnectionStatus();
            }
        } catch (error) {
            console.error('Error loading connection status page:', error);
        }
    }

    async loadSettingsData() {
        try {
            // Load settings page content
            const settingsPage = document.getElementById('settings-page');
            if (settingsPage) {
                const response = await fetch('pages/settings.html');
                const html = await response.text();
                settingsPage.innerHTML = html;
                
                // Load settings data
                await this.managers.settings.loadSettings();
            }
        } catch (error) {
            console.error('Error loading settings page:', error);
        }
    }

    // Modal management
    openModal(title, content, footer = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');
        const modalOverlay = document.getElementById('modal-overlay');

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (modalFooter) modalFooter.innerHTML = footer || '';
        if (modalOverlay) modalOverlay.style.display = 'flex';
    }

    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) modalOverlay.style.display = 'none';
    }

    // Quick actions
    openQuickSale() {
        const content = `
            <div class="quick-sale-form">
                <h4>بيع سريع</h4>
                <p>سيتم تنفيذ هذه الميزة قريباً...</p>
            </div>
        `;
        this.openModal('بيع سريع', content);
    }

    openImportInventory() {
        const content = `
            <div class="import-inventory-form">
                <h4>استيراد المخزون من Excel</h4>
                <p>سيتم تنفيذ هذه الميزة قريباً...</p>
            </div>
        `;
        this.openModal('استيراد المخزون', content);
    }

    openNewShopDialog() {
        const content = `
            <div class="new-shop-form">
                <h4>إنشاء متجر جديد</h4>
                <form id="new-shop-form">
                    <div class="form-group">
                        <label for="shop-name">اسم المتجر:</label>
                        <input type="text" id="shop-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="shop-owner">اسم المالك:</label>
                        <input type="text" id="shop-owner" name="owner" required>
                    </div>
                    <div class="form-group">
                        <label for="shop-phone">رقم الهاتف:</label>
                        <input type="tel" id="shop-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="shop-address">العنوان:</label>
                        <textarea id="shop-address" name="address" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="shop-email">البريد الإلكتروني:</label>
                        <input type="email" id="shop-email" name="email">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">إلغاء</button>
                        <button type="submit" class="btn btn-primary">إنشاء المتجر</button>
                    </div>
                </form>
            </div>
        `;
        this.openModal('إنشاء متجر جديد', content);
        
        // Add form submission handler
        setTimeout(() => {
            const form = document.getElementById('new-shop-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleNewShopSubmit(e));
            }
        }, 100);
    }

    async openShopSelector() {
        try {
            // Load existing shops
            const shops = await window.databaseManager.getShops();
            
            let shopsList = '';
            if (shops && shops.length > 0) {
                shopsList = shops.map(shop => `
                    <div class="shop-item" data-shop-id="${shop.id}">
                        <div class="shop-info">
                            <h5>${shop.name}</h5>
                            <p>المالك: ${shop.owner}</p>
                            <p>الهاتف: ${shop.phone}</p>
                            <p>العنوان: ${shop.address}</p>
                        </div>
                        <button class="btn btn-primary" onclick="app.selectShop('${shop.id}')">اختيار</button>
                    </div>
                `).join('');
            } else {
                shopsList = '<p>لا توجد متاجر محفوظة. قم بإنشاء متجر جديد.</p>';
            }
            
            const content = `
                <div class="shop-selector">
                    <h4>اختيار متجر</h4>
                    <div class="shops-list">
                        ${shopsList}
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">إلغاء</button>
                        <button type="button" class="btn btn-primary" onclick="app.openNewShopDialog()">متجر جديد</button>
                    </div>
                </div>
            `;
            this.openModal('اختيار متجر', content);
        } catch (error) {
            console.error('Error loading shops:', error);
            this.openModal('خطأ', '<p>حدث خطأ في تحميل المتاجر.</p>');
        }
    }

    async handleNewShopSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const shopData = {
                id: Date.now().toString(),
                name: formData.get('name'),
                owner: formData.get('owner'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                email: formData.get('email'),
                created_at: new Date().toISOString(),
                is_active: true
            };
            
            // Save shop to database
            await window.databaseManager.addShop(shopData);
            
            // Set as current shop
            this.shopInfo = shopData;
            await window.databaseManager.setSetting('current_shop_id', shopData.id);
            
            // Update UI
            this.updateShopInfoDisplay();
            
            // Close modal
            this.closeModal();
            
            // Show success message
            this.showNotification('تم إنشاء المتجر بنجاح', 'success');
            
        } catch (error) {
            console.error('Error creating shop:', error);
            this.showNotification('حدث خطأ في إنشاء المتجر', 'error');
        }
    }
    
    async selectShop(shopId) {
        try {
            const shop = await window.databaseManager.getShop(shopId);
            if (shop) {
                this.shopInfo = shop;
                await window.databaseManager.setSetting('current_shop_id', shopId);
                this.updateShopInfoDisplay();
                this.closeModal();
                this.showNotification('تم اختيار المتجر بنجاح', 'success');
            }
        } catch (error) {
            console.error('Error selecting shop:', error);
            this.showNotification('حدث خطأ في اختيار المتجر', 'error');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    exportData() {
        const content = `
            <div class="export-data-form">
                <h4>تصدير البيانات</h4>
                <p>سيتم تنفيذ هذه الميزة قريباً...</p>
            </div>
        `;
        this.openModal('تصدير البيانات', content);
    }

    // Utility methods
    formatCurrency(amount) {
        const currency = this.settings.currency?.value || 'EGP';
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'في الانتظار',
            'paid': 'مدفوع',
            'cancelled': 'ملغي',
            'refunded': 'مسترد'
        };
        return statusMap[status] || status;
    }

    // Sync management
    startSyncMonitoring() {
        setInterval(() => {
            this.checkSyncStatus();
        }, 30000); // Check every 30 seconds
    }

    async checkSyncStatus() {
        try {
            // Check if online
            this.isOnline = navigator.onLine;
            
            if (this.isOnline) {
                // Try to connect to Clutch backend
                const isConnected = await apiManager.testConnection();
                this.syncStatus = isConnected ? 'connected' : 'disconnected';
            } else {
                this.syncStatus = 'offline';
            }
            
            this.updateSyncStatus();
        } catch (error) {
            console.error('Error checking sync status:', error);
            this.syncStatus = 'error';
            this.updateSyncStatus();
        }
    }

    updateSyncStatus() {
        const syncStatusElement = document.getElementById('sync-status');
        if (!syncStatusElement) return;

        const syncText = syncStatusElement.querySelector('.sync-text');
        const syncIcon = syncStatusElement.querySelector('.sync-icon');

        if (syncText && syncIcon) {
            switch (this.syncStatus) {
                case 'connected':
                    syncText.textContent = 'متصل';
                    syncIcon.textContent = '🟢';
                    syncStatusElement.title = 'متصل بخادم Clutch';
                    break;
                case 'disconnected':
                    syncText.textContent = 'غير متصل';
                    syncIcon.textContent = '🔴';
                    syncStatusElement.title = 'غير متصل بخادم Clutch';
                    break;
                case 'offline':
                    syncText.textContent = 'غير متصل بالإنترنت';
                    syncIcon.textContent = '⚫';
                    syncStatusElement.title = 'غير متصل بالإنترنت';
                    break;
                case 'error':
                    syncText.textContent = 'خطأ في الاتصال';
                    syncIcon.textContent = '⚠️';
                    syncStatusElement.title = 'خطأ في الاتصال بخادم Clutch';
                    break;
            }
        }
    }

    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        this.checkSyncStatus();
        
        if (isOnline) {
            this.showToast('success', 'تم الاتصال بالإنترنت', 'تم استعادة الاتصال بالإنترنت');
        } else {
            this.showToast('warning', 'انقطع الاتصال بالإنترنت', 'سيتم العمل في وضع عدم الاتصال');
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.openNewShopDialog();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openShopSelector();
                    break;
                case 'i':
                    e.preventDefault();
                    this.openImportInventory();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportData();
                    break;
            }
        }
    }

    // Toast notifications
    showToast(type, title, message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${this.getToastIcon(type)}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    showError(title, message) {
        this.showToast('error', title, message);
    }

    showSuccess(title, message) {
        this.showToast('success', title, message);
    }

    showWarning(title, message) {
        this.showToast('warning', title, message);
    }

    showInfo(title, message) {
        this.showToast('info', title, message);
    }

    initializeApp() {
        // This method is called after successful sign in
        console.log('Initializing main application after sign in...');
        
        // Show main app container
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        // Load the dashboard page
        this.loadPage('dashboard');
        
        // Initialize any remaining systems
        this.initializeManagers();
    }

    enableDemoMode() {
        console.log('Enabling demo mode...');
        
        // Set demo credentials
        const demoCredentials = {
            shopId: 'demo-shop-id',
            apiKey: 'demo-api-key',
            shopName: 'متجر تجريبي',
            shopLocation: 'الرياض، المملكة العربية السعودية',
            rememberCredentials: true
        };
        
        // Save demo credentials
        localStorage.setItem('clutch_credentials', JSON.stringify(demoCredentials));
        
        // Update backend config to demo mode
        if (this.managers.backend) {
            this.managers.backend.credentials = demoCredentials;
            this.managers.backend.isDemoMode = true;
        }
        
        // Update API manager
        if (this.managers.api) {
            this.managers.api.apiKey = demoCredentials.apiKey;
            this.managers.api.shopId = demoCredentials.shopId;
            this.managers.api.isDemoMode = true;
        }
        
        console.log('Demo mode enabled successfully');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoPartsApp = new AutoPartsApp();
});
