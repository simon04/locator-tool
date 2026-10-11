<template>
  <a v-if="!userInfo?.user" class="btn-solid theme-success ms-3" :href="loginURL()">
    <DoorOpen />
    <span>{{ t('Log in') }}</span>
  </a>
  <span v-if="userInfo?.user" class="navbar-text ms-3">
    {{ msgLoggedIn }}
  </span>
  <a v-if="userInfo?.user" class="btn-solid theme-secondary ms-3" :href="logoutURL()">
    <DoorClosed />
    <span>{{ t('Log out') }}</span>
  </a>
</template>

<script setup lang="ts">
import DoorClosed from 'bootstrap-icons/icons/door-closed.svg?component';
import DoorOpen from 'bootstrap-icons/icons/door-open.svg?component';
import {computed} from 'vue';

import {getUserInfo, loginURL, logoutURL} from '../api/ltDataAuth';
import {t} from './useI18n';

const {data: userInfo} = getUserInfo();
const msgLoggedIn = computed(() =>
  t('Logged in as {{$ctrl.user}}').replace('{{$ctrl.user}}', userInfo.value?.user || '')
);
</script>
