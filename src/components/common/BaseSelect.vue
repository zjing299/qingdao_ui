<script setup>
// 公共下拉框：键盘导航、点击外部关闭、选中状态和列表无障碍属性。
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from "vue";
import { Check, ChevronDown } from "@lucide/vue";
const props = defineProps({
  label: String,
  modelValue: [String, Number],
  options: { type: Array, default: () => [] },
  disabled: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const id = useId();
const root = ref(null);
const trigger = ref(null);
const open = ref(false);
const active = ref(0);
const selected = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
);
function toggle() {
  if (!props.disabled) {
    active.value = Math.max(selected.value, 0);
    open.value = !open.value;
  }
}
function choose(index) {
  emit("update:modelValue", props.options[index].value);
  open.value = false;
  trigger.value?.focus({ preventScroll: true });
}
function outside(event) {
  if (!root.value?.contains(event.target)) open.value = false;
}
function keyDown(event) {
  if (props.disabled) return;
  if (event.key === "Escape" || event.key === "Tab") {
    open.value = false;
    if (event.key === "Escape") event.preventDefault();
    return;
  }
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    active.value =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? props.options.length - 1
          : !open.value
            ? Math.max(selected.value, 0)
            : (active.value +
                (event.key === "ArrowDown" ? 1 : -1) +
                props.options.length) %
              props.options.length;
    open.value = true;
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (open.value) choose(active.value);
    else toggle();
  }
}
watch([open, active], async () => {
  if (open.value) {
    await nextTick();
    root.value
      ?.querySelector(`[data-option-index="${active.value}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }
});
watch(
  () => props.disabled,
  (value) => {
    if (value) open.value = false;
  },
);
onMounted(() => document.addEventListener("pointerdown", outside));
onBeforeUnmount(() => document.removeEventListener("pointerdown", outside));
</script>
<template>
  <div
    ref="root"
    class="custom-select"
    @focusout="
      !$event.currentTarget.contains($event.relatedTarget) && (open = false)
    "
  >
    <button
      ref="trigger"
      type="button"
      class="select-trigger"
      :class="{ 'is-open': open }"
      role="combobox"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      :aria-activedescendant="open ? `${id}-option-${active}` : undefined"
      :disabled="disabled"
      @keydown="keyDown"
      @click="toggle"
    >
      <span>{{ options[selected]?.label || "请选择" }}</span><ChevronDown
        class="select-chevron"
        :size="18"
        :stroke-width="1.8"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="open"
      class="select-menu"
      :id="`${id}-list`"
      role="listbox"
      :aria-label="label"
    >
      <div
        v-for="(option, index) in options"
        :key="option.value"
        :id="`${id}-option-${index}`"
        role="option"
        :aria-selected="option.value === modelValue"
        :data-option-index="index"
        class="select-option"
        :class="{
          'is-selected': option.value === modelValue,
          'is-active': index === active,
        }"
        @pointermove="active = index"
        @mousedown.prevent
        @click="choose(index)"
      >
        <span>{{ option.label }}</span><Check
          v-if="option.value === modelValue"
          :size="15"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>
