<template>
  <view class="au-bread-crumb text-28rpx">
    <slot></slot>
  </view>
</template>

<script lang="ts" setup></script>

<style scoped lang="scss">
.au-bread-crumb {
  display: flex;
  align-items: center;
}
.au-bread-crumb::before {
  content: '';
  height: 24rpx;
  width: 0;
  border-left: 8rpx solid $u-primary;
  border-radius: 25%;
  margin-right: 16rpx;
}
</style>
