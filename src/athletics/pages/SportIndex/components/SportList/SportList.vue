<template>
  <scroll-view class="sport-list" :scroll-y="true" @scrolltolower="scrolltolower">
    <view class="overflow-hidden" v-if="list.length">
      <view
        class="au-container flex px-24rpx pt-36rpx pb-24rpx mb-28rpx"
        v-for="(item, index) in list"
        :key="index"
        @click="clickSportItem(item)"
      >
        <view class="flex-none flex-xy-center items-center w-100rpx">
          <image class="icon-100 rounded-1/2" :src="item.eventLogo" mode="scaleToFill" />
        </view>
        <view class="flex-1 ml-24rpx min-w-0">
          <view class="u-main-color text-32rpx font-bold text-over">{{ item.eventName }}</view>
          <view class="u-main-color text-24rpx h-lh-32rpx mt-12rpx text-over">{{ item.groupName }}</view>
          <view class="u-tips-color text-24rpx h-lh-32rpx mt-12rpx text-over">
            报名时间：{{ formatDate(item.signBeginTime, 'YYYY-MM-DD') }}至{{ formatDate(item.signEndTime, 'YYYY-MM-DD') }}
          </view>
          <view class="u-tips-color text-24rpx h-lh-32rpx mt-6rpx text-over">
            比赛时间：{{ formatDate(item.eventBeginTime, 'YYYY-MM-DD') }}至{{ formatDate(item.eventEndTime, 'YYYY-MM-DD') }}
          </view>
          <view class="flex-y-center tag" :class="'tag--' + item.eventSignupStatus" v-if="item.eventSignupStatus > 0">
            <i class="iconfont text-32rpx" :class="tagMap[item.eventSignupStatus].iconClass"></i>
            <text class="ml-4rpx">{{ tagMap[item.eventSignupStatus].text }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="pt-256rpx" v-else>
      <u-empty
        mode="data"
        :icon="listDefault2"
        text="暂无赛事，敬请期待！"
        width="473rpx"
        height="368rpx"
        textColor="#2d2d2d"
      ></u-empty>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { formatDate } from '@/utils/index';
import { requestTasks } from '@/utils/index';
import { listDefault2 } from '@/athletics/config/images';
import { SportEventGroupListReq, SportEventGroupListRes } from '@/athletics/model/sport';
import { sportEventGroupListApi } from '@/athletics/api/sport';

const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false
  }
);
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(sportHomeEventsFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(sportHomeEventsFn());
  }
  requestTasks.end();
}
async function sportHomeEventsFn() {
  const res = await sportEventGroupListApi(queryParams);
  let bizData = res?.bizData;
  if (!bizData) {
    return;
  }
  if (bizData?.length) {
    queryParams.pageNo++;
  }
  list.push(...bizData);
}

const queryParams = reactive<SportEventGroupListReq>({
  pageNo: 1,
  pageSize: 20
});
const tagMap = {
  1: {
    iconClass: 'icon-a-zu781',
    text: '未开始'
  },
  2: {
    iconClass: 'icon-a-zu782',
    text: '报名中'
  },
  3: {
    iconClass: 'icon-a-zu784',
    text: '已截止'
  }
};
const list = reactive<SportEventGroupListRes[]>([]);
function scrolltolower() {
  requestAll('onReachBottom');
}
function clickSportItem(item) {
  const { eventId, id: eventGroupId } = item;
  uni.navigateTo({
    url: `/athletics/pages/Detail/Detail?eventId=${eventId}&eventGroupId=${eventGroupId}`
  });
}

onLoad(() => {
  requestAll('onLoad');
});
onReachBottom(() => {
  if (!props.show || queryParams.pageNo == 1) {
    return;
  }
  requestAll('onReachBottom');
});
</script>

<style scoped lang="scss">
.tag {
  height: 44rpx;
  line-height: 44rpx;
  border-radius: 0rpx 16rpx 16rpx 16rpx;
  padding: 0 16rpx 0 8rpx;
  color: #fff;
  font-size: 28rpx;
  width: fit-content;
  margin-top: 18rpx;
  &.tag--1 {
    background-color: #abb6c2;
  }
  &.tag--2 {
    background-color: $u-primary;
  }
  &.tag--3 {
    background-color: #a8a8a8;
  }
}
.sport-list {
  height: calc(100vh - 246rpx);
}
</style>
