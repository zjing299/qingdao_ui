import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_URL || 'http://127.0.0.1:5173';
const out = path.resolve('.qa');
await mkdir(path.join(out, 'downloads'), { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=9238',
  `--user-data-dir=${path.join(out, 'chrome')}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  let target;
  for (let i = 0; i < 100; i++) {
    try { target = await (await fetch('http://127.0.0.1:9238/json/new?about:blank', { method: 'PUT' })).json(); break; } catch { await sleep(100); }
  }
  assert.ok(target, 'Chrome debugging endpoint unavailable');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  const errors = [];
  const requests = [];
  let replyCode = 0;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onmessage = async ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p?.reject(new Error(JSON.stringify(m.error))); else p?.resolve(m.result); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
    if (m.method === 'Fetch.requestPaused') {
      const { requestId, request } = m.params;
      requests.push({ url: request.url, headers: request.headers, body: JSON.parse(request.postData) });
      await sleep(150);
      await send('Fetch.fulfillRequest', { requestId, responseCode: replyCode === 0 ? 200 : replyCode === 3002 ? 503 : 504,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
        body: Buffer.from(JSON.stringify({ code: replyCode, message: replyCode === 3002 ? '时间戳已签发，但记录更新失败；请保存返回凭证' : replyCode ? '签发结果待核对，勿重复提交' : '成功',
          ...([0,3002].includes(replyCode) ? { data: { rid: requests.at(-1).body.rid, algorithm: requests.at(-1).url.endsWith('/sm') ? 'SM3' : 'SHA256', sn: 'TEST-20261117', ts: 1763454972517, tsr: 'AQID', nonce: 'test', record_id: 9, record_saved: replyCode === 0 } } : {}) })).toString('base64') });
    }
  };
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await sleep(100); }
    throw new Error('Timed out: '+expression);
  };
  const screenshot = async name => {
    await evaluate('window.scrollTo(0,0)'); await sleep(200);
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    await writeFile(path.join(out, name), Buffer.from(data, 'base64'));
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1419, height: 992, deviceScaleFactor: 1, mobile: false });
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(out, 'downloads') });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*api/timestamp/*', requestStage: 'Request' }] });
  await send('Page.navigate', { url: base });
  await waitFor('!!document.querySelector(".dropzone")');
  await screenshot('desktop-empty.png');
  const fill = async (selector, value) => evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)}); e.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  const chooseFile = async () => {
    await evaluate(`(() => {const dt=new DataTransfer();dt.items.add(new File(['abc'],'新型纤维素降解酶突变体_交底书.pdf'));const el=document.querySelector('#file');el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await waitFor('document.querySelector(".status-strip").textContent.includes("摘要已就绪")');
  };
  await chooseFile();
  await fill('input[maxlength="255"]', '新型纤维素降解酶突变体及其制备方法');
  await fill('[aria-label="第1位研发人员"]', '张某');
  await evaluate('document.querySelector(".add-person").click()');
  await fill('[aria-label="第2位研发人员"]', '李某');
  await evaluate('document.querySelector("[aria-label=上移第2位研发人员]").click()');
  await fill('input[maxlength="512"]', '国家重点研发计划 2026YFA');
  await fill('input[type="date"]', '2026-11-04');
  await evaluate('document.querySelector(".consent input").click()');
  await sleep(100);
  assert.equal(await evaluate('document.querySelector("[aria-label=第1位研发人员]").value'), '李某');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await screenshot('desktop-filled.png');
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('!!document.querySelector("[role=dialog]")');
  await screenshot('desktop-confirm.png');
  await evaluate('document.querySelector(".modal .primary").click();document.querySelector(".modal .primary").click()');
  await waitFor('!!document.querySelector("#result")');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, base+'/api/timestamp/sm');
  assert.equal(requests[0].body.rid, '66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0');
  assert.deepEqual(requests[0].body.achievement.researchers, ['李某','张某']);
  assert.equal(requests[0].body.achievement.confidentiality, 2);
  assert.equal(requests[0].headers['Content-Type'], 'application/json');
  await evaluate('document.querySelector("#result .primary").click()');
  await sleep(500);
  assert.deepEqual(await readFile(path.join(out,'downloads','新型纤维素降解酶突变体_交底书.tsr')), Buffer.from([1,2,3]));
  await screenshot('desktop-success.png');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await screenshot('mobile-success.png');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  // Use a second application for RSA and ambiguous failure handling.
  await evaluate('window.confirm=()=>true;document.querySelector(".text-button").click()');
  await chooseFile();
  await evaluate('document.querySelector("input[value=SHA256]").click(); document.querySelector(".consent input").click()');
  replyCode = 2202;
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('!!document.querySelector(".modal")');
  await evaluate('document.querySelector(".modal .primary").click()');
  await waitFor('document.querySelector(".status-strip").textContent.includes("结果待核对")');
  assert.equal(requests.length, 2);
  assert.ok(requests[1].url.endsWith('/rsa'));
  assert.equal(requests[1].body.rid, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await evaluate('document.querySelector("form .primary").disabled'), true);
  // Preserve issued credentials if the database update fails.
  await evaluate('document.querySelector(".text-button").click()');
  await chooseFile();
  await evaluate('document.querySelector(".consent input").click()');
  replyCode = 3002;
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('!!document.querySelector(".modal")');
  await evaluate('document.querySelector(".modal .primary").click()');
  await waitFor('!!document.querySelector("#result")');
  assert.equal(await evaluate('document.querySelector("[role=alert]").textContent.includes("3002")'), true);
  assert.equal(await evaluate('document.querySelector("#result .primary").disabled'), false);
  assert.deepEqual(errors, []);
  await writeFile(path.join(out,'browser-results.json'), JSON.stringify({ passed:true, requests:requests.length, consoleErrors:errors, checks:['SHA256/SM3 worker hashes','personnel ordering','JSON payload','double-submit prevention','binary certificate download','mobile overflow','ambiguous failure lock','3002 certificate preservation'] }, null, 2));
  console.log('Browser checks passed; screenshots saved under .qa. No real upstream requests sent.');
  await send('Browser.close').catch(()=>{});
} finally { socket?.close(); chrome.kill(); }
