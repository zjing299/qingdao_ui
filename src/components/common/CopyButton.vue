<script setup>
// 复制按钮：只复制显示值，不接触身份凭据；反馈统一走 Message。
import { Copy } from "@lucide/vue";
import { message } from "../../utils/message.js";
const props = defineProps({
  value: [String, Number],
  label: { type: String, default: "内容" },
});
async function copy() {
  try {
    if (navigator.clipboard?.writeText)
      await navigator.clipboard.writeText(String(props.value));
    else {
      const previous = document.activeElement;
      const input = document.createElement("textarea");
      input.value = String(props.value);
      input.readOnly = true;
      input.style.cssText = "position:fixed;left:-9999px;top:0;";
      document.body.appendChild(input);
      try {
        input.select();
        if (!document.execCommand("copy")) throw new Error("Unavailable");
      } finally {
        input.remove();
        previous?.focus({ preventScroll: true });
      }
    }
    message.success(`${props.label}已复制`);
  } catch {
    message.error("复制失败，请手动选择并复制");
  }
}
</script>
<template>
  <button
    type="button"
    class="copy-button"
    :aria-label="`复制${label}`"
    :disabled="!value"
    @click="copy"
  >
    <Copy :size="14" :stroke-width="1.8" aria-hidden="true" /><span>复制</span>
  </button>
</template>
