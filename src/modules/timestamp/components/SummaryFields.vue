<script setup>
// 登记信息展示：确认页与最终确认弹窗共用，不展示算法、摘要。
import { computed } from "vue";
import { levels } from "../constants.js";
const props = defineProps({ file: Object, form: Object, people: Array });
const rows = computed(() => [
  ["文件", props.file?.name],
  ["成果名称", props.form.name],
  ["成果类型", props.form.type],
  ["研究单位", props.form.research_unit],
  ["所属研究室 / 课题组", props.form.research_group],
  [
    "研发人员",
    props.people
      .map((person) => (typeof person === "string" ? person : person.name))
      .join("、"),
  ],
  ["密级", levels[props.form.confidentiality]],
  ["关联项目 / 专利（申请）号", props.form.related_project_no],
  ["成果完成日期", props.form.completion_date],
]);
</script>
<template>
  <dl>
    <div v-for="[label, value] in rows" :key="label">
      <dt class="summary-label">{{ label }}</dt>
      <dd>{{ value || "未填写" }}</dd>
    </div>
  </dl>
</template>
