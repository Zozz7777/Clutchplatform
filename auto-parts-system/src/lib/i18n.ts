import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { logger } from './logger';

export interface I18nConfig {
  lng: string;
  fallbackLng: string;
  debug: boolean;
  resources: {
    [key: string]: {
      translation: {
        [key: string]: any;
      };
    };
  };
}

export class I18nManager {
  private config: I18nConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      lng: 'ar',
      fallbackLng: 'en',
      debug: false,
      resources: {}
    };
  }

  async initialize(): Promise<void> {
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
    } catch (error) {
      logger.error('Failed to initialize i18n:', error);
      throw error;
    }
  }

  t(key: string, options?: any): string {
    if (!this.isInitialized) {
      return key;
    }
    return i18next.t(key, options);
  }

  changeLanguage(lng: string): Promise<void> {
    this.config.lng = lng;
    return i18next.changeLanguage(lng);
  }

  getCurrentLanguage(): string {
    return i18next.language;
  }

  isRTL(): boolean {
    return this.config.lng === 'ar';
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  formatCurrency(amount: number, currency: string = 'SAR'): string {
    const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: Date): string {
    const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatDateTime(date: Date): string {
    const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatNumber(number: number): string {
    const locale = this.config.lng === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
  }

  getAvailableLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }
}

// Create singleton instance
export const i18nManager = new I18nManager();
