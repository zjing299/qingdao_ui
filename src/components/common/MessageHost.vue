<script setup>
// 全局消息宿主：入口只挂载一次，任意业务模块调用 message 公共方法。
import { onBeforeUnmount, shallowRef } from "vue";
import { CircleCheck, Info, TriangleAlert, X } from "@lucide/vue";
import { message, messageStore } from "../../utils/message.js";
import "../message.css";
const notices = shallowRef(messageStore.getSnapshot());
const stop = messageStore.subscribe(() => {
  notices.value = messageStore.getSnapshot();
});
onBeforeUnmount(stop);
const icons = {
  error: TriangleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
  info: Info,
};
</script>
<template>
  <div class="message-host" aria-label="全局消息提示">
    <div
      v-for="notice in notices"
      :key="notice.id"
      class="app-message"
      :class="`app-message--${notice.type}`"
      :role="['error', 'warning'].includes(notice.type) ? 'alert' : 'status'"
      aria-atomic="true"
    >
      <component
        :is="icons[notice.type]"
        class="app-message-icon"
        :size="22"
        :stroke-width="1.8"
        aria-hidden="true"
      /><span class="app-message-content">{{ notice.content }}</span
      ><button
        type="button"
        class="app-message-close"
        aria-label="关闭提示"
        @click="message.close(notice.id)"
      >
        <X :size="15" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
