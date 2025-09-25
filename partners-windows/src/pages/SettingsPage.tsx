import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { AppSettings } from '../types';
import { 
  CogIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  DevicePhoneMobileIcon,
  // GlobeAltIcon,
  // BellIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    partner_id: '',
    business_name: '',
    currency: 'EGP',
    language: 'ar',
    theme: 'light',
    sync_interval: '30',
    auto_sync: '1',
    offline_mode: '1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'system' | 'users'>('general');
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.dbQuery('SELECT key, value FROM settings');
      const settingsObj = result.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load settings:', error); }
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      for (const [key, value] of Object.entries(settings)) {
        await window.electronAPI.dbExec(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [key, value]
        );
      }

      // Update language if changed
      if (settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
        document.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      }

      await window.electronAPI.showNotification({
        title: 'تم حفظ الإعدادات',
        body: 'تم حفظ الإعدادات بنجاح',
        urgency: 'normal'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to save settings:', error); }
      await window.electronAPI.showNotification({
        title: 'فشل حفظ الإعدادات',
        body: 'حدث خطأ أثناء حفظ الإعدادات',
        urgency: 'critical'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const syncData = async () => {
    try {
      setIsSaving(true);
      
      const syncStatus = await window.electronAPI.syncStatus();
      
      if (syncStatus.isOnline) {
        await window.electronAPI.syncPush([]);
        await window.electronAPI.showNotification({
          title: 'تمت المزامنة',
          body: 'تم مزامنة البيانات بنجاح',
          urgency: 'normal'
        });
      } else {
        await window.electronAPI.showNotification({
          title: 'غير متصل',
          body: 'لا يمكن المزامنة - تحقق من الاتصال بالإنترنت',
          urgency: 'critical'
        });
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: CogIcon },
    { id: 'business', label: 'العمل', icon: BuildingOfficeIcon },
    { id: 'system', label: 'النظام', icon: DevicePhoneMobileIcon },
    { id: 'users', label: 'المستخدمون', icon: UserIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={syncData} disabled={isSaving}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            مزامنة البيانات
          </Button>
          <Button variant="primary" onClick={saveSettings} disabled={isSaving} loading={isSaving}>
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('settings.generalSettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اللغة</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المظهر</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="light">فاتح</option>
                  <option value="dark">داكن</option>
                  <option value="auto">تلقائي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">العملة</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title={t('settings.systemInfo')}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">معرف الشريك:</span>
                <span className="font-medium">{settings.partner_id || 'غير محدد'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">المستخدم الحالي:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الدور:</span>
                <span className="font-medium">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الإصدار:</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'business' && (
        <Card title={t('settings.businessSettings')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم العمل</label>
              <Input
                value={settings.business_name}
                onChange={(value) => handleSettingChange('business_name', value)}
                placeholder={t('settings.businessName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">معرف الشريك</label>
              <Input
                value={settings.partner_id}
                onChange={(value) => handleSettingChange('partner_id', value)}
                placeholder={t('settings.partnerId')}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">العملة الافتراضية</label>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('settings.syncSettings')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">فترة المزامنة (دقيقة)</label>
                <Input
                  type="number"
                  value={settings.sync_interval}
                  onChange={(value) => handleSettingChange('sync_interval', value)}
                  placeholder="30"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">المزامنة التلقائية</span>
                <select
                  value={settings.auto_sync}
                  onChange={(e) => handleSettingChange('auto_sync', e.target.value)}
                  className="px-3 py-1 border border-border rounded bg-background text-foreground"
                >
                  <option value="1">مفعلة</option>
                  <option value="0">معطلة</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الوضع غير المتصل</span>
                <select
                  value={settings.offline_mode}
                  onChange={(e) => handleSettingChange('offline_mode', e.target.value)}
                  className="px-3 py-1 border border-border rounded bg-background text-foreground"
                >
                  <option value="1">مفعل</option>
                  <option value="0">معطل</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title={t('settings.systemStatus')}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">حالة الاتصال:</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  متصل
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر مزامنة:</span>
                <span className="text-sm">منذ 5 دقائق</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">العمليات المعلقة:</span>
                <span className="text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">العمليات الفاشلة:</span>
                <span className="text-sm">0</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card title={t('settings.userManagement')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{user?.username}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.role}</p>
                <p className="text-sm text-muted-foreground">نشط</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">الصلاحيات</h4>
              <div className="grid grid-cols-2 gap-2">
                {user?.permissions?.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 text-success mr-2" />
                    <span className="text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <Button variant="destructive" onClick={logout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
