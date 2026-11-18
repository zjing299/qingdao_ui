<script setup>
// 第一步：选择文件、浏览器本地摘要、签发算法设置。
import { ref, watch } from "vue";
import { TriangleAlert } from "@lucide/vue";
import { shortHash, sizeText } from "../constants.js";
import { message } from "../../../utils/message.js";
import PanelNote from "../../../components/common/PanelNote.vue";
const props = defineProps({ flow: Object });
const emit = defineEmits(["next"]);
const { state, locked, statusText } = props.flow;
const input = ref(null);
const dragging = ref(false);
function drop(event) {
  dragging.value = false;
  if (event.dataTransfer.files.length !== 1) {
    message.error("每次请选择一个文件");
    return;
  }
  props.flow.selectFile(event.dataTransfer.files[0]);
}
watch(
  () => state.resetVersion,
  () => {
    if (input.value) input.value.value = "";
  },
);
</script>
<template>
  <section class="panel upload-panel" aria-labelledby="upload-title">
    <h2 id="upload-title">上传知产文件</h2>
    <input
      id="file"
      ref="input"
      type="file"
      class="visually-hidden"
      tabindex="-1"
      :disabled="locked"
      @change="flow.selectFile($event.target.files?.[0])"
    /><button
      type="button"
      class="dropzone"
      :class="{ dragging }"
      :disabled="locked"
      @click="input.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="drop"
    >
      <div class="upload-copy">
        <strong :title="state.file?.name">{{
          state.file ? state.file.name : "拖拽文件到此处，或点击选择文件"
        }}</strong><span>{{
          state.file
            ? sizeText(state.file.size)
            : "支持任意文件格式，包括 PDF / DOCX / XLSX / ZIP / 代码包，单文件 ≤ 2 GB"
        }}</span>
      </div>
      <span class="upload-action"
        >{{ state.file ? "重新选择文件" : "选择文件" }}
        <span aria-hidden="true">＋</span></span
      ></button
    ><progress
      v-if="state.file && !state.hashes"
      max="100"
      :value="state.progress"
      aria-label="摘要计算进度"
    />
    <p class="privacy-note">
      <TriangleAlert
        class="privacy-warning"
        :size="18"
        :stroke-width="1.8"
        aria-hidden="true"
      /><span>摘要在浏览器本地计算，原文不上送服务器。</span>
    </p>
    <div class="summary integrated-summary">
      <h2>本次存证摘要 <span class="section-badge">浏览器本地计算</span></h2>
      <dl>
        <div>
          <dt>文件</dt>
          <dd :title="state.file?.name">
            {{ state.file?.name || "尚未选择文件" }}
          </dd>
        </div>
        <div>
          <dt>大小</dt>
          <dd>{{ state.file ? sizeText(state.file.size) : "—" }}</dd>
        </div>
        <div v-for="algorithm in ['sm3', 'sha256']" :key="algorithm">
          <dt>{{ algorithm.toUpperCase() }}</dt>
          <dd :title="state.hashes?.[algorithm]">
            {{ shortHash(state.hashes?.[algorithm])
            }}{{ state.hashes ? "（64 字符）" : "" }}
          </dd>
        </div>
      </dl>
      <fieldset class="algorithm" :disabled="locked">
        <legend>签发算法</legend>
        <label
          v-for="algorithm in ['SM3', 'SHA256']"
          :key="algorithm"
          :class="{ selected: state.algorithm === algorithm }"
          ><input
            v-model="state.algorithm"
            type="radio"
            name="algorithm"
            :value="algorithm"
          />{{
            algorithm === "SM3" ? "国密 SM3（默认）" : "SHA256 / RSA"
          }}</label
        >
      </fieldset>
      <p class="issuer-note">出证　由所内管理端统一调用，页面不持有密钥</p>
      <div
        class="status-strip"
        :class="{
          'is-ready': state.hashes && !state.uncertain && !state.submitting,
        }"
        role="status"
      >
        状态：{{ statusText }}
      </div>
    </div>
    <div class="actions wizard-actions">
      <button
        type="button"
        class="primary"
        :disabled="!state.hashes || state.submitting"
        @click="emit('next')"
      >
        下一步：填写登记信息 →
      </button>
    </div>
    <PanelNote />
  </section>
</template>
