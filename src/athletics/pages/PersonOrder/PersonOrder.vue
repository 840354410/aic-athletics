<template>
  <view class="au-wrapper">
    <view
      class="bg-cover-auto h-316rpx flex px-24rpx"
      :style="{
        backgroundImage: `url(${signupBgUrl})`
      }"
    >
      <view class="team-name mt-44rpx mb-22rpx">{{ headerName }}</view>
    </view>
    <view class="au-wrapper__body -mt-188rpx mx-24rpx">
      <view class="au-container py-20rpx">
        <AuCellGroup>
          <AuCell v-for="item in groupDataList" :key="item.value" :item="item"></AuCell>
        </AuCellGroup>
      </view>
      <view class="au-container overflow-hidden py-8rpx relative">
        <view class="absolute -top-28rpx -right-4rpx">
          <i class="iconfont icon-baomingchenggong text-100rpx color-#0DBF19" v-if="signupStatus == 1"></i>
          <i class="iconfont icon-yiquxiao1 text-100rpx color-#707070" v-if="signupStatus == 3"></i>
        </view>
        <AuCellGroup>
          <template #header>
            <view>我的报名信息</view>
          </template>
          <view class="pb-16rpx border-b-2">
            <AuCell v-for="item in userInfoList" :key="item.value" :item="item" labelWidth="12em" padding="12rpx 0"></AuCell>
            <AuCell
              v-for="item in signupInfoList"
              :key="item.value"
              :item="item"
              labelWidth="12em"
              padding="12rpx 0"
              v-show="showSignupInfoList"
            >
              <template #label>{{ item.label }}</template>
              <template #value>
                <template v-if="!item.isImg">
                  <text>{{ item.value }}</text>
                </template>
                <template v-else-if="item.imgArr?.length">
                  <u-album :urls="item.imgArr"></u-album>
                </template>
              </template>
            </AuCell>
            <template v-if="signupInfoList.length">
              <view class="flex u-tips-color my-12rpx">
                <view class="flex-y-center ml-auto" v-show="!showSignupInfoList" @click="showSignupInfoList = true">
                  <text>更多</text>
                  <i class="iconfont icon-right rotate-90 text-24rpx ml-8rpx"></i>
                </view>
                <view class="flex-y-center ml-auto" v-show="showSignupInfoList" @click="showSignupInfoList = false">
                  <text>收起</text>
                  <i class="iconfont icon-right -rotate-90 text-24rpx ml-8rpx"></i>
                </view>
              </view>
            </template>
          </view>
          <view class="py-16rpx border-b-2" v-if="priceDataList.length">
            <AuCell v-for="item in priceDataList" :key="item.value" :item="item" labelWidth="6rem" padding="12rpx 0">
              <template #value>
                <view class="flex-y-center justify-end" :class="item.className">{{ item.valuePrefix }}{{ item.value }}</view>
              </template>
            </AuCell>

            <view class="w-166rpx ml-auto pb-24rpx" v-if="paymentStatus == 2 && signupStatus != 3">
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
          <view class="py-16rpx">
            <AuCell labelWidth="6rem" padding="12rpx 0">
              <template #label>审核状态</template>
              <template #value>
                <view class="flex-y-center justify-end" :class="auditStatusMap[auditStatus]?.className">
                  <image class="icon-28" :src="auditStatusMap[auditStatus]?.iconUrl" mode="widthFix" />
                  <text class="ml-8rpx font-bold">{{ auditStatusMap[auditStatus]?.text }}</text>
                </view>
              </template>
            </AuCell>
            <AuCell labelWidth="6rem" padding="12rpx 0" v-if="auditStatus == 2">
              <template #label>不通过原因</template>
              <template #value>
                <view class="flex-y-center justify-end u-error">{{ signupData.auditRemark }}</view>
              </template>
            </AuCell>
          </view>
        </AuCellGroup>
      </view>
    </view>
    <AuFixed v-if="auditStatus == 1 && signupStatus != 3">
      <AuButtonGroup mode="double" cancel-text="取消报名" confirm-text="编辑报名信息" @click="clickButtonGroup"></AuButtonGroup>
    </AuFixed>
    <CancelSignPopup
      v-model:show="showCancelPopup"
      mode="individual"
      :signupId="individualSignupId"
      :signupData="signupData"
      @change="requestAll('onShow')"
    ></CancelSignPopup>
  </view>
</template>

