'use client';

import { useLanguage } from '@/contexts/language-context';
import enTranslations from '@/messages/en.json';
import arTranslations from '@/messages/ar.json';

// Ensure translations are properly loaded
const ensureTranslations = () => {
  if (!enTranslations || !arTranslations) {
    console.error('Translation files not loaded properly');
    return false;
  }
  return true;
};

type TranslationKey = string;
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKeys = NestedKeyOf<typeof enTranslations>;

export function useTranslations() {
  const { language } = useLanguage();
  
  // Ensure translations are loaded
  if (!ensureTranslations()) {
    console.error('Translation files not available');
  }
  
  const translations = language === 'ar' ? arTranslations : enTranslations;

  const t = (key: TranslationKeys): string => {
    // Check if translations are available
    if (!translations) {
      console.error('Translations not available for language:', language);
      return key;
    }
    
    const keys = key.split('.');
    let value: Record<string, unknown> = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found in ${language} translations`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
