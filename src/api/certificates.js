// 我的凭证接口适配层（后端暂未提供这些接口，默认关闭）。
// 启用前必须由后端通过登录会话识别用户，不能接收前端传入的 user_id。
export const certificatesEnabled =
  import.meta.env.VITE_MY_CERTIFICATES_ENABLED === "true";
const base = "/api/timestamp/applications/me";
async function request(path, signal) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  if (response.status === 401) throw new Error("请先登录后查看本人的存证申请");
  if (response.status === 403) throw new Error("无权查看该存证申请");
  if (!response.ok) throw new Error("凭证查询服务暂不可用，请稍后重试");
  const result = await response.json();
  if (result.code !== 0 || !result.data)
    throw new Error(result.message || "凭证数据响应异常");
  return result.data;
}
export async function listMyCertificates(filters, signal) {
  if (!certificatesEnabled) return null;
  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([, value]) => value !== "" && value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );
  const data = await request(`${base}?${query}`, signal);
  if (
    !Array.isArray(data.items) ||
    !Number.isInteger(data.total) ||
    data.total < 0
  )
    throw new Error("凭证列表响应异常");
  return data;
}
export async function getMyCertificate(id, signal) {
  if (!certificatesEnabled) throw new Error("个人凭证查询服务尚未接入");
  return request(`${base}/${encodeURIComponent(id)}`, signal);
}
