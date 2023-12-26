<template>
  <view class="au-wrapper relative overflow-hidden">
    <view
      class="au-wrapper__header relative bg-cover-auto"
      :style="{
        backgroundImage: `url(${detailData.basicInfo?.eventLogo})`
      }"
    ></view>
    <view class="au-wrapper__body relative">
      <!-- 基本信息 -->
      <view class="au-container -mt-78rpx">
        <view class="u-main-color text-32rpx font-bold my-16rpx">
          {{ detailData?.basicInfo?.eventName }}
        </view>
        <view class="text-28rpx u-main-color mt-16rpx">组别：{{ groupNames }}</view>
      </view>
      <!-- 比赛时间 -->
      <view class="au-container">
        <u-tabs
          :list="[
            {
              name: '赛事时间'
            }
          ]"
          lineWidth="140rpx"
          lineHeight="10rpx"
          lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
          :activeStyle="{
            color: '#2D2D2D',
            fontWeight: 'bold',
            fontSize: '32rpx'
          }"
          itemStyle="height: 48rpx;padding: 0"
        ></u-tabs>
        <view class="my-24rpx text-28rpx u-main-color">
          <view class="mb-24rpx">比赛时间：{{ signDateStr }}</view>
          <view class="mb-24rpx">报名时间：{{ eventDateStr }}</view>
        </view>
        <MatchCountDown :time="matchCountDownTime"></MatchCountDown>
      </view>
      <!-- 协议 -->
      <view class="au-container" v-if="detailData?.basicInfo?.signNotes || detailData?.disclaimer">
        <view class="flex-y-center text-28rpx">
          <view class="flex-xy-center flex-col w-1/2" v-if="detailData?.basicInfo?.signNotes" @click="clickSignNotes">
            <image class="icon-72" src="@/assets/images/icon-sign-notes.png" mode="widthFix" />
            <text class="mt-16rpx">报名须知</text>
          </view>
          <view class="flex-y-center flex-col w-1/2" v-if="detailData?.disclaimer" @click="clickDisclaimer">
            <image class="icon-72" src="@/assets/images/icon-disclaimer.png" mode="widthFix" />
            <text class="mt-16rpx">免责声明书</text>
          </view>
        </view>
      </view>
      <!-- 赛事组别 -->
      <view class="au-container">
        <u-tabs
          :list="[
            {
              name: '赛事组别'
            }
          ]"
          lineWidth="140rpx"
          lineHeight="10rpx"
          lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
          :activeStyle="{
            color: '#2D2D2D',
            fontWeight: 'bold',
            fontSize: '32rpx'
          }"
          itemStyle="height: 48rpx;padding: 0"
        ></u-tabs>
        <view class="u-warning text-28rpx my-36rpx text-center">请选择赛事组别</view>

        <view class="text-center px-24rpx" v-if="detailData?.groupInfo?.length">
          <view class="mb-40rpx" v-for="(item, index) in detailData?.groupInfo" :key="index">
            <u-button
              :type="'primary'"
              :plain="groupId != item.eventGroupId"
              shape="circle"
              size="middle"
              @click="clickGroupItem(index, item)"
            >
              {{ item.groupName }}
            </u-button>
          </view>
        </view>
      </view>
      <!-- 赛事介绍 -->
      <view class="au-container">
        <u-tabs
          :list="[
            {
              name: '赛事介绍'
            }
          ]"
          lineWidth="140rpx"
          lineHeight="10rpx"
          lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
          :activeStyle="{
            color: '#2D2D2D',
            fontWeight: 'bold',
            fontSize: '32rpx'
          }"
          itemStyle="height: 48rpx;padding: 0"
        ></u-tabs>
        <view class="mt-24rpx text-28rpx">
          <u-parse :content="detailData?.basicInfo?.eventDesc" :tagStyle="getUParseTagStyle()"></u-parse>
        </view>
      </view>
    </view>
    <u-action-sheet
      :actions="actionList"
      :show="showAction"
      round="60rpx"
      :closeOnClickAction="true"
      :closeOnClickOverlay="true"
      @select="selectAction"
      @close="showAction = false"
    ></u-action-sheet>

    <AuModal v-model:show="showContentPopup" :isCancel="false" :isConfrimAutoClose="true">
      <template #content>
        <view class="text-28rpx mx-32rpx mt-24rpx">
          <u-parse :content="remark" :tagStyle="getUParseTagStyle()"></u-parse>
        </view>
      </template>
    </AuModal>

    <AuPopup v-model:show="showMpQrcodePopup">
      <view class="p-32rpx flex-1 flex-xy-center flex-col u-main-color">
        <view class="t-32rpx mb-12rpx">报名前请关注 [立方竞技] 公众号</view>
        <view class="t-32rpx mb-12rpx">获得赛事报名消息提醒</view>
        <image class="w-400rpx mb-24rpx" :src="mpQrcode" mode="widthFix" />
        <view class="u-tips-color t-28rpx">长按二维码识别</view>
      </view>
    </AuPopup>

    <AuFixed>
      <view class="signup-count-down u-warning-light-bg u-warning flex-xy-center h-lh-52rpx" v-if="signupCountDownTime > 0">
        <text class="text-24rpx">距离报名开始还有</text>
        <u-count-down :time="signupCountDownTime" format="DD天HH小时mm分ss秒" autoStart></u-count-down>
      </view>
      <view class="m-40rpx flex-y-center justify-between">
        <view class="flex mx-20rpx text-24rpx">
          <view class="flex-1 flex-xy-center flex-col" @click="clickMoreSportBtn">
            <image class="icon-76" src="@/assets/images/icon-more-sport.png" />
            <text class="mt-8rpx">更多赛事</text>
          </view>
          <view class="flex-1 flex-xy-center flex-col ml-54rpx" @click="clickSignupListBtn">
            <image class="icon-76" src="@/assets/images/icon-signup-list.png" />
            <text class="mt-8rpx">报名记录</text>
          </view>
        </view>
        <view class="text-center w-310rpx" @click="clickSignupBtn">
          <u-button
            :type="signupStatus == 2 ? 'primary' : 'gray-disabled'"
            size="middle"
            :custom-style="{
              height: '74rpx',
              lineHeight: '74rpx',
              borderRadius: '16rpx'
            }"
          >
            {{ signupStatusMap[signupStatus] }}
          </u-button>
        </view>
      </view>
    </AuFixed>
  </view>
