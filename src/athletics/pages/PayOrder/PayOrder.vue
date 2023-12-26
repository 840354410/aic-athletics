<template>
  <view class="au-wrapper">
    <view class="au-wrapper__body">
      <view class="au-container mt-32rpx py-20rpx">
        <AuCellGroup>
          <AuCell v-for="item in groupDataList" :key="item.value" :item="item"></AuCell>
        </AuCellGroup>
      </view>
      <view class="au-container py-20rpx">
        <AuCellGroup v-if="orderItemList.length">
          <template #header>报名费用</template>
          <AuCell
            v-for="item in orderItemList"
            :key="item.signupOrderId"
            :item="item"
            labelWidth="12rem"
            padding="32rpx 0"
            :border="true"
          >
            <template #label>{{ item.signupOrderTitle }}</template>
            <template #value>
              <view class="flex-y-center justify-end">
                <text class="u-primary text-28rpx font-bold">￥</text>
                <text class="u-primary text-28rpx font-bold">{{ item.payAmt }}</text>
                <text class="">/{{ item.signupType == 1 ? '队' : '人' }}</text>
              </view>
            </template>
          </AuCell>
          <AuCell labelWidth="5rem" padding="32rpx 0">
            <template #label>共{{ orderItemList.length }}项</template>
            <template #value>
              <view class="flex-y-center justify-end">
                <text class="u-tips-color mr-12rpx">小计</text>
                <text class="u-primary text-28rpx font-bold">￥</text>
                <text class="u-primary text-28rpx font-bold">{{ orderInfo.totalAmt }}</text>
              </view>
            </template>
          </AuCell>
        </AuCellGroup>
      </view>
      <AuFixed customClass="py-60rpx px-24rpx">
        <view class="flex-y-center justify-between">
          <view class="flex flex-1 items-end pl-48rpx" v-if="Number(orderInfo.totalAmt) > 0">
            <text class="u-tips-color text-28rpx">总计</text>
            <text class="u-primary text-32rpx ml-12rpx font-bold">￥{{ orderInfo.totalAmt }}</text>
          </view>
          <view class="ml-auto w-310rpx" @click="clickPayBtn">
            <u-button type="primary">确认支付</u-button>
          </view>
        </view>
      </AuFixed>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import { requestTasks, customShowToast, setStatisticList, createLowercasePropertyProxy, doPaySuccess } from '@/utils/index';
import { UpdateEventTeamInfoReq, OrderItem, OrderConfirmInfoRes } from '@/athletics/model/sport';
import { orderConfirmInfoApi } from '@/athletics/api/sport';
import { doPayApi } from '@/athletics/api/pay';
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onShow') {
    requestTasks.add(orderConfirmInfoFn());
  } else if (key == 'submit') {
    requestTasks.add(doPayFn());
  }
  requestTasks.end();
}

async function orderConfirmInfoFn() {
  const { teamSignupId, memberId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const params = {
    teamSignupId,
    memberId
  };
  const task = orderConfirmInfoApi(params);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    setStatisticList(bizData, groupDataList);
    if (bizData?.orderItemList?.length) {
      orderItemList.length = 0;
      orderItemList.push(...bizData.orderItemList);
    }
    Object.assign(orderInfo, bizData);
  });
  return task;
}
async function doPayFn() {
  const businessIds = orderItemList.map((item) => item.signupOrderId);
  if (!businessIds?.length) {
    return;
  }
  const params = {
    businessIds
  };
  const task = doPayApi(params);
  task.then((res) => {
    doPaySuccess(res);
  });
  return task;
}

const groupDataList = reactive<StatisticItem[]>([
  { label: '比赛项目', value: '', labelBlod: true, key: 'eventName' },
  { label: '组别', value: '', labelBlod: true, key: 'eventGroupName' },
  { label: '报名队伍', value: '', key: 'eventTeamName' }
]);
const orderItemList = reactive<OrderItem[]>([]);
const orderInfo = reactive<Partial<OrderConfirmInfoRes>>({});

function clickPayBtn() {
  requestAll('submit');
}

interface OptionInfo {
  teamSignupId: string | number;
  memberId: string | number;
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
  margin-left: 28rpx;
  margin-right: 28rpx;
  margin-bottom: 28rpx;
}
</style>
