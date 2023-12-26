<template>
  <view class="au-input" :class="customClass">
    <u-input
      ref="uInputRef"
      v-model="modelValue"
      :type="type"
      :shape="shape"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :border="border"
      :clearable="clearable"
      :fontSize="fontSize"
      :customStyle="customStyle"
      :inputAlign="inputAlign"
      :color="color"
      :placeholderClass="placeholderClass"
      :placeholderStyle="placeholderStyle"
      :suffixIcon="suffixIcon"
      :suffixIconStyle="suffixIconStyle"
      :disabled="disabled"
      :adjustPosition="adjustPosition"
      @blur="blurInput"
    ></u-input>
  </view>
</template>
<!-- <script lang="ts">
// 声明额外的选项
export default {
  inheritAttrs: false
};
</script> -->
<script lang="ts" setup>
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { CSSProperties } from 'vue';
import { removeNonNumericCharacters } from '@/utils/index';
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
  placeholderStyle?: string | CSSProperties;
  color?: string;
  customClass?: string;
  customStyle?: CSSProperties;
  suffixIcon?: string;
  suffixIconStyle?: CSSProperties;
  disabled?: boolean;
  adjustPosition?: boolean;
}
interface AuInputProps extends AuElProps {
  modelValue?: string;
  clearable?: boolean;
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'password';
  maxlength?: string | number;
  isCode?: boolean;
}
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
const props = withDefaults(defineProps<AuInputProps>(), {
  modelValue: '',
  shape: 'square',
  border: 'none',
  fontSize: '28rpx',
  inputAlign: 'left',
  placeholder: '请输入',
  placeholderClass: '',
  placeholderStyle: () => ({}),
  color: '#2d2d2d',
  customClass: '',
  customStyle: () => ({}),
  suffixIcon: '',
  suffixIconStyle: () => ({}),
  disabled: false,
  adjustPosition: true,
  clearable: true,
  type: 'text',
  maxlength: -1
});

const { modelValue } = useVModels(props, emit);
const uInputRef = ref();
async function blurInput(e) {
  if (props.isCode) {
    const value = removeNonNumericCharacters(e);
    emit('update:modelValue', e);
    await nextTick();
    emit('update:modelValue', value);
  }
}
onMounted(() => {
  if (props.isCode) {
    uInputRef.value?.setFormatter(removeNonNumericCharacters);
  }
});
</script>

<style scoped lang="scss">
.au-input {
  width: 100%;
  &.input--circle-bg-f9::v-deep {
    padding: 18rpx 36rpx;
    background-color: #f9f9f9;
    border-radius: 100px;
    box-sizing: border-box;
  }
  &::v-deep {
    .uni-input-placeholder {
      color: $u-tips-color;
    }
  }
}
</style>
