<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto"
    :style="{
      backgroundImage: `url(${selectTeamBg})`
    }"
  >
    <view class="au-wrapper__body mx-24rpx mt-24rpx rounded-24rpx bg-white p-24rpx">
      <u-search
        placeholder="搜索队伍"
        v-model="queryParams.teamName"
        :showAction="false"
        height="76rpx"
        searchIconSize="32rpx"
        @search="clickSearchTeam"
      ></u-search>
      <view class="my-24rpx">
        <u-tabs
          :list="[
            {
              name: '队伍列表'
            }
          ]"
          lineWidth="140rpx"
          lineHeight="10rpx"
          lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
          :activeStyle="{
            color: '#2D2D2D',
            fontWeight: 'bold',
            fontSize: '28rpx'
          }"
          :inactiveStyle="{
            color: '#80878F',
            fontSize: '28rpx'
          }"
          itemStyle="height: 48rpx;padding: 0"
        ></u-tabs>
      </view>
      <view class="-mx-32rpx">
        <u-list @scrolltolower="scrolltolower" :height="'calc(100vh - 248rpx)'" v-if="teamList?.length">
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
                    @click="clickJoinTeam(item)"
                  >
                    加入报名
                  </u-button>
                </view>
              </template>
            </u-cell>
          </u-list-item>
        </u-list>
        <view class="my-320rpx" v-else>
          <u-empty mode="data" :icon="teamDefault" text="暂无队伍报名" width="450rpx" height="288rpx"></u-empty>
        </view>
      </view>
    </view>
    <JoinTeamPopup v-model:show="showCodePopup" :teamSignupId="teamSignupId"></JoinTeamPopup>
  </view>
</template>

<script lang="ts" setup>
import JoinTeamPopup from '@/athletics/components/JoinTeamPopup/JoinTeamPopup.vue';
import { selectTeamBg, teamDefault } from '@/athletics/config/images';
import { requestTasks, debounce, createLowercasePropertyProxy } from '@/utils/index';
import { SportTeamListRes, SportTeamListReq } from '@/athletics/model/sport';
import { sportTeamListApi } from '@/athletics/api/sport';
interface OptionInfo {
  eventId: string | number;
  eventGroupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
});
onReachBottom(() => {
  if (queryParams.pageNo == 1) {
    return;
  }
  requestAll('onReachBottom');
});

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(sportTeamListFn());
  } else if (key == 'clickSearchTeam') {
    queryParams.pageNo = 1;
    teamList.length = 0;
    requestTasks.add(sportTeamListFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(sportTeamListFn());
  }
  requestTasks.end();
}

async function sportTeamListFn() {
  const { eventGroupId, eventId } = optionInfo;
  const params: SportTeamListReq = {
    eventGroupId,
    eventId,
    signupStatus: '',
    ...queryParams
  };
  const res = await sportTeamListApi(params);
  let bizData = res?.bizData;
  if (!bizData) {
    return;
  }
  if (bizData?.length) {
    queryParams.pageNo++;
  }
  teamList.push(...bizData);
}
function toSignupUrl() {
  uni.navigateTo({
    url: `/athletics/pages/Signup/Signup?teamSignupId=${teamSignupId.value}`
  });
}

const teamList = reactive<SportTeamListRes[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  teamName: ''
});
let teamSignupId = ref<string | number>('');
function clickSearchTeam() {
  requestAll('clickSearchTeam');
}
const scrolltolower = debounce(function () {
  requestAll('onReachBottom');
}, 100);
function clickJoinTeam(item) {
  teamSignupId.value = item.teamSignupId;
  if (item.hasJoinCode == 1) {
    showCodePopup.value = true;
  } else {
    toSignupUrl();
  }
}
const showCodePopup = ref<boolean>(false);
</script>

<style scoped lang="scss"></style>
