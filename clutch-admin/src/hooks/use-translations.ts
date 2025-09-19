'use client';

import { useLanguage } from '@/contexts/language-context';
import { getTranslations } from '@/lib/translations';

// Load translations using the robust translation loader
const { enTranslations, arTranslations } = getTranslations();

// Ensure translations are properly loaded
const ensureTranslations = () => {
  if (!enTranslations || !arTranslations) {
    // Translation files not loaded properly
    return false;
  }
  
  // Debug: Check if common.loading exists
  if (enTranslations && enTranslations.common && enTranslations.common.loading) {
    // common.loading found in en translations
  } else {
    // common.loading NOT found in en translations
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
    // Translation files not available
  }
  
  const translations = language === 'ar' ? arTranslations : enTranslations;

  const t = (key: TranslationKeys): string => {
    // Check if translations are available
    if (!translations) {
      // Translations not available for language
      return key;
    }
    
    const keys = key.split('.');
    let value: Record<string, unknown> = translations;
    
    // Special debugging for common.loading
    if (key === 'common.loading') {
      // Looking for key in translations
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
        if (key === 'common.loading') {
          // Found key
        }
      } else {
        // Translation key not found
        
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
