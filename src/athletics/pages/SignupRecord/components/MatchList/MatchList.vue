<template>
  <view class="match-list">
    <view class="px-24rpx flex-y-center mt-24rpx mb-16rpx">
      <view class="mr-16rpx" v-for="(item, index) in navList" :key="index">
        <u-button :type="navId == item.value ? 'primary' : 'white-unactive'" size="small" @click="clickNavItem(item)">
          {{ item.label }}
        </u-button>
      </view>
    </view>
    <LeaderList :show="show && navId == 0" v-show="show && navId == 0"></LeaderList>
    <MemberList :show="show && navId == 1" v-show="show && navId == 1"></MemberList>
  </view>
</template>

<script lang="ts" setup>
import LeaderList from './components/LeaderList/LeaderList.vue';
import MemberList from './components/MemberList/MemberList.vue';
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false
  }
);

const navList = [
  { label: '我的报名', value: 0 },
  { label: '加盟队伍', value: 1 }
];
const navId = ref<number>(0);
function clickNavItem(item) {
  navId.value = item.value;
}
</script>

<style scoped lang="scss">
.sport-list {
  height: calc(100vh - 176rpx);
}
</style>
