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
      permission_denied: 'You do not have permission to perform this action.',
      // Additional translations
      cart: 'Cart',
      items: 'Items',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      cash: 'Cash',
      visa: 'Visa',
      instapay: 'InstaPay',
      wallet: 'Wallet',
      process_sale: 'Process Sale',
      search_products: 'Search Products',
      scan_barcode: 'Scan Barcode',
      walk_in_customer: 'Walk-in Customer',
      customer: 'Customer',
      payment_method: 'Payment Method',
      add_customer: 'Add Customer',
      search_customers: 'Search Customers',
      loyalty_members: 'Loyalty Members',
      credit_customers: 'Credit Customers',
      total_loyalty_points: 'Total Loyalty Points',
      member_since: 'Member Since',
      actions: 'Actions',
      add_supplier: 'Add Supplier',
      search_suppliers: 'Search Suppliers',
      total_suppliers: 'Total Suppliers',
      active_suppliers: 'Active Suppliers',
      pending_orders: 'Pending Orders',
      total_orders: 'Total Orders',
      contact_person: 'Contact Person',
      payment_terms: 'Payment Terms',
      export_excel: 'Export Excel',
      import_excel: 'Import Excel',
      export_pdf: 'Export PDF',
      to: 'to',
      financial: 'Financial',
      insights: 'Insights',
      demand_forecasting: 'Demand Forecasting',
      pricing_optimization: 'Pricing Optimization',
      inventory_optimization: 'Inventory Optimization',
      customer_insights: 'Customer Insights',
      generate_forecast: 'Generate Forecast',
      optimize_prices: 'Optimize Prices',
      optimize_inventory: 'Optimize Inventory',
      generate_insights: 'Generate Insights',
      general_settings: 'General Settings',
      company_name: 'Company Name',
      company_address: 'Company Address',
      company_phone: 'Company Phone',
      company_email: 'Company Email',
      business_settings: 'Business Settings',
      tax_rate: 'Tax Rate',
      currency: 'Currency',
      timezone: 'Timezone',
      sync_settings: 'Sync Settings',
      auto_sync_interval: 'Auto Sync Interval',
      clutch_backend_url: 'Clutch Backend URL',
      test_connection: 'Test Connection',
      sync_now: 'Sync Now',
      backup_settings: 'Backup Settings',
      auto_backup_interval: 'Auto Backup Interval',
      create_backup: 'Create Backup',
      restore_backup: 'Restore Backup',
      save_settings: 'Save Settings',
      reset_settings: 'Reset Settings',
      sku: 'SKU',
      category: 'Category',
      brand: 'Brand',
      cost_price: 'Cost Price',
      all_categories: 'All Categories',
      all_brands: 'All Brands',
      total_products: 'Total Products',
      low_stock_items: 'Low Stock Items',
      out_of_stock: 'Out of Stock',
      total_value: 'Total Value',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      loyalty_points: 'Loyalty Points',
      credit_limit: 'Credit Limit',
      current_credit: 'Current Credit',
      loading: 'Loading...',
      saving: 'Saving...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm_delete: 'Are you sure you want to delete this item?',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
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
      permission_denied: 'ليس لديك الإذن للقيام بهذا الإجراء.',
      // Additional translations
      cart: 'السلة',
      items: 'العناصر',
      subtotal: 'المجموع الفرعي',
      tax: 'الضريبة',
      total: 'المجموع',
      cash: 'نقداً',
      visa: 'فيزا',
      instapay: 'إنستاباي',
      wallet: 'محفظة',
      process_sale: 'معالجة البيع',
      search_products: 'البحث في المنتجات',
      scan_barcode: 'مسح الباركود',
      walk_in_customer: 'عميل عابر',
      customer: 'العميل',
      payment_method: 'طريقة الدفع',
      add_customer: 'إضافة عميل',
      search_customers: 'البحث في العملاء',
      loyalty_members: 'أعضاء الولاء',
      credit_customers: 'عملاء الائتمان',
      total_loyalty_points: 'إجمالي نقاط الولاء',
      member_since: 'عضو منذ',
      actions: 'الإجراءات',
      add_supplier: 'إضافة مورد',
      search_suppliers: 'البحث في الموردين',
      total_suppliers: 'إجمالي الموردين',
      active_suppliers: 'الموردين النشطين',
      pending_orders: 'الطلبات المعلقة',
      total_orders: 'إجمالي الطلبات',
      contact_person: 'الشخص المسؤول',
      payment_terms: 'شروط الدفع',
      export_excel: 'تصدير إكسل',
      import_excel: 'استيراد إكسل',
      export_pdf: 'تصدير PDF',
      to: 'إلى',
      sales: 'المبيعات',
      inventory: 'المخزون',
      customers: 'العملاء',
      suppliers: 'الموردون',
      financial: 'المالية',
      insights: 'الرؤى',
      demand_forecasting: 'توقع الطلب',
      pricing_optimization: 'تحسين الأسعار',
      inventory_optimization: 'تحسين المخزون',
      customer_insights: 'رؤى العملاء',
      generate_forecast: 'إنشاء توقع',
      optimize_prices: 'تحسين الأسعار',
      optimize_inventory: 'تحسين المخزون',
      generate_insights: 'إنشاء رؤى',
      general_settings: 'الإعدادات العامة',
      company_name: 'اسم الشركة',
      company_address: 'عنوان الشركة',
      company_phone: 'هاتف الشركة',
      company_email: 'بريد الشركة',
      business_settings: 'إعدادات العمل',
      tax_rate: 'معدل الضريبة',
      currency: 'العملة',
      timezone: 'المنطقة الزمنية',
      sync_settings: 'إعدادات المزامنة',
      auto_sync_interval: 'فترة المزامنة التلقائية',
      clutch_backend_url: 'رابط خادم كلتش',
      test_connection: 'اختبار الاتصال',
      sync_now: 'مزامنة الآن',
      backup_settings: 'إعدادات النسخ الاحتياطي',
      auto_backup_interval: 'فترة النسخ الاحتياطي التلقائي',
      create_backup: 'إنشاء نسخة احتياطية',
      restore_backup: 'استعادة نسخة احتياطية',
      save_settings: 'حفظ الإعدادات',
      reset_settings: 'إعادة تعيين الإعدادات',
      sku: 'رمز المنتج',
      category: 'الفئة',
      brand: 'العلامة التجارية',
      cost_price: 'سعر التكلفة',
      selling_price: 'سعر البيع',
      all_categories: 'جميع الفئات',
      all_brands: 'جميع العلامات التجارية',
      total_products: 'إجمالي المنتجات',
      low_stock_items: 'عناصر المخزون المنخفض',
      out_of_stock: 'نفد المخزون',
      total_value: 'القيمة الإجمالية',
      name: 'الاسم',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      loyalty_points: 'نقاط الولاء',
      credit_limit: 'حد الائتمان',
      current_credit: 'الائتمان الحالي',
      loading: 'جاري التحميل...',
      saving: 'جاري الحفظ...',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      confirm_delete: 'هل أنت متأكد من حذف هذا العنصر؟',
      error: 'خطأ',
      success: 'نجح',
      warning: 'تحذير',
      info: 'معلومات'
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
