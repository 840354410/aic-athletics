<template>
  <view class="au-wrapper overflow-hidden">
    <view class="au-wrapper__body">
      <view class="au-container m-20rpx">
        <view class="border-b-2 text-center">
          <view class="u-main-color font-bold text-32rpx py-24rpx">{{ agreementData.title }}</view>
          <view class="u-main-color text-28rpx pt-8rpx pb-50rpx">{{ agreementData.subTitle }}</view>
        </view>
        <view class="text-24rpx my-48rpx">
          <u-parse :content="agreementData.content" :tagStyle="getUParseTagStyle()"></u-parse>
        </view>
      </view>

      <AuFixed>
        <AuButtonGroup
          :confirmText="confirmText"
          :confirmType="countDownTime <= 0 ? 'primary' : 'gray-cancel'"
          :confirmDisabled="countDownTime > 0"
          @click="clickSave"
        ></AuButtonGroup>
      </AuFixed>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import { requestTasks, customShowToast, createLowercasePropertyProxy, getUParseTagStyle } from '@/utils/index';
import { SportEventDetailRes } from '@/athletics/model/sport';
import { sportEventDetailApi } from '@/athletics/api/sport';
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(await sportEventDetailFn());
  }
  requestTasks.end();
}

async function sportEventDetailFn() {
  const { eventId, eventGroupId } = optionInfo;
  if (!eventId) {
    return;
  }
  const task = sportEventDetailApi(eventId);
  task.then(async (res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    Object.assign(detailData, bizData);
    if (bizData.groupInfo.length) {
      let index = bizData.groupInfo.findIndex((item) => item.eventGroupId == eventGroupId);
      index = index > -1 ? index : 0;
      groupVal.value = index;
      const groupItem = bizData.groupInfo[index];
      if (groupItem) {
        groupId.value = groupItem.eventGroupId;
      }
    }
  });
  return task;
}

const detailData = reactive<Partial<SportEventDetailRes>>({});
const groupId = ref<number>();
const groupVal = ref<number>(0);
const agreementData = computed(() => {
  uni.pageScrollTo({
    scrollTop: 0
  });
  const obj = {
    title: '',
    subTitle: '',
    content: ''
  };
  const { bizAction } = optionInfo || {};
  obj.subTitle = detailData?.basicInfo?.eventName || '';
  if (bizAction == 'signNotes') {
    obj.title = '报名须知';
    obj.content = detailData?.basicInfo?.signNotes || '';
  } else if (bizAction == 'disclaimer') {
    obj.title = '免责声明书';
    obj.content = detailData?.disclaimer || '';
  }
  uni.setNavigationBarTitle({
    title: obj.title
  });
  return obj;
});
const countDownTime = ref<number>(8);
const confirmText = computed(() => {
  const str = '已阅读并同意';
  if (countDownTime.value > 0) {
    return `${str}(${countDownTime.value}s)`;
  } else {
    return str;
  }
});

onMounted(() => {
  startCountDown();
});

function startCountDown() {
  const interval = setInterval(() => {
    countDownTime.value--;
    if (countDownTime.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
}
function clickSave() {
  const { bizAction, jumpUrl: url } = optionInfo;
  if (bizAction === 'signNotes' && detailData?.disclaimer) {
    optionInfo.bizAction = 'disclaimer';
    countDownTime.value = 8;
    startCountDown();
    return;
  }
  uni.redirectTo({
    url
  });
}

interface OptionInfo {
  eventId: string | number;
  eventGroupId: string | number;
  bizAction: 'signNotes' | 'disclaimer' | '';
  jumpUrl: string;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  if (optionInfo) {
    optionInfo.jumpUrl = decodeURIComponent(optionInfo.jumpUrl);
  }
  optionInfo = reactive(optionInfo);
  requestAll('onLoad');
});
onShow(() => {
  requestAll('onShow');
});
</script>

<style scoped lang="scss">
.au-container {
  padding: 24rpx 48rpx;
  background: #fff;
  border-radius: 20rpx;
}
</style>
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
