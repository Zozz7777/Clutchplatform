'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useLanguage } from '@/contexts/language-context';

export function TranslationTest() {
  const { t } = useTranslations();
  const { language } = useLanguage();

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Translation Test</h3>
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>Sidebar Title:</strong> {t('sidebar.clutchAdmin')}</p>
        <p><strong>Navigation Dashboard:</strong> {t('navigation.dashboard')}</p>
        <p><strong>Header Search:</strong> {t('header.search')}</p>
        <p><strong>HR Title:</strong> {t('hr.title')}</p>
        <p><strong>Language English:</strong> {t('language.english')}</p>
      </div>
    </div>
  );
}
