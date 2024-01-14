<template>
  <select v-model="language" class="form-select">
    <option v-for="(label, key) in languages" :key="key" :value="key">{{ label }}</option>
  </select>
  <span
    hidden="hidden"
    translate-comment="Your language in your language (e.g. 'English', 'Deutsch')"
  >
    {{ t('LANGUAGE') }}
  </span>
</template>

<script setup lang="ts">
import {language, languages, t} from './useI18n';
</script>
