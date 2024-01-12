<template>
  <lt-navbar></lt-navbar>
  <div class="d-flex flex-grow-1 container-fluid flex-column">
    <router-view class="d-flex flex-grow-1" />
  </div>
</template>

<script setup lang="ts">
import ltNavbar from './components/ltNavbar.vue';
</script>
