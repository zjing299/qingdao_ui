export async function applyTimestamp(algorithm, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(
      `/api/timestamp/${algorithm === "SM3" ? "sm" : "rsa"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (
      !result ||
      typeof result.code !== "number" ||
      (result.code === 0 && !response.ok)
    )
      throw new Error("服务响应异常");
    return result;
  } finally {
    clearTimeout(timer);
  }
}

export function downloadCertificate(base64, filename) {
  const binary = atob(base64);
  if (!binary.length) throw new Error("凭证内容为空");
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: "application/octet-stream" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.[^.]+$/, "") + ".tsr";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
