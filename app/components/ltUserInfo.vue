<template>
  <a v-if="!userInfo?.user" class="btn btn-success ms-2" :href="loginURL()">
    <svg class="octicon">
      <use xlink:href="#sign-in"></use>
    </svg>
    <span>{{ t('Log in') }}</span>
  </a>
  <span v-if="userInfo?.user" class="navbar-text ms-2">
    {{ msgLoggedIn }}
  </span>
  <a v-if="userInfo?.user" class="btn btn-secondary ms-2" :href="logoutURL()">
    <svg class="octicon">
      <use xlink:href="#sign-out"></use>
    </svg>
    <span>{{ t('Log out') }}</span>
  </a>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {getUserInfo, loginURL, logoutURL} from '../api/ltDataAuth';
import {t} from './useI18n';

const {data: userInfo} = getUserInfo();
const msgLoggedIn = computed(() =>
  t('Logged in as {{$ctrl.user}}').replace('{{$ctrl.user}}', userInfo.value?.user || '')
);
</script>
