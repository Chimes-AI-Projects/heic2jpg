import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY } from '@/constants';

import { useThemeStore } from '../useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    act(() => useThemeStore.getState().reset());
    localStorage.clear();
  });

  it('defaults to following the system', () => {
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('updates the preference', () => {
    act(() => useThemeStore.getState().setPreference('dark'));
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('persists the preference to localStorage', () => {
    act(() => useThemeStore.getState().setPreference('light'));
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}');
    expect(saved.state).toEqual({ preference: 'light' });
  });

  it('reset returns to system', () => {
    act(() => useThemeStore.getState().setPreference('dark'));
    act(() => useThemeStore.getState().reset());
    expect(useThemeStore.getState().preference).toBe('system');
  });
});
