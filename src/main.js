// Vue 3 唯一入口。公共样式与路由在这里注册。
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router/index.js";
import "./styles/workflow.css";
import "./styles/components.css";
import "./components/message.css";
import "./styles/portal.css";
createApp(App).use(router).mount("#app");
