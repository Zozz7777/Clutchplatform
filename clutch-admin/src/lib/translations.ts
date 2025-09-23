// Translation loader utility
import enTranslations from '@/messages/en.json';
import arTranslations from '@/messages/ar.json';

export const getTranslations = (language: 'en' | 'ar') => {
  return language === 'ar' ? arTranslations : enTranslations;
};

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};