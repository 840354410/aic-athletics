<template>
  <view class="cancel-sign-popup">
    <AuModal v-model:show="show" title="验证信息" @confrim="clickConfrim">
      <template #content>
        <view class="mx-64rpx">
          <AuInput
            type="text"
            :isCode="true"
            v-model="code"
            placeholder="请输入队伍验证码"
            :maxlength="8"
            shape="circle"
            border="none"
            customClass="input--circle-bg-f9"
          ></AuInput>
        </view>
      </template>
    </AuModal>
  </view>
</template>

<script lang="ts" setup>
import AuInput from '@/components/AuInput/AuInput.vue';
import AuModal from '@/components/AuModal/AuModal.vue';
import { requestTasks, setStatisticList, amend, customShowToast } from '@/utils/index';
import { checkJoinTeamCodeApi } from '@/athletics/api/sport';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { useSportStore } from '@/store/sport';
const sportStore = useSportStore();

const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
}>();
interface CancelSignPopupProps {
  show: boolean;
  teamSignupId: string | number;
}
const props = withDefaults(defineProps<CancelSignPopupProps>(), {
  show: false,
  teamSignupId: ''
});

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'checkJoinTeamCode') {
    requestTasks.add(checkJoinTeamCodeFn());
  }
  requestTasks.end();
}
async function checkJoinTeamCodeFn() {
  const teamJoinCode = code.value;
  const teamSignupId = props.teamSignupId;
  if (!teamSignupId || !teamJoinCode) {
    return;
  }
  const params = {
    teamSignupId,
    teamJoinCode
  };
  const res = await checkJoinTeamCodeApi(params);
  if (res.success) {
    show.value = false;
    sportStore.joinCode = teamJoinCode;
    toSignupUrl();
  }
}
function toSignupUrl() {
  uni.navigateTo({
    url: `/athletics/pages/Signup/Signup?teamSignupId=${props.teamSignupId}`
  });
}

const { show } = useVModels(props, emit);
const code = ref<string>('');
function clickConfrim() {
  const len = code.value.length;
  if (!code.value) {
    uni.$u.toast('请输入队伍验证码');
  }
  if (len < 4) {
    uni.$u.toast('队伍验证码输入有误');
  }
  requestAll('checkJoinTeamCode');
}
</script>

<style scoped></style>
