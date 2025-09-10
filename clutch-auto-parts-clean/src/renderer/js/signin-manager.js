// Sign In Manager for Clutch Auto Parts System
class SignInManager {
    constructor() {
        this.isAuthenticated = false;
        this.credentials = null;
        this.app = null;
    }

    async init(app) {
        this.app = app;
        this.setupEventListeners();
        await this.checkSavedCredentials();
        await this.testConnection();
    }

    setupEventListeners() {
        // Sign in form
        const signinForm = document.getElementById('signin-form');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn();
            });
        }

        // Demo mode button
        const demoModeBtn = document.getElementById('demo-mode-btn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', () => {
                this.enableDemoMode();
            });
        }

        // Contact support button
        const contactSupportBtn = document.getElementById('contact-support-btn');
        if (contactSupportBtn) {
            contactSupportBtn.addEventListener('click', () => {
                this.contactSupport();
            });
        }

        // Documentation button
        const documentationBtn = document.getElementById('documentation-btn');
        if (documentationBtn) {
            documentationBtn.addEventListener('click', () => {
                this.openDocumentation();
            });
        }

        // Form validation
        const inputs = document.querySelectorAll('#signin-form input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    async checkSavedCredentials() {
        try {
            const savedCredentials = localStorage.getItem('clutch_credentials');
            if (savedCredentials) {
                const credentials = JSON.parse(savedCredentials);
                
                // Pre-fill form with saved credentials
                const shopIdInput = document.getElementById('shop-id');
                const apiKeyInput = document.getElementById('api-key');
                const shopNameInput = document.getElementById('shop-name');
                const shopLocationInput = document.getElementById('shop-location');
                const rememberCheckbox = document.getElementById('remember-credentials');

                if (shopIdInput) shopIdInput.value = credentials.shopId || '';
                if (apiKeyInput) apiKeyInput.value = credentials.apiKey || '';
                if (shopNameInput) shopNameInput.value = credentials.shopName || '';
                if (shopLocationInput) shopLocationInput.value = credentials.shopLocation || '';
                if (rememberCheckbox) rememberCheckbox.checked = true;

                // Test connection with saved credentials
                await this.testConnectionWithCredentials(credentials);
            }
        } catch (error) {
            console.error('Error checking saved credentials:', error);
        }
    }

    async testConnection() {
        try {
            this.updateConnectionStatus('checking', 'جاري فحص الاتصال...');
            
            // Test basic connectivity
            const response = await fetch('https://clutch-main-nk7x.onrender.com/health', {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                this.updateConnectionStatus('connected', 'متصل بالخادم');
            } else {
                this.updateConnectionStatus('error', 'خطأ في الاتصال');
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.updateConnectionStatus('disconnected', 'غير متصل بالخادم');
        }
    }

    async testConnectionWithCredentials(credentials) {
        try {
            this.updateConnectionStatus('checking', 'جاري التحقق من البيانات...');
            
            const response = await fetch('https://clutch-main-nk7x.onrender.com/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shop-ID': credentials.shopId,
                    'X-API-Key': credentials.apiKey
                },
                timeout: 5000
            });

            if (response.ok) {
                this.updateConnectionStatus('connected', 'متصل بالخادم');
                return true;
            } else {
                this.updateConnectionStatus('error', 'خطأ في التحقق من البيانات');
                return false;
            }
        } catch (error) {
            console.error('Credentials test failed:', error);
            this.updateConnectionStatus('error', 'خطأ في الاتصال');
            return false;
        }
    }

    async handleSignIn() {
        try {
            const formData = new FormData(document.getElementById('signin-form'));
            const credentials = {
                shopId: formData.get('shopId'),
                apiKey: formData.get('apiKey'),
                shopName: formData.get('shopName'),
                shopLocation: formData.get('shopLocation'),
                rememberCredentials: formData.get('rememberCredentials') === 'on'
            };

            // Validate form
            if (!this.validateForm(credentials)) {
                return;
            }

            // Show loading state
            this.showLoading();

            // Test connection with provided credentials
            const isValid = await this.testConnectionWithCredentials(credentials);
            
            if (isValid) {
                // Save credentials if remember is checked
                if (credentials.rememberCredentials) {
                    localStorage.setItem('clutch_credentials', JSON.stringify(credentials));
                } else {
                    sessionStorage.setItem('clutch_credentials', JSON.stringify(credentials));
                }

                // Set global credentials
                this.credentials = credentials;
                this.isAuthenticated = true;

                // Initialize API manager with credentials
                if (this.app && this.app.managers.api) {
                    this.app.managers.api.apiKey = credentials.apiKey;
                    this.app.managers.api.shopId = credentials.shopId;
                }

                // Show success message
                if (this.app && this.app.managers.ui) {
                    this.app.managers.ui.showNotification('تم تسجيل الدخول بنجاح', 'success');
                }

                // Navigate to dashboard
                setTimeout(() => {
                    this.navigateToDashboard();
                }, 1000);

            } else {
                if (this.app && this.app.managers.ui) {
                    this.app.managers.ui.showNotification('خطأ في بيانات الدخول', 'error');
                }
            }

        } catch (error) {
            console.error('Sign in error:', error);
            if (this.app && this.app.managers.ui) {
                this.app.managers.ui.showNotification('خطأ في تسجيل الدخول', 'error');
            }
        } finally {
            this.hideLoading();
        }
    }

    validateForm(credentials) {
        let isValid = true;
        const errors = [];

        if (!credentials.shopId || credentials.shopId.trim() === '') {
            errors.push('معرف المتجر مطلوب');
            isValid = false;
        }

        if (!credentials.apiKey || credentials.apiKey.trim() === '') {
            errors.push('مفتاح API مطلوب');
            isValid = false;
        }

        if (!credentials.shopName || credentials.shopName.trim() === '') {
            errors.push('اسم المتجر مطلوب');
            isValid = false;
        }

        if (!isValid) {
            uiManager.showNotification(errors.join(', '), 'error');
        }

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        const fieldName = input.name;

        // Clear previous errors
        this.clearInputError(input);

        if (!value) {
            this.showInputError(input, 'هذا الحقل مطلوب');
            return false;
        }

        // Specific validations
        switch (fieldName) {
            case 'shopId':
                if (value.length < 3) {
                    this.showInputError(input, 'معرف المتجر يجب أن يكون 3 أحرف على الأقل');
                    return false;
                }
                break;
            case 'apiKey':
                if (value.length < 10) {
                    this.showInputError(input, 'مفتاح API يجب أن يكون 10 أحرف على الأقل');
                    return false;
                }
                break;
            case 'shopName':
                if (value.length < 2) {
                    this.showInputError(input, 'اسم المتجر يجب أن يكون حرفين على الأقل');
                    return false;
                }
                break;
        }

        return true;
    }

    showInputError(input, message) {
        input.classList.add('error');
        
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearInputError(input) {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showLoading() {
        const signinBtn = document.getElementById('signin-btn');
        if (signinBtn) {
            signinBtn.disabled = true;
            signinBtn.innerHTML = '<span class="btn-icon">⏳</span> جاري تسجيل الدخول...';
        }
    }

    hideLoading() {
        const signinBtn = document.getElementById('signin-btn');
        if (signinBtn) {
            signinBtn.disabled = false;
            signinBtn.innerHTML = '<span class="btn-icon">🔐</span> تسجيل الدخول';
        }
    }

    updateConnectionStatus(status, message) {
        const indicator = document.getElementById('connection-status-indicator');
        const text = document.getElementById('connection-status-text');

        if (indicator) {
            indicator.className = `status-indicator ${status}`;
        }

        if (text) {
            text.textContent = message;
        }
    }

    enableDemoMode() {
        // Fill form with demo credentials
        const shopIdInput = document.getElementById('shop-id');
        const apiKeyInput = document.getElementById('api-key');
        const shopNameInput = document.getElementById('shop-name');
        const shopLocationInput = document.getElementById('shop-location');

        if (shopIdInput) shopIdInput.value = 'demo-shop-001';
        if (apiKeyInput) apiKeyInput.value = 'demo-api-key-1234567890';
        if (shopNameInput) shopNameInput.value = 'متجر قطع الغيار التجريبي';
        if (shopLocationInput) shopLocationInput.value = 'القاهرة، مصر';

        uiManager.showNotification('تم تحميل البيانات التجريبية', 'info');
    }

    contactSupport() {
        // Open support contact
        const supportInfo = {
            email: 'support@clutch.com',
            phone: '+20 123 456 7890',
            website: 'https://clutch.com/support'
        };

        const message = `
            للدعم الفني:
            البريد الإلكتروني: ${supportInfo.email}
            الهاتف: ${supportInfo.phone}
            الموقع: ${supportInfo.website}
        `;

        alert(message);
    }

    openDocumentation() {
        // Open documentation
        const docUrl = 'https://docs.clutch.com/auto-parts-system';
        window.open(docUrl, '_blank');
    }

    navigateToDashboard() {
        // Hide signin page and show main app
        const signinPage = document.querySelector('.signin-page');
        const appContainer = document.getElementById('app');

        if (signinPage) {
            signinPage.style.display = 'none';
        }

        if (appContainer) {
            appContainer.style.display = 'block';
        }

        // Initialize main app
        if (this.app) {
            this.app.initializeApp();
        }
    }

    signOut() {
        // Clear credentials
        localStorage.removeItem('clutch_credentials');
        sessionStorage.removeItem('clutch_credentials');
        
        this.credentials = null;
        this.isAuthenticated = false;

        // Show signin page
        const signinPage = document.querySelector('.signin-page');
        const appContainer = document.getElementById('app');

        if (signinPage) {
            signinPage.style.display = 'block';
        }

        if (appContainer) {
            appContainer.style.display = 'none';
        }

        if (this.app && this.app.managers.ui) {
            this.app.managers.ui.showNotification('تم تسجيل الخروج بنجاح', 'info');
        }
    }

    getCredentials() {
        return this.credentials;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Export singleton instance
const signinManager = new SignInManager();
module.exports = signinManager;
