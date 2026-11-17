import { hashFile } from './hash-file.js';
self.onmessage = async ({ data: file }) => {
  try {
    const hashes = await hashFile(file, progress => self.postMessage({ progress }));
    self.postMessage({ hashes });
  } catch {
    self.postMessage({ error: '文件摘要计算失败，请重新选择文件' });
  }
};
