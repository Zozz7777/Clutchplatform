import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { LoginForm } from '../types';

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    emailOrPhone: '',
    password: '',
    deviceId: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get device info from navigation state
    if (location.state?.deviceToken) {
      setForm(prev => ({ ...prev, deviceId: location.state.deviceToken }));
    } else {
      navigate('/device-registration');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const result = await login(form);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || t('errors.authenticationError'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // For now, accept any 6-digit OTP
      if (otp.length === 6 && /^\d{6}$/.test(otp)) {
        navigate('/dashboard');
      } else {
        setError('رمز OTP غير صحيح');
      }
    } catch (error) {
      setError(t('errors.authenticationError'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (showOTP) {
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
              {t('auth.verifyOTP')}
            </h1>
            <p className="text-muted-foreground">
              أدخل رمز التحقق المرسل إليك
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder={t('auth.enterOTP')}
                value={otp}
                onChange={setOtp}
                required
                disabled={isLoggingIn}
                className="text-center text-lg tracking-widest"
                maxLength={6}
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
              disabled={otp.length !== 6 || isLoggingIn}
              loading={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('auth.verifyOTP')}
                </div>
              ) : (
                t('auth.verifyOTP')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => setShowOTP(false)}
              className="text-sm"
            >
              {t('common.back')}
            </Button>
            <p className="text-sm text-muted-foreground">
              لم تستلم الرمز؟ <button className="text-primary hover:underline">{t('auth.resendOTP')}</button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

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
            {t('auth.login')}
          </h1>
          <p className="text-muted-foreground">
            تسجيل الدخول إلى نظام الشركاء
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder={t('auth.emailOrPhone')}
              value={form.emailOrPhone}
              onChange={(value) => handleInputChange('emailOrPhone', value)}
              required
              disabled={isLoggingIn}
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder={t('auth.password')}
              value={form.password}
              onChange={(value) => handleInputChange('password', value)}
              required
              disabled={isLoggingIn}
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
            disabled={!form.emailOrPhone || !form.password || isLoggingIn}
            loading={isLoggingIn}
            className="w-full"
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t('auth.login')}
              </div>
            ) : (
              t('auth.login')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => setShowOTP(true)}
            className="text-sm"
          >
            {t('auth.loginWithOTP')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('auth.forgotPassword')}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/device-registration')}
            className="text-sm"
          >
            {t('common.back')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
