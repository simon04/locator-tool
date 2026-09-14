<template>
  <a v-if="!profile?.username" class="btn btn-success icon-link ms-2" :href="loginURL">
    <DoorOpen />
    <span>{{ t('Log in') }}</span>
  </a>
  <span v-if="profile?.username" class="navbar-text ms-2">
    {{ msgLoggedIn }}
  </span>
  <a v-if="profile?.username" class="btn btn-secondary icon-link ms-2" :href="logoutURL">
    <DoorClosed />
    <span>{{ t('Log out') }}</span>
  </a>
</template>

<script setup lang="ts">
import DoorClosed from 'bootstrap-icons/icons/door-closed.svg?component';
import DoorOpen from 'bootstrap-icons/icons/door-open.svg?component';
import {computed} from 'vue';

import {useAuthLinks} from './useAuthLinks';
import {t} from './useI18n';
import {useProfile} from './useProfile';

const {loginURL, logoutURL} = useAuthLinks();
const profile = useProfile();
const msgLoggedIn = computed(() =>
  t('Logged in as {{$ctrl.user}}').replace('{{$ctrl.user}}', profile.value?.username ?? '')
);
</script>
