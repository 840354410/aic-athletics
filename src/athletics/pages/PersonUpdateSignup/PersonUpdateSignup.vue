<template>
  <view class="au-wrapper">
    <view
      class="bg-cover-auto flex-y-center flex-col h-316rpx"
      :style="{
        backgroundImage: `url(${signupBgUrl})`
      }"
    ></view>
    <view class="au-wrapper__body -mt-292rpx mx-24rpx">
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
          :disabledPhone="true"
          :disabledName="true"
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
    <AuFixed>
      <AuButtonGroup confirm-text="保存修改" @click="clickButtonGroup"></AuButtonGroup>
    </AuFixed>
  </view>
</template>

<script lang="ts" setup>
import AuCellGroup from '@/components/AuCellGroup/AuCellGroup.vue';
import AuCell from '@/components/AuCell/AuCell.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import SignupForm from '../Signup/components/SignupForm/SignupForm.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { useSportStore } from '@/store/sport';
import { useAuthStore } from '@/store/auth';
import {
  requestTasks,
  setStatisticList,
  amend,
  customShowToast,
  __hasOwnProp,
  createLowercasePropertyProxy
} from '@/utils/index';
import { SportEventGroupListRes, CollectionConfItem, IndividualUpdateSignupApplyDataReq } from '@/athletics/model/sport';
import {
  individualSignupApplyInfoFormApi,
  individualUpdateSignupApplyDataApi,
  getIndividualSignupApplyInfoDataApi
} from '@/athletics/api/sport';
import {
  getGroupList,
  handlePersonSignupApplyFormData,
  getFormDataNameAndPhone,
  getCollectionDataList,
  setSignupFormData
} from '@/athletics/utils/util';
const sportStore = useSportStore();
const authStore = useAuthStore();

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    await individualSignupApplyInfoFormFn();
    requestTasks.add(getIndividualSignupApplyInfoDataFn());
  } else if (key == 'submit') {
    requestTasks.add(individualUpdateSignupApplyDataFn());
  }
  requestTasks.end();
}
async function individualSignupApplyInfoFormFn() {
  const { eventGroupId } = optionInfo;
  if (!eventGroupId) {
    return;
  }
  const task = individualSignupApplyInfoFormApi(eventGroupId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    handlePersonSignupApplyFormData(bizData, {
      teamInfo: '',
      groupConfig,
      groupDataList,
      priceDataList,
      formDataList,
      formDataMap,
      formData
    });
  });
  return task;
}
async function getIndividualSignupApplyInfoDataFn() {
  const { individualSignupId } = optionInfo;
  if (!individualSignupId) {
    return;
  }
  const task = getIndividualSignupApplyInfoDataApi(individualSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    // 处理formData
    const dataList = bizData?.signupApplyInfo?.dataList || [];
    setSignupFormData(dataList, formDataMap, formData);
  });
  return task;
}

async function individualUpdateSignupApplyDataFn() {
  const { individualSignupId } = optionInfo;
  if (!authStore.userInfo || !signupForm.value) {
    return;
  }
  const { id: userId } = authStore.userInfo;
  if (!individualSignupId) {
    return;
  }
  const dataList = getCollectionDataList(formData, formDataMap);
  const { userName, userPhone } = getFormDataNameAndPhone(formDataList, formData);
  const params: IndividualUpdateSignupApplyDataReq = {
    dataList,
    individualSignupId,
    userName,
    userPhone,
    userId
  };
  const task = individualUpdateSignupApplyDataApi(params);
  task.then((res) => {
    customShowToast(res);
    if (res.success) {
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  });
  return task;
}

const groupDataList = reactive<StatisticItem[]>(getGroupList());
const groupConfig = reactive<Partial<SportEventGroupListRes>>({});
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
function clickButtonGroup() {
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
  eventGroupId: string | number;
  individualSignupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
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
