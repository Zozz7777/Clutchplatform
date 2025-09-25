import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { PartnerIdForm } from '../types';

const PartnerIdPage: React.FC = () => {
  const [form, setForm] = useState<PartnerIdForm>({ partnerId: '' });
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const { validatePartnerId } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const result = await validatePartnerId(form);
      
      if (result.success) {
        // Store partner info and navigate to device registration
        navigate('/device-registration', { 
          state: { 
            partnerId: form.partnerId,
            partnerData: result.data 
          } 
        });
      } else {
        setError(result.error || t('errors.validationError'));
      }
    } catch (error) {
      setError(t('errors.networkError'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setForm({ partnerId: value });
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
            {t('auth.partnerId')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth.enterPartnerId')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder={t('auth.partnerId')}
              value={form.partnerId}
              onChange={handleInputChange}
              error={error}
              required
              disabled={isValidating}
              className="text-center text-lg"
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!form.partnerId || isValidating}
            loading={isValidating}
            className="w-full"
          >
            {isValidating ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t('auth.validatePartnerId')}
              </div>
            ) : (
              t('auth.validatePartnerId')
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('common.needHelp')} <a href="#" className="text-primary hover:underline">{t('common.contactSupport')}</a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PartnerIdPage;
