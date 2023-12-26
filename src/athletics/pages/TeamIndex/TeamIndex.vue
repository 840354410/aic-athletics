<template>
  <view class="au-wrapper">
    <view
      class="bg-cover-auto flex-y-center flex-col h-316rpx"
      :style="{
        backgroundImage: `url(${signupBgUrl})`
      }"
    >
      <image class="icon-140 mt-16rpx rounded-1/2" :src="teamInfo.eventTeamLogo || aicLogoUrl" mode="aspectFill" />
      <view class="flex-y-center text-32rpx">
        <view class="team-name mt-8rpx mb-6rpx">
          {{ teamInfo.eventTeamName }}
        </view>
        <template v-if="teamInfo.signupStatus != 3">
          <i
            class="iconfont icon-a-zu782 text-32rpx color-white ml-16rpx -mr-40rpx"
            v-if="teamInfo.auditStatus == 1"
            @click="clickEditTeamInfo"
          ></i>
        </template>
      </view>
      <view class="text-28rpx color-white mt-6rpx" v-if="teamInfo.teamJoinCode">入队验证码{{ teamInfo.teamJoinCode }}</view>
    </view>
    <view class="au-wrapper__body -mt-40rpx mx-24rpx">
      <view class="au-container mb-28rpx px-32rpx pt-40rpx text-28rpx overflow-hidden">
        <view class="flex-y-center mb-48rpx">
          <text class="u-tips-color">队伍报名状态</text>
          <view class="ml-auto flex-y-center">
            <image class="icon-28" :src="checkUrl" mode="widthFix" v-if="teamInfo.auditStatus == 1" />
            <text class="ml-8rpx" :class="auditStatusMap[teamInfo.auditStatus || '']?.className">
              {{ auditStatusMap[teamInfo.auditStatus || '']?.text }}
            </text>
          </view>
          <view class="w-166rpx ml-16rpx" v-if="teamInfo.auditStatus == 1 && teamInfo.signupStatus != 3">
            <u-button
              type="primary"
              size="mini"
              :custom-style="{
                height: '50rpx'
              }"
              @click="showCancelPopup = true"
            >
              取消建队
            </u-button>
          </view>
        </view>

        <view class="u-main-color text-28rpx pt-24rpx pr-24rpx border-t-2" v-if="teamInfo.securityDepositPayMode == 1">
          <view class="flex-y-center py-24rpx justify-between" v-for="(item, index) in teamInfo.teamSignupOrderList" :key="index">
            <text>队伍{{ bizTypeMap[item.bizType] }}</text>
            <text>￥{{ item.payAmt }}</text>
            <view
              class="flex-y-center text-28rpx self-start font-bold"
              :class="paymentStatusMap[item.paymentStatus]?.className"
              v-if="Number(item.paymentStatus) > 0"
            >
              <text class="ml-8rpx">{{ paymentStatusMap[item.paymentStatus]?.text }}</text>
            </view>
          </view>
        </view>
        <view class="w-166rpx ml-auto pb-24rpx" v-if="teamInfo.signupStatus == '0'">
          <u-button
            type="primary"
            size="mini"
            :custom-style="{
              height: '50rpx'
            }"
            @click="clickToPay"
          >
            去缴费
          </u-button>
        </view>
      </view>

      <template v-if="teamInfo.signupStatus != 3">
        <!-- 教练组成员 -->
        <view class="au-container mb-28rpx p-32rpx">
          <view class="flex-y-center mb-28rpx">
            <view class="text-32rpx font-bold u-main-color">教练组成员</view>
            <view class="ml-auto text-28rpx flex-y-center u-primary" @click="clickInviteJoin('1')">
              <image class="icon-32" :src="shareUrl" mode="widthFix" />
              <text class="ml-12rpx">邀请加入</text>
            </view>
          </view>
          <view
            class="relative rounded-14rpx bg-hex-f9f9f9 px-24rpx u-main-color pt-10rpx pb-18rpx mb-16rpx"
            v-for="(item, index) in teamWorkerList"
            :key="index"
          >
            <view
              class="absolute right-8rpx top-8rpx text-28rpx u-tips-color"
              v-if="teamInfo.auditStatus == 1 && item.roleCode != 'TEAM_LEADER'"
              @click="clickDeleteTeamWorker(index, item)"
            >
              <i class="iconfont icon-close-circle-fill text-28rpx"></i>
            </view>
            <view class="text-28rpx">{{ item.roleName }}</view>
            <view class="flex-y-center mt-24rpx">
              <view class="flex-1 min-w-0 text-over flex-y-center text-28rpx border-b-2 pb-12rpx">
                <i class="iconfont icon-person text-32rpx"></i>
                <view class="ml-18rpx">
                  <AuInput
                    type="text"
                    v-model="item.memberName"
                    placeholder="请输入姓名"
                    fontSize="28rpx"
                    :disabled="item.roleCode == 'TEAM_LEADER'"
                  ></AuInput>
                </view>
              </view>
              <view class="flex-1 min-w-0 text-over flex-y-center text-28rpx border-b-2 pb-12rpx ml-48rpx">
                <i class="iconfont icon-phone text-32rpx"></i>
                <view class="ml-18rpx">
                  <AuInput
                    type="number"
                    v-model="item.memberPhone"
                    maxlength="11"
                    placeholder="请输入手机号码"
                    fontSize="28rpx"
                    :disabled="item.roleCode == 'TEAM_LEADER'"
                  ></AuInput>
                </view>
              </view>
            </view>
          </view>
          <view class="mt-48rpx flex-xy-center text-28rpx u-primary" @click="clickAddTeamWorker">
            <image class="icon-32" :src="addUrl" mode="widthFix" />
            <text class="ml-8rpx">新增</text>
          </view>
        </view>

        <!-- 队员 -->
        <view class="au-container mb-28rpx p-32rpx">
          <view class="flex-y-center mb-28rpx">
            <view class="text-32rpx font-bold u-main-color">队员</view>
            <view class="ml-auto text-28rpx flex-y-center u-primary" @click="clickInviteJoin('2')">
              <image class="icon-32" :src="shareUrl" mode="widthFix" />
              <text class="ml-12rpx">邀请加入</text>
            </view>
          </view>
          <view class="my-24rpx text-28rpx u-main-color">
            <text v-if="teamInfo.teamMemberMin && teamInfo.teamMemberMax">
              队员数要求：{{ teamInfo.teamMemberMin }}-{{ teamInfo.teamMemberMax }}人
            </text>
            <text class="indent-2em">当前队员数：{{ teamMemberList.length }}人</text>
          </view>
          <view
            class="team-member-item u-main-color text-28rpx"
            v-for="(item, index) in teamMemberList"
            :key="index"
            @click="clickTeamMemberItem(item)"
          >
            <view class="flex-y-center">
              <text class="max-w-6em text-over">{{ item.memberName }}</text>
              <text class="ml-18rpx">{{ item.memberPhone }}</text>
              <view class="w-100rpx">
                <u-button
                  class="ml-8rpx"
                  type="warning-tag"
                  v-if="item.auditStatus == 1"
                  :custom-style="{
                    height: '36rpx'
                  }"
                  fontSize="28rpx"
                >
                  待审核
                </u-button>
              </view>
              <view class="ml-auto">
                <i class="iconfont icon-right text-32rpx"></i>
              </view>
            </view>
            <view class="flex-y-center mt-12rpx" v-if="teamInfo.securityDepositPayMode == 2">
              <text>￥{{ item.payPrice }}</text>
              <view class="ml-auto" v-if="item.payPrice > 0">
                <text class="u-warning" v-if="item.orderStatus == 0" @click.stop="clickToPay(item.memberId)">待缴费</text>
                <text v-else-if="item.orderStatus == 1">已缴费</text>
              </view>
            </view>
          </view>
          <view class="mt-48rpx flex-xy-center text-28rpx u-primary" @click="clickAddTeamMember">
            <image class="icon-32" :src="addUrl" mode="widthFix" />
            <text class="ml-8rpx">新增</text>
          </view>
        </view>

        <AuFixed>
          <AuButtonGroup mode="double" @click="clickButtonGroup"></AuButtonGroup>
        </AuFixed>
      </template>
    </view>
    <AuPopup
      v-model:show="showInvitePopup"
      mode="center"
      :customStyle="{
        backgroundColor: 'transparent'
      }"
    >
      <view>
        <view class="text-50rpx text-right mb-20rpx" @click="showInvitePopup = false">
          <i class="iconfont icon-close color-white text-32rpx"></i>
        </view>
        <view>
          <image
            class="w-650rpx"
            :src="shareQrCodeType1Url"
            mode="widthFix"
            :show-menu-by-longpress="true"
            v-if="invitationType == 1"
          />
          <image
            class="w-650rpx"
            :src="shareQrCodeType2Url"
            mode="widthFix"
            :show-menu-by-longpress="true"
            v-else-if="invitationType == 2"
          />
        </view>
      </view>
    </AuPopup>
    <u-action-sheet
      :actions="actionList"
      :show="showAction"
      round="60rpx"
      :closeOnClickAction="true"
      :closeOnClickOverlay="true"
      @select="selectAction"
      @close="showAction = false"
    ></u-action-sheet>
    <CancelSignPopup
      v-model:show="showCancelPopup"
      mode="team"
      :signupId="teamSignupId"
      :signupData="teamInfo"
      @change="cancelSign"
    ></CancelSignPopup>

    <view
      class="invitation-qrcode off-screen w-600rpx h-800rpx pt-96rpx bg-cover-full flex-y-center flex-col fixed-top"
      ref="invitationQrcode"
    >
      <image class="absolute-full w-full h-full draw z-0" :src="shareBg" mode="" data-type="image" :data-url="shareBg" />
      <view class="flex-y-center flex-col w-full pt-30rpx h-576rpx mb-100rpx bg-white draw relative z-1">
        <view class="u-main-color text-22rpx draw w-20em text-center" data-type="text" :data-text="`（${userName}）邀请你`">
          （{{ userName }}）邀请你
        </view>
        <view class="u-main-color text-22rpx draw">
          <text class="draw" data-type="text" :data-text="'扫码加入成为教练组成员'" v-if="invitationType == 1">
            扫码加入成为教练组成员
          </text>
          <text class="draw" data-type="text" :data-text="'扫码加入成为队员'" v-if="invitationType == 2">扫码加入成为队员</text>
        </view>
        <view class="event-team-name color-hex-3C4380 text-24rpx draw" data-type="text" :data-text="teamInfo.eventTeamName">
          {{ teamInfo.eventTeamName }}
        </view>

        <view class="relative w-360rpx min-h-360rpx flex-xy-center draw">
          <image
            class="icon-64 z-1 draw"
            src="@/assets/images/icon-logo.png"
            mode="widthFix"
            data-type="image"
            :data-url="iconLogo"
          />
          <image
            class="icon-360 absolute-full draw"
            :src="invitationQrcodeData.qrCodeBase64"
            mode="widthFix"
            data-type="image"
            :data-url="invitationQrcodeData.qrCodeBase64"
            v-if="invitationQrcodeData.qrCodeBase64"
          />
        </view>

        <view class="mt-16rpx mb-90rpx u-tips-color text-center text-24rpx px-108rpx draw">
          <view class="line-clamp-2 draw" data-type="text" :data-text="teamInfo.eventName">{{ teamInfo.eventName }}</view>
          <view class="draw" data-type="text" :data-text="teamInfo.groupName">{{ teamInfo.groupName }}</view>
        </view>
      </view>
    </view>

    <canvas class="qrcode off-screen" canvas-id="qrcode" style="width: 200px; height: 200px" />
    <canvas class="share-canvas off-screen" canvas-id="shareCanvas" style="width: 600rpx; height: 800rpx" />
  </view>
