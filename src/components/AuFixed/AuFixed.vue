<template>
  <view class="au-fixed" :class="[positionClass, customClass]" :style="mergeCustomStyle">
    <slot></slot>
  </view>
</template>

<script lang="ts" setup>
import { CSSProperties, computed } from 'vue';
interface AuFixedProps {
  position?: 'bottom' | 'top' | 'left' | 'right';
  customClass?: string;
  customStyle?: CSSProperties;
  bg?: string;
}
const props = withDefaults(defineProps<AuFixedProps>(), {
  position: 'bottom',
  customClass: '',
  customStyle: () => ({}),
  bg: '#fff'
});
const positionClass = computed(() => {
  const { position } = props;
  if (position == 'top') {
    return 'fixed-top';
  } else if (position == 'left') {
    return 'fixed-left';
  } else if (position == 'right') {
    return 'fixed-right';
  } else {
    return 'fixed-bottom';
  }
});
const mergeCustomStyle = computed(() => {
  const { bg, customStyle } = props;
  return Object.assign(
    {
      backgroundColor: bg
    },
    customStyle || {}
  );
});
</script>

<style scoped lang="scss">
.au-fixed {
  border-top: 2rpx solid rgba(0, 0, 0, 0.1);
}
</style>
