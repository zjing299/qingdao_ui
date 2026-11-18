// 哈希路由可直接部署到静态站点；KeepAlive 在 App 中保留未完成草稿。
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RegistrationView from "../views/RegistrationView.vue";
import CertificatesView from "../views/CertificatesView.vue";
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "服务首页" },
    },
    {
      path: "/register",
      name: "register",
      component: RegistrationView,
      meta: { title: "新建存证登记" },
    },
    {
      path: "/certificates",
      name: "certificates",
      component: CertificatesView,
      meta: { title: "我的凭证" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.name !== "register") return savedPosition || { top: 0 };
  },
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · 知识产权可信时间戳存证`;
});
