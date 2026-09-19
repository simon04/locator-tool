<script setup lang="ts">
import {onMounted} from 'vue';

import {logout} from '../api/OAuth2';

onMounted(() => logout());
</script>
