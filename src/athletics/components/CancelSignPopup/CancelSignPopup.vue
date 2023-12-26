<template>
  <view class="cancel-sign-popup">
    <AuModal v-model:show="show" :width="664" @confrim="clickConfrimCancel">
      <template #content>
        <view class="px-48rpx pt-50rpx">
          <view class="bg-hex-f2f2f2 rounded-12rpx text-28rpx u-main-color p-24rpx">
            <view>赛事名称 ：{{ signupData.eventName }}</view>
            <view class="mt-16rpx" v-if="mode != 'individual' && signupData.eventTeamName">
              队伍名称 ：{{ signupData.eventTeamName }}
            </view>
            <view class="mt-16rpx" v-if="mode == 'member' && signupData.signupUserName">
              报名人 ：{{ signupData.signupUserName }}
            </view>
            <view class="mt-16rpx" v-if="mode == 'individual' && signupData.signupUserName">
              报名人 ：{{ signupData.signupUserName }}
            </view>
          </view>
          <view class="lh-40rpx u-warning flex text-28rpx mt-40rpx">
            <i class="iconfont icon-warn text-28rpx"></i>
            <template v-if="mode == 'individual'">
              <view class="ml-8rpx">确认取消个人报名？如有缴费，相关费用将会原路返回。</view>
            </template>
            <template v-else-if="mode == 'team'">
              <view class="ml-8rpx">确认取消队伍报名？如有缴费，相关费用将会原路返回。</view>
            </template>
            <template v-else-if="mode == 'member'">
              <view class="ml-8rpx">确认取消个人报名？如有缴费，相关费用将会原路返回。</view>
            </template>
          </view>
        </view>
      </template>
    </AuModal>
  </view>
</template>

<script lang="ts" setup>
import AuModal from '@/components/AuModal/AuModal.vue';
import { requestTasks, setStatisticList, amend, customShowToast } from '@/utils/index';
import { teamSignupCancelApi, cancelMemberSignupApi, individualCancelSignupApi } from '@/athletics/api/sport';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';

const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'change'): void;
}>();
interface CancelSignPopupProps {
  show: boolean;
  mode: 'team' | 'member' | 'individual';
  signupId: string | number;
  signupData: Partial<{
    eventName: string;
    eventTeamName: string;
    signupUserName: string;
  }>;
}
const props = withDefaults(defineProps<CancelSignPopupProps>(), {
  show: false,
  signupId: '',
  signupData: () => ({})
});

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'clickButtonCancel') {
    requestTasks.add(signupCancelFn());
  }
  requestTasks.end();
}
async function signupCancelFn() {
  const { mode, signupId } = props;
  if (!signupId) {
    return;
  }
  let task;
  if (mode == 'individual') {
    task = individualCancelSignupApi(signupId);
  } else if (mode == 'member') {
    task = cancelMemberSignupApi(signupId);
  } else {
    task = teamSignupCancelApi(signupId);
  }
  task.then((res) => {
    customShowToast(res);
    if (res.success) {
      show.value = false;
      setTimeout(() => {
        emit('change');
      }, 1500);
    }
  });
  return task;
}

const { show } = useVModels(props, emit);
function clickConfrimCancel() {
  requestAll('clickButtonCancel');
}
</script>

<style scoped></style>
