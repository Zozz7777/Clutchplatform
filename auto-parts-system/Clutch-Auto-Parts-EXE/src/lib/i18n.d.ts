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
export declare class I18nManager {
    private config;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    t(key: string, options?: any): string;
    changeLanguage(lng: string): Promise<void>;
    getCurrentLanguage(): string;
    isRTL(): boolean;
    getDirection(): 'ltr' | 'rtl';
    formatCurrency(amount: number, currency?: string): string;
    formatDate(date: Date): string;
    formatDateTime(date: Date): string;
    formatNumber(number: number): string;
    getAvailableLanguages(): Array<{
        code: string;
        name: string;
        nativeName: string;
    }>;
}
export declare const i18nManager: I18nManager;
//# sourceMappingURL=i18n.d.ts.map