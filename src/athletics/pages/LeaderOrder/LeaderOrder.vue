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
      <view class="flex-y-center text-28rpx color-white" @click="showTeamMemberListPopup = true">
        <text class="mr-16rpx">共有{{ signupData?.teamMemberList?.length || 0 }}人报名，查看队伍成员</text>
        <i class="iconfont icon-roundrightfill text-28rpx"></i>
      </view>
    </view>
    <view class="au-wrapper__body -mt-40rpx mx-24rpx">
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
            <AuCell v-for="item in userInfoList" :key="item.value" :item="item" labelWidth="6rem" padding="12rpx 0"></AuCell>
          </view>
          <view class="py-16rpx border-b-2" v-if="signupData.securityDepositPayMode == 1 && priceDataList.length">
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
      <AuButtonGroup mode="double" cancel-text="取消建队" confirm-text="管理报名" @click="clickButtonGroup"></AuButtonGroup>
    </AuFixed>
    <TeamMemberList v-model:show="showTeamMemberListPopup" :signupData="signupData"></TeamMemberList>
    <CancelSignPopup
      v-model:show="showCancelPopup"
      mode="team"
      :signupId="teamSignupId"
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
import TeamMemberList from '@/athletics/components/TeamMemberList/TeamMemberList.vue';
import { signupBgUrl, aicLogoUrl } from '@/athletics/config/images';
import { requestTasks, setStatisticList, getDateStrs, createLowercasePropertyProxy } from '@/utils/index';
import { TeamSignupDataRes } from '@/athletics/model/sport';
import { teamSignupInfoApi } from '@/athletics/api/sport';
import { getGroupList, setgroupDataOpenLocation, auditStatusMap, setPriceDataList } from '@/athletics/utils/util';

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onShow') {
    requestTasks.add(teamSignupInfoFn());
  }
  requestTasks.end();
}
async function teamSignupInfoFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const task = teamSignupInfoApi(teamSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    teamInfo.teamName = bizData.eventTeamName;
    teamInfo.teamLogo = bizData.eventTeamLogo;
    bizData.signDateStr = getDateStrs(bizData.signBeginTime, bizData.signEndTime);
    bizData.eventDateStr = getDateStrs(bizData.eventBeginTime, bizData.eventEndTime);
    bizData.teamSignupOrderList = bizData.teamSignupOrderList || [];
    setStatisticList(bizData, groupDataList);
    setgroupDataOpenLocation(bizData, groupDataList);
    const { memberName, memberPhone } = bizData.leaderInfo || {};
    setStatisticList(
      {
        memberPhone,
        memberName
      },
      userInfoList
    );
    setPriceDataList(bizData, bizData.teamSignupOrderList, { priceDataList, paymentStatus });
    auditStatus.value = bizData.auditStatus;
    signupStatus.value = bizData.signupStatus;
    Object.assign(signupData, bizData);
  });
  return task;
}

const teamSignupId = ref<string | number>('');
const signupStatus = ref<string | number>('');
const showTeamMemberListPopup = ref<boolean>(false);
const signupData = reactive<Partial<TeamSignupDataRes>>({});
const groupDataList = reactive<StatisticItem[]>(getGroupList());
const teamInfo = reactive<{
  teamName: string;
  teamLogo: string;
}>({
  teamName: '',
  teamLogo: ''
});
const userInfoList = reactive<StatisticItem[]>([
  { label: '姓名', value: '', key: 'memberName' },
  { label: '手机号', value: '', key: 'memberPhone' },
  { label: '报名人类型', value: '领队', key: '' }
]);
const priceDataList = reactive<StatisticItem[]>([]);
const paymentStatus = ref<string | number>('');
const auditStatus = ref<string | number>('');
const showCancelPopup = ref<boolean>(false);
function clickButtonGroup(index, item) {
  if (index == 0) {
    showCancelPopup.value = true;
  } else if (index == 1) {
    uni.navigateTo({
      url: `/athletics/pages/TeamIndex/TeamIndex?teamSignupId=${optionInfo.teamSignupId}`
    });
  }
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
