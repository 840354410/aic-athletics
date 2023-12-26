<template>
  <u-button :type="type" :plain="plain" :shape="shape" :disabled="disabled || isRunning" @click="clickButton">
    <view class="mr-8rpx" v-show="isRunning">
      <u-count-down ref="countDown" :time="60 * 1000" format="ss" :autoStart="false" @finish="finishCount"></u-count-down>
    </view>
    {{ !isRunning ? '获取验证码' : ' s后重新获取' }}
  </u-button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void;
}>();
interface ICountDown {
  start(): void;
  reset(): void;
}
interface Props {
  type?: 'primary' | 'info' | 'error' | 'warning' | 'success' | undefined;
  shape?: 'circle' | 'square';
  plain?: boolean;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  circle: 'circle',
  plain: false,
  disabled: false
});

const countDown = ref(null);
const isRunning = ref(false);
function clickButton() {
  isRunning.value = true;
  if (countDown.value) {
    (countDown.value! as ICountDown).start();
  }
  emit('click');
}
function finishCount() {
  isRunning.value = false;
  if (countDown.value) {
    (countDown.value! as ICountDown).reset();
  }
}
</script>

<style scoped></style>
