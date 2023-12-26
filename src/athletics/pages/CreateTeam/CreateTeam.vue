<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto"
    :style="{
      backgroundImage: `url(${signupBgUrl})`
    }"
  >
    <view class="au-wrapper__body">
      <view class="au-container mt-52rpx">
        <CreateTeamForm ref="createTeamForm" v-model:formData="formData" :formDisabledData="formDisabledData"></CreateTeamForm>
      </view>
      <view class="au-container">
        <view class="py-12rpx">
          <AuCellGroup>
            <AuCell v-for="item in groupDataList" :key="item.value" :item="item" padding="12rpx 0"></AuCell>
          </AuCellGroup>
        </view>
        <view class="border-b-2"></view>
        <view class="py-12rpx">
          <AuCellGroup>
            <template #header>报名费用</template>
            <AuCell v-for="item in priceDataList" :key="item.value" :item="item" labelWidth="12rem" padding="12rpx 0">
              <template #value>
                <view class="flex-y-center justify-end">
                  <text>￥</text>
                  <text>{{ item.value }}</text>
                  <text class="" v-if="groupInfo.securityDepositPayMode == 1">/队</text>
                  <text class="" v-else>/人</text>
                </view>
              </template>
            </AuCell>
          </AuCellGroup>
        </view>
      </view>
      <view class="mx-58rpx text-28rpx u-tips-color">
        <view class="flex-y-center">
          <i class="iconfont icon-warn text-28rpx"></i>
          <text class="ml-4rpx">温馨提示</text>
        </view>
        <view class="lh-40rpx mt-6rpx">
          此处为创建队伍入口，请队伍沟通好由一人创建即可，队伍成员无需创建队伍，可直接搜索队伍加入或联系队伍负责人发送报名二维码或链接。
        </view>
      </view>
      <AuFixed>
        <AuButtonGroup confirmText="队伍参赛" @click="clickTeamSignup"></AuButtonGroup>
      </AuFixed>
    </view>

    <AuModal v-model:show="showSuccessPopup" :isCancel="false" :width="586" :isConfrimAutoClose="true" @confrim="confrimSuccess">
      <template #title>
        <image class="w-full" :src="submitSuccessUrl" mode="widthFix" />
      </template>
      <template #content>
        <view class="u-main-color text-28rpx mx-32rpx mt-50rpx">
          您的队伍已提交，请耐心等待审核结果，您可以关注【立方竞技】公众号接收审核通知，或直接在【报名记录】中查看审核结果。
        </view>
      </template>
    </AuModal>
  </view>
</template>

