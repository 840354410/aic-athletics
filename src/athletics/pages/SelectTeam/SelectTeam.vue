<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto"
    :style="{
      backgroundImage: `url(${selectTeamBg})`
    }"
  >
    <view class="au-wrapper__body">
      <view class="au-container mt-32rpx mx-32rpx">
        <view class="py-32rpx u-main-color text-28rpx">报名赛事，您可以：</view>
        <view>
          <u-button type="primary" @click="clickCreateTeam">创建队伍</u-button>
        </view>
        <view class="py-32rpx u-main-color text-28rpx text-center">或</view>
        <view class="pb-32rpx u-main-color text-28rpx">选择已有队伍</view>
        <u-list @scrolltolower="scrolltolower" :height="'calc(100vh - 390rpx)'" v-if="teamList?.length">
          <u-list-item v-for="(item, index) in teamList" :key="index">
            <u-cell
              :title="item.teamName"
              :border="false"
              :titleStyle="{
                fontSize: '28rpx'
              }"
            >
              <template #icon>
                <u-avatar size="92rpx" :src="item.teamLogo" customStyle="margin-right: 20rpx"></u-avatar>
              </template>
              <template #value>
                <view>
                  <u-button
                    type="primary"
                    :plain="true"
                    shape="circle"
                    size="mini"
                    :customStyle="{
                      height: '50rpx',
                      lineHeight: '50rpx'
                    }"
                    @click="clickUseTeam(item)"
                  >
                    使用队伍
                  </u-button>
                </view>
              </template>
            </u-cell>
          </u-list-item>
        </u-list>
        <view class="py-48rpx" v-else>
          <u-empty mode="data" :icon="teamDefault" text="暂无队伍" width="450rpx" height="288rpx"></u-empty>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { selectTeamBg, teamDefault } from '@/athletics/config/images';
import { requestTasks, debounce, createLowercasePropertyProxy } from '@/utils/index';
import { SportTeamListRes } from '@/athletics/model/sport';
import { sportMyTeamListApi } from '@/athletics/api/sport';
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  let res;
  if (key == 'onShow') {
    queryParams.pageNo = 1;
    requestTasks.add(sportTeamListFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(sportTeamListFn());
  }
  requestTasks.end();
  return res;
}

async function sportTeamListFn() {
  const { eventGroupId } = optionInfo;
  if (!eventGroupId) {
    return;
  }
  const params = Object.assign({ eventGroupId }, queryParams);
  const task = sportMyTeamListApi(params);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    if (queryParams.pageNo == 1) {
      teamList.length = 0;
    }
    if (bizData?.length) {
      queryParams.pageNo++;
    }
    teamList.push(...bizData);
  });
  return task;
}

let teamSignupId = '';
let teamId = '';
const teamList = reactive<SportTeamListRes[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20
});
async function clickUseTeam(item) {
  teamSignupId = item.teamSignupId;
  teamId = item.teamId;
  // 未报名
  if (!teamSignupId) {
    let url = '/athletics/pages/CreateTeam/CreateTeam';
    url += `?eventId=${optionInfo.eventId}&eventGroupId=${optionInfo.eventGroupId}&teamId=${teamId}`;
    uni.navigateTo({
      url
    });
    return;
  }
  // 已报名未缴费
  if (item.teamPaymentMode == 1 && item.teamSignupOrderNeedPay == 1) {
    uni.navigateTo({
      url: `/athletics/pages/PayOrder/PayOrder?teamSignupId=${teamSignupId}`
    });
    return;
  }
  // 已报名已缴费
  uni.navigateTo({
    url: `/athletics/pages/TeamIndex/TeamIndex?teamSignupId=${teamSignupId}`
  });
}
function clickCreateTeam() {
  uni.navigateTo({
    url: `/athletics/pages/CreateTeam/CreateTeam?eventId=${optionInfo.eventId}&eventGroupId=${optionInfo.eventGroupId}`
  });
}

const scrolltolower = debounce(function () {
  requestAll('onReachBottom');
}, 100);

interface OptionInfo {
  eventId: string | number;
  eventGroupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
onReachBottom(() => {
  if (queryParams.pageNo == 1) {
    return;
  }
  requestAll('onReachBottom');
});
</script>

<style scoped lang="scss">
.au-container {
  padding-left: 48rpx;
  padding-right: 48rpx;
  margin-left: 28rpx;
  margin-right: 28rpx;
}
</style>
