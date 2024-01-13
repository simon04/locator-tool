<template>
  <a v-hide="userInfo?.user" class="btn btn-success ms-2" :href="loginURL()">
    <svg class="octicon">
      <use xlink:href="#sign-in"></use>
    </svg>
    <span translate="translate">Log in</span>
  </a>
  <span v-show="userInfo?.user" class="navbar-text ms-2" translate="translate">
    Logged in as {{ userInfo?.user }}
  </span>
  <a v-show="userInfo?.user" class="btn btn-secondary ms-2" :href="logoutURL()">
    <svg class="octicon">
      <use xlink:href="#sign-out"></use>
    </svg>
    <span translate="translate">Log out</span>
  </a>
</template>

<script setup lang="ts">
import {getUserInfo, loginURL, logoutURL} from '../api/ltDataAuth';

const {data: userInfo} = getUserInfo();
</script>
