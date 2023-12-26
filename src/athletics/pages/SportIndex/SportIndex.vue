<template>
  <view class="au-wrapper overflow-hidden">
    <view
      class="au-wrapper__header flex-xy-center flex-col bg-cover-auto"
      :style="{
        backgroundImage: `url(${indexBg})`
      }"
    ></view>
    <view class="au-wrapper__body">
      <view class="mx-24rpx mt-32rpx">
        <SportList></SportList>
      </view>
      <view class="fixed bottom-100rpx right-32rpx text-28rpx">
        <view class="flex-xy-center flex-col" @click="clickSignupListBtn">
          <image class="icon-76" src="@/assets/images/icon-signup-list.png" />
          <text class="mt-8rpx">我的报名</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import SportList from './components/SportList/SportList.vue';
import { indexBg, aicLogoUrl } from '@/athletics/config/images';
import { createLowercasePropertyProxy } from '@/utils/index';

function clickSignupListBtn() {
  uni.navigateTo({
    url: '/athletics/pages/SignupRecord/SignupRecord?navVal=0'
  });
}

interface OptionInfo {
  navVal?: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
});
</script>

<style scoped lang="scss">
.au-wrapper__header {
  height: 212rpx;
}
</style>
