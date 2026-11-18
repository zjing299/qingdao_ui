// 我的凭证状态映射与列表过滤选项；与后端 tinyint 状态约定保持一致。
export const statuses = {
  1: { label: "待签发", tone: "pending" },
  2: { label: "已签发", tone: "issued" },
  3: { label: "明确失败", tone: "failed" },
  4: { label: "待核对", tone: "unknown" },
};
export const statusOptions = [
  { value: "", label: "全部状态" },
  ...Object.entries(statuses).map(([value, item]) => ({
    value: Number(value),
    label: item.label,
  })),
];
export const statItems = [
  { key: "all", label: "全部申请", tone: "all" },
  { key: "issued", label: "已签发", tone: "issued" },
  { key: "pending", label: "待签发", tone: "pending" },
  { key: "unknown", label: "待核对", tone: "unknown" },
  { key: "failed", label: "明确失败", tone: "failed" },
];
export function recordName(record) {
  return (
    record.achievement?.name || record.achievement_name || "未填写成果名称"
  );
}
export function recordType(record) {
  return record.achievement?.type || record.achievement_type || "—";
}
