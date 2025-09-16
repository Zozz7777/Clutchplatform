import { NAVIGATION_ITEMS } from './constants';

export function getTranslatedNavigationItems(t: (key: string) => string) {
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
  return title.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]/g, '');
}
