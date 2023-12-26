<template>
  <view
    class="au-wrapper bg-cover-auto"
    :style="{
      backgroundImage: `url(${signupBgUrl})`
    }"
  >
    <view class="au-wrapper__body pt-32rpx mx-24rpx">
      <view class="au-container">
        <SignupForm ref="signupForm" :formDataList="formDataList" v-model:formData="formData" :disabled="true"></SignupForm>
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
    <AuFixed v-if="checkStatus == 1">
      <u-radio-group v-model="auditStatus">
        <view class="w-full flex justify-between px-120rpx mt-32rpx">
          <u-radio name="3" label="审核通过"></u-radio>
          <u-radio name="2" label="审核不通过"></u-radio>
        </view>
      </u-radio-group>
      <view class="mx-32rpx mt-20rpx text-28rpx" v-if="auditStatus == 2">
        <u-textarea
          v-model="auditRemark"
          placeholder="请输入审核不通过的原因"
          count
          maxlength="200"
          border="none"
          height="134rpx"
        ></u-textarea>
      </view>
      <AuButtonGroup mode="double" @click="clickButtonGroup"></AuButtonGroup>
    </AuFixed>
    <AuModal v-model:show="showCheckPopup" :width="664" @confrim="clickConfrimCheck">
      <template #content>
        <view class="px-48rpx pt-50rpx">
          <view class="bg-hex-f2f2f2 rounded-12rpx text-28rpx u-main-color p-24rpx">
            <view>队员：{{ userInfo.userName }}</view>
            <view class="mt-16rpx">手机号码：{{ userInfo.userPhone }}</view>
          </view>
          <view class="lh-40rpx u-warning flex text-28rpx mt-40rpx">
            <i class="iconfont icon-warn text-28rpx"></i>
            <view class="ml-8rpx">确认该队员审核不通过，不通过后，该队员将从队伍删除并全额退费。</view>
          </view>
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
import SignupForm from '../Signup/components/SignupForm/SignupForm.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { useSportStore } from '@/store/sport';
import { useAuthStore } from '@/store/auth';
import { requestTasks, amend, customShowToast, createLowercasePropertyProxy } from '@/utils/index';
import {
  SportEventGroupListRes,
  CollectionConfItem,
  PersonSignupApplyFormReq,
  UpdateSignupApplyDataReq
} from '@/athletics/model/sport';
import { personSignupApplyFormApi, auditMemberApi, getMemberSignupApplyInfoDataApi } from '@/athletics/api/sport';
import {
  getGroupList,
  handlePersonSignupApplyFormData,
  getFormDataNameAndPhone,
  setSignupFormData
} from '@/athletics/utils/util';
const sportStore = useSportStore();
const authStore = useAuthStore();

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    await personSignupApplyFormFn();
    requestTasks.add(getMemberSignupApplyInfoDataFn());
  } else if (key == 'check') {
    requestTasks.add(auditMemberFn());
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
  });
  return task;
}
async function getMemberSignupApplyInfoDataFn() {
  const { teamSignupId, memberId } = optionInfo;
  if (!teamSignupId || !memberId) {
    return;
  }
  const params = {
    teamSignupId,
    memberId
  };
  const task = getMemberSignupApplyInfoDataApi(params);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    // 处理formData
    const dataList = bizData?.signupApplyInfo?.dataList || [];
    setSignupFormData(dataList, formDataMap, formData);
    Object.assign(userInfo, getFormDataNameAndPhone(formDataList, formData));
    checkStatus.value = bizData?.memberSignup?.auditStatus || '';
  });
  return task;
}

async function auditMemberFn() {
  const { memberSignupId } = optionInfo;
  if (!memberSignupId) {
    return;
  }
  const params = {
    auditRemark: auditRemark.value,
    auditStatus: auditStatus.value,
    memberSignupId
  };
  const task = auditMemberApi(params);
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

const checkStatus = ref<string | number>('');
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

// 审核
const showCheckPopup = ref<boolean>(false);
const auditStatus = ref<string | number>('');
const auditRemark = ref<string>('');
const userInfo = reactive<
  Partial<{
    userName: string;
    userPhone: string;
  }>
>({});
function clickButtonGroup(index) {
  if (index == 0) {
    uni.navigateBack();
  } else {
    if (!auditStatus.value) {
      uni.$u.toast('请选择审核状态');
      return;
    }
    if (auditStatus.value == 2 && !auditRemark.value) {
      uni.$u.toast('请输入审核不通过的原因');
      return;
    }
    if (auditStatus.value == 2) {
      showCheckPopup.value = true;
    } else {
      uni.showModal({
        title: '提示',
        content: '确定审核通过？',
        success: ({ confirm }) => {
          if (confirm) {
            requestAll('check');
          }
        }
      });
    }
  }
}
function clickConfrimCheck() {
  requestAll('check');
}

interface OptionInfo {
  teamSignupId: string | number;
  memberId: string | number;
  memberSignupId: string | number;
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
::v-deep {
  .u-textarea {
    background-color: #f9f9f9 !important;
    .u-textarea__count {
      background-color: #f9f9f9 !important;
    }
  }
}
</style>
<style lang="scss">
page {
  padding-bottom: 440rpx;
}
</style>
