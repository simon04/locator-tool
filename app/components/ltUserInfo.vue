<template>
  <button
    type="button"
    v-if="!userInfo?.user"
    class="btn-solid theme-success ms-3"
    @click="login()"
  >
    <DoorOpen />
    <span>{{ t('Log in') }}</span>
  </button>
  <span v-if="userInfo?.user" class="navbar-text ms-3">
    {{ msgLoggedIn }}
  </span>
  <button
    type="button"
    v-if="userInfo?.user"
    class="btn-solid theme-secondary ms-3"
    @click="logout()"
  >
    <DoorClosed />
    <span>{{ t('Log out') }}</span>
  </button>
</template>

<script setup lang="ts">
import DoorClosed from 'bootstrap-icons/icons/door-closed.svg?component';
import DoorOpen from 'bootstrap-icons/icons/door-open.svg?component';
import {computed} from 'vue';

import {getUserInfo, login, logout} from '../api/ltDataAuth';
import {t} from './useI18n';

const {data: userInfo} = getUserInfo();
const msgLoggedIn = computed(() =>
  t('Logged in as {{$ctrl.user}}').replace('{{$ctrl.user}}', userInfo.value?.user || '')
);
</script>
