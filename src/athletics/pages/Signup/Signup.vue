<template>
  <view class="au-wrapper">
    <view
      class="bg-cover-auto flex-y-center flex-col h-316rpx"
      :style="{
        backgroundImage: `url(${signupBgUrl})`
      }"
    >
      <image class="icon-140 mt-16rpx rounded-1/2" :src="teamInfo.teamLogo || aicLogoUrl" mode="aspectFill" />
      <view class="team-name mt-8rpx mb-20rpx">
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
        <SignupForm
          ref="signupForm"
          :formDataList="formDataList"
          v-model:formData="formData"
          :disabledPhone="!isTeamLeader"
          :disabledName="false"
        ></SignupForm>
      </view>
      <view class="au-container py-20rpx">
        <AuCellGroup v-if="priceDataList.length">
          <template #header>报名费用</template>
          <AuCell v-for="item in priceDataList" :key="item.value" :item="item" labelWidth="12rem" padding="24rpx 0">
            <template #label>{{ item.label }}</template>
            <template #value>
              <view class="flex-y-center justify-end">
                <text class="u-primary text-28rpx font-bold">￥</text>
                <text class="u-primary text-28rpx font-bold">{{ item.value }}</text>
                <text class="">/{{ unitStr }}</text>
              </view>
            </template>
          </AuCell>
        </AuCellGroup>
        <view
          class="py-24rpx flex-y-center u-error text-28rpx lh-40rpx items-start"
          v-if="groupConfig.securityDepositPayMode == 1"
        >
          <i class="iconfont icon-warn text-28rpx"></i>
          <text class="ml-4rpx">当前队伍报名费用统一由领队支付，个人无需支付</text>
        </view>
      </view>
    </view>
    <AuFixed customClass="py-60rpx px-24rpx">
      <view class="flex-y-center justify-between">
        <view class="flex flex-1 items-end pl-48rpx" v-if="groupConfig.securityDepositPayMode != 1">
          <text class="u-tips-color text-28rpx">总计</text>
          <text class="u-primary text-32rpx ml-12rpx font-bold">￥{{ totalPrice }}</text>
        </view>
        <view class="ml-auto w-310rpx" @click="clickSignupBtn">
          <u-button type="primary">立即报名</u-button>
        </view>
      </view>
    </AuFixed>
  </view>
</template>

<script lang="ts" setup>
import AuCellGroup from '@/components/AuCellGroup/AuCellGroup.vue';
import AuCell from '@/components/AuCell/AuCell.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import SignupForm from './components/SignupForm/SignupForm.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { useSportStore } from '@/store/sport';
import { useAuthStore } from '@/store/auth';
import { requestTasks, setStatisticList, amend, customShowToast, createLowercasePropertyProxy, debounce } from '@/utils/index';
import {
  SportEventGroupListRes,
  CollectionConfItem,
  PersonSignupApplyFormReq,
  PersonSignupApplyReq
} from '@/athletics/model/sport';
import { personSignupApplyFormApi, personSignupApplyApi } from '@/athletics/api/sport';
import {
  getGroupList,
  handlePersonSignupApplyFormData,
  setSignupFormDataUserPhone,
  getFormDataNameAndPhone,
  getCollectionDataList
} from '@/athletics/utils/util';
const sportStore = useSportStore();
const authStore = useAuthStore();
const { userInfo, phone } = storeToRefs(authStore);
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(personSignupApplyFormFn());
  } else if (key == 'submit') {
    requestTasks.add(personSignupApplyFn());
  }
  requestTasks.end();
}
async function personSignupApplyFormFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const params: PersonSignupApplyFormReq = {
    teamSignupId
  };
  if (!isTeamLeader.value) {
    params.joinCode = sportStore.joinCode;
  }
  const task = personSignupApplyFormApi(params);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    handlePersonSignupApplyFormData(bizData, {
      groupConfig,
      teamInfo,
      groupDataList,
      priceDataList,
      formDataList,
      formDataMap,
      formData
    });
    if (!isTeamLeader.value) {
      setSignupFormDataUserPhone(formDataList, formData, phone);
    }
  });
  return task;
}
const personSignupApplyFn = debounce(async function () {
  const { teamSignupId } = optionInfo;
  if (!userInfo.value || !signupForm.value) {
    return;
  }
  const { id: userId } = userInfo.value;
  if (!teamSignupId) {
    return;
  }
  const dataList = getCollectionDataList(formData, formDataMap);
  const { userName, userPhone } = getFormDataNameAndPhone(formDataList, formData);
  const params: PersonSignupApplyReq = {
    dataList,
    teamSignupId,
    userName,
    userPhone
  };
  if (!isTeamLeader.value) {
    params.userId = userId;
    params.joinCode = sportStore.joinCode;
  }
  const task = personSignupApplyApi(params);
  task.then((res) => {
    if (isNeedPay.value) {
      const { teamSignupId } = optionInfo;
      const memberId = res?.bizData || '';
      uni.redirectTo({
        url: `/athletics/pages/PayOrder/PayOrder?teamSignupId=${teamSignupId}&memberId=${memberId}`
      });
    } else {
      customShowToast(res);
      setTimeout(() => {
        if (isTeamLeader.value) {
          uni.navigateBack();
        } else {
          uni.navigateTo({
            url: '/athletics/pages/SignupRecord/SignupRecord?navVal=0'
          });
        }
      }, 1500);
    }
  });
  return task;
}, 100);

const isTeamLeader = ref<boolean>(false);
const groupDataList = reactive<StatisticItem[]>(getGroupList());
const groupConfig = reactive<Partial<SportEventGroupListRes>>({});
const teamInfo = reactive<{
  teamName: string;
  teamLogo: string;
}>({
  teamName: '',
  teamLogo: ''
});
const priceDataList = reactive<Option[]>([]);
const totalPrice = computed(() => {
  let val = 0;
  priceDataList.forEach((item) => {
    val = amend(val, item.value, '+');
  });
  return val;
});
const isNeedPay = computed(() => {
  if (groupConfig.securityDepositPayMode == 1) {
    return false;
  }
  return Number(totalPrice.value) > 0;
});
const signupForm = ref<Form | null>(null);
const formDataMap = reactive({});
const formDataList = reactive<CollectionConfItem[]>([]);
const formData = reactive({});
const unitStr = computed(() => {
  return groupConfig.securityDepositPayMode == 1 ? '队' : '人';
});
function clickSignupBtn() {
  if (!signupForm.value) {
    return;
  }
  signupForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {
      console.log(err);
    });
}

interface OptionInfo {
  teamSignupId: string | number;
  isTeamLeader?: string;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  isTeamLeader.value = optionInfo?.isTeamLeader == '1';
  requestAll('onLoad');
});
</script>

<style scoped lang="scss">
.team-name {
  font-family: Microsoft YaHei-Bold, Microsoft YaHei;
  font-weight: bold;
}
.au-container {
  padding-left: 48rpx;
  padding-right: 48rpx;
  margin-bottom: 28rpx;
}
::v-deep {
  .u-cell:nth-child(-n + 2) .u-cell__value {
    font-weight: bold;
  }
}
</style>
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
