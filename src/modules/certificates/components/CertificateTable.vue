<script setup>
// 列表展示：只有已签发记录显示下载入口，待核对不提供重复申请操作。
import { FileClock, Download, LogIn, RefreshCw } from "@lucide/vue";
import { recordName, recordType, statuses } from "../constants.js";
import { dateText } from "../../timestamp/constants.js";
defineProps({
  records: Array,
  total: Number,
  loading: Boolean,
  enabled: Boolean,
  error: String,
  page: Number,
  pageCount: Number,
  downloading: [Number, String],
});
const emit = defineEmits(["detail", "download", "page", "retry"]);
</script>
<template>
  <section class="portal-card certificate-table">
    <div class="section-heading">
      <h2>存证申请记录</h2>
      <span class="quiet-label">{{
        enabled ? `共 ${total} 条` : "仅展示本人申请"
      }}</span>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>成果名称</th>
            <th>成果类型</th>
            <th>申请时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody v-if="records.length && !loading && !error">
          <tr v-for="record in records" :key="record.id">
            <td class="record-name" :title="recordName(record)">
              {{ recordName(record) }}
            </td>
            <td>{{ recordType(record) }}</td>
            <td>{{ dateText(record.created_at) }}</td>
            <td>
              <span
                class="status-badge"
                :class="statuses[record.status]?.tone"
                >{{ statuses[record.status]?.label || "待核对" }}</span
              >
            </td>
            <td>
              <div class="row-actions">
                <button type="button" @click="emit('detail', record)">
                  详情</button
                ><button
                  v-if="record.status === 2"
                  type="button"
                  :disabled="downloading !== null"
                  @click="emit('download', record)"
                >
                  <Download :size="13" />{{
                    downloading === record.id ? "下载中" : "下载凭证"
                  }}</button
                ><span v-else-if="record.status === 4" class="quiet-label"
                  >请勿重复提交</span
                ><button
                  v-else-if="record.status === 3"
                  type="button"
                  @click="emit('detail', record)"
                >
                  查看原因
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="loading || error || !records.length"
      class="record-empty"
      :aria-busy="loading"
    >
      <RefreshCw v-if="loading" :size="34" class="loading-icon" /><LogIn
        v-else-if="!enabled"
        :size="38"
        :stroke-width="1.3"
      /><FileClock v-else :size="38" :stroke-width="1.3" />
      <h3>
        {{
          loading
            ? "正在加载申请记录"
            : !enabled
              ? "个人凭证查询即将接入"
              : error
                ? "暂时无法加载记录"
                : "暂无存证申请"
        }}
      </h3>
      <p>
        {{
          loading
            ? "请稍候"
            : !enabled
              ? "身份认证接入后，可在这里查看和下载本人的存证凭证。"
              : error || "试试调整筛选条件，或新建一份存证登记。"
        }}
      </p>
      <button
        v-if="error"
        class="secondary"
        type="button"
        @click="emit('retry')"
      >
        重新加载
      </button>
    </div>
    <div class="pagination">
      <span>{{
        enabled ? `第 ${page} / ${pageCount} 页` : "身份认证待接入"
      }}</span>
      <div>
        <button
          type="button"
          :disabled="!enabled || loading || page <= 1"
          @click="emit('page', page - 1)"
        >
          上一页</button
        ><span class="page-active">{{ page }}</span
        ><button
          type="button"
          :disabled="!enabled || loading || page >= pageCount"
          @click="emit('page', page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </section>
</template>
