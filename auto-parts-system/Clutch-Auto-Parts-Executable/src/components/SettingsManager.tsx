import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface Settings {
  general: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    currency: string;
    timezone: string;
    language: string;
  };
  inventory: {
    lowStockThreshold: number;
    autoReorder: boolean;
    barcodePrefix: string;
    defaultCategory: string;
  };
  sales: {
    defaultTaxRate: number;
    receiptFooter: string;
    printReceipt: boolean;
    allowDiscounts: boolean;
    maxDiscountPercent: number;
  };
  sync: {
    autoSync: boolean;
    syncInterval: number;
    clutchBackendUrl: string;
    apiKey: string;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number;
    backupLocation: string;
    maxBackups: number;
  };
}

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    general: {
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      language: 'ar'
    },
    inventory: {
      lowStockThreshold: 10,
      autoReorder: false,
      barcodePrefix: 'CLT',
      defaultCategory: ''
    },
    sales: {
      defaultTaxRate: 15,
      receiptFooter: '',
      printReceipt: true,
      allowDiscounts: true,
      maxDiscountPercent: 50
    },
    sync: {
      autoSync: true,
      syncInterval: 30,
      clutchBackendUrl: 'https://clutch-main-nk7x.onrender.com',
      apiKey: ''
    },
    backup: {
      autoBackup: true,
      backupInterval: 24,
      backupLocation: '',
      maxBackups: 30
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert(i18nManager.t('settings.saved'));
      } else {
        alert(i18nManager.t('settings.saveError'));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(i18nManager.t('settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: i18nManager.t('settings.general') },
    { id: 'inventory', label: i18nManager.t('settings.inventory') },
    { id: 'sales', label: i18nManager.t('settings.sales') },
    { id: 'sync', label: i18nManager.t('settings.sync') },
    { id: 'backup', label: i18nManager.t('settings.backup') }
  ];

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{i18nManager.t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">{i18nManager.t('settings.title')}</h1>
        <p className="settings-subtitle">{i18nManager.t('settings.subtitle')}</p>
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>{i18nManager.t('settings.general')}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{i18nManager.t('settings.businessName')}</label>
                <input
                  type="text"
                  value={settings.general.businessName}
                  onChange={(e) => handleInputChange('general', 'businessName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.businessAddress')}</label>
                <textarea
                  value={settings.general.businessAddress}
                  onChange={(e) => handleInputChange('general', 'businessAddress', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.businessPhone')}</label>
                <input
                  type="tel"
                  value={settings.general.businessPhone}
                  onChange={(e) => handleInputChange('general', 'businessPhone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.businessEmail')}</label>
                <input
                  type="email"
                  value={settings.general.businessEmail}
                  onChange={(e) => handleInputChange('general', 'businessEmail', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.currency')}</label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                >
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.language')}</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="settings-section">
            <h2>{i18nManager.t('settings.inventory')}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{i18nManager.t('settings.lowStockThreshold')}</label>
                <input
                  type="number"
                  value={settings.inventory.lowStockThreshold}
                  onChange={(e) => handleInputChange('inventory', 'lowStockThreshold', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.autoReorder')}</label>
                <input
                  type="checkbox"
                  checked={settings.inventory.autoReorder}
                  onChange={(e) => handleInputChange('inventory', 'autoReorder', e.target.checked)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.barcodePrefix')}</label>
                <input
                  type="text"
                  value={settings.inventory.barcodePrefix}
                  onChange={(e) => handleInputChange('inventory', 'barcodePrefix', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="settings-section">
            <h2>{i18nManager.t('settings.sales')}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{i18nManager.t('settings.defaultTaxRate')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.sales.defaultTaxRate}
                  onChange={(e) => handleInputChange('sales', 'defaultTaxRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.receiptFooter')}</label>
                <textarea
                  value={settings.sales.receiptFooter}
                  onChange={(e) => handleInputChange('sales', 'receiptFooter', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.printReceipt')}</label>
                <input
                  type="checkbox"
                  checked={settings.sales.printReceipt}
                  onChange={(e) => handleInputChange('sales', 'printReceipt', e.target.checked)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.allowDiscounts')}</label>
                <input
                  type="checkbox"
                  checked={settings.sales.allowDiscounts}
                  onChange={(e) => handleInputChange('sales', 'allowDiscounts', e.target.checked)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.maxDiscountPercent')}</label>
                <input
                  type="number"
                  value={settings.sales.maxDiscountPercent}
                  onChange={(e) => handleInputChange('sales', 'maxDiscountPercent', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="settings-section">
            <h2>{i18nManager.t('settings.sync')}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{i18nManager.t('settings.autoSync')}</label>
                <input
                  type="checkbox"
                  checked={settings.sync.autoSync}
                  onChange={(e) => handleInputChange('sync', 'autoSync', e.target.checked)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.syncInterval')}</label>
                <input
                  type="number"
                  value={settings.sync.syncInterval}
                  onChange={(e) => handleInputChange('sync', 'syncInterval', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.clutchBackendUrl')}</label>
                <input
                  type="url"
                  value={settings.sync.clutchBackendUrl}
                  onChange={(e) => handleInputChange('sync', 'clutchBackendUrl', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.apiKey')}</label>
                <input
                  type="password"
                  value={settings.sync.apiKey}
                  onChange={(e) => handleInputChange('sync', 'apiKey', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="settings-section">
            <h2>{i18nManager.t('settings.backup')}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{i18nManager.t('settings.autoBackup')}</label>
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.backupInterval')}</label>
                <input
                  type="number"
                  value={settings.backup.backupInterval}
                  onChange={(e) => handleInputChange('backup', 'backupInterval', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.backupLocation')}</label>
                <input
                  type="text"
                  value={settings.backup.backupLocation}
                  onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{i18nManager.t('settings.maxBackups')}</label>
                <input
                  type="number"
                  value={settings.backup.maxBackups}
                  onChange={(e) => handleInputChange('backup', 'maxBackups', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button 
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? i18nManager.t('settings.saving') : i18nManager.t('settings.save')}
        </button>
        <button 
          className="reset-btn"
          onClick={loadSettings}
        >
          {i18nManager.t('settings.reset')}
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
