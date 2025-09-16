import { NAVIGATION_ITEMS } from './constants';

export function getTranslatedNavigationItems(t: (key: string) => string) {
  return NAVIGATION_ITEMS.map(item => ({
    ...item,
    title: t(`navigation.${item.title.toLowerCase().replace(/\s+/g, '')}`),
    children: item.children?.map(child => ({
      ...child,
      title: t(`navigation.${child.title.toLowerCase().replace(/\s+/g, '')}`),
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
