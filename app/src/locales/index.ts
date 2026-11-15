import enUS from './en-US.json';
import zhHans from './zh-Hans.json';
import zhHantTW from './zh-Hant-TW.json';

export type TLocale = 'zh-Hant-TW' | 'zh-Hans' | 'en-US';

export const DEFAULT_LOCALE: TLocale = 'zh-Hant-TW';

export const MESSAGES: Record<TLocale, Record<string, string>> = {
  'zh-Hant-TW': zhHantTW,
  'zh-Hans': zhHans,
  'en-US': enUS
};

/** 依瀏覽器語系挑選支援的語言，未支援時回退到繁體中文 */
export function resolveLocale(languages: readonly string[]): TLocale {
  for (const language of languages) {
    const lower = language.toLowerCase();
    if (lower.startsWith('en')) return 'en-US';
    if (lower === 'zh-cn' || lower === 'zh-sg' || lower.startsWith('zh-hans')) return 'zh-Hans';
    if (lower.startsWith('zh')) return 'zh-Hant-TW';
  }
  return DEFAULT_LOCALE;
}
