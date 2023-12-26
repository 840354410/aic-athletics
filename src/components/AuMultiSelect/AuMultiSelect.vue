<template>
  <view class="au-mutil-select w-full" :class="[disabled ? 'au-mutil-select--disabled' : '']">
    <view class="au-mutil-select__input relative" @click="open">
      <slot name="default" :modelLabel="modelLabel">
        <AuInput
          type="text"
          v-model="modelLabel"
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
    <AuPopup
      v-model:show="uPopupShow"
      mode="bottom"
      :closeOnClickOverlay="closeOnClickOverlay"
      :safeAreaInsetBottom="safeAreaInsetBottom"
      :zIndex="uPopupZIndex"
    >
      <view class="au-mutil-select__content">
        <!-- 头部 -->
        <view class="au-mutil-select__content__header" @touchmove.stop.prevent>
          <view
            class="au-mutil-select__content__header__btn au-mutil-select__content__header--cancel"
            :style="{ color: cancelColor }"
            hover-class="hover-class"
            hover-stay-time="150"
            @tap="setResult('cancel')"
          >
            {{ cancelText }}
          </view>
          <view class="au-mutil-select__content__header__title">{{ title }}</view>
          <view
            class="au-mutil-select__content__header__btn au-mutil-select__content__header--confirm"
            :style="{ color: confirmColor }"
            hover-class="hover-class"
            hover-stay-time="150"
            @tap="setResult('confirm')"
          >
            {{ confirmText }}
          </view>
        </view>
        <view class="au-mutil-select__content__body">
          <view v-if="showSearch">
            <view class="flex au-mutil-select__content__body__search">
              <u-search
                :placeholder="searchPlaceholder"
                :showAction="false"
                height="76rpx"
                searchIconSize="32rpx"
                :modelValue="searchValue"
                @update:modelValue="searchInput"
                @search="searchInput"
                @blur="searchInput"
              ></u-search>
            </view>
          </view>

          <scroll-view
            class="au-mutil-select__content__body__list"
            scroll-y="true"
            :lower-threshold="80"
            @scrolltolower="scrollToBottom"
            :style="{ height: listHeight }"
          >
            <template v-if="pageList.length">
              <u-checkbox-group v-model="selfModelValue" iconPlacement="right" placement="column" :borderBottom="true">
                <u-checkbox
                  v-for="item in pageList"
                  :key="item[valueKey]"
                  :label="item[labelKey]"
                  :name="item[valueKey]"
                ></u-checkbox>
              </u-checkbox-group>
            </template>
            <template v-else>
              <view class="absolute-center mt-15px">
                <u-empty mode="list"></u-empty>
              </view>
            </template>
          </scroll-view>
        </view>
      </view>
    </AuPopup>
  </view>
</template>

<script setup lang="ts">
import AuPopup from '../AuPopup/AuPopup.vue';
import { debounce, isArray } from '@/utils/index';
import { CSSProperties } from 'vue';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]);
  (e: 'cancel', value: (string | number)[]);
  (e: 'confirm', value: (string | number)[]);
}>();
interface ListItem {
  value?: string;
  label?: string;
  children?: ListItem[];
  [propsName: string]: any;
}
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
interface AuMultiSelectProps<T extends object = ListItem> extends AuElProps {
  modelValue?: (string | number)[] | string | number;
  valueKey?: keyof T;
  labelKey?: keyof T;
  title?: string;
  cancelText?: string;
  cancelColor?: string;
  confirmText?: string;
  confirmColor?: string;
  closeOnClickOverlay?: boolean;
  safeAreaInsetBottom?: boolean;
  zIndex?: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
  multiple?: true;
  multipleLimit?: number;
  listHeight?: string;
  list?: ListItem[];
  pageSize?: number;
}

const props = withDefaults(defineProps<AuMultiSelectProps>(), {
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
  valueKey: 'value',
  labelKey: 'label',
  childKey: 'children',
  title: '',
  cancelText: '取消',
  cancelColor: '',
  confirmText: '确认',
  confirmColor: '',
  closeOnClickOverlay: true,
  safeAreaInsetBottom: false,
  zIndex: 10070,
  showSearch: true,
  searchPlaceholder: '搜索',
  multiple: true,
  multipleLimit: 0,
  listHeight: '516rpx',
  list: () => [],
  pageSize: 30
});
const mergeCustomStyle = computed(() => {
  return Object.assign(
    {
      backgroundColor: 'transparent'
    },
    props.customStyle
  );
});
const uPopupZIndex = computed(() => {
  return Math.max(props.zIndex, 10070);
});

