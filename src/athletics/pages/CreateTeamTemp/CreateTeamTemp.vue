<template>
  <view
    class="au-wrapper overflow-hidden bg-cover-auto"
    :style="{
      backgroundImage: `url(${signupBgUrl})`
    }"
  >
    <view class="au-wrapper__body">
      <view class="au-container mt-52rpx">
        <CreateTeamTempForm
          ref="createTeamTempForm"
          v-model:formData="formData"
          :formDisabledData="formDisabledData"
        ></CreateTeamTempForm>
      </view>
      <AuFixed>
        <AuButtonGroup :confirmText="confirmText" @click="clickTeamSignup"></AuButtonGroup>
      </AuFixed>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuFixed from '@/components/AuFixed/AuFixed.vue';
import AuButtonGroup from '@/components/AuButtonGroup/AuButtonGroup.vue';
import CreateTeamTempForm from './components/CreateTeamTempForm/CreateTeamTempForm.vue';
import { signupBgUrl } from '@/athletics/config/images';
import { requestTasks, customShowToast, setObjectOwnProperty, createLowercasePropertyProxy, debounce } from '@/utils/index';
import { SportTeamAddReq, UpdateTeamReq } from '@/athletics/model/sport';
import { sportTeamAddApi, updateTeamApi, sportTeamDetailApi } from '@/athletics/api/sport';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
const { phone } = storeToRefs(authStore);
async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    if (optionInfo?.teamId) {
      requestTasks.add(sportTeamDetailFn());
    }
  } else if (key == 'submit') {
    if (!optionInfo?.teamId) {
      requestTasks.add(sportTeamAddFn());
    } else {
      requestTasks.add(updateTeamFn());
    }
  }
  requestTasks.end();
}
async function sportTeamDetailFn() {
  const { teamId } = optionInfo;
  if (!teamId) {
    return;
  }
  const task = sportTeamDetailApi(teamId);
  task.then((res) => {
    const bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    setObjectOwnProperty(formData, bizData);
  });
  return task;
}
async function sportTeamAddFn() {
  const params = {
    ...formData
  } as SportTeamAddReq;
  const task = sportTeamAddApi(params);
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
async function updateTeamFn() {
  const { teamId } = optionInfo;
  const { teamLogo } = formData;
  if (!teamId) {
    return;
  }
  const params: UpdateTeamReq = {
    teamId,
    teamLogo
  };
  const task = updateTeamApi(params);
  task.then((res) => {
    customShowToast(res);
    if (res.success) {
      setTimeout(() => {
        isEdit.value = false;
      }, 1500);
    }
  });
  return task;
}

const onLoaded = ref<boolean>(false);
const createTeamTempForm = ref<Form | null>(null);
const formData = reactive({
  teamLogo: '',
  teamLogoList: [],
  teamName: '',
  leaderName: '',
  leaderPhone: phone.value || ''
});
const formDisabledData = reactive({
  teamLogo: false,
  teamLogoList: false,
  teamName: false,
  leaderName: false,
  leaderPhone: false
});
const isEdit = ref<boolean>(false);
const confirmText = computed(() => {
  if (!onLoaded.value) {
    return '';
  }
  let title = '';
  if (!optionInfo?.teamId) {
    title = '创建队伍';
    uni.setNavigationBarTitle({
      title
    });
    return title;
  }
  if (isEdit.value) {
    formDisabledData.teamLogo = false;
    title = '编辑队伍';
  } else {
    formDisabledData.teamLogo = true;
    title = '我的队伍';
  }
  uni.setNavigationBarTitle({
    title
  });
  return isEdit.value ? '保存' : '编辑';
});
const clickTeamSignup = debounce(function () {
  if (!createTeamTempForm.value) {
    return;
  }
  if (optionInfo?.teamId && !isEdit.value) {
    isEdit.value = true;
    return;
  }
  createTeamTempForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {});
}, 100);

interface OptionInfo {
  eventGroupId: string | number;
  teamId?: string | number;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  if (optionInfo?.teamId) {
    formData.leaderPhone = '';
    formDisabledData.teamLogo = true;
    formDisabledData.teamName = true;
    formDisabledData.leaderName = true;
  }
  requestAll('onLoad');
  onLoaded.value = true;
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
<style lang="scss">
page {
  padding-bottom: 240rpx;
}
</style>
