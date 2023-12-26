<template>
  <div class="au-modal">
    <AuPopup
      :show="show"
      @close="close"
      mode="center"
      round="20rpx"
      :customStyle="{
        width: width + 'rpx'
      }"
      :closeable="closeable"
    >
      <view class="au-modal__title">
        <slot name="title">
          <view class="text-32rpx text-center py-40rpx fw-500 u-main-color" :style="titleCustomStyle" v-if="title">
            {{ title }}
          </view>
        </slot>
      </view>
      <view class="au-modal__content">
        <slot name="content">
          <view class="px-32rpx pb-20rpx text-28rpx u-main-color lh-40rpx" :style="contentCustomStyle" v-if="content">
            {{ content }}
          </view>
        </slot>
      </view>
      <view class="au-modal__button">
        <slot name="button">
          <view class="flex-xy-center gap-40rpx text-28rpx flex-x-center m-48rpx" v-if="!buttonFixed && (isCancel || isConfrim)">
            <view :class="[buttonCount == 1 ? 'w-310rpx' : 'flex-1']" v-if="isCancel">
              <u-button type="gray-cancel" size="default" :customStyle="mergeButtonCustomStyle" @click="clickCancel">
                取消
              </u-button>
            </view>
            <view :class="[buttonCount == 1 ? 'w-310rpx' : 'flex-1']" v-if="isConfrim">
              <u-button type="primary" size="default" :customStyle="mergeButtonCustomStyle" @click="clickConfrim">确定</u-button>
            </view>
          </view>
        </slot>
      </view>
    </AuPopup>
  </div>
</template>

<script lang="ts" setup>
import AuPopup from '../AuPopup/AuPopup.vue';
import { CSSProperties } from 'vue';
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'close'): void;
  (e: 'confrim'): void;
}>();
interface Props {
  show?: boolean;
  width?: number;
  title?: string;
  content?: string;
  buttonFixed?: boolean;
  buttonCustomStyle?: object;
  titleCustomStyle?: CSSProperties;
  contentCustomStyle?: CSSProperties;
  closeable?: boolean;
  isCancel?: boolean;
  isConfrim?: boolean;
  isCancelAutoClose?: boolean; // 点击取消键是否自动关闭
  isConfrimAutoClose?: boolean; // 点击确认键是否自动关闭
}
const props = withDefaults(defineProps<Props>(), {
  show: false,
  width: 660,
  title: '',
  content: '',
  buttonFixed: false,
  buttonCustomStyle: () => ({}),
  titleCustomStyle: () => ({}),
  contentCustomStyle: () => ({}),
  closeable: false,
  isCancel: true,
  isConfrim: true,
  isCancelAutoClose: true,
  isConfrimAutoClose: false
});

const mergeButtonCustomStyle = computed(() => {
  return Object.assign(
    {
      borderRadius: '14rpx'
    },
    props.buttonCustomStyle
  );
});

const buttonCount = computed(() => {
  let value = 0;
  const { isCancel, isConfrim } = props;
  if (isCancel) {
    value++;
  }
  if (isConfrim) {
    value++;
  }
  return value;
});

function close() {
  emit('close');
}

function clickCancel() {
  if (props.isCancelAutoClose) {
    emit('update:show', false);
  }
  close();
}

function clickConfrim() {
  if (props.isConfrimAutoClose) {
    emit('update:show', false);
  }
  emit('confrim');
}
</script>

<style scoped lang="scss">
.au-modal__content {
  max-height: 600rpx;
  overflow: auto;
}
</style>
