<template>
  <select class="form-select" v-model="language">
    <option v-for="(label, key) in languages" :value="key">{{ label }}</option>
  </select>
  <span
    hidden="hidden"
    translate="translate"
    translate-comment="Your language in your language (e.g. 'English', 'Deutsch')"
  >
    LANGUAGE
  </span>
</template>

<script setup lang="ts">
import {useLocalStorage} from '@vueuse/core';
import i18n from '../i18n.json';

const languageCodes = [
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
  'pt',
  'ru',
  'uk',
  'zh_TW'
];

const languages = Object.fromEntries(languageCodes.map(lang => [lang, getDisplayString(lang)]));
const language = useLocalStorage('language', () =>
  navigator.languages.find(lang => languages[lang])
);

function getDisplayString(language: string): string {
  if (language === 'en') {
    return 'English';
  }
  const key = 'LANGUAGE';
  return i18n[language][key];
}
</script>
