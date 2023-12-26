<template>
  <view class="match-count-down u-primary-light-bg rounded-8rpx u-primary pb-18rpx px-32rpx overflow-hidden" v-if="time > 0">
    <u-divider text="距离比赛开始还有" textSize="28rpx" textColor="#40acff" lineColor="#40acff"></u-divider>
    <u-count-down :time="time" format="DD:HH:mm:ss" autoStart @change="changeTime">
      <view class="flex text-28rpx px-48rpx">
        <view class="flex-1 flex-xy-center flex-col">
          <text class="lh-40rpx">{{ countDownData.days }}</text>
          <text class="lh-32rpx">天</text>
        </view>
        <view class="flex-1 flex-xy-center flex-col">
          <text class="lh-40rpx">{{ countDownData.hours }}</text>
          <text class="lh-32rpx">时</text>
        </view>
        <view class="lh-32rpx">:</view>
        <view class="flex-1 flex-xy-center flex-col">
          <text class="lh-40rpx">{{ countDownData.minutes }}</text>
          <text class="lh-32rpx">分</text>
        </view>
        <view class="lh-32rpx">:</view>
        <view class="flex-1 flex-xy-center flex-col">
          <text class="lh-40rpx">{{ countDownData.seconds }}</text>
          <text class="lh-32rpx">秒</text>
        </view>
      </view>
    </u-count-down>
  </view>
</template>

<script lang="ts" setup>
import { setObjectOwnProperty } from '@/utils/index';
interface MatchCountDownProps {
  time: number;
}
const props = withDefaults(defineProps<MatchCountDownProps>(), {
  time: 0
});
const countDownData = reactive({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});
function changeTime(e) {
  if (e) {
    for (let key in e) {
      e[key] = e[key].toString().padStart(2, '0');
    }
  }
  setObjectOwnProperty(countDownData, e);
}
</script>

<style scoped></style>
