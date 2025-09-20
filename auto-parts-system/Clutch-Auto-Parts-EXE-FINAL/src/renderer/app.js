// Clutch Auto Parts System - Main Application
class ClutchAutoPartsApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isRTL = true;
        this.theme = 'light';
        this.syncStatus = 'offline';
        
        this.init();
    }

    async init() {
        try {
            // Initialize the application
            await this.initializeApp();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Show main app
            this.showMainApp();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('فشل في تحميل التطبيق');
        }
    }

    async initializeApp() {
        // Check if user is already logged in
        const user = await window.electronAPI.getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.updateUserInterface();
        } else {
            this.showLoginScreen();
        }

        // Get system info
        const systemInfo = await window.electronAPI.getSystemInfo();
        console.log('System info:', systemInfo);

        // Set up language and theme
        this.setupLanguageAndTheme();
    }

    setupLanguageAndTheme() {
        // Set initial language (Arabic first)
        this.setLanguage('ar');
        
        // Set initial theme
        this.setTheme('light');
        
        // Apply RTL/LTR styles
        this.applyDirection();
    }

    setLanguage(lang) {
        this.isRTL = lang === 'ar';
        document.documentElement.lang = lang;
        document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
        
        // Update UI text based on language
        this.updateUIText(lang);
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle button
        const lightIcon = document.querySelector('.light-icon');
        const darkIcon = document.querySelector('.dark-icon');
        
        if (theme === 'light') {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }

    applyDirection() {
        const body = document.body;
        if (this.isRTL) {
            body.classList.add('rtl');
            body.classList.remove('ltr');
        } else {
            body.classList.add('ltr');
            body.classList.remove('rtl');
        }
    }

    updateUIText(lang) {
        // This would be replaced with actual i18n implementation
        const texts = {
            ar: {
                appTitle: 'نظام قطع غيار كلتش',
                dashboard: 'لوحة التحكم',
                inventory: 'المخزون',
                sales: 'المبيعات',
                customers: 'العملاء',
                suppliers: 'الموردون',
                reports: 'التقارير',
                ai: 'الذكاء الاصطناعي',
                settings: 'الإعدادات'
            },
            en: {
                appTitle: 'Clutch Auto Parts System',
                dashboard: 'Dashboard',
                inventory: 'Inventory',
                sales: 'Sales',
                customers: 'Customers',
                suppliers: 'Suppliers',
                reports: 'Reports',
                ai: 'AI Insights',
                settings: 'Settings'
            }
        };

        const currentTexts = texts[lang] || texts.ar;
        
        // Update navigation items
        document.querySelectorAll('[data-page]').forEach(item => {
            const page = item.dataset.page;
            const textElement = item.querySelector('.nav-text');
            if (textElement && currentTexts[page]) {
                textElement.textContent = currentTexts[page];
            }
        });

        // Update app title
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.textContent = currentTexts.appTitle;
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Language selector
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.setTheme(this.theme === 'light' ? 'dark' : 'light');
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
        }

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // User menu
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        
        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                    userMenuDropdown.classList.add('hidden');
                }
            });

            // User menu actions
            userMenuDropdown.addEventListener('click', (e) => {
                const action = e.target.closest('.menu-item')?.dataset.action;
                if (action) {
                    this.handleUserMenuAction(action);
                }
            });
        }

        // Menu events from main process
        window.electronAPI.onMenuNewSale(() => {
            this.navigateToPage('sales');
        });

        window.electronAPI.onMenuImportData(() => {
            this.showImportDialog();
        });

        window.electronAPI.onMenuExportData(() => {
            this.showExportDialog();
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        const loginButton = e.target.querySelector('.login-button');
        const buttonText = loginButton.querySelector('.button-text');
        const buttonSpinner = loginButton.querySelector('.button-spinner');

        try {
            // Show loading state
            loginButton.disabled = true;
            buttonText.classList.add('hidden');
            buttonSpinner.classList.remove('hidden');

            // Attempt login
            const result = await window.electronAPI.login(credentials);
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateUserInterface();
                this.showMainApp();
                this.showNotification('تم تسجيل الدخول بنجاح', 'success');
            } else {
                this.showNotification(result.message || 'فشل في تسجيل الدخول', 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('خطأ في تسجيل الدخول', 'error');
        } finally {
            // Hide loading state
            loginButton.disabled = false;
            buttonText.classList.remove('hidden');
            buttonSpinner.classList.add('hidden');
        }
    }

    async handleUserMenuAction(action) {
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        userMenuDropdown.classList.add('hidden');

        switch (action) {
            case 'profile':
                this.showProfileModal();
                break;
            case 'settings':
                this.navigateToPage('settings');
                break;
            case 'help':
                this.showHelpModal();
                break;
            case 'logout':
                await this.handleLogout();
                break;
        }
    }

    async handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            try {
                await window.electronAPI.logout();
                this.currentUser = null;
                this.showLoginScreen();
                this.showNotification('تم تسجيل الخروج بنجاح', 'success');
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('خطأ في تسجيل الخروج', 'error');
            }
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user name and initials
        const userName = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
        const initials = `${this.currentUser.first_name[0]}${this.currentUser.last_name[0]}`;

        document.getElementById('user-name').textContent = userName;
        document.getElementById('user-initials').textContent = initials;
        document.getElementById('user-name-large').textContent = userName;
        document.getElementById('user-initials-large').textContent = initials;
        document.getElementById('user-role').textContent = this.getRoleDisplayName(this.currentUser.role);
    }

    getRoleDisplayName(role) {
        const roleNames = {
            ar: {
                owner: 'مالك',
                manager: 'مدير',
                accountant: 'محاسب',
                cashier: 'كاشير',
                auditor: 'مراجع',
                sysadmin: 'مدير النظام'
            },
            en: {
                owner: 'Owner',
                manager: 'Manager',
                accountant: 'Accountant',
                cashier: 'Cashier',
                auditor: 'Auditor',
                sysadmin: 'System Admin'
            }
        };

        const lang = this.isRTL ? 'ar' : 'en';
        return roleNames[lang][role] || role;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
    }

    navigateToPage(page) {
        // Update active navigation item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        this.currentPage = page;
        this.loadPageContent(page);
    }

    async loadPageContent(page) {
        const pageContent = document.getElementById('page-content');
        
        try {
            // Show loading state
            pageContent.innerHTML = '<div class="loading">جاري التحميل...</div>';

            // Load page content based on current page
            switch (page) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'inventory':
                    await this.loadInventory();
                    break;
                case 'sales':
                    await this.loadSales();
                    break;
                case 'customers':
                    await this.loadCustomers();
                    break;
                case 'suppliers':
                    await this.loadSuppliers();
                    break;
                case 'reports':
                    await this.loadReports();
                    break;
                case 'ai':
                    await this.loadAI();
                    break;
                case 'settings':
                    await this.loadSettings();
                    break;
                default:
                    pageContent.innerHTML = '<div class="error">صفحة غير موجودة</div>';
            }

        } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            pageContent.innerHTML = '<div class="error">خطأ في تحميل الصفحة</div>';
        }
    }

    async loadDashboard() {
        const pageContent = document.getElementById('page-content');
        
        // Get dashboard data
        const stats = await this.getDashboardStats();
        
        pageContent.innerHTML = `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h1>لوحة التحكم</h1>
                    <p>مرحباً بك في نظام قطع غيار كلتش</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalProducts}</div>
                            <div class="stat-label">إجمالي المنتجات</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalSales}</div>
                            <div class="stat-label">إجمالي المبيعات</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.totalCustomers}</div>
                            <div class="stat-label">إجمالي العملاء</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.lowStock}</div>
                            <div class="stat-label">مخزون منخفض</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="dashboard-section">
                        <h2>المبيعات الأخيرة</h2>
                        <div class="recent-sales">
                            ${stats.recentSales.map(sale => `
                                <div class="sale-item">
                                    <div class="sale-info">
                                        <div class="sale-number">${sale.sale_number}</div>
                                        <div class="sale-customer">${sale.customer_name || 'عميل نقدي'}</div>
                                    </div>
                                    <div class="sale-amount">${sale.total_amount} ريال</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h2>تنبيهات المخزون</h2>
                        <div class="stock-alerts">
                            ${stats.stockAlerts.map(alert => `
                                <div class="alert-item">
                                    <div class="alert-product">${alert.product_name}</div>
                                    <div class="alert-stock">المخزون: ${alert.current_stock}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadInventory() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="inventory">
                <div class="page-header">
                    <h1>إدارة المخزون</h1>
                    <button class="btn btn-primary" onclick="app.showAddProductModal()">
                        إضافة منتج
                    </button>
                </div>
                
                <div class="inventory-filters">
                    <input type="text" placeholder="البحث في المنتجات..." class="form-input">
                    <select class="form-select">
                        <option value="">جميع الفئات</option>
                    </select>
                    <select class="form-select">
                        <option value="">جميع العلامات التجارية</option>
                    </select>
                </div>
                
                <div class="inventory-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>رمز المنتج</th>
                                <th>اسم المنتج</th>
                                <th>الفئة</th>
                                <th>العلامة التجارية</th>
                                <th>سعر البيع</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="8" class="text-center">جاري تحميل البيانات...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Load inventory data
        await this.loadInventoryData();
    }

    async loadSales() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="sales">
                <div class="page-header">
                    <h1>نقطة البيع</h1>
                    <button class="btn btn-primary" onclick="app.startNewSale()">
                        بيع جديد
                    </button>
                </div>
                
                <div class="pos-container">
                    <div class="pos-left">
                        <div class="product-search">
                            <input type="text" placeholder="البحث عن منتج..." class="form-input">
                        </div>
                        <div class="product-grid">
                            <!-- Products will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="pos-right">
                        <div class="cart">
                            <h3>سلة المشتريات</h3>
                            <div class="cart-items">
                                <!-- Cart items will be loaded here -->
                            </div>
                            <div class="cart-summary">
                                <div class="summary-row">
                                    <span>المجموع الفرعي:</span>
                                    <span>0 ريال</span>
                                </div>
                                <div class="summary-row">
                                    <span>الخصم:</span>
                                    <span>0 ريال</span>
                                </div>
                                <div class="summary-row">
                                    <span>الضريبة:</span>
                                    <span>0 ريال</span>
                                </div>
                                <div class="summary-row total">
                                    <span>المجموع الكلي:</span>
                                    <span>0 ريال</span>
                                </div>
                            </div>
                            <div class="cart-actions">
                                <button class="btn btn-primary" onclick="app.processPayment()">
                                    معالجة الدفع
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCustomers() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="customers">
                <div class="page-header">
                    <h1>إدارة العملاء</h1>
                    <button class="btn btn-primary" onclick="app.showAddCustomerModal()">
                        إضافة عميل
                    </button>
                </div>
                
                <div class="customers-filters">
                    <input type="text" placeholder="البحث في العملاء..." class="form-input">
                    <select class="form-select">
                        <option value="">جميع المدن</option>
                    </select>
                </div>
                
                <div class="customers-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>رمز العميل</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>المدينة</th>
                                <th>نقاط الولاء</th>
                                <th>الرصيد</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="text-center">جاري تحميل البيانات...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async loadSuppliers() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="suppliers">
                <div class="page-header">
                    <h1>إدارة الموردين</h1>
                    <button class="btn btn-primary" onclick="app.showAddSupplierModal()">
                        إضافة مورد
                    </button>
                </div>
                
                <div class="suppliers-filters">
                    <input type="text" placeholder="البحث في الموردين..." class="form-input">
                    <select class="form-select">
                        <option value="">جميع المدن</option>
                    </select>
                </div>
                
                <div class="suppliers-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>الشخص المسؤول</th>
                                <th>الهاتف</th>
                                <th>المدينة</th>
                                <th>حد الائتمان</th>
                                <th>الرصيد الحالي</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="text-center">جاري تحميل البيانات...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async loadReports() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="reports">
                <div class="page-header">
                    <h1>التقارير</h1>
                    <button class="btn btn-primary" onclick="app.generateReport()">
                        إنشاء تقرير
                    </button>
                </div>
                
                <div class="reports-grid">
                    <div class="report-card" onclick="app.loadReport('sales')">
                        <div class="report-icon">📊</div>
                        <div class="report-title">تقرير المبيعات</div>
                        <div class="report-description">عرض تفصيلي للمبيعات والإيرادات</div>
                    </div>
                    
                    <div class="report-card" onclick="app.loadReport('inventory')">
                        <div class="report-icon">📦</div>
                        <div class="report-title">تقرير المخزون</div>
                        <div class="report-description">حالة المخزون والمنتجات</div>
                    </div>
                    
                    <div class="report-card" onclick="app.loadReport('customers')">
                        <div class="report-icon">👥</div>
                        <div class="report-title">تقرير العملاء</div>
                        <div class="report-description">تحليل العملاء والمشتريات</div>
                    </div>
                    
                    <div class="report-card" onclick="app.loadReport('financial')">
                        <div class="report-icon">💰</div>
                        <div class="report-title">التقرير المالي</div>
                        <div class="report-description">الأرباح والخسائر</div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadAI() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="ai">
                <div class="page-header">
                    <h1>الذكاء الاصطناعي</h1>
                    <p>رؤى ذكية لتحسين عملك</p>
                </div>
                
                <div class="ai-insights">
                    <div class="insight-card">
                        <div class="insight-header">
                            <h3>توقع الطلب</h3>
                            <span class="insight-badge">جديد</span>
                        </div>
                        <div class="insight-content">
                            <p>توقع الطلب على المنتجات بناءً على البيانات التاريخية</p>
                            <button class="btn btn-primary">عرض التوقعات</button>
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-header">
                            <h3>تحسين الأسعار</h3>
                            <span class="insight-badge">مفعل</span>
                        </div>
                        <div class="insight-content">
                            <p>اقتراحات لتحسين أسعار المنتجات لزيادة الأرباح</p>
                            <button class="btn btn-primary">عرض الاقتراحات</button>
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-header">
                            <h3>تحسين المخزون</h3>
                            <span class="insight-badge">مفعل</span>
                        </div>
                        <div class="insight-content">
                            <p>توصيات لتحسين مستويات المخزون</p>
                            <button class="btn btn-primary">عرض التوصيات</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadSettings() {
        const pageContent = document.getElementById('page-content');
        
        pageContent.innerHTML = `
            <div class="settings">
                <div class="page-header">
                    <h1>الإعدادات</h1>
                </div>
                
                <div class="settings-tabs">
                    <div class="tab active" data-tab="general">عام</div>
                    <div class="tab" data-tab="users">المستخدمون</div>
                    <div class="tab" data-tab="backup">النسخ الاحتياطي</div>
                    <div class="tab" data-tab="sync">المزامنة</div>
                </div>
                
                <div class="settings-content">
                    <div class="tab-content active" id="general">
                        <h3>الإعدادات العامة</h3>
                        <form class="settings-form">
                            <div class="form-group">
                                <label>اسم المتجر</label>
                                <input type="text" class="form-input" value="متجر قطع غيار كلتش">
                            </div>
                            <div class="form-group">
                                <label>العملة</label>
                                <select class="form-select">
                                    <option value="SAR">ريال سعودي</option>
                                    <option value="USD">دولار أمريكي</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>معدل الضريبة</label>
                                <input type="number" class="form-input" value="15" step="0.01">
                            </div>
                            <button type="submit" class="btn btn-primary">حفظ الإعدادات</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    async getDashboardStats() {
        // This would fetch real data from the database
        return {
            totalProducts: 1250,
            totalSales: 3420,
            totalCustomers: 890,
            lowStock: 45,
            recentSales: [
                { sale_number: 'S001', customer_name: 'أحمد محمد', total_amount: 150 },
                { sale_number: 'S002', customer_name: 'فاطمة علي', total_amount: 200 },
                { sale_number: 'S003', customer_name: null, total_amount: 75 }
            ],
            stockAlerts: [
                { product_name: 'فلتر زيت', current_stock: 2 },
                { product_name: 'شمعة احتراق', current_stock: 5 },
                { product_name: 'حزام محرك', current_stock: 1 }
            ]
        };
    }

    async loadInitialData() {
        // Load initial data for the application
        console.log('Loading initial data...');
    }

    showLoginScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Load dashboard by default
        this.loadPageContent('dashboard');
    }

    showError(message) {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
        
        // Show error message
        console.error(message);
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Placeholder methods for future implementation
    showAddProductModal() {
        this.showNotification('سيتم تنفيذ إضافة منتج قريباً', 'info');
    }

    showAddCustomerModal() {
        this.showNotification('سيتم تنفيذ إضافة عميل قريباً', 'info');
    }

    showAddSupplierModal() {
        this.showNotification('سيتم تنفيذ إضافة مورد قريباً', 'info');
    }

    startNewSale() {
        this.showNotification('سيتم تنفيذ نقطة البيع قريباً', 'info');
    }

    processPayment() {
        this.showNotification('سيتم تنفيذ معالجة الدفع قريباً', 'info');
    }

    generateReport() {
        this.showNotification('سيتم تنفيذ إنشاء التقارير قريباً', 'info');
    }

    loadReport(type) {
        this.showNotification(`سيتم تنفيذ تقرير ${type} قريباً`, 'info');
    }

    showProfileModal() {
        this.showNotification('سيتم تنفيذ الملف الشخصي قريباً', 'info');
    }

    showHelpModal() {
        this.showNotification('سيتم تنفيذ المساعدة قريباً', 'info');
    }

    showImportDialog() {
        this.showNotification('سيتم تنفيذ الاستيراد قريباً', 'info');
    }

    showExportDialog() {
        this.showNotification('سيتم تنفيذ التصدير قريباً', 'info');
    }

    async loadInventoryData() {
        // This would load real inventory data
        console.log('Loading inventory data...');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ClutchAutoPartsApp();
});
