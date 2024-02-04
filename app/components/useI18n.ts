import {useLocalStorage} from '@vueuse/core';
import i18n from '../i18n.json';

export const languageCodes = [
  'bn',
  'cs',
  'de',
  'en',
  'es',
  'fa_IR',
  'fr',
  'it',
  'ja',
  'mk',
  'ml',
  'nl',
  'pt',
  'ru',
  'uk',
  'zh_TW'
] as const;
type Language = (typeof languageCodes)[number];

export const languages = Object.fromEntries(
  languageCodes.map(lang => [lang, lang === 'en' ? 'English' : i18n[lang]['LANGUAGE']])
);

export const language = useLocalStorage<Language>(
  'language',
  () =>
    navigator.languages
      .map(lang =>
        languages[lang]
          ? (lang as Language)
          : languages[lang.slice(0, 2)]
          ? (lang.slice(0, 2) as Language)
          : lang.startsWith('en')
          ? 'en'
          : undefined
      )
      .find(lang => !!lang) ?? 'en'
);

const templateRe = /\{ *([\w_ -]+) *\}/g;

type I18nCatalog = (typeof i18n)['de'];

export function t(key: keyof I18nCatalog, values?: Record<string, string>): string {
  const msg = language.value === 'en' ? key : (i18n[language.value] as I18nCatalog)[key] ?? key;
  if (typeof msg === 'object') {
    // key === 'Depth'
    // translate-context
    return msg['Category'];
  }
  if (typeof values !== 'object') return msg;
  return msg.replace(templateRe, (_, match) => values[match]);
}