<script lang="ts" setup>
import AuCellGroup from '@/components/AuCellGroup/AuCellGroup.vue';
import AuCell from '@/components/AuCell/AuCell.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import CreateTeamForm from './components/CreateTeamForm/CreateTeamForm.vue';
import AuModal from '@/components/AuModal/AuModal.vue';
import { signupBgUrl, submitSuccessUrl } from '@/athletics/config/images';
import {
  requestTasks,
  setStatisticList,
  amend,
  customShowToast,
  setObjectOwnProperty,
  createLowercasePropertyProxy,
  debounce
} from '@/utils/index';
import { GroupInfo, SportTeamAddReq } from '@/athletics/model/sport';
import { sportEventDetailApi, sportTeamAddApi, teamSignupApi, sportTeamDetailApi } from '@/athletics/api/sport';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
const { phone } = storeToRefs(authStore);
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(sportEventDetailFn());
    if (optionInfo?.teamId) {
      requestTasks.add(sportTeamDetailFn());
    }
  } else if (key == 'submit') {
    if (!optionInfo?.teamId) {
      requestTasks.add(sportTeamAddFn());
    } else {
      requestTasks.add(teamSignupFn());
    }
  }
  requestTasks.end();
}
async function sportEventDetailFn() {
  const { eventId, eventGroupId } = optionInfo;
  if (!eventId) {
    return;
  }
  const task = sportEventDetailApi(eventId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData || !bizData?.groupInfo?.length || !bizData.basicInfo) {
      return;
    }
    const index = bizData.groupInfo.findIndex((item) => item.eventGroupId == eventGroupId);
    if (index == -1) {
      return;
    }
    Object.assign(groupInfo, bizData.groupInfo[index]);
    const eventName = bizData.basicInfo.eventName;
    const { groupName, signFee, securityDeposit } = groupInfo;
    setStatisticList(
      {
        eventName,
        groupName
      },
      groupDataList
    );
    if (signFee) {
      priceDataList.push({
        label: `${groupName}队员报名费用`,
        value: `${signFee}`
      });
    }
    if (securityDeposit) {
      priceDataList.push({
        label: `${groupName}队员保证金`,
        value: `${securityDeposit}`
      });
    }
  });
  return task;
}
async function sportTeamDetailFn() {
  const { teamId } = optionInfo;
  if (!teamId) {
    return;
  }
  const task = sportTeamDetailApi(teamId);
  task.then((res) => {
    const bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    setObjectOwnProperty(formData, bizData);
  });
  return task;
}
async function sportTeamAddFn() {
  const { eventGroupId } = optionInfo;
  if (!eventGroupId) {
    return;
  }
  const params = {
    eventGroupId,
    ...formData
  } as SportTeamAddReq;
  const task = sportTeamAddApi(params);
  task.then((res) => {
    if (!res.bizData) {
      return;
    }
    teamSignupId = res.bizData?.teamSignupId || '';
    if (res.success) {
      showSuccessPopup.value = true;
    }
  });
  return task;
}
async function teamSignupFn() {
  const { teamId, eventGroupId } = optionInfo;
  if (!eventGroupId || !teamId) {
    return;
  }
  const { teamLogo: eventTeamLogo, joinCode } = formData;
  const params = {
    eventGroupId,
    teamId,
    eventTeamLogo,
    joinCode
  };
  const task = teamSignupApi(params);
  task.then((res) => {
    if (!res.bizData) {
      return;
    }
    teamSignupId = res.bizData || '';
    if (res.success) {
      showSuccessPopup.value = true;
    }
  });
  return task;
}

let teamSignupId;
const showSuccessPopup = ref<boolean>(false);
const createTeamForm = ref<Form | null>(null);
const formData = reactive({
  teamLogo: '',
  teamLogoList: [],
  teamName: '',
  leaderName: '',
  leaderPhone: phone.value || '',
  joinCode: ''
});
const formDisabledData = reactive({
  teamLogo: false,
  teamLogoList: false,
  teamName: false,
  leaderName: false,
  leaderPhone: false,
  joinCode: false
});
const groupDataList = reactive<StatisticItem[]>([
  { label: '比赛项目', value: '', key: 'eventName' },
  { label: '组别', value: '', key: 'groupName' }
]);
const priceDataList = reactive<Option[]>([]);
const groupInfo = reactive<Partial<GroupInfo>>({});
const totalPrice = computed(() => {
  let val = 0;
  priceDataList.forEach((item) => {
    val = amend(val, item.value, '+');
  });
  return val;
});
const isNeedPay = computed(() => {
  if (groupInfo.securityDepositPayMode == 2) {
    return false;
  }
  return Number(totalPrice.value) > 0;
});

const clickTeamSignup = debounce(function () {
  if (!createTeamForm.value) {
    return;
  }
  createTeamForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {});
}, 100);
function confrimSuccess() {
  if (!isNeedPay.value) {
    uni.redirectTo({
      url: `/athletics/pages/TeamIndex/TeamIndex?teamSignupId=${teamSignupId}`
    });
  } else {
    uni.redirectTo({
      url: `/athletics/pages/PayOrder/PayOrder?teamSignupId=${teamSignupId}`
    });
  }
}

interface OptionInfo {
  eventId: string | number;
  eventGroupId: string | number;
  teamId?: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  if (optionInfo?.teamId) {
    formData.leaderPhone = '';
    formDisabledData.teamName = true;
    formDisabledData.leaderName = true;
  }
  requestAll('onLoad');
});
</script>

<style scoped lang="scss">
.au-container {
  padding-left: 48rpx;
  padding-right: 48rpx;
  margin-left: 28rpx;
  margin-right: 28rpx;
  margin-bottom: 28rpx;
}
</style>
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