const { modelValue } = useVModels(props, emit);
const uPopupShow = ref<boolean>(false);
// 搜索值
const searchValue = ref<string>('');
// 页码
const selfPageId = ref<number>(1);
const selfModelValue = ref<(string | number)[] | string | number>('');
initSelfValue();

function initSelfValue() {
  const { modelValue: val, multiple, list, valueKey } = props;
  let value;
  if (val !== undefined && val !== null && val !== '') {
    value = multiple ? ([] as (string | number)[]).concat(val) : val;
  } else {
    value = multiple ? [] : '';
  }
  if (list[0]) {
    const valueType = typeof list[0][valueKey];
    if (valueType == 'string') {
      if (isArray(value)) {
        value = value.map((item) => String(item));
      } else {
        value = String(value);
      }
    } else if (valueType == 'number') {
      if (isArray(value)) {
        value = value.map((item) => Number(item));
      } else {
        value = Number(value);
      }
    }
  }
  selfModelValue.value = value;
}

watch(
  () => props.modelValue,
  () => {
    initSelfValue();
  }
);
const filterList = computed(() => {
  const { list, labelKey } = props;
  return list.filter((item) => item[labelKey]?.indexOf(searchValue.value) > -1);
});
const pageList = computed(() => {
  const { pageSize } = props;
  return filterList.value.slice(0, selfPageId.value * pageSize);
});
const modelLabel = computed(() => {
  let text;
  const { list, multiple, modelValue, valueKey, labelKey } = props;
  if (multiple) {
    const checked = list.filter((item) => {
      if (!modelValue) {
        return;
      }
      if (isArray(modelValue)) {
        return (
          (modelValue as (string | number)[]).indexOf(String(item[valueKey])) > -1 ||
          (modelValue as (string | number)[]).indexOf(Number(item[valueKey])) > -1
        );
      } else {
        return (modelValue as string).indexOf(String(item[valueKey])) > -1;
      }
    });
    text = checked.map((item) => item[labelKey]).join();
  } else {
    const checked = list.find((item) => item[valueKey] == selfModelValue.value);
    checked && (text = checked[labelKey]);
  }
  return text;
});
const loadMoreStatus = computed(() => {
  const { pageSize } = props;
  return selfPageId.value * pageSize >= filterList.value.length ? 'noMore' : 'more';
});

function open() {
  if (props.disabled) {
    return;
  }
  uPopupShow.value = true;
}
function close() {
  uPopupShow.value = false;
}

function setResult(event: 'cancel' | 'confirm' | null = null) {
  const value = selfModelValue.value as (string | number)[];
  if (event) {
    if (event === 'cancel') {
      emit(event, value);
    } else if (event === 'confirm') {
      emit(event, value);
    }
  }
  if (event === 'confirm') {
    emit('update:modelValue', value);
  }
  close();
}
//搜索输入监听
const searchInput = debounce(function (e) {
  searchValue.value = e;
  selfPageId.value = 1;
}, 300);
function scrollToBottom() {
  selfPageId.value++;
}
</script>

<style lang="scss">
.au-mutil-select {
  &__content {
    position: relative;
    &__header {
      position: relative;
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 90rpx;
      padding: 0 40rpx;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      font-size: 30rpx;
      background-color: #ffffff;
      &__btn {
        padding: 16rpx;
        box-sizing: border-box;
        text-align: center;
        text-decoration: none;
      }
      &__title {
        color: $u-main-color;
      }
      &--cancel {
        color: $u-tips-color;
      }
      &--confirm {
        color: $u-primary;
      }
    }
    &__body {
      position: relative;
      width: 100%;
      height: 580rpx;
      overflow: hidden;
      background-color: #ffffff;
      &__search {
        z-index: 5;
        margin: 0 32rpx;
        position: relative;
      }

      &__list {
        margin-top: 32rpx;
        padding: 0 32rpx;
        height: 100%;
        box-sizing: border-box;
      }
      &__item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: $u-content-color;
        padding: 0 8rpx;
      }
    }
  }
}
.au-mutil-select--disabled {
  background-color: $u-select-disbaled-background-color;
}
.au-mutil-select::v-deep .au-mutil-select__input .uni-input-input {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
