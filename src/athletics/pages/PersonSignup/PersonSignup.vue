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
      </view>
    </view>
    <AuFixed customClass="py-60rpx px-24rpx">
      <view class="flex-y-center justify-between">
        <view class="flex flex-1 items-end pl-48rpx" v-if="totalPrice > 0">
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
import SignupForm from '../Signup/components/SignupForm/SignupForm.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { useSportStore } from '@/store/sport';
import { useAuthStore } from '@/store/auth';
import { requestTasks, setStatisticList, amend, customShowToast, createLowercasePropertyProxy } from '@/utils/index';
import { SportEventGroupListRes, CollectionConfItem } from '@/athletics/model/sport';
import { individualSignupApplyInfoFormApi, individualSignupApplyApi } from '@/athletics/api/sport';
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
    requestTasks.add(individualSignupApplyInfoFormFn());
  } else if (key == 'submit') {
    requestTasks.add(individualSignupApplyFn());
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
    setSignupFormDataUserPhone(formDataList, formData, phone);
  });
  return task;
}
async function individualSignupApplyFn() {
  const { eventGroupId } = optionInfo;
  if (!userInfo.value || !signupForm.value) {
    return;
  }
  const { id: userId } = userInfo.value;
  if (!eventGroupId) {
    return;
  }
  const dataList = getCollectionDataList(formData, formDataMap);
  const { userName, userPhone } = getFormDataNameAndPhone(formDataList, formData);
  const params = {
    dataList,
    eventGroupId,
    userName,
    userPhone,
    userId
  };
  const task = individualSignupApplyApi(params);
  task.then((res) => {
    if (isNeedPay.value) {
      const individualSignupId = res?.bizData || '';
      uni.redirectTo({
        url: `/athletics/pages/PersonPayOrder/PersonPayOrder?individualSignupId=${individualSignupId}`
      });
    } else {
      customShowToast(res);
      setTimeout(() => {
        uni.navigateTo({
          url: '/athletics/pages/SignupRecord/SignupRecord?navVal=0'
        });
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
  return Number(totalPrice.value) > 0;
});
const signupForm = ref<Form | null>(null);
const formDataMap = reactive({});
const formDataList = reactive<CollectionConfItem[]>([]);
const formData = reactive({});
const unitStr = computed(() => {
  return '人';
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
  eventGroupId: string | number;
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
