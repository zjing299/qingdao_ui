<script setup>
// 公共确认弹窗：不替代全局消息，负责焦点循环和背景滚动锁。
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
const props = defineProps({ open: Boolean, title: String, busy: Boolean });
const emit = defineEmits(["close"]);
const panel = ref(null);
let previous;
let previousOverflow;
watch(
  () => props.open,
  async (open) => {
    if (open) {
      previous = document.activeElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      await nextTick();
      panel.value
        ?.querySelector("button:not(:disabled)")
        ?.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = previousOverflow ?? "";
      if (previous?.isConnected && previous.getClientRects().length)
        previous.focus({ preventScroll: true });
    }
  },
  { flush: "post" },
);
function keys(event) {
  if (event.key === "Escape" && !props.busy) emit("close");
  if (event.key !== "Tab") return;
  const items = [
    ...panel.value.querySelectorAll(
      "button:not(:disabled), [href], input:not(:disabled)",
    ),
  ];
  if (!items.length) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey && document.activeElement === items[0]) {
    event.preventDefault();
    items.at(-1).focus();
  } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
    event.preventDefault();
    items[0].focus();
  }
}
onBeforeUnmount(() => {
  if (props.open) document.body.style.overflow = previousOverflow ?? "";
});
</script>
<template>
  <Teleport to="body"
    ><div
      v-if="open"
      class="modal-backdrop"
      @click.self="!busy && emit('close')"
    >
      <div
        ref="panel"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @keydown="keys"
      >
        <h2>{{ title }}</h2>
        <slot />
      </div></div
  ></Teleport>
</template>
