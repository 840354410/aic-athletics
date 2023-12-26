<template>
  <div class=""></div>
</template>

<script lang="ts" setup>
import { createLowercasePropertyProxy, setToken } from '@/utils/index';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
interface OptionInfo {
  token: string;
}
// 此页面用于获取url路径上的token，同时重定向到上一个触发授权的页面，以此触发路由拦截，由于uni源码的原因，路由不能拦截首屏页面。
onLoad((options) => {
  const optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  if (optionInfo.token) {
    setToken(optionInfo.token);
    authStore.toLastRequestPath();
  }
});
</script>

<style scoped></style>
