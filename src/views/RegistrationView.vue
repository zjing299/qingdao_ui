<script setup>
// 存证页面编排：步骤切换、各步滚动记忆与签发确认；业务逻辑在 useTimestamp。
import { onDeactivated, ref } from "vue";
import { RouterLink } from "vue-router";
import { ArrowLeft } from "@lucide/vue";
import { useTimestamp } from "../modules/timestamp/useTimestamp.js";
import { stepLabels, stepTitles } from "../modules/timestamp/constants.js";
import UploadStep from "../modules/timestamp/components/UploadStep.vue";
import RegistrationStep from "../modules/timestamp/components/RegistrationStep.vue";
import ReviewStep from "../modules/timestamp/components/ReviewStep.vue";
import ResultStep from "../modules/timestamp/components/ResultStep.vue";
import SummaryFields from "../modules/timestamp/components/SummaryFields.vue";
import BaseModal from "../components/common/BaseModal.vue";
const flow = useTimestamp();
const { state } = flow;
const registration = ref(null);
function stepClick(index) {
  if (state.submitting) return;
  if (index === 0) flow.goToStep(1);
  if (index === 1 && state.hashes) {
    state.consent = false;
    flow.goToStep(2);
  }
  if (index === 2) {
    if (state.step === 2) registration.value.review();
    else if (state.furthestStep >= 3) flow.goToStep(3);
  }
  if (index === 3 && state.result) flow.goToStep(4);
}
onDeactivated(() => {
  flow.rememberRouteScroll();
  state.confirming = false;
  state.resetting = false;
});
</script>
<template>
  <div class="register-view">
    <nav class="steps" aria-label="办理步骤">
      <button
        v-for="(label, index) in stepLabels"
        :key="label"
        type="button"
        :disabled="
          state.submitting ||
          (index === 1 && !state.hashes) ||
          (index === 2 && state.step !== 2 && state.furthestStep < 3) ||
          (index === 3 && !state.result)
        "
        :class="
          state.step === index + 1
            ? 'active'
            : state.step > index + 1
              ? 'complete'
              : ''
        "
        :aria-current="state.step === index + 1 ? 'step' : undefined"
        @click="stepClick(index)"
      >
        <b class="step-number">{{
          String(index + 1).padStart(2, "0")
        }}</b><span>{{ label }}</span>
      </button>
    </nav>
    <main class="workspace wizard-workspace">
      <RouterLink to="/" class="back-link"
        ><ArrowLeft :size="14" />返回服务首页</RouterLink
      >
      <div class="main-column">
        <div class="page-heading">
          <div>
            <p class="eyebrow">新建存证登记</p>
            <h2>{{ stepTitles[state.step - 1] }}</h2>
          </div>
          <span class="page-counter"
            >办理进度 <b>0{{ state.step }}</b> / 04</span
          >
        </div>
        <UploadStep
          v-show="state.step === 1"
          :flow="flow"
          @next="stepClick(1)"
        /><RegistrationStep
          v-show="state.step === 2"
          ref="registration"
          :flow="flow"
          @back="stepClick(0)"
        /><ReviewStep
          v-show="state.step === 3"
          :flow="flow"
          @back="stepClick(1)"
        /><ResultStep v-show="state.step === 4" :flow="flow" />
      </div>
    </main>
    <BaseModal
      :open="state.confirming"
      title="确认存证申请"
      :busy="state.submitting"
      @close="state.confirming = false"
      ><p>请核对以下信息，确认后将向时间戳服务申请签发。</p>
      <SummaryFields
        :file="state.file"
        :form="state.form"
        :people="state.people"
      />
      <div class="actions">
        <button
          type="button"
          class="secondary"
          :disabled="state.submitting"
          @click="state.confirming = false"
        >
          返回修改</button
        ><button
          type="button"
          class="primary"
          :disabled="state.submitting"
          @click="flow.submit"
        >
          {{ state.submitting ? "正在提交…" : "确认申请" }}
        </button>
      </div></BaseModal
    ><BaseModal
      :open="state.resetting"
      title="开始新的申请"
      @close="state.resetting = false"
      ><p>
        当前页面的文件和签发结果将被清空。请确认已保存凭证或已核对申请结果。
      </p>
      <div class="actions">
        <button
          type="button"
          class="secondary"
          @click="state.resetting = false"
        >
          取消</button
        ><button type="button" class="primary" @click="flow.reset">
          确认新建
        </button>
      </div></BaseModal
    >
  </div>
</template>
