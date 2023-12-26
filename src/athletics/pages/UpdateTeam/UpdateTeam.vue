<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto"
    :style="{
      backgroundImage: `url(${signupBgUrl})`
    }"
  >
    <view class="au-wrapper__body">
      <view class="au-container mt-52rpx">
        <CreateTeamForm ref="createTeamForm" v-model:formData="formData"></CreateTeamForm>
      </view>
      <AuFixed>
        <AuButtonGroup confirmText="保存" @click="clickSave"></AuButtonGroup>
      </AuFixed>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import CreateTeamForm from '../CreateTeam/components/CreateTeamForm/CreateTeamForm.vue';
import { signupBgUrl } from '@/athletics/config/images';
import { requestTasks, customShowToast, createLowercasePropertyProxy } from '@/utils/index';
import { UpdateEventTeamInfoReq } from '@/athletics/model/sport';
import { teamSignupDataApi, updateEventTeamInfoApi } from '@/athletics/api/sport';
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(teamSignupDataFn());
  } else if (key == 'submit') {
    requestTasks.add(updateEventTeamInfoFn());
  }
  requestTasks.end();
}

async function teamSignupDataFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const task = teamSignupDataApi(teamSignupId);
  task.then((res) => {
    let bizData = res?.bizData;
    formData.teamLogo = bizData.eventTeamLogo;
    formData.teamName = bizData.eventTeamName;
    formData.leaderName = bizData.leaderInfo?.memberName || '';
    formData.leaderPhone = bizData.leaderInfo?.memberPhone || '';
    formData.joinCode = bizData.teamJoinCode;
  });
  return task;
}
async function updateEventTeamInfoFn() {
  const { teamSignupId } = optionInfo;
  if (!teamSignupId) {
    return;
  }
  const { teamLogo: eventTeamLogo, teamName: eventTeamName, leaderName, joinCode: teamJoinCode } = formData;
  const params: UpdateEventTeamInfoReq = {
    eventTeamLogo,
    eventTeamName,
    leaderName,
    teamJoinCode,
    teamSignupId
  };
  const task = updateEventTeamInfoApi(params);
  task.then((res) => {
    customShowToast(res);
    if (res.success) {
      setTimeout(() => {
        const { teamLogo: eventTeamLogo, teamName: eventTeamName, joinCode: teamJoinCode } = formData;
        const data = {
          eventTeamLogo,
          eventTeamName,
          teamJoinCode
        };
        uni.$emit(optionInfo.eventUniId, {
          data,
          leaderName
        });
        uni.navigateBack();
      }, 1500);
    }
  });
  return task;
}

const createTeamForm = ref<Form | null>(null);
const formData = reactive({
  teamLogo: '',
  teamName: '',
  leaderName: '',
  leaderPhone: '',
  joinCode: ''
});

function clickSave() {
  if (!createTeamForm.value) {
    return;
  }
  createTeamForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {});
}

interface OptionInfo {
  teamSignupId: string | number;
  eventUniId: any;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  requestAll('onLoad');
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