</template>

<script lang="ts" setup>
import iconLogo from '@/assets/images/icon-logo.png';
import UQRCode from 'uqrcodejs'; // npm install uqrcodejs
import AuPopup from '@/components/AuPopup/AuPopup.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import CancelSignPopup from '@/athletics/components/CancelSignPopup/CancelSignPopup.vue';
import { aicLogoUrl, signupBgUrl, checkUrl, shareUrl, invitationQrcodeBg, addUrl } from '@/athletics/config/images';
import {
  requestTasks,
  amend,
  customShowToast,
  uuid,
  isPhone,
  deepClone,
  generateImage,
  delay,
  createLowercasePropertyProxy,
  getCanvasDrawImage,
  getOrigin,
  getCanvasToTempFilePath
} from '@/utils/index';
import { TeamWorkerItem, InvitationQrcodeRes, TeamMemberItem, TeamSignupDataRes } from '@/athletics/model/sport';
import { auditStatusMap, paymentStatusMap, bizTypeMap } from '@/athletics/utils/util';
import {
  teamSignupDataApi,
  teamWorkerRolesApi,
  invitationQrcodeApi,
  addTeamWorkersApi,
  getQrCodeBgApi,
  generateMinaUrlApi
} from '@/athletics/api/sport';
import { useAuthStore } from '@/store/auth';

