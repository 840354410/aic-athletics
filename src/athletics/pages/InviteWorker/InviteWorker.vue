<template>
  <view class="au-wrapper">
    <view
      class="bg-cover-auto flex-y-center flex-col h-316rpx"
      :style="{
        backgroundImage: `url(${signupBgUrl})`
      }"
    >
      <image class="icon-140 mt-16rpx rounded-1/2" :src="teamInfo.teamLogo || aicLogoUrl" mode="aspectFill" />
      <view class="team-name mt-8rpx mb-10rpx">
        {{ teamInfo.teamName }}
      </view>
    </view>
    <view class="au-wrapper__body -mt-72rpx mx-24rpx">
      <view class="au-container py-20rpx">
        <AuCellGroup>
          <AuCell v-for="item in groupDataList" :key="item.value" :item="item"></AuCell>
        </AuCellGroup>
      </view>
      <view class="au-container">
        <InviteWorkerForm ref="inviteWorkerForm" v-model:formData="formData"></InviteWorkerForm>
      </view>
    </view>
    <AuFixed>
      <AuButtonGroup confirm-text="立即加入" @click="clickButtonGroup"></AuButtonGroup>
    </AuFixed>
  </view>
</template>

<script lang="ts" setup>
import AuCellGroup from '@/components/AuCellGroup/AuCellGroup.vue';
import AuCell from '@/components/AuCell/AuCell.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import InviteWorkerForm from './components/InviteWorkerForm/InviteWorkerForm.vue';
import { signupBgUrl, aicLogoUrl, checkUrl, checkPassUrl, checkOutUrl } from '@/athletics/config/images';
import {
  requestTasks,
  setStatisticList,
  getDateStrs,
  amend,
  customShowToast,
  deepClone,
  createLowercasePropertyProxy
} from '@/utils/index';
import { AnalyzeInvitationQrcodeRes } from '@/athletics/model/sport';
import { analyzeInvitationQrcodeApi, addTeamWorkersApi } from '@/athletics/api/sport';
import { getGroupList, setgroupDataOpenLocation } from '@/athletics/utils/util';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
const { phone } = storeToRefs(authStore);

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onShow') {
    requestTasks.add(analyzeInvitationQrcodeFn());
  } else if (key == 'submit') {
    requestTasks.add(addTeamWorkersFn());
  }
  requestTasks.end();
}
async function analyzeInvitationQrcodeFn() {
  const { token } = optionInfo;
  if (!token) {
    return;
  }
  const task = analyzeInvitationQrcodeApi(token);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    const eventGroupInfo = bizData.eventGroupInfo;
    teamInfo.teamName = eventGroupInfo.eventName;
    teamInfo.teamLogo = eventGroupInfo.eventLogo;
    eventGroupInfo.signDateStr = getDateStrs(eventGroupInfo.signBeginTime, eventGroupInfo.signEndTime);
    eventGroupInfo.eventDateStr = getDateStrs(eventGroupInfo.eventBeginTime, eventGroupInfo.eventEndTime);
    setStatisticList(eventGroupInfo, groupDataList);
    setgroupDataOpenLocation(eventGroupInfo, groupDataList);
    Object.assign(inviteData, bizData);
  });
  return task;
}
async function addTeamWorkersFn() {
  const { teamSignupId } = inviteData;
  if (!teamSignupId) {
    return;
  }
  const params = deepClone(formData);
  Object.assign(params, {
    teamSignupId,
    userRoleIds: [params.roleId]
  });
  const task = addTeamWorkersApi(params);
  task.then((res) => {
    customShowToast(res);
    setTimeout(() => {
      uni.navigateTo({
        url: '/athletics/pages/SignupRecord/SignupRecord?navVal=0'
      });
    });
  });
  return task;
}

const inviteWorkerForm = ref<Form | null>(null);
const formData = reactive({
  memberName: '',
  memberPhone: phone.value || '',
  roleId: ''
});
const inviteData = reactive<Partial<AnalyzeInvitationQrcodeRes>>({});
const groupDataList = reactive<StatisticItem[]>(getGroupList());
const teamInfo = reactive<{
  teamName: string;
  teamLogo: string;
}>({
  teamName: '',
  teamLogo: ''
});
function clickButtonGroup(index, item) {
  if (!inviteWorkerForm.value) {
    return;
  }
  inviteWorkerForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {});
}

interface OptionInfo {
  token: string;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
</script>

<style scoped lang="scss">
.au-container {
  padding-left: 48rpx;
  padding-right: 48rpx;
  margin-bottom: 28rpx;
}
</style>
