# Prototype Instructions

框架和页面结构：只使用 Vue 3，删除旧 React / JSX 入口、组件和依赖；构建工具使用新版 Vite，不保留 Vite 6。按用户选定的首页参考图实现服务首页，主题仍为 #144994；点击“新建存证登记”进入既有四步流程。我的凭证独立页面，参考用户选定的第二张图。页面、业务组合函数、接口适配和公共组件清晰拆分，职责见 docs/modules.md。身份与记录接口未提供前明确显示待接入，不伪造登录人员及历史记录。

签发结果页序列号旁提供复制按钮（线条复制图标+文字），复制完整 SN；成功及失败使用全局 Message 反馈。

打开确认弹窗时背景内容不得位移：页面稳定预留滚动条槽，滚动锁在布局阶段应用，焦点切换不得改变原滚动位置。关联项目标签在登记页、确认页和弹窗均保持单行。

确认信息中“关联项目 / 专利（申请）号”等标签保持单行显示，不在标签中间折行；内容列仍可随长度换行，避免手机横向溢出。

必填文本输入框（成果名称、每位研发人员姓名）在失去焦点后为空时显示红色边框及下方红色提示；输入有效内容后自动清除。每个输入框固定预留 20px 提示行，出现/消失错误时内容不得位移。字段错误用就地提示，接口及操作错误继续使用全局 Message。

最新提示方式：全局使用顶部悬浮 Message 提示条（白底、状态色左边线、图标、关闭按钮），无全屏遮罩，不锁滚动、不抢焦点，默认 5 秒消失；统一公共方法 message.error/warning/success/info，支持 duration 配置及 clear。提交申请确认仍使用确认弹窗。此规则取代此前错误提示使用居中遮罩弹窗的要求。

成果完成日期不能晚于北京时间当天；前端限制日历最大日期，手动填入未来日期弹窗提示并禁用下一步；后端同样在入库及调用上游前拒绝，错误码 1004。所有错误提示统一使用弹窗。

下拉框箭头使用 Lucide ChevronDown 线条图标，右侧垂直居中，展开旋转向上；不要使用文字字符模拟箭头。

成果完成日期默认填入当天日期（Asia/Shanghai），可以手动修改；开始新的申请时重新默认当天。

所有必填星号统一用红色强调，包括卡片底部说明中的星号。

第二步左列顺序：研究单位在上、成果名称在下；研究单位固定显示“中国科学院青岛生物能源与过程研究所”，为只读字段。

第二步必填项完整前，“下一步：确认并提交”按钮必须禁用并置灰；仅空格视为空值；新增的每位研发人员也必须填写姓名。

文件选择后只在虚线框中显示文件名称和文件大小；移除下方重复的文件信息框。未选择文件时显示选择提示和“支持任意文件格式……”说明行，选中文件后将说明行替换为文件大小。

最新上传区偏好：警示说明整体靠左，与虚线文件框左边缘对齐，图标与文字保持垂直居中；选中文件后，将虚线框中的主提示文字替换为实际文件名称，保留重新选择文件按钮。

上传标题不展示星号；隐私说明使用线条警示图标，图标与文字在一行内垂直居中并整体居中；步骤圆圈编号在圆圈内水平、垂直居中。

“摘要在浏览器本地计算，原文不上送服务器”说明前添加警示图标，图标及文字使用可读的深黄色。

前端不再提供“在凭证中包含签名证书”选项，也不发送 cert_req 字段；后端省略该字段时沿用默认 false。

摘要就绪及已签发状态条使用浅绿色背景、绿色文字和绿色左边线，其他区域保留蓝色主题。

交互细节：不使用蓝色粗焦点外框，使用细边框标识焦点；说明文字放在各步白色卡片底部；各步骤保留独立滚动位置；错误提示使用弹窗。确认页及最终确认弹窗展示全部登记字段（包括成果类型、所属研究室/课题组），不展示算法和摘要，提交数据仍保留算法及摘要。

成果类型固定为：专利交底书、论文预印本、原始实验数据、源代码与算法、工艺配方与中试记录、横向合作交付物。成果类型和密级使用与品牌蓝一致的自定义下拉框，保留键盘操作及数值型密级。

最新视觉方向：用户允许整体改版，无需完全复刻原图，但必须保留 #144994 主题色。采用浅灰蓝底、白色轻阴影卡片、圆形编号步骤导航、虚线文件选择区和卡片式算法选项。登记表单采用独立边框输入框；继续保持适中的字号、较小的左右留白及四步独立视图。

最新密度调整：使用适中字号和输入框尺寸，桌面左右边距 28px、卡片内边距 22px。第一页摘要与算法设置左右排列以减少无效空白；不要再整体放大成超大表单。

流程更新：采用四个独立步骤视图。第一页将上传文件及本次存证摘要合并在同一张卡片；第二页仅登记信息，之后是确认提交与凭证下载。切换步骤保留文件、摘要、算法及表单内容，不再同时显示全部板块。

密度偏好：用户不希望界面过于紧凑，也不希望控件过大或左右留白太多。桌面内容尽量占满可用宽度，外边距约 28px、卡片内边距 22px、表单高约 86px、正文字号 13–14px；第一步摘要明细和算法设置并排，手机端再纵向排列。

用户偏好：参照提供的时间戳存证截图，采用四步导航和左右双栏布局。主色使用用户第二张色块的 #144994（从图片采样），不沿用原截图的深藏蓝。文件仅在浏览器本地计算 SHA256/SM3；调用当前后端 JSON 接口；不虚构登录身份。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
