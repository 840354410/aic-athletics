<template>
  <view class="au-button-group" :class="'au-button-group--' + mode">
    <u-button
      v-for="(item, index) in mergeButtonList"
      :key="index"
      :type="item.type"
      :customStyle="customStyle"
      :icon="item.icon"
      :disabled="item.disabled"
      @click="clickButtonGroup(index, item)"
    >
      {{ item.text }}
    </u-button>
  </view>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click', index, item);
}>();
interface buttonItem {
  type?: 'info' | 'primary' | 'error' | 'warning' | 'success';
  text?: string;
  icon?: string;
  disabled?: boolean;
}
interface AuButtonGroupProps {
  mode: 'signle' | 'double' | 'custom';
  buttonList?: buttonItem[];
  customStyle?: object;
  cancelText?: string;
  confirmText?: string;
  cancelIcon?: string;
  confirmIcon?: string;
  confirmType?: 'primary' | 'gray-cancel';
  confirmDisabled?: boolean;
}
const props = withDefaults(defineProps<AuButtonGroupProps>(), {
  mode: 'signle',
  buttonList: () => [],
  customStyle: () => ({
    borderRadius: '14rpx'
  }),
  cancelText: '取消',
  confirmText: '确定',
  confirmType: 'primary',
  confirmDisabled: false
});
const mergeButtonList = computed(() => {
  const { mode, buttonList, cancelText, cancelIcon, confirmText, confirmIcon, confirmType, confirmDisabled } = props;
  if (mode === 'signle' && !buttonList?.length) {
    return [
      {
        type: confirmType,
        text: confirmText,
        icon: confirmIcon || '',
        disabled: confirmDisabled
      }
    ];
  }
  if (mode === 'double' && !buttonList?.length) {
    return [
      {
        type: 'gray-cancel',
        text: cancelText,
        icon: cancelIcon || ''
      },
      {
        type: confirmType,
        text: confirmText,
        icon: confirmIcon || '',
        disabled: confirmDisabled
      }
    ];
  }
  return buttonList;
});

function clickButtonGroup(index, item) {
  emit('click', index, item);
}
</script>

<style scoped lang="scss">
.au-button-group {
  width: 100%;
  display: flex;
}
</style>
