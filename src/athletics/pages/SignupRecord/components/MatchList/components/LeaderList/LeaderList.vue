<template>
  <scroll-view class="leader-list" :scroll-y="true" @scrolltolower="scrolltolower">
    <view class="overflow-hidden" v-if="list.length">
      <view
        class="au-container px-24rpx pt-36rpx pb-24rpx mb-28rpx"
        v-for="(item, index) in list"
        :key="index"
        @click="clickListItem(item)"
      >
        <view class="flex pb-40rpx border-b-2">
          <view class="flex-none">
            <image class="icon-100 rounded-1/2" :src="item.eventTeamLogo || headImg" mode="scaleToFill" />
          </view>
          <view class="flex-1 ml-24rpx min-w-0">
            <view class="u-main-color text-32rpx font-bold text-over">{{ item.signupUserName || item.eventTeamName }}</view>
            <view class="u-tips-color text-28rpx h-lh-32rpx mt-12rpx text-over">
              {{ item.eventName + '（' + item.groupName + '）' }}
            </view>
          </view>
          <view class="flex-y-center text-28rpx" :class="auditStatusMap[item.auditStatus]?.className">
            <image class="icon-28" :src="auditStatusMap[item.auditStatus]?.iconUrl" mode="widthFix" />
            <text class="ml-8rpx font-bold">{{ auditStatusMap[item.auditStatus]?.text }}</text>
          </view>
        </view>
        <view
          class="u-main-color text-28rpx pt-24rpx mx-24rpx"
          v-if="item.securityDepositPayMode == 1 || Number(item.individualSignupId) > 0"
        >
          <view class="flex-y-center py-24rpx justify-between">
            <text>队伍保证金</text>
            <template v-if="Number(item.securityDeposit) > 0">
              <text>￥{{ item.securityDeposit }}</text>
              <template v-if="!item?.securityDepositOrderList?.length">
                <text>未缴费</text>
              </template>
              <template v-else>
                <text v-if="item.securityDepositPayMode != 2">已缴费</text>
                <text v-else-if="item.securityDepositPayMode == 2">已缴费{{ item?.securityDepositOrderList?.length }}人</text>
              </template>
            </template>
            <template v-else>
              <text>无需缴费</text>
            </template>
          </view>
          <view class="flex-y-center py-12rpx justify-between">
            <text>队伍报名费</text>
            <template v-if="Number(item.signFee) > 0">
              <text>￥{{ item.signFee }}</text>
              <template v-if="!item?.signFeeOrderList?.length">
                <text>未缴费</text>
              </template>
              <template v-else>
                <text v-if="item.signPayMode != 2">已缴费</text>
                <text v-else-if="item.signPayMode == 2">已缴费{{ item?.signFeeOrderList?.length }}人</text>
              </template>
            </template>
            <template v-else>
              <text>无需缴费</text>
            </template>
          </view>
        </view>
      </view>
    </view>
    <view class="pt-256rpx" v-else>
      <u-empty
        mode="data"
        :icon="listDefault1"
        text="您还没有报名赛事哦，赶紧去报名吧！"
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
import { checkUrl, checkPassUrl, headImg, listDefault1 } from '@/athletics/config/images';
import { Page, TeamSignupListByLeaderRes } from '@/athletics/model/sport';
import { signupListByUserApi } from '@/athletics/api/sport';
import { auditStatusMap } from '@/athletics/utils/util';

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
    requestTasks.add(signupListByUserFn());
  } else if (key == 'onShow') {
    queryParams.pageNo = 1;
    list.length = 0;
    requestTasks.add(signupListByUserFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(signupListByUserFn());
  }
  requestTasks.end();
}
async function signupListByUserFn() {
  const res = await signupListByUserApi(queryParams);
  let bizData = res?.bizData;
  if (!bizData) {
    return;
  }
  if (bizData?.length) {
    queryParams.pageNo++;
  }
  list.push(...bizData);
}

const queryParams = reactive<Page>({
  pageNo: 1,
  pageSize: 20
});
const list = reactive<TeamSignupListByLeaderRes[]>([]);
function scrolltolower() {
  requestAll('onReachBottom');
}
function clickListItem(item) {
  if (Number(item.individualSignupId) > 0) {
    uni.navigateTo({
      url: `/athletics/pages/PersonOrder/PersonOrder?individualSignupId=${item.individualSignupId}`
    });
  } else {
    uni.navigateTo({
      url: `/athletics/pages/LeaderOrder/LeaderOrder?teamSignupId=${item.teamSignupId}`
    });
  }
}

let firstLoad = true;
onLoad(() => {
  requestAll('onLoad');
  setTimeout(() => {
    firstLoad = false;
  });
});
onShow(() => {
  if (!firstLoad) {
    setTimeout(() => {
      requestAll('onShow');
    }, 500);
  }
});
onReachBottom(() => {
  if (!props.show || queryParams.pageNo == 1) {
    return;
  }
  requestAll('onReachBottom');
});
</script>

<style scoped lang="scss">
.leader-list {
  height: calc(100vh - 222rpx);
}
</style>
