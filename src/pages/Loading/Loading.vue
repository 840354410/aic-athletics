<template>
  <view class="au-wrapper"></view>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/store/auth';
onLoad((options) => {
  const authStore = useAuthStore();
  uni.reLaunch({
    url: '/athletics/pages/SportIndex/SportIndex'
  });
});
</script>

<style scoped></style>
