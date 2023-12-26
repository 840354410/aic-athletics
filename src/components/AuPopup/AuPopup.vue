<template>
  <div class="au-popup">
    <u-popup
      :show="show"
      :overlay="overlay"
      :mode="mode"
      :duration="duration"
      :closeable="closeable"
      :overlayStyle="overlayStyle"
      :overlayOpacity="overlayOpacity"
      :closeOnClickOverlay="closeOnClickOverlay"
      :zIndex="zIndex"
      :safeAreaInsetBottom="safeAreaInsetBottom"
      :safeAreaInsetTop="safeAreaInsetTop"
      :closeIconPos="closeIconPos"
      :round="round"
      :zoom="zoom"
      :bgColor="bgColor"
      :customStyle="customStyle"
      @close="close"
      @open="open"
    >
      <template #default>
        <slot name="default"></slot>
      </template>
    </u-popup>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'close'): void;
  (e: 'open'): void;
}>();
interface AuPopupProps {
  show?: boolean;
  overlay?: boolean;
  mode?: 'top' | 'right' | 'bottom' | 'center';
  duration?: string | number;
  closeable?: boolean;
  overlayStyle?: object | string;
  overlayOpacity?: string | number;
  closeOnClickOverlay?: boolean;
  zIndex?: string | number;
  safeAreaInsetBottom?: boolean;
  safeAreaInsetTop?: boolean;
  closeIconPos?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  round?: string | number;
  zoom?: boolean;
  bgColor?: string;
  customStyle?: object;
}
const props = withDefaults(defineProps<AuPopupProps>(), {
  show: false,
  overlay: true,
  mode: 'bottom',
  duration: 300,
  closeable: false,
  overlayStyle: () => ({}),
  overlayOpacity: 0.5,
  closeOnClickOverlay: true,
  zIndex: 10075,
  safeAreaInsetBottom: true,
  safeAreaInsetTop: false,
  closeIconPos: 'top-right',
  round: 0,
  zoom: true,
  bgColor: '',
  customStyle: () => ({})
});

function close() {
  emit('update:show', false);
  emit('close');
}
function open() {
  emit('open');
}
</script>

<style scoped></style>
