<script setup lang="ts">
import {onMounted} from 'vue';

import {startAuthorization} from '../api/OAuth2';
import {useRoute} from '../router';

const $route = useRoute();

onMounted(() => startAuthorization(String($route.query?.next ?? '')));
</script>