const invitationQrcode = ref(null);

const authStore = useAuthStore();
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  let res;
  if (key == 'onLoad') {
    requestTasks.add(teamWorkerRolesFn());
  } else if (key == 'onShow') {
    requestTasks.add(await teamSignupDataFn());
    requestTasks.add(await getQrCodeBgFn());
    // 没生成邀请码，需要生成
    if (!shareQrCodeType1Url.value || !shareQrCodeType2Url.value) {
      await setCanvasImages();
      drawInvitationQrcode();
    }
  } else if (key == 'clickButtonConfirm') {
    requestTasks.add(addTeamWorkersFn());
  }
  requestTasks.end();
  return res;
}
async function teamSignupDataFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const task = teamSignupDataApi(teamSignupId);
  task.then(async (res) => {
    let bizData = res?.bizData;
    bizData.teamSignupOrderList = bizData.teamSignupOrderList || [];
    bizData.teamWorkerList = bizData.teamWorkerList || [];
    bizData.memberSignupOrderList = bizData.memberSignupOrderList || [];
    bizData.teamMemberList = bizData.teamMemberList || [];
    teamWorkerList.length = 0;
    teamMemberList.length = 0;
    const map = {};
    bizData.memberSignupOrderList.forEach((item) => {
      if (!map[item.teamMember]) {
        map[item.teamMember] = [];
      }
      map[item.teamMember].push(item);
    });
    bizData.teamMemberList.forEach((item) => {
      if (!map[item.memberId]) {
        item.payPrice = 0;
        return;
      }
      let payPrice = 0;
      map[item.memberId].forEach((subItem, subIndex) => {
        if (subIndex == 0) {
          item.auditStatus = subItem.auditStatus;
          item.orderStatus = subItem.orderStatus;
          item.memberSignupId = subItem.memberSignupId;
        }
        payPrice = amend(payPrice, subItem.payAmt, '+');
      });
      item.payPrice = payPrice;
    });
    teamWorkerList.push(...bizData.teamWorkerList);
    teamMemberList.push(...bizData.teamMemberList);
    Object.assign(teamInfo, bizData);
  });
  return task;
}
async function teamWorkerRolesFn() {
  const task = teamWorkerRolesApi();
  task.then((res) => {
    let bizData = res?.bizData || [];
    const list = bizData.map((item) => ({
      name: item.roleName,
      value: item.id
    }));
    actionList.push(...list);
  });
  return task;
}
async function getQrCodeBgFn() {
  if (qrCodeBg.value) {
    return;
  }
  const task = getQrCodeBgApi(teamInfo.eventId);
  task.then((res) => {
    let bizData = res?.bizData || invitationQrcodeBg;
    qrCodeBg.value = bizData;
  });
  return task;
}

