<template>
  <view class="au-wrapper">
    <JoinTeamPopup v-model:show="showCodePopup" :teamSignupId="inviteData.teamSignupId"></JoinTeamPopup>
  </view>
</template>

<script lang="ts" setup>
import JoinTeamPopup from '@/athletics/components/JoinTeamPopup/JoinTeamPopup.vue';
import { requestTasks, createLowercasePropertyProxy } from '@/utils/index';
import { AnalyzeInvitationQrcodeRes } from '@/athletics/model/sport';
import { analyzeInvitationQrcodeApi } from '@/athletics/api/sport';
import { useAuthStore } from '@/store/auth';

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onShow') {
    requestTasks.add(analyzeInvitationQrcodeFn());
  }
  requestTasks.end();
}
async function analyzeInvitationQrcodeFn() {
  const { token } = optionInfo;
  if (!token) {
    return;
  }
  const task = analyzeInvitationQrcodeApi(token);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    Object.assign(inviteData, bizData);
    if (bizData.hasJoinCode == 1) {
      showCodePopup.value = true;
    } else {
      toSignupUrl();
    }
  });
  return task;
}

const showCodePopup = ref<boolean>(false);
const inviteData = reactive<Partial<AnalyzeInvitationQrcodeRes>>({});
function toSignupUrl() {
  uni.navigateTo({
    url: `/athletics/pages/Signup/Signup?teamSignupId=${inviteData.teamSignupId}`
  });
}

interface OptionInfo {
  token: string;
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

<style scoped lang="scss"></style>
