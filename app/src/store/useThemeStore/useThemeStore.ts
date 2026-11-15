import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { THEME_STORAGE_KEY } from '@/constants';

import type { TThemePreference } from '@/types';

interface IThemeStoreState {
  preference: TThemePreference;
  setPreference: (preference: TThemePreference) => void;
  reset: () => void;
}

const initialState = { preference: 'system' as TThemePreference };

/** localStorage 在無痕模式或被封鎖時可能丟錯，退回記憶體儲存 */
const safeStorage = createJSONStorage(() => {
  try {
    const probe = '__heic2jpg_probe__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      removeItem: (key: string) => void memory.delete(key)
    };
  }
});

export const useThemeStore = create<IThemeStoreState>()(
  persist(
    set => ({
      ...initialState,
      setPreference: preference => set({ preference }),
      reset: () => set(initialState)
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: safeStorage,
      partialize: state => ({ preference: state.preference })
    }
  )
);
