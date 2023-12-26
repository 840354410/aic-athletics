<template>
  <view class="au-wrapper overflow-hidden">
    <view class="au-wrapper__body">
      <view class="au-container m-20rpx">
        <view class="border-b-2 text-center">
          <view class="u-main-color font-bold text-32rpx py-24rpx" v-if="agreementData.title">{{ agreementData.title }}</view>
          <view class="u-main-color text-28rpx pt-8rpx pb-50rpx" v-if="agreementData.subTitle">{{ agreementData.subTitle }}</view>
        </view>
        <view class="text-24rpx my-48rpx">
          <u-parse :content="agreementData.content" :tagStyle="getUParseTagStyle()"></u-parse>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { requestTasks, createLowercasePropertyProxy, getUserRemark, getPrivacyRemark, getUParseTagStyle } from '@/utils/index';
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  requestTasks.end();
}

const agreementData = computed(() => {
  const obj = {
    title: '',
    subTitle: '',
    content: ''
  };
  const { bizAction } = optionInfo.value || {};
  if (bizAction == 'userRemark') {
    obj.title = '用户服务协议';
    obj.content = getUserRemark();
  } else if (bizAction == 'privacyRemark') {
    obj.title = '隐私政策';
    obj.content = getPrivacyRemark();
  }
  uni.setNavigationBarTitle({
    title: obj.title
  });
  return obj;
});

interface OptionInfo {
  bizAction: 'userRemark' | 'privacyRemark' | '';
}
let optionInfo = ref<OptionInfo>({
  bizAction: ''
});
onLoad((options) => {
  optionInfo.value = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
</script>

<style scoped lang="scss">
.au-container {
  padding: 24rpx 48rpx;
  background: #fff;
  border-radius: 20rpx;
}
</style>
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
