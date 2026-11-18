# qingdao_ui

全局消息提示统一使用公共方法（无全屏遮罩）：

```js
import { message } from "./utils/message.js";

message.error("请填写正确的信息");
message.success("操作成功");
message.warning("请注意核对");
message.info("提示内容", { duration: 3000 });
// 默认 5 秒消失；duration: 0 表示保持显示，支持手动关闭。
message.clear();
```

`MessageHost` 在应用入口挂载一次；相同类型的重复内容会合并，最多同时显示 4 条。提交申请确认弹窗继续使用确认对话框。

知识产权可信时间戳存证前端。使用 Vue 3 + Vue Router + Vite 8，独立于同级 qingdao_backend。模块职责和接口预留合同详见 [docs/modules.md](docs/modules.md)。

## 本地开发

```sh
npm install
npm run dev -- --port 5173
```

浏览器访问 http://localhost:5173。开发服务器将 `/api` 代理到 `http://127.0.0.1:3010`。后端端口不同时，启动 Vite 前设置 `API_PROXY_TARGET` 环境变量；PowerShell 示例：`$env:API_PROXY_TARGET='http://127.0.0.1:3010'`。

也可以在 `.env.local` 中设置 `API_PROXY_TARGET`，更改后重启前端。当前本机联调配置指向后端实际监听的 `http://192.168.188.32:3010`。

## 功能

页面包括服务首页、我的凭证、新建存证登记。首页的“新建存证登记”进入四步流程：文件选择和摘要设置、登记信息、确认提交、凭证下载。页面切换使用 Vue Router，缓存未完成的草稿；刷新浏览器不保存敏感信息。

- 单个任意类型文件，最大 2 GB；Web Worker 内分块计算 SHA256 和 SM3，原文件不上传。
- 成果信息、研发人员排序、密级、算法选择、声明与二次确认。研究单位只读；完成日期默认当天且不能晚于北京时间当天；必填项失焦后显示就地提示，提示行预留空间。
- POST `/api/timestamp/sm` 或 `/api/timestamp/rsa`，Content-Type 为 application/json。仅发送 rid、achievement。密级 1 公开、2 内部、3 秘密。
- 成功后下载 Base64 解码得到的二进制 `.tsr`，保存序列号、签发时间及入库状态。3002 错误仍保留凭证下载。
- 网络异常或结果不确定时禁止再次提交，需人工核对后开始新申请。页面刷新后不保留文件、表单或凭证，请先保存凭证。
- “我的凭证”按参考图提供统计、筛选、分页、详情及下载模块。当前后端尚未实现身份认证及个人记录接口，默认明确显示待接入，不展示示例用户或虚构记录。接入说明见 docs/modules.md；`VITE_MY_CERTIFICATES_ENABLED=true` 仅应在后端对接完成后启用。

## 验证与部署

`npm test` 检查标准摘要向量、跨块计算及 JSON 请求；`npm run build` 构建前端。

部署使用 `dist/client`，由 Nginx 等静态服务器提供文件，并将同源 `/api/` 转发到后端。Vite 的开发代理不在生产构建中生效。前端无需 AppKey、AppSecret 或数据库凭据，不得将这些密钥写入前端环境变量。

浏览器自动化使用 `node scripts/browser-check.mjs`；采用独立的 Chrome 无头配置，不读取用户浏览器会话。浏览器流程使用拦截的测试响应，不消耗真实签发额度，也不修改真实数据库。