</template>

<script lang="ts" setup>
import AuModal from '@/components/AuModal/AuModal.vue';
import AuPopup from '@/components/AuPopup/AuPopup.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import MatchCountDown from './components/MatchCountDown/MatchCountDown.vue';
import { mpQrcode } from '@/athletics/config/images';
import {
  requestTasks,
  createLowercasePropertyProxy,
  getCalcHeight,
  clearObject,
  getDateStrs,
  wechat,
  getIsH5,
  showShareMenu,
  getUParseTagStyle
} from '@/utils/index';
import { SportEventDetailRes } from '@/athletics/model/sport';
import { sportEventDetailApi, getTeamRemainNumApi, getIndividualRemainNumApi } from '@/athletics/api/sport';
import { checkUserSubscribeApi } from '@/api/common';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  let res;
  if (key == 'onLoad') {
    requestTasks.add(await sportEventDetailFn());
    requestTasks.add(getJsApiTicketFn());
  } else if (key == 'changeGroupData') {
    if (groupData.value) {
      if (groupData.value?.eventMode != 2) {
        requestTasks.add(getTeamRemainNumFn());
      } else {
        requestTasks.add(getIndividualRemainNumFn());
      }
    }
  } else if (key == 'onShow') {
    requestTasks.add((res = checkUserSubscribeFn()));
  } else if (key == 'checkUserSubscribe') {
    requestTasks.add((res = checkUserSubscribeFn()));
  }
  requestTasks.end(setBasicInfoHeight);
  return res;
}
async function sportEventDetailFn() {
  const { eventId, eventGroupId } = optionInfo;
  if (!eventId) {
    return;
  }
  const task = sportEventDetailApi(eventId);
  task.then(async (res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    if (bizData.basicInfo?.eventName) {
      uni.setNavigationBarTitle({
        title: bizData.basicInfo.eventName
      });
    }

    Object.assign(detailData, bizData);
    if (bizData.groupInfo.length) {
      let index = bizData.groupInfo.findIndex((item) => item.eventGroupId == eventGroupId);
      index = index > -1 ? index : 0;
      groupVal.value = index;
      const groupItem = bizData.groupInfo[index];
      if (groupItem) {
        groupId.value = groupItem.eventGroupId;
        eventSignupStatus.value = groupItem.eventSignupStatus;
      }
    }
  });
  return task;
}
function getCustomShareInfo() {
  return {
    title: detailData.basicInfo?.eventName,
    desc: '一起报名挑战吧~',
    imageUrl: detailData.basicInfo?.eventLogo || ''
  };
}
async function getJsApiTicketFn() {
  const isH5 = getIsH5();
  if (!isH5) {
    return;
  }
  const options = getCustomShareInfo();
  const task = wechat.share(options);
  return task;
}
async function checkUserSubscribeFn() {
  if (!authStore.token) {
    return;
  }
  const task = checkUserSubscribeApi();
  task.then(async (res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    clearObject(userSubscribe);
    Object.assign(userSubscribe, bizData);
    if (userSubscribe.subscribe == 1) {
      showMpQrcodePopup.value = false;
    }
  });
  return task;
}
async function setBasicInfoHeight() {
  await nextTick();
  let height;
  if (matchCountDownTime.value > 0) {
    height = (await getCalcHeight('.match-count-down', '.fixed-bottom', 0, -36)) as string;
  } else {
    height = (await getCalcHeight('#groupList', '.fixed-bottom', 0, -24)) as string;
  }
  basicInfoHeight.value = height;
}
async function getTeamRemainNumFn() {
  const eventGroupId = groupId.value;
  if (!eventGroupId) {
    return;
  }
  const task = getTeamRemainNumApi(eventGroupId);
  task.then((res) => {
    let bizData = res?.bizData || 0;
    remainNum.value = bizData;
    loaded.value = true;
  });
  return task;
}
async function getIndividualRemainNumFn() {
  const eventGroupId = groupId.value;
  if (!eventGroupId) {
    return;
  }
  const task = getIndividualRemainNumApi(eventGroupId);
  task.then((res) => {
    let bizData = res?.bizData || 0;
    remainNum.value = bizData;
    loaded.value = true;
  });
  return task;
}

