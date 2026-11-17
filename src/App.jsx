import { useEffect, useRef, useState } from 'react';
import { MAX_FILE_BYTES } from './hash-file.js';
import { applyTimestamp, downloadCertificate } from './api.js';

const initialForm = { name: '', type: '专利交底书', research_unit: '中国科学院青岛生物能源与过程研究所', research_group: '', confidentiality: 2, related_project_no: '', completion_date: '' };
const levels = { 1: '公开', 2: '内部', 3: '秘密' };
const uncertainCodes = [2200, 2201, 2202, 2300, 3002, 9000];
function sizeText(n) { return n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`; }
function shortHash(s) { return s ? `${s.slice(0, 12)}···${s.slice(-6)}` : '等待计算'; }

export function App() {
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [people, setPeople] = useState(['']);
  const [algorithm, setAlgorithm] = useState('SM3');
  const [certReq, setCertReq] = useState(false);
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const worker = useRef(null);
  const submitLock = useRef(false);
  const fileInput = useRef(null);
  const formRef = useRef(null);
  const uploadRef = useRef(null);
  const cancelRef = useRef(null);
  const locked = submitting || !!result || uncertain;
  const step = result ? 4 : confirming || submitting ? 3 : hashes ? 2 : 1;
  useEffect(() => () => worker.current?.terminate(), []);
  useEffect(() => {
    if (!confirming) return;
    cancelRef.current?.focus();
    function escape(e) { if (e.key === 'Escape' && !submitLock.current) setConfirming(false); }
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [confirming]);

  function selectFile(candidate) {
    if (!candidate || locked) return;
    setError('');
    if (candidate.size > MAX_FILE_BYTES) { setError('文件超过 2 GB，请选择较小的文件'); return; }
    worker.current?.terminate();
    setFile(candidate); setHashes(null); setProgress(0); setConsent(false);
    const current = new Worker(new URL('./hash.worker.js', import.meta.url), { type: 'module' });
    worker.current = current;
    current.onmessage = ({ data }) => {
      if (worker.current !== current) return;
      if (data.progress !== undefined) setProgress(data.progress);
      if (data.hashes) { setHashes(data.hashes); current.terminate(); }
      if (data.error) { setError(data.error); current.terminate(); }
    };
    current.onerror = () => { setError('摘要计算失败，请重新选择文件'); current.terminate(); };
    current.postMessage(candidate);
  }
  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }
  function movePerson(index, direction) {
    setPeople(old => { const next = [...old]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; });
  }
  function review(e) {
    e.preventDefault(); setError('');
    if (!hashes) { setError('请先选择文件并等待摘要计算完成'); uploadRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (!form.name.trim() || !form.research_unit.trim() || people.some(p => !p.trim())) { setError('成果名称、研究单位及每位研发人员姓名不能为空'); return; }
    if (!consent) { setError('请先阅读并勾选声明'); return; }
    setConfirming(true);
  }
  async function submit() {
    if (submitLock.current || locked) return;
    submitLock.current = true; setSubmitting(true); setError('');
    const achievement = { ...form, name: form.name.trim(), research_unit: form.research_unit.trim(), researchers: people.map(p => p.trim()) };
    try {
      const response = await applyTimestamp(algorithm, { rid: hashes[algorithm.toLowerCase()], cert_req: certReq, achievement });
      if ((response.code === 0 || response.code === 3002) && response.data?.tsr) {
        setResult(response.data);
        if (response.code === 3002) setError(`错误码 3002：${response.message}`);
      } else {
        setError(`错误码 ${response.code}：${response.message || '申请失败'}`);
        setUncertain(uncertainCodes.includes(response.code) || response.code === 0);
      }
    } catch {
      setError('连接中断或响应异常，签发结果待核对。请联系管理员核对申请记录，勿重复提交。');
      setUncertain(true);
    } finally { setSubmitting(false); setConfirming(false); submitLock.current = false; }
  }
  function download() {
    try { downloadCertificate(result.tsr, file.name); } catch { setError('凭证下载失败，请保留页面并联系管理员'); }
  }
  function reset() {
    if (!window.confirm('开始新的申请将清空当前页面，请确认已保存凭证或已核对申请结果。')) return;
    worker.current?.terminate(); setFile(null); setHashes(null); setProgress(0); setResult(null); setError(''); setUncertain(false); setConsent(false);
    if (fileInput.current) fileInput.current.value = '';
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  function stepClick(index) {
    if (index === 0) uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (index === 1) formRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (index === 2 && !locked) formRef.current?.requestSubmit();
    if (index === 3 && result) document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
  }
  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner"><h1>知识产权可信时间戳存证 <span>/ 在线办理</span></h1><span className="org-name">青岛生物能源与过程研究所</span><span className="header-tag">文件摘要存证</span></div></header>
    <nav className="steps" aria-label="办理步骤">{['上传知产文件', '填写登记信息', '确认并提交', '下载 .tsr 凭证'].map((label, i) => <button type="button" key={label} onClick={() => stepClick(i)} aria-current={step === i + 1 ? 'step' : undefined} className={step === i + 1 ? 'active' : step > i + 1 ? 'complete' : ''}>{String(i + 1).padStart(2, '0')} <span>{label}</span></button>)}</nav>
    <main className="workspace">
      <div className="main-column">
        <section className="panel upload-panel" ref={uploadRef} aria-labelledby="upload-title">
          <h2 id="upload-title">① 上传知产文件 <span className="required">*</span></h2>
          <input ref={fileInput} id="file" type="file" className="visually-hidden" tabIndex={-1} disabled={locked} onChange={e => selectFile(e.target.files?.[0])} />
          <button type="button" className={`dropzone ${dragging ? 'dragging' : ''}`} disabled={locked} onClick={() => fileInput.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length !== 1) { setError('每次请选择一个文件'); return; } selectFile(e.dataTransfer.files[0]); }}>
            <strong>{file ? '重新选择文件' : '将知产文件拖至此处，或点击选择文件'}</strong><span>支持 PDF / DOCX / XLSX / ZIP / 代码包等，单文件 ≤ 2 GB</span>
          </button>
          {file && <div className="file-strip"><strong title={file.name}>{file.name}</strong><span>{sizeText(file.size)}</span><span>{hashes ? (result ? '已签发' : 'SM3 / SHA256 已计算 · 待提交') : `正在本地计算摘要 · ${progress}%`}</span></div>}
          {file && !hashes && !error && <progress max="100" value={progress} aria-label="摘要计算进度" />}
          <p className="privacy-note">摘要在浏览器本地计算，原文不上送服务器。</p>
        </section>
        <form ref={formRef} onSubmit={review}>
          <section className="panel registration" aria-labelledby="registration-title">
            <h2 id="registration-title">② 登记信息</h2>
            <p className="section-note">请核对成果登记信息；研发人员可添加、删除及调整顺序。</p>
            <fieldset disabled={locked} className="fields">
              <label className="field"><span>成果名称 <b>*</b></span><input required maxLength={255} value={form.name} placeholder="请输入科技成果的正式名称" onChange={e => update('name', e.target.value)} /></label>
              <label className="field"><span>成果类型 <b>*</b></span><select value={form.type} onChange={e => update('type', e.target.value)}>{['专利交底书', '研究报告', '技术方案', '软件著作权', '论文', '其他'].map(t => <option key={t}>{t}</option>)}</select></label>
              <label className="field"><span>研究单位 <b>*</b></span><input required maxLength={255} value={form.research_unit} onChange={e => update('research_unit', e.target.value)} /></label>
              <label className="field"><span>所属研究室 / 课题组</span><input maxLength={255} value={form.research_group} placeholder="请输入研究室或课题组" onChange={e => update('research_group', e.target.value)} /></label>
              <div className="field people-field"><span>成果研发人员 <b>*</b>（可多人 / 排序）</span><div className="people-list">{people.map((person, i) => <div className="person" key={i}><span className="person-index">{i + 1}</span><input aria-label={`第${i + 1}位研发人员`} required maxLength={100} value={person} placeholder="姓名" onChange={e => setPeople(old => old.map((p, n) => n === i ? e.target.value : p))} /><button type="button" aria-label={`上移第${i + 1}位研发人员`} disabled={i === 0} onClick={() => movePerson(i, -1)}>上移</button><button type="button" aria-label={`下移第${i + 1}位研发人员`} disabled={i === people.length - 1} onClick={() => movePerson(i, 1)}>下移</button>{people.length > 1 && <button type="button" aria-label={`删除第${i + 1}位研发人员`} onClick={() => setPeople(old => old.filter((_, n) => n !== i))}>删除</button>}</div>)}</div><button className="add-person" type="button" disabled={people.length >= 100} onClick={() => setPeople(old => [...old, ''])}>＋ 添加研发人员</button></div>
              <label className="field"><span>密级 <b>*</b></span><select value={form.confidentiality} onChange={e => update('confidentiality', Number(e.target.value))}>{Object.entries(levels).map(([n, label]) => <option value={n} key={n}>{label}</option>)}</select><small>公开 / 内部 / 秘密</small></label>
              <label className="field"><span>关联项目 / 专利（申请）号</span><input maxLength={512} value={form.related_project_no} placeholder="请输入关联项目或专利申请号" onChange={e => update('related_project_no', e.target.value)} /></label>
              <label className="field"><span>成果完成日期</span><input type="date" min="1000-01-01" max="9999-12-31" value={form.completion_date} onChange={e => update('completion_date', e.target.value)} /></label>
            </fieldset>
          </section>
          <section className="panel submission" aria-labelledby="submission-title">
            <h2 id="submission-title">③ 声明与提交</h2>
            <label className="consent"><input type="checkbox" checked={consent} disabled={locked} onChange={e => setConsent(e.target.checked)} /><span>本人确认所传文件为本所职务成果，登记信息真实；知悉本服务为可信时间戳存证，不构成著作权确权登记。</span></label>
            {error && <div role="alert" className="error-message">{error}</div>}
            <div className="actions"><button type="button" className="secondary" disabled={submitting} onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })}>上一步</button><button className="primary" type="submit" disabled={locked || !hashes}>{submitting ? '正在申请，请勿关闭页面…' : result ? '已完成签发，请下载凭证' : uncertain ? '签发结果待核对' : '确认提交并申请可信时间戳 →'}</button></div>
            {(result || uncertain) && <button type="button" className="text-button" onClick={reset}>开始新的申请</button>}
          </section>
        </form>
      </div>
      <aside className="sidebar">
        <section className="panel summary"><h2>本次存证摘要</h2><dl><div><dt>文件</dt><dd title={file?.name}>{file?.name || '尚未选择文件'}</dd></div><div><dt>大小</dt><dd>{file ? sizeText(file.size) : '—'}</dd></div><div><dt>SM3</dt><dd title={hashes?.sm3}>{shortHash(hashes?.sm3)}{hashes && '（64 字符）'}</dd></div><div><dt>SHA256</dt><dd title={hashes?.sha256}>{shortHash(hashes?.sha256)}{hashes && '（64 字符）'}</dd></div></dl>
          <fieldset className="algorithm" disabled={locked}><legend>算法</legend>{['SM3', 'SHA256'].map(a => <label key={a}><input type="radio" name="algorithm" value={a} checked={algorithm === a} onChange={() => setAlgorithm(a)} />{a === 'SM3' ? '国密 SM3（默认）' : 'SHA256 / RSA'}</label>)}</fieldset>
          <label className="certificate-option"><input type="checkbox" checked={certReq} disabled={locked} onChange={e => setCertReq(e.target.checked)} />在凭证中包含签名证书</label>
          <p className="issuer-note">出证　由所内管理端统一调用，页面不持有密钥</p>
          <div className="status-strip" role="status">状态：{result ? '已签发 · 请下载保存凭证' : uncertain ? '结果待核对 · 请勿重复申请' : submitting ? '申请处理中' : hashes ? '摘要已就绪 · 等待确认提交' : file ? `摘要计算中 · ${progress}%` : '等待选择文件'}</div>
        </section>
        {result ? <section className="panel result-card" id="result"><h2>④ 时间戳凭证已签发</h2><dl><div><dt>序列号</dt><dd>{result.sn}</dd></div><div><dt>签发时间</dt><dd>{new Date(result.ts).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}（北京时间）</dd></div><div><dt>记录编号</dt><dd>{result.record_id || '—'}</dd></div><div><dt>入库状态</dt><dd>{result.record_saved ? '已保存' : '待核对，请保留凭证'}</dd></div></dl><button type="button" className="primary" onClick={download}>下载 .tsr 凭证</button><p>请将凭证与原文件一同保存，原文件改动后摘要将发生变化。</p></section> : <section className="panel certificate-info"><h2>将取得的凭证 · .tsr</h2><p>提交后由所内管理端调用时间戳服务，返回标准时间戳凭证：</p><ul><li>生成“原文件名.tsr”，供您下载并自行存储</li><li>建议与源文件同目录保存，二者均勿改动</li><li>所内台账同步留存序列号、时间与摘要，供统计与复核</li></ul></section>}
        <section className="security-card"><h2>安全边界</h2><p>本页不上传原文 · 不持有 AppKey / AppSecret</p><p>对外仅传输摘要与必要接口参数</p><p>成果登记信息仅保存在所内台账</p></section>
      </aside>
    </main>
    <footer>* 标注字段为必填 ｜ 登记信息将写入所内台账，用于统计报表与后续核验 ｜ 本页为一次一份文件存证</footer>
    {confirming && <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget && !submitting) setConfirming(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onKeyDown={e => { if (e.key === 'Tab') { const items = Array.from(e.currentTarget.querySelectorAll('button:not(:disabled)')); if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus(); } else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus(); } } }}><h2 id="confirm-title">确认存证申请</h2><p>请核对以下信息，确认后将向时间戳服务申请签发。</p><dl><div><dt>文件</dt><dd>{file.name}</dd></div><div><dt>成果名称</dt><dd>{form.name}</dd></div><div><dt>研发人员</dt><dd>{people.join('、')}</dd></div><div><dt>密级</dt><dd>{levels[form.confidentiality]}</dd></div><div><dt>算法</dt><dd>{algorithm}</dd></div><div><dt>摘要</dt><dd className="full-hash">{hashes[algorithm.toLowerCase()]}</dd></div></dl><div className="actions"><button ref={cancelRef} className="secondary" disabled={submitting} onClick={() => setConfirming(false)}>返回修改</button><button className="primary" disabled={submitting} onClick={submit}>{submitting ? '正在提交…' : '确认申请'}</button></div></div></div>}
  </div>;
}
