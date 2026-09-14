<script setup lang="ts">
import {onMounted} from 'vue';

import {startAuthorization} from '../api/OAuth2';

onMounted(() => startAuthorization());
</script>