// 页面数据
const { currentTime } = storeToRefs(authStore);
let lastCurrentTime;
const detailData = reactive<Partial<SportEventDetailRes>>({});
const userName = authStore.userName;
const groupId = ref<number>();
const groupVal = ref<number>(0);
const eventSignupStatus = ref<string | number>(1);
const remainNum = ref<number>(0);
const basicInfoHeight = ref<string>('');
const loaded = ref<boolean>(false);
const showMpQrcodePopup = ref<boolean>(false);
const userSubscribe = reactive({
  subscribe: 0,
  subscribeTime: 0
});
const isRead = ref<boolean>(false); // 是否已读协议
const groupNames = computed(() => {
  const list = detailData?.groupInfo || [];
  return list.map((item) => item.groupName).join('、');
});
const groupData = computed(() => {
  const value = detailData?.groupInfo && detailData?.groupInfo[groupVal.value];
  setTimeout(() => {
    requestAll('changeGroupData');
  }, 0);
  return value;
});
const matchCountDownTime = ref<number>(0);
const signupCountDownTime = ref<number>(0);
watchEffect(() => {
  const { eventBeginTime, signBeginTime } = groupData?.value || {};
  if (lastCurrentTime === currentTime.value) {
    return 0;
  }
  lastCurrentTime = currentTime.value;
  if (eventBeginTime) {
    matchCountDownTime.value = eventBeginTime - currentTime.value;
  }
  if (signBeginTime) {
    signupCountDownTime.value = signBeginTime - currentTime.value;
  }
});
const signDateStr = computed(() => {
  return getDateStrs(groupData.value?.signBeginTime, groupData.value?.signEndTime);
});
const eventDateStr = computed(() => {
  return getDateStrs(groupData.value?.eventBeginTime, groupData.value?.eventEndTime);
});
const signupStatus = computed(() => {
  if (!loaded.value) {
    return '';
  }
  if (remainNum.value > 0) {
    return eventSignupStatus.value;
  } else {
    return '-1';
  }
});
const signupStatusMap = {
  '-1': '名额已满',
  1: '报名未开始',
  2: '立即报名',
  3: '报名已结束'
};
function clickGroupItem(index, item) {
  groupVal.value = index;
  groupId.value = item.eventGroupId;
  eventSignupStatus.value = item.eventSignupStatus;
}

