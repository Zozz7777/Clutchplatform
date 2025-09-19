'use client';

import { useLanguage } from '@/contexts/language-context';
import { getTranslations } from '@/lib/translations';

// Load translations using the robust translation loader
const { enTranslations, arTranslations } = getTranslations();

// Ensure translations are properly loaded
const ensureTranslations = () => {
  if (!enTranslations || !arTranslations) {
    console.error('Translation files not loaded properly');
    console.error('enTranslations:', enTranslations);
    console.error('arTranslations:', arTranslations);
    return false;
  }
  
  // Debug: Check if common.loading exists
  if (enTranslations && enTranslations.common && enTranslations.common.loading) {
    console.log('✅ common.loading found in en translations:', enTranslations.common.loading);
  } else {
    console.error('❌ common.loading NOT found in en translations');
    console.error('enTranslations.common:', enTranslations?.common);
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
    
    // Special debugging for common.loading
    if (key === 'common.loading') {
      console.log(`🔍 Looking for key "${key}" in ${language} translations`);
      console.log('Current translations object:', translations);
      console.log('common object:', translations.common);
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
        if (key === 'common.loading') {
          console.log(`✅ Found key "${k}", value:`, value);
        }
      } else {
        console.warn(`❌ Translation key "${key}" not found in ${language} translations`);
        console.warn(`Failed at key "${k}" in path "${key}"`);
        console.warn('Available keys at current level:', value ? Object.keys(value) : 'value is null/undefined');
        
        // Fallback for common keys
        if (key === 'common.loading') {
          return 'Loading...';
        }
        if (key === 'common.filter') {
          return 'Filter';
        }
        
        return key;
      }
    }
    
    const result = typeof value === 'string' ? value : key;
    if (key === 'common.loading') {
      console.log(`🎯 Final result for "${key}":`, result);
    }
    
    return result;
  };

  return { t, language };
}
