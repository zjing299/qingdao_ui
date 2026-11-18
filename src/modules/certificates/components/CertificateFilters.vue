<script setup>
// 检索区：输入值由业务模块持有，查询和重置通过事件发出。
import { Search, RotateCcw } from "@lucide/vue";
import BaseSelect from "../../../components/common/BaseSelect.vue";
import { achievementTypes } from "../../timestamp/constants.js";
import { statusOptions } from "../constants.js";
defineProps({ filters: Object, loading: Boolean });
const emit = defineEmits(["search", "reset"]);
const types = [{ value: "", label: "全部成果类型" }, ...achievementTypes];
</script>
<template>
  <form
    class="portal-card certificate-filters"
    @submit.prevent="emit('search')"
  >
    <div class="keyword-field">
      <Search :size="16" /><input
        v-model="filters.keyword"
        aria-label="搜索成果名称或序列号"
        placeholder="搜索成果名称 / 序列号"
        maxlength="255"
      />
    </div>
    <BaseSelect
      v-model="filters.status"
      label="申请状态"
      :options="statusOptions"
    /><BaseSelect
      v-model="filters.type"
      label="筛选成果类型"
      :options="types"
    />
    <div class="filter-date">
      <input
        v-model="filters.start_date"
        type="date"
        aria-label="申请开始日期"
      /><span>至</span
      ><input
        v-model="filters.end_date"
        type="date"
        aria-label="申请结束日期"
      />
    </div>
    <div class="filter-actions">
      <button class="primary" :disabled="loading" type="submit">
        <Search :size="14" />查询</button
      ><button
        class="secondary"
        :disabled="loading"
        type="button"
        @click="emit('reset')"
      >
        <RotateCcw :size="14" />重置
      </button>
    </div>
  </form>
</template>
