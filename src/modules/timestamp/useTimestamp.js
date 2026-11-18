// 存证业务：本地摘要、四步状态、人员排序、提交锁和结果恢复。
// 文件及草稿只驻留内存，不持久化原文或上游凭据。
import {
  computed,
  markRaw,
  nextTick,
  onActivated,
  onBeforeUnmount,
  reactive,
  ref,
} from "vue";
import { applyTimestamp, downloadCertificate } from "../../api/timestamp.js";
import { MAX_FILE_BYTES } from "../../hash-file.js";
import { message } from "../../utils/message.js";
import {
  achievementTypes,
  createForm,
  levels,
  todayDate,
} from "./constants.js";

export function useTimestamp() {
  const state = reactive({
    step: 1,
    furthestStep: 1,
    file: null,
    hashes: null,
    progress: 0,
    form: createForm(),
    people: [{ id: 1, name: "" }],
    algorithm: "SM3",
    consent: false,
    submitting: false,
    confirming: false,
    resetting: false,
    uncertain: false,
    result: null,
    resetVersion: 0,
  });
  let worker;
  let personSequence = 1;
  let submitLock = false;
  const scrollPositions = {};
  let routeScroll = 0;
  const fileInput = ref(null);
  const locked = computed(
    () => state.submitting || !!state.result || state.uncertain,
  );
  const registrationComplete = computed(
    () =>
      !!state.form.name.trim() &&
      !!state.form.research_unit.trim() &&
      achievementTypes.some((option) => option.value === state.form.type) &&
      Object.hasOwn(levels, state.form.confidentiality) &&
      (!state.form.completion_date ||
        state.form.completion_date <= todayDate()) &&
      state.people.length > 0 &&
      state.people.every((person) => !!person.name.trim()),
  );

  async function goToStep(step) {
    if (step === state.step || state.submitting) return;
    scrollPositions[state.step] = window.scrollY;
    state.step = step;
    await nextTick();
    window.scrollTo({ top: scrollPositions[step] || 0, behavior: "instant" });
  }
  function selectFile(candidate) {
    if (!candidate || locked.value) return;
    message.clear();
    if (candidate.size > MAX_FILE_BYTES) {
      message.error("文件超过 2 GB，请选择较小的文件");
      return;
    }
    worker?.terminate();
    state.file = markRaw(candidate);
    state.hashes = null;
    state.progress = 0;
    state.consent = false;
    const current = new Worker(
      new URL("../../hash.worker.js", import.meta.url),
      { type: "module" },
    );
    worker = current;
    current.onmessage = ({ data }) => {
      if (worker !== current) return;
      if (data.progress !== undefined) state.progress = data.progress;
      if (data.hashes) {
        state.hashes = data.hashes;
        current.terminate();
      }
      if (data.error) {
        message.error(data.error);
        current.terminate();
      }
    };
    current.onerror = () => {
      message.error("摘要计算失败，请重新选择文件");
      current.terminate();
    };
    current.postMessage(candidate);
  }
  function addPerson() {
    if (state.people.length < 100)
      state.people.push({ id: ++personSequence, name: "" });
  }
  function removePerson(index) {
    if (state.people.length > 1) state.people.splice(index, 1);
  }
  function movePerson(index, direction) {
    const destination = index + direction;
    if (destination >= 0 && destination < state.people.length)
      [state.people[index], state.people[destination]] = [
        state.people[destination],
        state.people[index],
      ];
  }
  function changeDate(value) {
    state.form.completion_date = value;
    if (value > todayDate()) message.error("成果完成日期不能晚于今天");
  }
  function review(formElement) {
    if (locked.value) return;
    message.clear();
    if (!state.hashes) {
      message.error("请先选择文件并等待摘要计算完成");
      return;
    }
    if (
      !state.form.name.trim() ||
      !state.form.research_unit.trim() ||
      state.people.some((person) => !person.name.trim())
    ) {
      message.error("成果名称、研究单位及每位研发人员姓名不能为空");
      return;
    }
    if (state.form.completion_date > todayDate()) {
      message.error("成果完成日期不能晚于今天");
      return;
    }
    if (formElement && !formElement.checkValidity()) {
      message.error("请检查登记信息，成果完成日期应为有效日期");
      return;
    }
    if (state.step === 2) {
      state.furthestStep = Math.max(state.furthestStep, 3);
      goToStep(3);
      return;
    }
    if (!state.consent) {
      message.error("请先阅读并勾选声明");
      return;
    }
    state.confirming = true;
  }
  async function submit() {
    if (submitLock || locked.value) return;
    if (state.form.completion_date > todayDate()) {
      state.confirming = false;
      message.error("成果完成日期不能晚于今天");
      return;
    }
    submitLock = true;
    state.submitting = true;
    message.clear();
    const achievement = {
      ...state.form,
      name: state.form.name.trim(),
      research_unit: state.form.research_unit.trim(),
      researchers: state.people.map((person) => person.name.trim()),
    };
    try {
      const response = await applyTimestamp(state.algorithm, {
        rid: state.hashes[state.algorithm.toLowerCase()],
        achievement,
      });
      if (
        (response.code === 0 || response.code === 3002) &&
        response.data?.tsr
      ) {
        state.result = response.data;
        state.furthestStep = 4;
        scrollPositions[state.step] = window.scrollY;
        state.step = 4;
        await nextTick();
        window.scrollTo({ top: 0, behavior: "instant" });
        if (response.code === 3002)
          message.error(`错误码 3002：${response.message}`);
      } else {
        message.error(
          `错误码 ${response.code}：${response.message || "申请失败"}`,
        );
        state.uncertain =
          [2200, 2201, 2202, 2300, 3002, 9000].includes(response.code) ||
          response.code === 0;
      }
    } catch {
      message.error(
        "连接中断或响应异常，签发结果待核对。请联系管理员核对申请记录，勿重复提交。",
      );
      state.uncertain = true;
    } finally {
      state.submitting = false;
      state.confirming = false;
      submitLock = false;
    }
  }
  function download() {
    try {
      downloadCertificate(state.result.tsr, state.file.name);
    } catch {
      message.error("凭证下载失败，请保留页面并联系管理员");
    }
  }
  async function reset() {
    worker?.terminate();
    Object.keys(scrollPositions).forEach((key) => delete scrollPositions[key]);
    Object.assign(state, {
      step: 1,
      furthestStep: 1,
      file: null,
      hashes: null,
      progress: 0,
      result: null,
      consent: false,
      uncertain: false,
      resetting: false,
      resetVersion: state.resetVersion + 1,
    });
    state.form.completion_date = todayDate();
    if (fileInput.value) fileInput.value.value = "";
    message.clear();
    await nextTick();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const statusText = computed(() =>
    state.result
      ? "已签发 · 请下载保存凭证"
      : state.uncertain
        ? "结果待核对 · 请勿重复申请"
        : state.submitting
          ? "申请处理中"
          : state.hashes
            ? "摘要已就绪 · 等待确认提交"
            : state.file
              ? `摘要计算中 · ${state.progress}%`
              : "等待选择文件",
  );
  onBeforeUnmount(() => worker?.terminate());
  onActivated(async () => {
    await nextTick();
    window.scrollTo({ top: routeScroll, behavior: "instant" });
  });
  return {
    state,
    locked,
    registrationComplete,
    fileInput,
    statusText,
    goToStep,
    selectFile,
    addPerson,
    removePerson,
    movePerson,
    changeDate,
    review,
    submit,
    download,
    reset,
    rememberRouteScroll: () => {
      routeScroll = window.scrollY;
    },
  };
}
