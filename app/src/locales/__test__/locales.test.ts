import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, MESSAGES, resolveLocale } from '../index';

describe('resolveLocale', () => {
  it('maps browser languages to supported locales', () => {
    expect(resolveLocale(['en-GB'])).toBe('en-US');
    expect(resolveLocale(['zh-CN'])).toBe('zh-Hans');
    expect(resolveLocale(['zh-Hans-CN'])).toBe('zh-Hans');
    expect(resolveLocale(['zh-TW'])).toBe('zh-Hant-TW');
    expect(resolveLocale(['zh-HK'])).toBe('zh-Hant-TW');
  });
  it('uses the first supported language', () => {
    expect(resolveLocale(['ja-JP', 'en-US'])).toBe('en-US');
  });
  it('falls back to the default locale', () => {
    expect(resolveLocale([])).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(['fr-FR'])).toBe(DEFAULT_LOCALE);
  });
});

describe('locale files', () => {
  it('have identical key sets', () => {
    const base = Object.keys(MESSAGES[DEFAULT_LOCALE]).sort();
    Object.values(MESSAGES).forEach(messages => {
      expect(Object.keys(messages).sort()).toEqual(base);
    });
  });
});