const userName = authStore.userName;
const teamSignupId = ref<string | number>('');
const showCancelPopup = ref<boolean>(false);
const teamInfo = reactive<Partial<TeamSignupDataRes>>({});
const teamWorkerList = reactive<Partial<TeamWorkerItem>[]>([]);
const teamMemberList = reactive<TeamMemberItem[]>([]);
const qrCodeBg = ref<string>('');
function clickEditTeamInfo() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const eventUniId = uuid(); // 事件标识
  uni.navigateTo({
    url: `/athletics/pages/UpdateTeam/UpdateTeam?teamSignupId=${teamSignupId}&eventUniId=${eventUniId}`,
    success: (res) => {
      uni.$once(eventUniId, (res) => {
        const { data, leaderName } = res;
        if (!data || !(data instanceof Object)) {
          return;
        }
        Object.assign(teamInfo, data);
        teamWorkerList.some((item) => {
          if (item.roleCode == 'TEAM_LEADER') {
            item.memberName = leaderName;
            return true;
          }
          return false;
        });
      });
    }
  });
}
function cancelSign() {
  uni.navigateBack();
}

// 邀请码
async function setCanvasImages() {
  const promiseList: Promise<any>[] = [];
  // const task = getCanvasDrawImage(teamInfo.eventTeamLogo || aicLogoUrl);
  // promiseList.push(task);
  // task.then((logoRes) => {
  //   if (logoRes?.bizData) {
  //     teamInfo.eventTeamLogo = logoRes.bizData as string;
  //   }
  // });
  const task2 = getCanvasDrawImage(qrCodeBg.value);
  promiseList.push(task2);
  task2.then((inviteRes) => {
    if (inviteRes?.bizData) {
      shareBg.value = inviteRes.bizData as string;
    }
  });
  return Promise.all(promiseList);
}
async function invitationQrcodeFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  let path;
  const origin = getOrigin();
  if (invitationType.value == 1) {
    path = origin + '/athletics/pages/InviteWorker/InviteWorker';
  } else if (invitationType.value == 2) {
    path = origin + '/athletics/pages/InviteMemberMiddle/InviteMemberMiddle';
  }
  const params = {
    invitationType: invitationType.value,
    teamSignupId,
    path
  };
  let task = invitationQrcodeApi(params);
  const res = await task;
  let bizData = res?.bizData;
  Object.assign(invitationQrcodeData, bizData);
  // #ifdef MP-WEIXIN
  const query = (bizData.qrCodeValue || '').split('?')[1];
  if (query) {
    await generateMinaUrlFn({
      path,
      query
    });
  }
  // #endif
  return task;
}
async function generateMinaUrlFn(params) {
  // generateMinaUrlApi(params);
  // 获取uQRCode实例
  var qr = new UQRCode();
  // 设置二维码内容
  qr.data = 'https://uqrcode.cn/doc';
  // 设置二维码大小，必须与canvas设置的宽高一致
  qr.size = 200;
  qr.margin = 10; // 指定二维码的边距
  // 调用制作二维码方法
  qr.make();
  // 获取canvas上下文
  var canvasContext = uni.createCanvasContext('qrcode'); // 如果是组件，this必须传入
  // 设置uQRCode实例的canvas上下文
  qr.canvasContext = canvasContext;
  // 调用绘制方法将二维码图案绘制到canvas上
  qr.drawCanvas();
  await delay(500);
  const res = await getCanvasToTempFilePath('qrcode');
  invitationQrcodeData.qrCodeBase64 = res;
}

