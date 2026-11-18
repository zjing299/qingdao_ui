<script setup>
// 第四步：展示真实签发结果、复制序列号、下载二进制凭证。
import { RouterLink } from "vue-router";
import CopyButton from "../../../components/common/CopyButton.vue";
import PanelNote from "../../../components/common/PanelNote.vue";
import { dateText } from "../constants.js";
const props = defineProps({ flow: Object });
const { state } = props.flow;
</script>
<template>
  <section v-if="state.result" id="result" class="panel result-card">
    <h2>时间戳凭证已签发</h2>
    <dl>
      <div>
        <dt>序列号</dt>
        <dd class="serial-number">
          <span>{{ state.result.sn }}</span><CopyButton
            :value="state.result.sn"
            label="序列号"
          />
        </dd>
      </div>
      <div>
        <dt>签发时间</dt>
        <dd>{{ dateText(state.result.ts) }}（北京时间）</dd>
      </div>
      <div>
        <dt>记录编号</dt>
        <dd>{{ state.result.record_id || "—" }}</dd>
      </div>
      <div>
        <dt>入库状态</dt>
        <dd>
          {{ state.result.record_saved ? "已保存" : "待核对，请保留凭证" }}
        </dd>
      </div>
    </dl>
    <div class="result-actions">
      <button type="button" class="primary" @click="flow.download">
        下载 .tsr 凭证</button
      ><RouterLink class="secondary link-button" to="/certificates"
        >我的凭证</RouterLink
      >
    </div>
    <p>请将凭证与原文件一同保存，原文件改动后摘要将发生变化。</p>
    <button class="text-button" type="button" @click="state.resetting = true">
      开始新的申请</button
    ><PanelNote />
  </section>
</template>
