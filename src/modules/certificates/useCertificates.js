// 我的凭证业务：分页、筛选、详情与下载；未接入时不请求虚构接口或展示假记录。
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import {
  certificatesEnabled,
  getMyCertificate,
  listMyCertificates,
} from "../../api/certificates.js";
import { downloadCertificate } from "../../api/timestamp.js";
import { message } from "../../utils/message.js";
import { recordName } from "./constants.js";
export function useCertificates() {
  const filters = reactive({
    keyword: "",
    status: "",
    type: "",
    start_date: "",
    end_date: "",
  });
  const records = ref([]);
  const stats = ref(null);
  const total = ref(0);
  const page = ref(1);
  const pageSize = 10;
  const loading = ref(false);
  const error = ref("");
  const selected = ref(null);
  const detailLoading = ref(false);
  const downloading = ref(null);
  const drawerOpen = ref(false);
  let listController;
  let detailController;
  let sequence = 0;
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize)),
  );
  async function load(nextPage = 1) {
    if (!certificatesEnabled) return;
    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date > filters.end_date
    ) {
      message.error("开始日期不能晚于结束日期");
      return;
    }
    listController?.abort();
    listController = new AbortController();
    const current = ++sequence;
    loading.value = true;
    error.value = "";
    try {
      const data = await listMyCertificates(
        { ...filters, page: nextPage, page_size: pageSize },
        listController.signal,
      );
      if (current !== sequence) return;
      records.value = data.items;
      stats.value = data.stats || null;
      total.value = data.total;
      page.value = nextPage;
    } catch (failure) {
      if (failure.name !== "AbortError") {
        error.value = failure.message;
        message.error(failure.message);
      }
    } finally {
      if (current === sequence) loading.value = false;
    }
  }
  function search() {
    if (!certificatesEnabled) {
      message.info("身份认证及个人凭证查询服务尚未接入");
      return;
    }
    load(1);
  }
  function reset() {
    Object.assign(filters, {
      keyword: "",
      status: "",
      type: "",
      start_date: "",
      end_date: "",
    });
    load(1);
  }
  async function openDetail(record) {
    drawerOpen.value = true;
    selected.value = null;
    detailLoading.value = true;
    detailController?.abort();
    detailController = new AbortController();
    const controller = detailController;
    try {
      const data = await getMyCertificate(record.id, controller.signal);
      if (!controller.signal.aborted) selected.value = data;
    } catch (failure) {
      if (failure.name !== "AbortError") {
        message.error(failure.message);
        drawerOpen.value = false;
      }
    } finally {
      if (detailController === controller) detailLoading.value = false;
    }
  }
  function closeDetail() {
    detailController?.abort();
    drawerOpen.value = false;
  }
  async function download(record) {
    if (record.status !== 2 || downloading.value !== null) return;
    downloading.value = record.id;
    try {
      const detail = await getMyCertificate(record.id);
      if (!detail.tsr) throw new Error("该申请暂无可下载的凭证");
      downloadCertificate(detail.tsr, recordName(detail));
    } catch (failure) {
      message.error(failure.message || "凭证下载失败");
    } finally {
      downloading.value = null;
    }
  }
  onBeforeUnmount(() => {
    listController?.abort();
    detailController?.abort();
  });
  return {
    enabled: certificatesEnabled,
    filters,
    records,
    stats,
    total,
    page,
    pageCount,
    loading,
    error,
    selected,
    drawerOpen,
    detailLoading,
    downloading,
    load,
    search,
    reset,
    openDetail,
    closeDetail,
    download,
  };
}
