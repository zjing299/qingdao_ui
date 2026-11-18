<script setup>
// 第三步：只核对登记内容；签发确认由上层公共弹窗承担。
import SummaryFields from "./SummaryFields.vue";
import PanelNote from "../../../components/common/PanelNote.vue";
const props = defineProps({ flow: Object });
const emit = defineEmits(["back"]);
const { state, locked } = props.flow;
</script>
<template>
  <form novalidate @submit.prevent="flow.review()">
    <section class="panel submission" aria-labelledby="submission-title">
      <h2 id="submission-title">确认存证申请</h2>
      <SummaryFields
        class="review-details"
        :file="state.file"
        :form="state.form"
        :people="state.people"
      /><label class="consent"
        ><input
          v-model="state.consent"
          type="checkbox"
          :disabled="locked"
        /><span
          >本人确认所传文件为本所职务成果，登记信息真实；知悉本服务为可信时间戳存证，不构成著作权确权登记。</span
        ></label
      >
      <div class="actions">
        <button
          type="button"
          class="secondary"
          :disabled="state.submitting"
          @click="emit('back')"
        >
          上一步</button
        ><button
          class="primary"
          type="submit"
          :disabled="locked || !state.hashes"
        >
          {{
            state.submitting
              ? "正在申请，请勿关闭页面…"
              : state.result
                ? "已完成签发，请下载凭证"
                : state.uncertain
                  ? "签发结果待核对"
                  : "确认提交并申请可信时间戳 →"
          }}
        </button>
      </div>
      <button
        v-if="state.result || state.uncertain"
        class="text-button"
        type="button"
        @click="state.resetting = true"
      >
        开始新的申请</button
      ><PanelNote />
    </section>
  </form>
</template>