// 报名须知/免责声明书
const showContentPopup = ref<boolean>(false);
const remark = ref<string>('');
function clickSignNotes() {
  remark.value = detailData?.basicInfo?.signNotes || '';
  showContentPopup.value = true;
}
function clickDisclaimer() {
  remark.value = detailData?.disclaimer || '';
  showContentPopup.value = true;
}

const showAction = ref<boolean>(false);
const actionList = [
  {
    name: '我是队长，我要团队报名',
    value: 1
  },
  {
    name: '我是队员，我要加盟队伍',
    value: 2
  }
];
async function clickSignupBtn() {
  if (signupStatus.value != 2) {
    return;
  }
  await requestAll('checkUserSubscribe');
  // #ifdef H5
  if (userSubscribe.subscribe != 1) {
    // 没关注公众号要先关注公众号
    showMpQrcodePopup.value = true;
    return;
  }
  // #endif
  if (groupData?.value?.eventMode == 2) {
    // 个人赛报名
    const url = `/athletics/pages/PersonSignup/PersonSignup?eventGroupId=${groupId.value}`;
    const validateRemark = getValidateRemark(url);
    if (!validateRemark) {
      return;
    }
    uni.navigateTo({
      url
    });
    return;
  }
  showAction.value = true;
}
function getValidateRemark(jumpUrl) {
  if (isRead.value) {
    return true;
  }
  const { eventId, eventGroupId } = optionInfo;
  // 有报名须知需要先阅读报名须知，免责声明书也一样
  let bizAction;
  if (detailData?.basicInfo?.signNotes) {
    bizAction = 'signNotes';
  } else if (detailData?.disclaimer) {
    bizAction = 'disclaimer';
  }
  if (bizAction) {
    uni.navigateTo({
      // eslint-disable-next-line max-len
      url: `/athletics/pages/Agreement/Agreement?eventId=${eventId}&eventGroupId=${eventGroupId}&bizAction=${bizAction}&jumpUrl=${encodeURIComponent(
        jumpUrl
      )}`
    });
    return false;
  }
  return true;
}
function clickSignupListBtn() {
  uni.navigateTo({
    url: '/athletics/pages/SignupRecord/SignupRecord?navVal=0'
  });
}
function clickMoreSportBtn() {
  uni.navigateTo({
    url: '/athletics/pages/SportIndex/SportIndex'
  });
}

function selectAction(e) {
  let url;
  const value = e.value;
  if (value == 1) {
    url = `/athletics/pages/SelectTeam/SelectTeam?eventId=${optionInfo.eventId}&eventGroupId=${groupId.value}`;
  } else if (value == 2) {
    url = `/athletics/pages/JoinTeam/JoinTeam?eventId=${optionInfo.eventId}&eventGroupId=${groupId.value}`;
  }
  if (!url) {
    return;
  }
  const validateRemark = getValidateRemark(url);
  if (!validateRemark) {
    return;
  }
  uni.navigateTo({
    url
  });
}

interface OptionInfo {
  eventId: string | number;
  eventGroupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  showShareMenu();
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
onShareAppMessage((e) => {
  const options = getCustomShareInfo();
  return options;
});
</script>

<style scoped lang="scss">
::v-deep {
  .match-count-down .u-divider {
    margin: 10rpx 0 6rpx;
  }
  .signup-count-down .u-count-down__text {
    color: $u-warning;
    font-size: 24rpx;
  }
}
.au-wrapper__header {
  z-index: 0;
  width: 100%;
  height: 360rpx;
}
.au-wrapper__header::before {
  content: '';
  width: 100%;
  height: 360rpx;
  z-index: -1;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25));
  position: absolute;
}
.au-container {
  padding: 32rpx 48rpx;
  margin-bottom: 16rpx;
}
.au-container:first-child {
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
}
</style>
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
