// src/client/i18n.ts - Client-side i18n manager
export class ClientI18nManager {
  private currentLanguage: string = 'en';
  private translations: Record<string, Record<string, string>> = {
    en: {
      welcome: 'Welcome to Clutch Auto Parts System',
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      sales: 'Sales',
      customers: 'Customers',
      suppliers: 'Suppliers',
      reports: 'Reports',
      ai: 'AI/ML',
      settings: 'Settings',
      login: 'Login',
      username: 'Username',
      password: 'Password',
      logout: 'Logout',
      product_name: 'Product Name',
      stock_quantity: 'Stock Quantity',
      selling_price: 'Selling Price',
      add_product: 'Add Product',
      edit_product: 'Edit Product',
      delete_product: 'Delete Product',
      total_sales: 'Total Sales',
      total_customers: 'Total Customers',
      low_stock_alerts: 'Low Stock Alerts',
      tax_shortcut_applied: 'Tax shortcut applied',
      permission_denied: 'You do not have permission to perform this action.'
    },
    ar: {
      welcome: 'أهلاً بك في نظام كلتش لقطع غيار السيارات',
      dashboard: 'لوحة القيادة',
      inventory: 'المخزون',
      sales: 'المبيعات',
      customers: 'العملاء',
      suppliers: 'الموردون',
      reports: 'التقارير',
      ai: 'الذكاء الاصطناعي',
      settings: 'الإعدادات',
      login: 'تسجيل الدخول',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      logout: 'تسجيل الخروج',
      product_name: 'اسم المنتج',
      stock_quantity: 'الكمية المتوفرة',
      selling_price: 'سعر البيع',
      add_product: 'إضافة منتج',
      edit_product: 'تعديل منتج',
      delete_product: 'حذف منتج',
      total_sales: 'إجمالي المبيعات',
      total_customers: 'إجمالي العملاء',
      low_stock_alerts: 'تنبيهات المخزون المنخفض',
      tax_shortcut_applied: 'تم تطبيق اختصار الضريبة',
      permission_denied: 'ليس لديك الإذن للقيام بهذا الإجراء.'
    }
  };

  async initialize(): Promise<void> {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('clutch-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
    
    // Set initial direction
    this.updateDirection();
  }

  t(key: string, options?: any): string {
    const translation = this.translations[this.currentLanguage]?.[key];
    return translation || key;
  }

  async changeLanguage(lng: string): Promise<void> {
    if (this.translations[lng]) {
      this.currentLanguage = lng;
      localStorage.setItem('clutch-language', lng);
      this.updateDirection();
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  private updateDirection(): void {
    document.body.classList.toggle('rtl', this.isRTL());
    document.documentElement.setAttribute('dir', this.getDirection());
  }

  formatCurrency(amount: number, currency: string = 'SAR'): string {
    const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: Date): string {
    const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatDateTime(date: Date): string {
    const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatNumber(number: number): string {
    const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
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
export const i18nManager = new ClientI18nManager();
