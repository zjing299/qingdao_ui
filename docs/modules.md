# 前端模块说明

本项目使用 Vue 3 Composition API、Vue Router 和 Vite。页面组件负责布局，业务组合函数负责状态和流程，接口层负责网络协议。只保留一套 Vue 实现。

## 目录职责

| 目录 / 文件                                            | 职责                                                     |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `src/main.js`                                          | 唯一应用入口，注册路由和公共样式                         |
| `src/App.vue`                                          | 应用壳、公共导航、页面缓存和全局消息宿主                 |
| `src/router/index.js`                                  | 首页、我的凭证、新建登记路由，使用哈希路由适配静态部署   |
| `src/layouts/AppHeader.vue`                            | 全站统一导航，展示实际的身份服务接入状态                 |
| `src/views/HomeView.vue`                               | 服务介绍、办理指南、成果类型和在线办理入口               |
| `src/modules/home/content.js`                          | 首页静态文案与流程配置                                   |
| `src/views/RegistrationView.vue`                       | 四步登记页面编排及最终确认弹窗                           |
| `src/modules/timestamp/useTimestamp.js`                | 文件摘要生命周期、人员排序、状态锁、提交和结果处理       |
| `src/modules/timestamp/components/`                    | 上传、登记、确认、结果四个独立步骤；共用登记信息展示     |
| `src/modules/timestamp/constants.js`                   | 成果类型、密级、研究单位和北京时间日期工具               |
| `src/views/CertificatesView.vue`                       | 我的凭证页面，组合统计、筛选、列表和详情                 |
| `src/modules/certificates/useCertificates.js`          | 我的申请列表分页、请求取消、详情加载和下载               |
| `src/modules/certificates/components/`                 | 筛选表单、记录表格、申请详情弹窗                         |
| `src/api/timestamp.js`                                 | 现有 RSA / SM 存证接口与二进制凭证下载                   |
| `src/api/certificates.js`                              | 个人记录接口适配位置，未接入时不发请求、不显示虚构数据   |
| `src/components/common/`                               | 下拉框、确认弹窗、必填输入、复制按钮、消息宿主等公共组件 |
| `src/utils/message.js`                                 | 全局 `message.error/success/warning/info` 公共方法       |
| `src/hash-file.js`、`src/hash.worker.js`               | 浏览器分块计算 SHA256 / SM3；不上传文件内容              |
| `src/styles/portal.css`                                | 首页、个人凭证及导航样式                                 |
| `src/styles/workflow.css`、`src/styles/components.css` | 办理流程和公共控件样式；所有页面沿用品牌蓝 `#144994`     |
| `scripts/browser-check.mjs`                            | 隔离浏览器中的页面及完整流程验证；真实签发请求被拦截     |

## 页面关系与草稿

- `/#/`：服务首页。
- `/#/register`：新建存证登记。首页和顶部导航均可进入。
- `/#/certificates`：我的凭证。
- 路由缓存保留未完成的文件、摘要、登记内容和步骤；刷新浏览器不会保存原文或敏感草稿。
- 第一步只选文件和算法；第二步所有必填项完整后方可下一步；第三步声明与确认；第四步下载和复制序列号。
- 未确认提交前，不向上游申请签发；请求结果不确定时禁用重复提交。
- 日期按北京时间判断，不允许晚于当天；字段失焦错误就地显示，操作和接口错误使用全局悬浮消息。

## 我的凭证接口边界（待接入）

当前后端只有 `/api/timestamp/rsa`、`/api/timestamp/sm`，尚无身份认证及个人列表接口。因此默认显示明确的待接入状态，统计为 `—`，不使用示例身份、伪造申请记录或用前端 user_id 过滤全部记录。

对接完成后，在 `.env.local` 设置 `VITE_MY_CERTIFICATES_ENABLED=true` 并重启开发服务。接口位置集中维护在 `src/api/certificates.js`，当前约定如下（这是预留合同，并非已实现的后端路由）：

```text
GET /api/timestamp/applications/me
  ?keyword=...&status=2&type=...&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&page_size=10
GET /api/timestamp/applications/me/:id
```

所有请求携带登录会话，用户身份必须由后端提取。列表、详情及凭证读取均必须校验记录归属；不得仅依赖 UI 隐藏、路由或前端传入的用户编号。

列表成功示例结构：

```json
{
  "code": 0,
  "data": {
    "items": [],
    "total": 0,
    "stats": { "all": 0, "issued": 0, "pending": 0, "unknown": 0, "failed": 0 }
  }
}
```

记录包含 `id`、数值 `status`、`created_at`、`achievement` 登记对象、`serial_number`、`issued_at_ms`。详情返回同一对象及已签发记录的 Base64 `tsr`。列表不需要返回完整凭证。状态与当前后端一致：1 待签发、2 已签发、3 明确失败、4 待核对。只有已签发记录显示下载按钮；待核对记录不提供重复申请操作。

## 公共组件使用

```vue
<RequiredInput v-model="form.name" error-text="请输入成果名称" />
<BaseSelect v-model="form.type" label="成果类型" :options="options" />
<CopyButton :value="serialNumber" label="序列号" />
```

```js
import { message } from "./utils/message.js";
message.error("操作失败");
message.success("操作成功");
message.info("提示内容", { duration: 3000 });
```

`BaseModal` 仅用于需明确确认的操作，具有焦点循环和背景滚动锁；消息条不遮罩、不抢焦点。
