import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from '@/store';

import { useResolvedTheme } from '../useResolvedTheme';

type TListener = () => void;

const mockSystemTheme = (isDark: boolean) => {
  const listeners = new Set<TListener>();
  const state = { matches: isDark };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return state.matches;
      },
      addEventListener: (_: string, listener: TListener) => listeners.add(listener),
      removeEventListener: (_: string, listener: TListener) => listeners.delete(listener)
    }))
  );
  return {
    setDark: (value: boolean) => {
      state.matches = value;
      listeners.forEach(listener => listener());
    }
  };
};

describe('useResolvedTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => useThemeStore.getState().reset());
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('follows a light system theme by default', () => {
    mockSystemTheme(false);
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('follows a dark system theme and reacts to changes', () => {
    const system = mockSystemTheme(true);
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => system.setDark(false));
    expect(result.current).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('explicit preference overrides the system theme', () => {
    mockSystemTheme(false);
    const { result } = renderHook(() => useResolvedTheme());
    act(() => useThemeStore.getState().setPreference('dark'));
    expect(result.current).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
