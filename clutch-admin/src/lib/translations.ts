// Translation loader utility
import enTranslations from '@/messages/en.json';
import arTranslations from '@/messages/ar.json';

export const getTranslations = (language: 'en' | 'ar') => {
  const translations = language === 'ar' ? arTranslations : enTranslations;
  console.log(`getTranslations called for ${language}:`, {
    hasVendorManagement: !!translations.vendorManagement,
    allKeys: Object.keys(translations),
    enTranslationsKeys: Object.keys(enTranslations),
    arTranslationsKeys: Object.keys(arTranslations)
  });
  return translations;
};

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};