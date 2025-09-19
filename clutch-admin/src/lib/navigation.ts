import { NAVIGATION_ITEMS } from './constants';

export function getTranslatedNavigationItems(t: (key: any) => string) {
  return NAVIGATION_ITEMS.map(item => ({
    ...item,
    title: t(`navigation.${titleToTranslationKey(item.title)}`),
    children: item.children?.map(child => ({
      ...child,
      title: t(`navigation.${titleToTranslationKey(child.title)}`),
    }))
  }));
}

// Helper function to convert title to translation key
export function titleToTranslationKey(title: string): string {
  // Convert to camelCase format to match translation keys
  return title
    .replace(/&/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}
