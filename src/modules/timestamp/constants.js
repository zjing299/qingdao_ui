// 存证模块：成果选项、固定研究单位和登记表默认值。
export const RESEARCH_UNIT = "中国科学院青岛生物能源与过程研究所";
export const achievementTypes = [
  "专利交底书",
  "论文预印本",
  "原始实验数据",
  "源代码与算法",
  "工艺配方与中试记录",
  "横向合作交付物",
].map((label) => ({ value: label, label }));
export const confidentialityOptions = [
  { value: 1, label: "公开" },
  { value: 2, label: "内部" },
  { value: 3, label: "秘密" },
];
export const levels = { 1: "公开", 2: "内部", 3: "秘密" };
export const stepLabels = [
  "上传知产文件",
  "填写登记信息",
  "确认并提交",
  "下载 .tsr 凭证",
];
export const stepTitles = [
  "让每一份成果，都有时间的证明",
  "完善成果信息，建立存证档案",
  "核对申请信息，确认本次存证",
  "存证已完成，请妥善保存凭证",
];
export function createForm() {
  return {
    name: "",
    type: achievementTypes[0].value,
    research_unit: RESEARCH_UNIT,
    research_group: "",
    confidentiality: 2,
    related_project_no: "",
    completion_date: todayDate(),
  };
}
export function todayDate() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function sizeText(n) {
  return n < 1024
    ? `${n} B`
    : n < 1024 ** 2
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 ** 2).toFixed(1)} MB`;
}
export function shortHash(value) {
  return value ? `${value.slice(0, 12)}···${value.slice(-6)}` : "等待计算";
}
export function dateText(value) {
  return value
    ? new Date(value).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      })
    : "—";
}
