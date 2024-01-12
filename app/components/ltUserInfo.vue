<template>
  <a class="btn btn-success ms-2" :href="loginURL()" v-hide="userInfo?.user">
    <svg class="octicon">
      <use xlink:href="#sign-in"></use>
    </svg>
    <span translate="translate">Log in</span>
  </a>
  <span class="navbar-text ms-2" v-show="userInfo?.user" translate="translate">
    Logged in as {{ userInfo?.user }}
  </span>
  <a class="btn btn-secondary ms-2" :href="logoutURL()" v-show="userInfo?.user">
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
