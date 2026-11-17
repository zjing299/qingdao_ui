import { createSHA256, createSM3 } from 'hash-wasm';

export const MAX_FILE_BYTES = 2 * 1024 ** 3;
export async function hashFile(file, onProgress = () => {}) {
  if (!file || file.size > MAX_FILE_BYTES) throw new Error('请选择不超过 2 GB 的文件');
  const [sha256, sm3] = await Promise.all([createSHA256(), createSM3()]);
  sha256.init(); sm3.init();
  const chunkSize = 4 * 1024 ** 2;
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const bytes = new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());
    sha256.update(bytes); sm3.update(bytes);
    onProgress(Math.round(Math.min(offset + chunkSize, file.size) / file.size * 100));
  }
  onProgress(100);
  return { sha256: sha256.digest('hex'), sm3: sm3.digest('hex') };
}
