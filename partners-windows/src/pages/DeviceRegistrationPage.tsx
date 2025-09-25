import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { DeviceRegistrationForm } from '../types';

const DeviceRegistrationPage: React.FC = () => {
  const [form, setForm] = useState<DeviceRegistrationForm>({
    deviceId: '',
    deviceName: '',
    deviceType: 'windows_desktop',
    platform: 'windows',
    version: '1.0.0',
    partnerId: ''
  });
  const [error, setError] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { registerDevice } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get partner info from navigation state
    if (location.state?.partnerId) {
      setForm(prev => ({ ...prev, partnerId: location.state.partnerId }));
    } else {
      navigate('/partner-id');
    }

    // Generate device ID
    const deviceId = `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setForm(prev => ({ ...prev, deviceId }));

    // Get system info
    const getSystemInfo = async () => {
      try {
        const appInfo = await window.electronAPI.getAppInfo();
        setForm(prev => ({
          ...prev,
          deviceName: `${appInfo.platform} ${appInfo.arch} - ${appInfo.name}`,
          version: appInfo.version
        }));
      } catch (error) {
        console.error('Failed to get system info:', error);
      }
    };

    getSystemInfo();
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRegistering(true);

    try {
      const result = await registerDevice(form);
      
      if (result.success) {
        // Store device token and navigate to login
        navigate('/login', { 
          state: { 
            partnerId: form.partnerId,
            deviceToken: result.data?.deviceToken 
          } 
        });
      } else {
        setError(result.error || t('errors.operationFailed'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInputChange = (field: keyof DeviceRegistrationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/assets/logos/logo-red.png" 
            alt="Clutch Partners" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('auth.deviceRegistration')}
          </h1>
          <p className="text-muted-foreground">
            تسجيل الجهاز مع حساب الشريك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.deviceName')}
            </label>
            <Input
              type="text"
              placeholder={t('auth.deviceName')}
              value={form.deviceName}
              onChange={(value) => handleInputChange('deviceName', value)}
              required
              disabled={isRegistering}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.deviceType')}
            </label>
            <select
              value={form.deviceType}
              onChange={(e) => handleInputChange('deviceType', e.target.value)}
              disabled={isRegistering}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="windows_desktop">Windows Desktop</option>
              <option value="android_tablet">Android Tablet</option>
              <option value="ios_tablet">iOS Tablet</option>
              <option value="pos_terminal">POS Terminal</option>
              <option value="kiosk">Kiosk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.platform')}
            </label>
            <select
              value={form.platform}
              onChange={(e) => handleInputChange('platform', e.target.value)}
              disabled={isRegistering}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="windows">Windows</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="linux">Linux</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('auth.version')}
            </label>
            <Input
              type="text"
              placeholder={t('auth.version')}
              value={form.version}
              onChange={(value) => handleInputChange('version', value)}
              required
              disabled={isRegistering}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!form.deviceName || !form.version || isRegistering}
            loading={isRegistering}
            className="w-full"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t('auth.registerDevice')}
              </div>
            ) : (
              t('auth.registerDevice')
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/partner-id')}
            className="text-sm"
          >
            {t('common.back')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeviceRegistrationPage;