const invitationType = ref<string | number>('');
const shareQrCodeType1Url = ref<string>('');
const shareQrCodeType2Url = ref<string>('');
const shareBg = ref<string>('');
const showInvitePopup = ref<boolean>(false);
const invitationQrcodeData = reactive<Partial<InvitationQrcodeRes>>({});
async function drawInvitationQrcode() {
  const options = {
    drawElemClass: 'invitation-qrcode'
  };
  invitationType.value = 1;
  await invitationQrcodeFn();
  await nextTick();
  await delay(500);
  shareQrCodeType1Url.value = await generateImage(invitationQrcode.value, options);
  invitationType.value = 2;
  await invitationQrcodeFn();
  await nextTick();
  await delay(500);
  shareQrCodeType2Url.value = await generateImage(invitationQrcode.value, options);
}
function clickInviteJoin(e) {
  invitationType.value = e;
  showInvitePopup.value = true;
}
function clickTeamMemberItem(item) {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const { memberId, memberSignupId } = item;
  let url = '/athletics/pages/CheckSignup/CheckSignup';
  url += `?teamSignupId=${optionInfo.teamSignupId}&memberId=${memberId}&memberSignupId=${memberSignupId}`;
  uni.navigateTo({
    url
  });
}
function clickToPay(memberId) {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  let url = `/athletics/pages/PayOrder/PayOrder?teamSignupId=${teamSignupId}`;
  if (memberId) {
    url += `&memberId=${memberId}`;
  }
  uni.navigateTo({
    url
  });
}

