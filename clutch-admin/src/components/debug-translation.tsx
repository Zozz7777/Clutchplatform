'use client';

import { useLanguage } from '@/contexts/language-context';

export function DebugTranslation() {
  const { t, language } = useLanguage();
  
  // Test basic translation
  const testKey = 'vendorManagement.title';
  const result = t(testKey);
  
  console.log('Debug Translation Test:', {
    language,
    testKey,
    result,
    resultType: typeof result,
    isString: typeof result === 'string',
    isObject: typeof result === 'object'
  });
  
  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h3>Translation Debug</h3>
      <p>Language: {language}</p>
      <p>Test Key: {testKey}</p>
      <p>Result: {String(result)}</p>
      <p>Type: {typeof result}</p>
    </div>
  );
}
