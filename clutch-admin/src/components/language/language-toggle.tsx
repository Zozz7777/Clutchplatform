'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { SnowButton } from '@/components/ui/snow-button'
import { Globe, Check } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'

const languages = locales.map(locale => ({
  code: locale,
  name: localeNames[locale],
  flag: localeFlags[locale]
}))

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('languages')

  const currentLanguage = languages.find(lang => lang.code === locale)

  const handleLanguageChange = (newLocale: Locale) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <SnowButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={t('switchLanguage')}
        title={t('switchLanguage')}
      >
        <Globe className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-300" />
        <span className="hidden sm:inline text-slate-700 dark:text-slate-200">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
      </SnowButton>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in slide-in-from-top">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code as Locale)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    locale === language.code 
                      ? 'text-clutch-primary dark:text-clutch-primary' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                  {locale === language.code && (
                    <Check className="h-4 w-4 text-clutch-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
