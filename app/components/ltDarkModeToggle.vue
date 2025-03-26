<template>
  <button class="btn" title="Light/Dark Mode" @click="toggleDark()">
    <SunFillIcon v-if="isDark" />
    <MoonStarsFillIcon v-else />
  </button>
</template>
<script setup lang="ts">
import {useDark, useToggle} from '@vueuse/core';
import MoonStarsFillIcon from 'bootstrap-icons/icons/moon-stars-fill.svg?component';
import SunFillIcon from 'bootstrap-icons/icons/sun-fill.svg?component';

// https://getbootstrap.com/docs/5.3/customize/color-modes/
const isDark = useDark({
  selector: 'body',
  attribute: 'data-bs-theme',
  valueDark: 'dark',
  valueLight: 'light'
});
const toggleDark = useToggle(isDark);
</script>
