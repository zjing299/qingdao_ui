<script setup>
// 必填输入框：失焦才显示错误，始终保留提示高度，输入有效内容后立即清除。
import { computed, ref, useId } from "vue";
defineOptions({ inheritAttrs: false });
const props = defineProps({
  modelValue: { type: String, default: "" },
  errorText: String,
});
const emit = defineEmits(["update:modelValue"]);
const touched = ref(false);
const id = useId();
const error = computed(() =>
  touched.value && !props.modelValue.trim() ? props.errorText : "",
);
</script>
<template>
  <div class="validated-input">
    <input
      v-bind="$attrs"
      :value="modelValue"
      required
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      @input="emit('update:modelValue', $event.target.value)"
      @blur="touched = true"
    /><span class="field-feedback" :id="`${id}-error`" aria-live="polite">{{
      error
    }}</span>
  </div>
</template>
