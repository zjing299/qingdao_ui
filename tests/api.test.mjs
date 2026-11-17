import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTimestamp } from '../src/api.js';

test('两种算法按 JSON 协议提交，成果密级保持数字', async t => {
  const body = { rid: 'a'.repeat(64), cert_req: false, achievement: { confidentiality: 2, researchers: ['张某', '李某'] } };
  for (const [algorithm, route] of [['SM3', 'sm'], ['SHA256', 'rsa']]) {
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, `/api/timestamp/${route}`);
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.deepEqual(JSON.parse(options.body), body);
      assert.equal(options.body.includes('file'), false);
      return Response.json({ code: 0, data: { tsr: 'AQID' } });
    });
    assert.equal((await applyTimestamp(algorithm, body)).code, 0);
    t.mock.restoreAll();
  }
});
test('入库失败仍保留已签发凭证，不重试申请', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({ code: 3002, message: '入库失败', data: { tsr: 'AQID' } }, { status: 503 }));
  const result = await applyTimestamp('SM3', {});
  assert.equal(result.data.tsr, 'AQID');
  assert.equal(mock.mock.calls.length, 1);
});
test('非 JSON 响应按异常处理，不重试', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('<html>error</html>', { status: 502 }));
  await assert.rejects(applyTimestamp('SM3', {}));
  assert.equal(mock.mock.calls.length, 1);
});