<script lang="ts" setup>
import AuCellGroup from '@/components/AuCellGroup/AuCellGroup.vue';
import AuCell from '@/components/AuCell/AuCell.vue';
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import CancelSignPopup from '@/athletics/components/CancelSignPopup/CancelSignPopup.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { requestTasks, setStatisticList, getDateStrs, getIsImg, createLowercasePropertyProxy } from '@/utils/index';
import { IndividualSignupInfoRes } from '@/athletics/model/sport';
import { individualSignupInfoApi, getIndividualSignupApplyInfoDataApi } from '@/athletics/api/sport';
import { getGroupList, setgroupDataOpenLocation, auditStatusMap, setPriceDataList } from '@/athletics/utils/util';

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onShow') {
    requestTasks.add(individualSignupInfoFn());
    requestTasks.add(getIndividualSignupApplyInfoDataFn());
  }
  requestTasks.end();
}
async function individualSignupInfoFn() {
  const { individualSignupId } = optionInfo;
  if (!individualSignupId) {
    return;
  }
  const task = individualSignupInfoApi(individualSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    bizData.signDateStr = getDateStrs(bizData.signBeginTime, bizData.signEndTime);
    bizData.eventDateStr = getDateStrs(bizData.eventBeginTime, bizData.eventEndTime);
    bizData.signupOrderList = bizData.signupOrderList || [];
    setStatisticList(bizData, groupDataList);
    setgroupDataOpenLocation(bizData, groupDataList);
    const { signupUserName: memberName, signupUserPhone: memberPhone } = bizData.signupInfo || {};
    setStatisticList(
      {
        memberPhone,
        memberName
      },
      userInfoList
    );
    setPriceDataList(bizData, bizData.signupOrderList, { priceDataList, paymentStatus });
    signupStatus.value = bizData.signupOrderList[0]?.signupStatus;
    auditStatus.value = bizData.signupOrderList[0]?.auditStatus;
    bizData.auditRemark = bizData.signupOrderList[0]?.auditRemark;
    headerName.value = bizData.signupInfo?.signupUserName + '  ' + bizData.signupInfo?.signupUserPhone;
    signupData.signupUserName = bizData.signupInfo.signupUserName;
    eventGroupId.value = bizData?.signupInfo?.eventGroupId;
    Object.assign(signupData, bizData);
  });
  return task;
}
async function getIndividualSignupApplyInfoDataFn() {
  const { individualSignupId } = optionInfo;
  if (!individualSignupId) {
    return;
  }
  const params = {
    individualSignupId
  };
  const task = getIndividualSignupApplyInfoDataApi(individualSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    // 处理formData
    let dataList = bizData?.signupApplyInfo?.dataList || [];
    signupInfoList.length = 0;
    let list = dataList
      .map((item) => {
        if (['USER_NAME', 'USER_PHONE'].indexOf(item.collectionDesc) > -1) {
          return false;
        }
        let value = item.valueDesc;
        let isImg = false;
        let imgArr: any[] = [];
        if (value) {
          const arr = value.split(',');
          const allEmpty = arr.every((subItem) => subItem === '');
          if (allEmpty) {
            value = '';
          }
          const isAllI = arr.every((item) => getIsImg(item));
          if (isAllI) {
            isImg = true;
            imgArr = arr;
          }
        }
        const obj: StatisticItem = {
          label: item.label,
          value,
          key: '',
          isImg
        };
        if (isImg) {
          obj.imgArr = imgArr;
        }
        return obj;
      })
      .filter(Boolean) as StatisticItem[];
    signupInfoList.push(...list);
  });
  return task;
}

const individualSignupId = ref<string | number>('');
const signupStatus = ref<string | number>('');
const signupData = reactive<Partial<IndividualSignupInfoRes>>({});
const groupDataList = reactive<StatisticItem[]>(getGroupList());
const userInfoList = reactive<StatisticItem[]>([
  { label: '姓名', value: '', key: 'memberName' },
  { label: '手机号', value: '', key: 'memberPhone' }
]);
const signupInfoList = reactive<StatisticItem[]>([]);

const priceDataList = reactive<StatisticItem[]>([]);
const paymentStatus = ref<string | number>('');
const auditStatus = ref<string | number>('');
const showCancelPopup = ref<boolean>(false);
const headerName = ref<string>('');
const showSignupInfoList = ref<boolean>(false);
const eventGroupId = ref<string | number>('');
function clickButtonGroup(index, item) {
  if (index == 0) {
    showCancelPopup.value = true;
  } else if (index == 1) {
    uni.navigateTo({
      // eslint-disable-next-line max-len
      url: `/athletics/pages/PersonUpdateSignup/PersonUpdateSignup?eventGroupId=${eventGroupId.value}&individualSignupId=${optionInfo.individualSignupId}`
    });
  }
}
function clickToPay() {
  const { individualSignupId } = optionInfo;
  if (!individualSignupId) {
    return;
  }
  let url = `/athletics/pages/PersonPayOrder/PersonPayOrder?individualSignupId=${individualSignupId}`;
  uni.navigateTo({
    url
  });
}

interface OptionInfo {
  individualSignupId: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  individualSignupId.value = optionInfo.individualSignupId;
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
