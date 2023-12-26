<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto px-24rpx"
    :style="{
      backgroundImage: `url(${selectTeamBg})`
    }"
  >
    <view class="au-wrapper__header mt-40rpx rounded-200rpx bg-white">
      <u-tabs
        :list="navList"
        :current="navVal"
        lineWidth="134rpx"
        lineHeight="14rpx"
        lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
        :activeStyle="{
          color: '#2D2D2D',
          fontWeight: 'bold',
          fontSize: '32rpx'
        }"
        :inactiveStyle="{
          color: '#80878F',
          fontSize: '32rpx'
        }"
        itemStyle="height: 82rpx;padding: 0;width: 50%;"
        @change="changeNavVal"
      ></u-tabs>
    </view>
    <view class="au-wrapper__body">
      <view v-show="navVal == 0">
        <MatchList :show="navVal == 0"></MatchList>
      </view>
      <view class="mt-24rpx" v-show="navVal == 1">
        <TeamList :show="navVal == 1"></TeamList>
      </view>
      <view class="fixed bottom-220rpx right-32rpx text-28rpx">
        <view class="flex-xy-center flex-col" @click="clickMoreSportBtn">
          <image class="icon-76" src="@/assets/images/icon-signup-list.png" />
          <text class="mt-8rpx">更多赛事</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import MatchList from './components/MatchList/MatchList.vue';
import TeamList from './components/TeamList/TeamList.vue';
import { selectTeamBg } from '@/athletics/config/images';
import { createLowercasePropertyProxy } from '@/utils/index';
const navList = [{ name: '我的比赛' }, { name: '我的队伍' }];
const navVal = ref<number>(0);
function changeNavVal(item) {
  navVal.value = item.index;
}
function clickMoreSportBtn() {
  uni.navigateTo({
    url: '/athletics/pages/SportIndex/SportIndex'
  });
}

interface OptionInfo {
  navVal?: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  optionInfo.navVal = Number(optionInfo.navVal);
  if (optionInfo.navVal) {
    navVal.value = optionInfo.navVal;
  }
});
</script>

<style scoped lang="scss">
::v-deep .u-tabs__wrapper__nav__line {
  top: 52rpx;
}
.au-wrapper__header {
  box-shadow: inset 0 -10px 10px -10px rgba(0, 0, 0, 0.5);
}
</style>
