import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashFile, MAX_FILE_BYTES } from '../src/hash-file.js';

test('abc 的 SHA256 与 SM3 符合标准测试向量', async () => {
  const result = await hashFile(new Blob(['abc']));
  assert.equal(result.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(result.sm3, '66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0');
});
test('分块计算保留完整内容并报告进度', async () => {
  const bytes = new Uint8Array(5 * 1024 ** 2 + 17).fill(42);
  const progress = [];
  const result = await hashFile(new Blob([bytes]), n => progress.push(n));
  assert.equal(result.sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(result.sm3, createHash('sm3').update(bytes).digest('hex'));
  assert.ok(progress.some(n => n > 0 && n < 100));
  assert.equal(progress.at(-1), 100);
});
test('空文件可计算，超限文件不会读取', async () => {
  const result = await hashFile(new Blob([]));
  assert.equal(result.sha256, createHash('sha256').digest('hex'));
  await assert.rejects(hashFile({ size: MAX_FILE_BYTES + 1 }), /2 GB/);
});
