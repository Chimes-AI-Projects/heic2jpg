import { useEffect, useSyncExternalStore } from 'react';

import { DARK_MODE_MEDIA_QUERY } from '@/constants';
import { useThemeStore } from '@/store';

import type { TResolvedTheme } from '@/types';

const subscribeToSystemTheme = (onChange: () => void): (() => void) => {
  const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

const getSystemPrefersDark = (): boolean => window.matchMedia(DARK_MODE_MEDIA_QUERY).matches;

/** 依使用者偏好與系統設定算出實際主題，並同步到 <html class="dark"> */
export function useResolvedTheme(): TResolvedTheme {
  const preference = useThemeStore(state => state.preference);
  const isSystemDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark);
  const resolvedTheme: TResolvedTheme =
    preference === 'system' ? (isSystemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return resolvedTheme;
}
