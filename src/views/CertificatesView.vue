<script setup>
// 我的凭证页面编排：统计、检索、分页和详情，各模块独立维护。
import { onActivated } from "vue";
import { RouterLink } from "vue-router";
import {
  Plus,
  Layers,
  CircleCheck,
  Clock3,
  CircleAlert,
  CircleX,
  ShieldCheck,
} from "@lucide/vue";
import { useCertificates } from "../modules/certificates/useCertificates.js";
import { statItems } from "../modules/certificates/constants.js";
import CertificateFilters from "../modules/certificates/components/CertificateFilters.vue";
import CertificateTable from "../modules/certificates/components/CertificateTable.vue";
import CertificateDetail from "../modules/certificates/components/CertificateDetail.vue";
const records = useCertificates();
const {
  enabled,
  filters,
  stats,
  total,
  page,
  pageCount,
  loading,
  error,
  selected,
  drawerOpen,
  detailLoading,
  downloading,
} = records;
const icons = {
  all: Layers,
  issued: CircleCheck,
  pending: Clock3,
  unknown: CircleAlert,
  failed: CircleX,
};
onActivated(() => records.load(page.value));
</script>
<template>
  <main class="portal-container certificates-view">
    <div class="portal-page-heading">
      <div>
        <p class="eyebrow">个人存证工作台</p>
        <h1>我的凭证</h1>
        <p>集中查看申请进度，管理和下载存证凭证。</p>
      </div>
      <RouterLink to="/register" class="primary link-button"
        ><Plus :size="17" />新建存证登记</RouterLink
      >
    </div>
    <div class="record-stats">
      <article v-for="item in statItems" :key="item.key" :class="item.tone">
        <div class="stat-icon">
          <component :is="icons[item.key]" :size="22" :stroke-width="1.6" />
        </div>
        <div>
          <span>{{ item.label }}</span><strong>{{
            stats?.[item.key] ?? "—"
          }}</strong>
        </div>
      </article>
    </div>
    <div v-if="!enabled" class="integration-note">
      <ShieldCheck :size="16" /><span
        >身份认证与个人记录查询尚未接入。此页已预留查询入口，接入后将仅展示当前登录人员的申请。</span
      >
    </div>
    <CertificateFilters
      :filters="filters"
      :loading="loading"
      @search="records.search"
      @reset="records.reset"
    /><CertificateTable
      :records="records.records.value"
      :total="total"
      :enabled="enabled"
      :loading="loading"
      :error="error"
      :page="page"
      :page-count="pageCount"
      :downloading="downloading"
      @detail="records.openDetail"
      @download="records.download"
      @page="records.load"
      @retry="records.load(page)"
    />
    <p class="records-footnote">
      凭证与原文件请一同保存。待核对的申请请联系管理员，勿重复提交。
    </p>
    <CertificateDetail
      :open="drawerOpen"
      :record="selected"
      :loading="detailLoading"
      :downloading="downloading"
      @close="records.closeDetail"
      @download="records.download"
    />
  </main>
</template>
