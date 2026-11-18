<script setup>
// 应用壳：公共页头、路由缓存和全局提示，各业务页不重复挂载。
import { RouterView } from "vue-router";
import AppHeader from "./layouts/AppHeader.vue";
import MessageHost from "./components/common/MessageHost.vue";
</script>
<template>
  <div class="app-shell">
    <AppHeader /><RouterView v-slot="{ Component }"
      ><KeepAlive><component :is="Component" /></KeepAlive></RouterView
    ><MessageHost />
  </div>
</template>
