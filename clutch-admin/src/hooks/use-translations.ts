'use client';

import { useLanguage } from '@/contexts/language-context';
import enTranslations from '@/messages/en.json';
import arTranslations from '@/messages/ar.json';

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
  
  const translations = language === 'ar' ? arTranslations : enTranslations;

  const t = (key: TranslationKeys): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
