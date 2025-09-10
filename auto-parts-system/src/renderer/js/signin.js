// Signin Page Logic for Clutch Auto Parts System
class SigninManager {
    constructor() {
        this.currentLanguage = 'ar';
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.loadSavedCredentials();
            this.initializeLanguage();
            console.log('Signin page initialized successfully');
        } catch (error) {
            console.error('Error initializing signin page:', error);
        }
    }

    setupEventListeners() {
        // Form submission
        const signinForm = document.getElementById('signin-form');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignin(e));
        }

        // Demo mode button
        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.handleDemoMode());
        }

        // Language toggle
        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Password toggle
        const togglePassword = document.getElementById('toggle-api-key');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Forgot credentials link
        const forgotLink = document.querySelector('.forgot-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => this.handleForgotCredentials(e));
        }

        // Form input validation
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearInputError(input));
        });
    }

    async handleSignin(event) {
        event.preventDefault();
        
        if (this.isLoading) return;

        try {
            this.setLoading(true);
            this.clearMessages();

            const formData = new FormData(event.target);
            const credentials = {
                shopId: formData.get('shopId').trim(),
                apiKey: formData.get('apiKey').trim(),
                shopName: formData.get('shopName').trim(),
                shopLocation: formData.get('shopLocation').trim(),
                rememberMe: formData.get('rememberMe') === 'on'
            };

            // Validate form data
            const validation = this.validateForm(credentials);
            if (!validation.isValid) {
                this.showMessage('error', validation.message);
                return;
            }

            // Test API connection
            const connectionTest = await this.testAPIConnection(credentials);
            if (!connectionTest.success) {
                this.showMessage('error', connectionTest.message);
                return;
            }

            // Save credentials
            await this.saveCredentials(credentials);

            // Show success message
            this.showMessage('success', this.getTranslation('signin-success'));

            // Redirect to main application
            setTimeout(() => {
                this.redirectToMainApp();
            }, 1500);

        } catch (error) {
            console.error('Signin error:', error);
            this.showMessage('error', this.getTranslation('signin-error'));
        } finally {
            this.setLoading(false);
        }
    }

    async handleDemoMode() {
        try {
            this.setLoading(true);
            this.clearMessages();

            const demoCredentials = {
                shopId: 'demo-shop-id',
                apiKey: 'demo-api-key',
                shopName: 'متجر تجريبي',
                shopLocation: 'الرياض، المملكة العربية السعودية',
                rememberMe: false
            };

            // Fill form with demo data
            this.fillFormWithCredentials(demoCredentials);

            // Show demo mode message
            this.showMessage('warning', this.getTranslation('demo-mode-activated'));

            // Auto signin after a short delay
            setTimeout(() => {
                document.getElementById('signin-form').dispatchEvent(new Event('submit'));
            }, 1000);

        } catch (error) {
            console.error('Demo mode error:', error);
            this.showMessage('error', this.getTranslation('demo-mode-error'));
        } finally {
            this.setLoading(false);
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
                return { success: true, message: this.getTranslation('connection-success') };
            } else {
                return { 
                    success: false, 
                    message: this.getTranslation('connection-failed') + ` (${response.status})` 
                };
            }
        } catch (error) {
            console.error('API connection test failed:', error);
            return { 
                success: false, 
                message: this.getTranslation('connection-error') 
            };
        }
    }

    validateForm(credentials) {
        if (!credentials.shopId) {
            return { isValid: false, message: this.getTranslation('shop-id-required') };
        }
        if (!credentials.apiKey) {
            return { isValid: false, message: this.getTranslation('api-key-required') };
        }
        if (!credentials.shopName) {
            return { isValid: false, message: this.getTranslation('shop-name-required') };
        }
        return { isValid: true };
    }

    validateInput(input) {
        const value = input.value.trim();
        const fieldName = input.name;

        // Clear previous errors
        this.clearInputError(input);

        if (!value && input.required) {
            this.showInputError(input, this.getTranslation(`${fieldName}-required`));
            return false;
        }

        // Additional validation for specific fields
        if (fieldName === 'shopId' && value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
            this.showInputError(input, this.getTranslation('shop-id-invalid'));
            return false;
        }

        if (fieldName === 'apiKey' && value && value.length < 8) {
            this.showInputError(input, this.getTranslation('api-key-too-short'));
            return false;
        }

        return true;
    }

    showInputError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    clearInputError(input) {
        input.classList.remove('error');
        const errorDiv = input.parentNode.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async saveCredentials(credentials) {
        try {
            // Save to localStorage for demo purposes
            // In a real application, this would be encrypted and stored securely
            const credentialsData = {
                shopId: credentials.shopId,
                apiKey: credentials.apiKey,
                shopName: credentials.shopName,
                shopLocation: credentials.shopLocation,
                rememberMe: credentials.rememberMe,
                timestamp: new Date().toISOString()
            };

            if (credentials.rememberMe) {
                localStorage.setItem('clutch_credentials', JSON.stringify(credentialsData));
            } else {
                sessionStorage.setItem('clutch_credentials', JSON.stringify(credentialsData));
            }

            console.log('Credentials saved successfully');
        } catch (error) {
            console.error('Error saving credentials:', error);
            throw error;
        }
    }

    loadSavedCredentials() {
        try {
            // Try localStorage first, then sessionStorage
            let savedCredentials = localStorage.getItem('clutch_credentials');
            if (!savedCredentials) {
                savedCredentials = sessionStorage.getItem('clutch_credentials');
            }

            if (savedCredentials) {
                const credentials = JSON.parse(savedCredentials);
                this.fillFormWithCredentials(credentials);
                
                // Check remember me if loaded from localStorage
                const rememberMe = document.getElementById('remember-me');
                if (rememberMe && localStorage.getItem('clutch_credentials')) {
                    rememberMe.checked = true;
                }
            }
        } catch (error) {
            console.error('Error loading saved credentials:', error);
        }
    }

    fillFormWithCredentials(credentials) {
        const shopIdInput = document.getElementById('shop-id');
        const apiKeyInput = document.getElementById('api-key');
        const shopNameInput = document.getElementById('shop-name');
        const shopLocationInput = document.getElementById('shop-location');

        if (shopIdInput) shopIdInput.value = credentials.shopId || '';
        if (apiKeyInput) apiKeyInput.value = credentials.apiKey || '';
        if (shopNameInput) shopNameInput.value = credentials.shopName || '';
        if (shopLocationInput) shopLocationInput.value = credentials.shopLocation || '';
    }

    togglePasswordVisibility() {
        const apiKeyInput = document.getElementById('api-key');
        const toggleBtn = document.getElementById('toggle-api-key');
        const eyeIcon = toggleBtn.querySelector('.eye-icon');

        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        const langText = document.querySelector('.lang-text');
        if (langText) {
            langText.textContent = this.currentLanguage === 'ar' ? 'EN' : 'AR';
        }

        this.updateUIText();
        console.log('Language changed to:', this.currentLanguage);
    }

    updateUIText() {
        const translations = this.getTranslations();
        const texts = translations[this.currentLanguage] || translations.ar;

        // Update all elements with data-translate attribute
        Object.keys(texts).forEach(key => {
            const elements = document.querySelectorAll(`[data-translate="${key}"]`);
            elements.forEach(element => {
                element.textContent = texts[key];
            });
        });

        // Update placeholders
        const shopIdInput = document.getElementById('shop-id');
        const apiKeyInput = document.getElementById('api-key');
        const shopNameInput = document.getElementById('shop-name');
        const shopLocationInput = document.getElementById('shop-location');

        if (shopIdInput) shopIdInput.placeholder = texts['shop-id-placeholder'];
        if (apiKeyInput) apiKeyInput.placeholder = texts['api-key-placeholder'];
        if (shopNameInput) shopNameInput.placeholder = texts['shop-name-placeholder'];
        if (shopLocationInput) shopLocationInput.placeholder = texts['shop-location-placeholder'];

        // Update page title
        document.title = texts['page-title'];
    }

    getTranslations() {
        return {
            ar: {
                'signin-title': 'تسجيل الدخول',
                'signin-subtitle': 'نظام إدارة قطع غيار السيارات',
                'shop-id-label': 'معرف المتجر',
                'api-key-label': 'مفتاح API',
                'shop-name-label': 'اسم المتجر',
                'shop-location-label': 'موقع المتجر',
                'remember-me': 'تذكرني',
                'forgot-credentials': 'نسيت بيانات الدخول؟',
                'signin-btn': 'تسجيل الدخول',
                'signing-in': 'جاري تسجيل الدخول...',
                'or': 'أو',
                'demo-mode': 'استخدام الوضع التجريبي',
                'page-title': 'تسجيل الدخول - Clutch Auto Parts',
                'shop-id-placeholder': 'أدخل معرف المتجر',
                'api-key-placeholder': 'أدخل مفتاح API',
                'shop-name-placeholder': 'أدخل اسم المتجر',
                'shop-location-placeholder': 'أدخل موقع المتجر',
                'signin-success': 'تم تسجيل الدخول بنجاح!',
                'signin-error': 'حدث خطأ أثناء تسجيل الدخول',
                'demo-mode-activated': 'تم تفعيل الوضع التجريبي',
                'demo-mode-error': 'خطأ في تفعيل الوضع التجريبي',
                'connection-success': 'تم الاتصال بالخادم بنجاح',
                'connection-failed': 'فشل الاتصال بالخادم',
                'connection-error': 'خطأ في الاتصال بالخادم',
                'shop-id-required': 'معرف المتجر مطلوب',
                'api-key-required': 'مفتاح API مطلوب',
                'shop-name-required': 'اسم المتجر مطلوب',
                'shop-id-invalid': 'معرف المتجر غير صحيح',
                'api-key-too-short': 'مفتاح API قصير جداً'
            },
            en: {
                'signin-title': 'Sign In',
                'signin-subtitle': 'Auto Parts Management System',
                'shop-id-label': 'Shop ID',
                'api-key-label': 'API Key',
                'shop-name-label': 'Shop Name',
                'shop-location-label': 'Shop Location',
                'remember-me': 'Remember Me',
                'forgot-credentials': 'Forgot Credentials?',
                'signin-btn': 'Sign In',
                'signing-in': 'Signing In...',
                'or': 'or',
                'demo-mode': 'Use Demo Mode',
                'page-title': 'Sign In - Clutch Auto Parts',
                'shop-id-placeholder': 'Enter Shop ID',
                'api-key-placeholder': 'Enter API Key',
                'shop-name-placeholder': 'Enter Shop Name',
                'shop-location-placeholder': 'Enter Shop Location',
                'signin-success': 'Signed in successfully!',
                'signin-error': 'An error occurred during sign in',
                'demo-mode-activated': 'Demo mode activated',
                'demo-mode-error': 'Error activating demo mode',
                'connection-success': 'Connected to server successfully',
                'connection-failed': 'Failed to connect to server',
                'connection-error': 'Connection error',
                'shop-id-required': 'Shop ID is required',
                'api-key-required': 'API Key is required',
                'shop-name-required': 'Shop Name is required',
                'shop-id-invalid': 'Invalid Shop ID format',
                'api-key-too-short': 'API Key is too short'
            }
        };
    }

    getTranslation(key) {
        const translations = this.getTranslations();
        const texts = translations[this.currentLanguage] || translations.ar;
        return texts[key] || key;
    }

    initializeLanguage() {
        // Load saved language preference or default to Arabic
        const savedLanguage = localStorage.getItem('clutch_language') || 'ar';
        this.currentLanguage = savedLanguage;
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        const langText = document.querySelector('.lang-text');
        if (langText) {
            langText.textContent = this.currentLanguage === 'ar' ? 'EN' : 'AR';
        }

        this.updateUIText();
    }

    setLoading(loading) {
        this.isLoading = loading;
        const signinBtn = document.getElementById('signin-btn');
        const btnText = signinBtn.querySelector('.btn-text');
        const btnLoading = signinBtn.querySelector('.btn-loading');

        if (loading) {
            signinBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
        } else {
            signinBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }

    showMessage(type, message) {
        const messageContainer = document.getElementById('message-container');
        const messageElement = document.getElementById('message');
        const messageText = messageElement.querySelector('.message-text');
        const messageIcon = messageElement.querySelector('.message-icon');

        // Set message content
        messageText.textContent = message;
        messageElement.className = `message ${type}`;

        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        messageIcon.textContent = icons[type] || 'ℹ️';

        // Show message
        messageContainer.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.clearMessages();
        }, 5000);
    }

    clearMessages() {
        const messageContainer = document.getElementById('message-container');
        messageContainer.style.display = 'none';
    }

    handleForgotCredentials(event) {
        event.preventDefault();
        this.showMessage('info', this.getTranslation('forgot-credentials-info'));
    }

    redirectToMainApp() {
        // In a real application, this would redirect to the main app
        // For now, we'll show a success message
        window.location.href = 'index.html';
    }
}

// Initialize signin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SigninManager();
});

// Add CSS for input errors
const style = document.createElement('style');
style.textContent = `
    .form-input.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
    
    .input-error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        font-family: 'Cairo', sans-serif;
    }
    
    .message.info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
`;
document.head.appendChild(style);
