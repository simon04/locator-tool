<template>
  <h2 v-if="!userInfo?.user" class="mt-4">{{ t('Sign in') }}</h2>
  <p v-if="!userInfo?.user">
    <span>
      {{ t('In order to allow locator-tool to modify file description pages, sign in first:') }}
    </span>
    <a class="btn btn-success icon-link ms-2" :href="loginURL()">
      <DoorOpen />
      <span>{{ t('Log in') }}</span>
    </a>
  </p>
  <p v-if="userInfo?.user" class="mt-4">{{ msgLoggedIn }}</p>
  <h2>{{ t('Select files to geolocate') }}</h2>
  <ul class="nav nav-pills my-3">
    <li class="nav-item">
      <button
        class="nav-link"
        :class="{active: $tab === Tab.CATEGORY}"
        @click="$tab = Tab.CATEGORY"
      >
        {{ t('Category') }}
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" :class="{active: $tab === Tab.USER}" @click="$tab = Tab.USER">
        {{ t('User files') }}
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" :class="{active: $tab === Tab.FILES}" @click="$tab = Tab.FILES">
        {{ t('File list') }}
      </button>
    </li>
  </ul>

  <LtFilesSelectorForUser v-show="$tab === Tab.USER" />
  <LtFilesSelectorForCategory v-show="$tab === Tab.CATEGORY" />
  <LtFilesSelectorForFiles v-show="$tab === Tab.FILES" />
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {getUserInfo, loginURL} from '../api/ltDataAuth';
import {t} from './useI18n';
import DoorOpen from 'bootstrap-icons/icons/door-open.svg?component';
import {useLtRoute} from './useLtRoute';
import LtFilesSelectorForUser from './ltFilesSelectorForUser.vue';
import LtFilesSelectorForCategory from './ltFilesSelectorForCategory.vue';
import LtFilesSelectorForFiles from './ltFilesSelectorForFiles.vue';

enum Tab {
  CATEGORY = 1,
  USER = 2,
  FILES = 3
}

const {$query} = useLtRoute();

const $tab = ref<Tab>($query.value.user ? Tab.USER : Tab.CATEGORY);

const {data: userInfo} = getUserInfo();

const msgLoggedIn = computed(() =>
  t('Hello {{$ctrl.userInfo}}!').replace('{{$ctrl.userInfo}}', userInfo.value?.user)
);
</script>
