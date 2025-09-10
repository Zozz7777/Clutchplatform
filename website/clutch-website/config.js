// ========================================
// CLUTCH MARKETING WEBSITE - CONFIGURATION
// ========================================

const CONFIG = {
    // Backend API Configuration
    BACKEND: {
        API_URL: 'https://clutch-main-nk7x.onrender.com',
        API_VERSION: 'v1',
        MARKETING_ENDPOINT: '/api/marketing/statistics',
        HEALTH_ENDPOINT: '/health',
        TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3
    },

    // Website Configuration
    WEBSITE: {
        NAME: 'Clutch',
        DESCRIPTION: 'The Future of Car Care',
        SLOGAN: 'Drive with Confidence',
        URL: 'https://www.yourclutch.com',
        VERSION: '1.0.0'
    },

    // Contact Form Configuration
    CONTACT: {
        EMAIL: 'ziad@yourclutch.com',
        FORMSPREE_ENDPOINT: 'https://formspree.io/f/xpwzgzqn',
        VALIDATION: {
            EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            PHONE_REGEX: /^(\+2|002|2)?01[0-9]{9}$|^(\+|00)?[1-9]\d{1,14}$/
        }
    },

    // Feature Flags
    FEATURES: {
        STATISTICS: true,
        CONTACT_FORM: true,
        LANGUAGE_SWITCHER: true,
        DYNAMIC_FAVICON: true,
        PERFORMANCE_MONITORING: true,
        ANALYTICS: true
    },

    // Animation & Performance
    ANIMATION: {
        STATISTICS_DURATION: 2000,
        SCROLL_THRESHOLD: 0.1,
        MOBILE_BREAKPOINT: 768,
        DESKTOP_BREAKPOINT: 1024
    },

    // Localization
    LANGUAGES: {
        DEFAULT: 'en',
        SUPPORTED: ['en', 'ar'],
        RTL_LANGUAGES: ['ar']
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        API_ERROR: 'Unable to fetch data from server.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        GENERIC_ERROR: 'Something went wrong. Please try again.'
    },

    // Success Messages
    SUCCESS: {
        FORM_SUBMITTED: 'Message sent successfully!',
        CONTACT_INFO: 'We\'ll get back to you soon at ziad@yourclutch.com'
    },

    // API Response Handling
    API: {
        SUCCESS_STATUS: 200,
        ERROR_STATUS: [400, 401, 403, 404, 500],
        TIMEOUT_MESSAGE: 'Request timed out. Please try again.'
    },

    // Analytics Configuration
    ANALYTICS: {
        GOOGLE_ANALYTICS_ID: 'G-RCTHXQVDNQ',
        ENABLED: true,
        TRACK_PAGE_VIEWS: true,
        TRACK_EVENTS: true,
        TRACK_FORM_SUBMISSIONS: true
    }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CONFIG.BACKEND.API_URL = 'http://localhost:5000';
    CONFIG.WEBSITE.URL = 'http://localhost:3001';
    CONFIG.FEATURES.ANALYTICS = false;
    CONFIG.FEATURES.PERFORMANCE_MONITORING = false;
}

// Production environment overrides
if (window.location.hostname === 'www.yourclutch.com' || window.location.hostname === 'yourclutch.com') {
    CONFIG.FEATURES.ANALYTICS = true;
    CONFIG.FEATURES.PERFORMANCE_MONITORING = true;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CLUTCH_CONFIG = CONFIG;
}
