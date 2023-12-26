<template>
  <view
    class="au-datetime-picker w-full"
    :class="[disabled ? 'au-datetime-picker--disabled' : '', 'au-datetime-picker-h-' + itemHeight]"
  >
    <view class="au-datetime-picker__input relative" @click="open">
      <slot name="default" :modelLabel="modelValue">
        <AuInput
          type="text"
          v-model="modelValue"
          :border="border"
          :fontSize="fontSize"
          :inputAlign="inputAlign"
          :placeholder="placeholder"
          :suffixIcon="suffixIcon"
          :suffixIconStyle="suffixIconStyle"
          :clearable="false"
          :customClass="customClass"
          :customStyle="mergeCustomStyle"
          :adjustPosition="false"
          disabled
        ></AuInput>
      </slot>
      <view class="absolute-full"></view>
    </view>
    <u-datetime-picker
      ref="picker"
      :show="uDatetimePickerShow"
      :modelValue="pickerModelValue"
      :mode="mode"
      :formatter="formatter"
      :itemHeight="mergeItemHeight"
      :closeOnClickOverlay="closeOnClickOverlay"
      :cancelText="cancelText"
      :confirmText="confirmText"
      :cancelColor="cancelColor"
      :confirmColor="confirmColor"
      :minDate="minDate"
      :maxDate="maxDate"
      @close="close"
      @cancel="cancel"
      @confirm="confirm"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { CSSProperties } from 'vue';
import { formatDate } from '../../utils/commonUtil';
import { pxToRpx } from '@/utils/index';
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number);
  (e: 'cancel', value: string | number);
  (e: 'confirm', value: string | number);
}>();
type AuElShape = 'square' | 'circle';
type AuElBorder = 'surround' | 'bottom' | 'none';
type AuInputAlign = 'left' | 'center' | 'right';
interface AuElProps {
  shape?: AuElShape;
  border?: AuElBorder;
  fontSize?: string | number;
  inputAlign?: AuInputAlign;
  placeholder?: string;
  placeholderClass?: string;
  placeholderStyle?: CSSProperties;
  color?: string;
  customClass?: string;
  customStyle?: CSSProperties;
  suffixIcon?: string;
  suffixIconStyle?: CSSProperties;
  disabled?: boolean;
  adjustPosition?: boolean;
}

interface AuDatetimePickerProps extends AuElProps {
  modelValue?: (string | number)[] | string | number;
  title?: string;
  cancelText?: string;
  cancelColor?: string;
  confirmText?: string;
  confirmColor?: string;
  closeOnClickOverlay?: boolean;
  mode: 'date' | 'time' | 'datetime' | 'year-month';
  formatter: (...args) => any;
  itemHeight: number;
  minDate?: number;
  maxDate?: number;
}

const props = withDefaults(defineProps<AuDatetimePickerProps>(), {
  modelValue: '',
  shape: 'square',
  border: 'none',
  fontSize: '28rpx',
  inputAlign: 'left',
  placeholder: '请选择',
  placeholderClass: 'u-tips-color',
  placeholderStyle: () => ({}),
  color: '#2d2d2d',
  customClass: '',
  customStyle: () => ({}),
  suffixIcon: 'arrow-right',
  suffixIconStyle: () => ({}),
  disabled: false,
  adjustPosition: true,
  cancelText: '取消',
  cancelColor: '',
  confirmText: '确认',
  confirmColor: '',
  closeOnClickOverlay: true,
  mode: 'date',
  formatter: (type, value) => {
    if (type === 'year') {
      return `${value}年`;
    }
    if (type === 'month') {
      return `${value}月`;
    }
    if (type === 'day') {
      return `${value}日`;
    }
    return value;
  },
  itemHeight: 80,
  minDate: new Date('1971/01/01').getTime(),
  maxDate: new Date('2033/01/01').getTime()
});
const mergeCustomStyle = computed(() => {
  return Object.assign(
    {
      backgroundColor: 'transparent'
    },
    props.customStyle
  );
});
const mergeItemHeight = computed(() => {
  const { itemHeight } = props;
  if (itemHeight) {
    return pxToRpx((itemHeight as number) / 2);
  }
});

const uDatetimePickerShow = ref<boolean>(false);
const { modelValue } = useVModels(props, emit);
const pickerModelValue = computed(() => {
  if (modelValue.value) {
    return modelValue.value;
  }
  const { mode } = props;
  if (mode == 'date') {
    return formatDate(new Date(), 'YYYY-MM-DD');
  }
});
let picker = ref<DatetimePicker | null>(null);
watchEffect(
  async () => {
    const { formatter } = props;
    if (formatter && typeof formatter == 'function' && picker.value) {
      picker.value.setFormatter(formatter);
    }
  },
  {
    flush: 'post'
  }
);

function open() {
  if (props.disabled) {
    return;
  }
  uDatetimePickerShow.value = true;
}
function close() {
  uDatetimePickerShow.value = false;
}
function cancel() {
  emit('cancel', modelValue.value);
  close();
}
function confirm(e) {
  if (e.mode == 'date') {
    modelValue.value = formatDate(new Date(e.value), 'YYYY-MM-DD');
  }
  emit('confirm', modelValue.value);
  close();
}
</script>

<style lang="scss">
.au-datetime-picker--disabled {
  background-color: $u-select-disbaled-background-color;
}
</style>
