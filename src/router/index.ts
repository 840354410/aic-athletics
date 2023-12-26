import uniCrazyRouter from 'uni-crazy-router';
import { useAuthStore } from '@/store/auth';
export function setupRouter(app) {
  // 接收vue3的实例，并注册uni-crazy-router
  app.use(uniCrazyRouter);
}

const loginUrl = 'pages/Login/Login';
uniCrazyRouter.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  authStore.isAuthing = false;
  // 拦截个毛线，很多不知道的页面不需要拦截，拦截不了一点
  await authStore.getUserInfo();
  if (authStore.token && authStore.userInfo?.phone && to && to.url === loginUrl) {
    uniCrazyRouter.afterNotNext(() => {
      // 拦截路由，并且跳转去赛事列表页面
      uni.navigateTo({
        url: '/athletics/pages/SportIndex/SportIndex'
      });
    });
    return;
  }
  next();
});
uniCrazyRouter.afterEach(async (to, from) => {
  const authStore = useAuthStore();
  authStore.isAuthing = false;
  if (!authStore.token && to.url === loginUrl && to.query?.bizaction !== 'login') {
    authStore.authH5();
    return; // 拦截路由，不执行next
  }
  if (authStore.token && authStore.userInfo?.phone && to && to.url === loginUrl) {
    // 拦截路由，并且跳转去赛事列表页面
    uni.navigateTo({
      url: '/athletics/pages/SportIndex/SportIndex'
    });
    return;
  }
  await authStore.getUserInfo();
});

uniCrazyRouter['on' + 'Error']((to, from) => {
  // 逻辑代码
});
