<script setup>
// 详情确认层：展示登记信息和签发结果；不从列表行推断凭证数据。
import { computed } from "vue";
import BaseModal from "../../../components/common/BaseModal.vue";
import CopyButton from "../../../components/common/CopyButton.vue";
import { dateText, levels } from "../../timestamp/constants.js";
import { statuses, recordName, recordType } from "../constants.js";
const props = defineProps({
  open: Boolean,
  record: Object,
  loading: Boolean,
  downloading: [Number, String],
});
const emit = defineEmits(["close", "download"]);
const achievement = computed(
  () => props.record?.achievement || props.record || {},
);
</script>
<template>
  <BaseModal :open="open" title="存证申请详情" @close="emit('close')"
    ><p v-if="loading">正在加载详情…</p>
    <template v-else-if="record"
      ><span class="status-badge" :class="statuses[record.status]?.tone">{{
        statuses[record.status]?.label || "待核对"
      }}</span>
      <dl class="certificate-detail-fields">
        <div>
          <dt>成果名称</dt>
          <dd>{{ recordName(record) }}</dd>
        </div>
        <div>
          <dt>成果类型</dt>
          <dd>{{ recordType(record) }}</dd>
        </div>
        <div>
          <dt>研究单位</dt>
          <dd>{{ achievement.research_unit || "—" }}</dd>
        </div>
        <div>
          <dt>研究室 / 课题组</dt>
          <dd>{{ achievement.research_group || "—" }}</dd>
        </div>
        <div>
          <dt>研发人员</dt>
          <dd>{{ achievement.researchers?.join("、") || "—" }}</dd>
        </div>
        <div>
          <dt>密级</dt>
          <dd>{{ levels[achievement.confidentiality] || "—" }}</dd>
        </div>
        <div>
          <dt>关联项目 / 专利号</dt>
          <dd>{{ achievement.related_project_no || "—" }}</dd>
        </div>
        <div>
          <dt>成果完成日期</dt>
          <dd>{{ achievement.completion_date || "—" }}</dd>
        </div>
        <div>
          <dt>序列号</dt>
          <dd class="serial-number">
            <span>{{
              record.serial_number || record.sn || "—"
            }}</span><CopyButton
              v-if="record.serial_number || record.sn"
              :value="record.serial_number || record.sn"
              label="序列号"
            />
          </dd>
        </div>
        <div>
          <dt>签发时间</dt>
          <dd>{{ dateText(record.issued_at_ms || record.ts) }}</dd>
        </div>
      </dl>
      <p v-if="record.status === 4" class="detail-warning">
        签发结果待核对，请联系管理员，勿重复提交。
      </p>
      <p v-if="record.status === 3">
        {{
          record.failure_message || "本次申请明确失败，可联系管理员核对原因。"
        }}
      </p>
      <div class="actions">
        <button type="button" class="secondary" @click="emit('close')">
          关闭详情</button
        ><button
          v-if="record.status === 2"
          class="primary"
          type="button"
          :disabled="downloading !== null"
          @click="emit('download', record)"
        >
          下载 .tsr 凭证
        </button>
      </div></template
    ></BaseModal
  >
</template>
