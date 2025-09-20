import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { logger } from './logger';
export class I18nManager {
    constructor() {
        this.isInitialized = false;
        this.config = {
            lng: 'ar',
            fallbackLng: 'en',
            debug: false,
            resources: {}
        };
    }
    async initialize() {
        try {
            await i18next
                .use(Backend)
                .init({
                lng: this.config.lng,
                fallbackLng: this.config.fallbackLng,
                debug: this.config.debug,
                backend: {
                    loadPath: './src/locales/{{lng}}/{{ns}}.json'
                },
                interpolation: {
                    escapeValue: false
                },
                resources: this.config.resources
            });
            this.isInitialized = true;
            logger.info(`I18n initialized with language: ${this.config.lng}`);
        }
        catch (error) {
            logger.error('Failed to initialize i18n:', error);
            throw error;
        }
    }
    t(key, options) {
        if (!this.isInitialized) {
            return key;
        }
        const result = i18next.t(key, options);
        return typeof result === 'string' ? result : key;
    }
    async changeLanguage(lng) {
        this.config.lng = lng;
        await i18next.changeLanguage(lng);
    }
    getCurrentLanguage() {
        return i18next.language;
    }
    isRTL() {
        return this.config.lng === 'ar';
    }
    getDirection() {
        return this.isRTL() ? 'rtl' : 'ltr';
    }
    formatCurrency(amount, currency = 'EGP') {
        const locale = this.config.lng === 'ar' ? 'ar-EG' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }
    formatDate(date) {
        const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
    formatDateTime(date) {
        const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    formatNumber(number) {
        const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.NumberFormat(locale).format(number);
    }
    getAvailableLanguages() {
        return [
            { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
            { code: 'en', name: 'English', nativeName: 'English' }
        ];
    }
}
// Create singleton instance
export const i18nManager = new I18nManager();
//# sourceMappingURL=i18n.js.map