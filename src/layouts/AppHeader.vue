<script setup>
// 应用公共页头：路由导航，不虚构已登录用户。
import { RouterLink } from "vue-router";
import { ShieldCheck, Home, Files, Plus, UserRound } from "@lucide/vue";
</script>
<template>
  <header class="portal-header">
    <div class="portal-header-inner">
      <RouterLink to="/" class="portal-brand"
        ><ShieldCheck :size="30" :stroke-width="1.6" /><span
          >知识产权可信时间戳存证<small>科研成果 · 在线办理</small></span
        ></RouterLink
      >
      <nav aria-label="主导航" class="portal-navigation">
        <RouterLink to="/"><Home :size="16" />服务首页</RouterLink
        ><RouterLink to="/certificates"><Files :size="16" />我的凭证</RouterLink
        ><RouterLink to="/register"><Plus :size="16" />新建存证登记</RouterLink>
      </nav>
      <span class="identity-state"><UserRound :size="15" />身份认证待接入</span>
    </div>
  </header>
</template>
