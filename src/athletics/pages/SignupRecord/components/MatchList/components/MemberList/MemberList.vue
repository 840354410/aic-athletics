<template>
  <view>
    <scroll-view class="leader-list" :scroll-y="true" @scrolltolower="scrolltolower">
      <view class="overflow-hidden" v-if="list.length">
        <view
          class="au-container px-24rpx pt-36rpx pb-24rpx mb-28rpx"
          v-for="(item, index) in list"
          :key="index"
          @click="clickListItem(item)"
        >
          <view class="flex">
            <view class="flex-none">
              <image class="icon-100 rounded-1/2" :src="item.eventTeamLogo || aicLogoUrl" mode="scaleToFill" />
            </view>
            <view class="flex-1 ml-24rpx min-w-0">
              <view class="u-main-color text-32rpx font-bold text-over">{{ item.eventTeamName }}</view>
              <view class="u-tips-color text-28rpx h-lh-32rpx mt-12rpx text-over">
                {{ item.eventName + '（' + item.groupName + '）' }}
              </view>
              <view class="u-main-color text-28rpx h-lh-32rpx mt-12rpx text-over flex-y-center">
                <text class="mr-24rpx">{{ item.roleName }}</text>
                <view class="flex-y-center text-28rpx" :class="auditStatusMap[item.auditStatus]?.className">
                  <text class="ml-8rpx font-bold">{{ auditStatusMap[item.auditStatus]?.text }}</text>
                </view>
              </view>
            </view>
            <view
              class="flex-y-center text-28rpx self-start font-bold"
              :class="paymentStatusMap[item.paymentStatus]?.className"
              v-if="Number(item.paymentStatus) > 0"
            >
              <text class="ml-8rpx">{{ paymentStatusMap[item.paymentStatus]?.text }}</text>
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
    <TeamMemberList v-model:show="showTeamMemberListPopup" :signupData="signupData"></TeamMemberList>
  </view>
</template>

<script lang="ts" setup>
import TeamMemberList from '@/athletics/components/TeamMemberList/TeamMemberList.vue';
import { formatDate } from '@/utils/index';
import { requestTasks, clearObject } from '@/utils/index';
import { checkUrl, checkPassUrl, aicLogoUrl, listDefault1 } from '@/athletics/config/images';
import { Page, TeamListByMemberUserRes } from '@/athletics/model/sport';
import { getTeamListByMemberUserApi, teamSignupDataApi } from '@/athletics/api/sport';
import { auditStatusMap, paymentStatusMap } from '@/athletics/utils/util';

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
    requestTasks.add(getTeamListByMemberUserFn());
  } else if (key == 'onShow') {
    queryParams.pageNo = 1;
    list.length = 0;
    requestTasks.add(getTeamListByMemberUserFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(getTeamListByMemberUserFn());
  } else if (key == 'getTeamSignupData') {
    requestTasks.add(teamSignupDataFn());
  }
  requestTasks.end();
}
async function getTeamListByMemberUserFn() {
  const res = await getTeamListByMemberUserApi(queryParams);
  let bizData = res?.bizData;
  if (!bizData) {
    return;
  }
  if (bizData?.length) {
    queryParams.pageNo++;
  }
  list.push(...bizData);
}
async function teamSignupDataFn() {
  if (!teamSignupId) {
    return;
  }
  const task = teamSignupDataApi(teamSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    clearObject(signupData);
    Object.assign(signupData, bizData);
    showTeamMemberListPopup.value = true;
  });
  return task;
}

let teamSignupId = '';
const showTeamMemberListPopup = ref<boolean>(false);
const signupData = reactive({});
const queryParams = reactive<Page>({
  pageNo: 1,
  pageSize: 20
});
const list = reactive<TeamListByMemberUserRes[]>([]);
function scrolltolower() {
  requestAll('onReachBottom');
}
function clickListItem(item) {
  if (item.roleCode == 'TEAM_MEMBER') {
    uni.navigateTo({
      url: `/athletics/pages/MemberOrder/MemberOrder?teamSignupId=${item.teamSignupId}&memberId=${item.memberId}`
    });
  } else {
    // 是教练组成员，弹窗提示成员信息
    teamSignupId = item.teamSignupId;
    requestAll('getTeamSignupData');
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