// 新增编辑教练组
async function addTeamWorkersFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const workerInfos = deepClone(teamWorkerList).filter((item) => item.roleCode != 'TEAM_LEADER');
  workerInfos.forEach((item) => {
    item.userRoleIds = [item.roleId];
  });
  const params = {
    teamSignupId,
    workerInfos
  };
  const task = addTeamWorkersApi(params);
  task.then((res) => {
    customShowToast(res);
  });
  return task;
}
const showAction = ref<boolean>(false);
const actionList = reactive<
  {
    name: string;
    value: string | number;
  }[]
>([]);
function clickDeleteTeamWorker(index, item) {
  teamWorkerList.splice(index, 1);
}
function clickAddTeamWorker() {
  showAction.value = true;
}
function selectAction(e) {
  const value = e.value;
  teamWorkerList.push({
    roleName: e.name,
    roleId: value,
    memberName: '',
    memberPhone: ''
  });
}
function validateTeamWorkers(): boolean {
  const res = teamWorkerList.every((item) => {
    if (!item.memberName || !item.memberPhone) {
      return false;
    }
    return isPhone(item.memberPhone);
  });
  if (!res) {
    uni.$u.toast('教练组成员姓名和手机号码必填');
  }
  return res;
}
function clickButtonGroup(e) {
  if (e == 0) {
    uni.navigateBack();
  } else if (e == 1) {
    const validateRes = validateTeamWorkers();
    if (!validateRes) {
      return;
    }
    requestAll('clickButtonConfirm');
  }
}

// 新增队员
function clickAddTeamMember() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  uni.navigateTo({
    url: `/athletics/pages/Signup/Signup?teamSignupId=${teamSignupId}&isTeamLeader=1`
  });
}

interface OptionInfo {
  teamSignupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  teamSignupId.value = optionInfo.teamSignupId;
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
</script>

<style scoped lang="scss">
.team-name {
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
}
.team-member-item {
  position: relative;
  border-radius: 14rpx;
  background-color: #f9f9f9;
  padding: 32rpx;
  margin-bottom: 16rpx;
}
.event-team-name {
  margin-bottom: 0rpx;
}
.invitation-qrcode {
  padding-left: 76rpx;
  padding-right: 76rpx;
  box-sizing: border-box;
  z-index: -1;
}
</style>
<style lang="scss">
page {
  padding-bottom: 220rpx;
}
</style>
