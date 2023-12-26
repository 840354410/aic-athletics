<template>
  <view class="au-select w-full" :class="[disabled ? 'au-select--disabled' : '']">
    <view class="au-select__input relative" @click="open">
      <slot name="default" :modelLabel="modelLabel">
        <AuInput
          type="text"
          v-model="modelLabel"
          :border="border"
          :fontSize="fontSize"
          :inputAlign="inputAlign"
          :placeholder="placeholder"
          :suffixIcon="suffixIcon"
          :clearable="false"
          :customClass="customClass"
          :customStyle="mergeCustomStyle"
          disabled
        ></AuInput>
      </slot>
      <view class="absolute-full"></view>
    </view>
    <view v-if="uPopupShow" @click.stop>
      <AuPopup
        v-model:show="uPopupShow"
        mode="bottom"
        :closeOnClickOverlay="closeOnClickOverlay"
        :safeAreaInsetBottom="safeAreaInsetBottom"
        :zIndex="uPopupZIndex"
      >
        <view class="au-select__content">
          <!-- 头部 -->
          <view class="au-select__content__header" @touchmove.stop.prevent>
            <view
              class="au-select__content__header__btn au-select__content__header--cancel"
              :style="{ color: cancelColor }"
              hover-class="hover-class"
              hover-stay-time="150"
              @tap="setResult('cancel')"
            >
              {{ cancelText }}
            </view>
            <view class="au-select__content__header__title">{{ title }}</view>
            <view
              class="au-select__content__header__btn au-select__content__header--confirm"
              :style="{ color: confirmColor }"
              hover-class="hover-class"
              hover-stay-time="150"
              @tap="setResult('confirm')"
            >
              {{ confirmText }}
            </view>
          </view>
          <!-- 列表内容 -->

          <view class="au-select__content__body">
            <view v-if="showSearch && mode === 'single'">
              <view class="flex au-select__content__body__search">
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
            <template v-if="columnData[0] && columnData[0].length">
              <picker-view
                class="au-select__content__body__list"
                :value="defaultSelector"
                @pickstart="pickStart"
                @pickend="pickEnd"
                @change="columnChange"
              >
                <picker-view-column v-for="(item, index) in columnData" :key="index">
                  <view class="au-select__content__body__item" v-for="(sub_item, sub_index) in item" :key="sub_index">
                    <view class="text-ellipsis">
                      {{ sub_item[labelKey] }}
                    </view>
                  </view>
                </picker-view-column>
              </picker-view>
            </template>
            <template v-else>
              <view class="absolute-center mt-30rpx">
                <u-empty mode="list"></u-empty>
              </view>
            </template>
          </view>
        </view>
      </AuPopup>
    </view>
  </view>
</template>

<script setup lang="ts">
import AuPopup from '../AuPopup/AuPopup.vue';
import { deepClone, debounce } from '@/utils/index';
import { CSSProperties } from 'vue';
const emit = defineEmits<{
  (e: 'update:modelValue', value: string);
  (e: 'cancel', value: string);
  (e: 'confirm', value: string);
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
  disabled?: boolean;
  adjustPosition?: boolean;
}
interface baseSelectProps<T extends object = ListItem> extends AuElProps {
  modelValue?: string;
  valueKey?: keyof T;
  labelKey?: keyof T;
  childKey?: string;
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
}

interface AuSelectProps<T extends object = ListItem> extends baseSelectProps {
  mode?: 'single' | 'multi' | 'multi-auto';
  list?: T[] | T[][];
}
const props = withDefaults(defineProps<AuSelectProps>(), {
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
  mode: 'single',
  list: () => []
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

const uPopupShow = ref<boolean>(false);

// 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
const moving = ref<boolean>(false);
// 用户保存当前列的索引，用于判断下一次变化时改变的列
const defaultSelector = ref<number[]>([0]);
// 上一次改变时的index
const lastSelectIndex = ref<[]>([]);
// picker-view数据
const columnData = ref<ListItem[][]>([]);
// 保存用户选择的结果
const selectValue = ref<ListItem[]>([]);
// 搜索值
const searchValue = ref<string>('');
// 列数
const columnNum = computed(() => {
  const { mode, list, childKey } = props;
  // 单列的数量为1
  if (mode === 'single') return 1;
  // 多列时取list的长度
  else if (mode === 'multi') return list.length;
  // 多列联动时，通过遍历list的第一个元素，得出有多少列
  else if (mode === 'multi-auto') {
    let num = 1;
    let column = list;
    // 如果存在children属性，再次遍历
    while (column[0][childKey]) {
      (column = column[0] ? column[0][childKey] : {}), num++;
    }
    return num;
  }
  return 0;
});

const defaultValue = computed(() => {
  const arr: string[] = props.modelValue ? props.modelValue.split(',') : [];
  const indexArr: number[] = arr.map((item) => 0);
  const labelArr: string[] = arr.map((item) => '');
  if (arr.length === 0) return [];
  const { mode, list, childKey, valueKey, labelKey } = props;
  let column = list as ListItem[];
  if (mode === 'multi-auto') {
    for (let i = 0; i < columnNum.value; i++) {
      const index = column.findIndex((item) => item[valueKey] == arr[i]);
      if (index > -1) {
        indexArr[i] = index;
        labelArr[i] = column[index][labelKey];
      } else {
        return [];
      }
      column = column[index][childKey];
    }
  } else if (mode === 'single') {
    const index = column.findIndex((item) => item[valueKey] == arr[0]);
    if (index > -1) {
      indexArr[0] = index;
      labelArr[0] = column[index][labelKey];
    } else {
      return [];
    }
  } else {
    for (let i = 0; i < columnNum.value; i++) {
      column = list[i] as ListItem[];
      const index = column.findIndex((item) => item[valueKey] == arr[i]);
      if (index > -1) {
        indexArr[i] = index;
        labelArr[i] = column[index][labelKey];
      } else {
        return [];
      }
    }
  }
  modelLabel.value = labelArr.join('-');
  return indexArr;
});

watchEffect(() => {
  // 获取默认选中列下标
  // 如果没有传入默认值，生成用0填充长度为columnNum的数组
  const arr = defaultValue.value.length === columnNum.value ? defaultValue.value : Array(columnNum.value).fill(0);
  defaultSelector.value = arr;
  lastSelectIndex.value = deepClone(arr);
});

watchEffect(() => {
  const { mode, list, childKey } = props;
  let data: ListItem[][] = [];
  if (mode === 'multi-auto') {
    // 获取所有数据中的第一个元素
    let column = list[defaultSelector.value.length ? defaultSelector.value[0] : 0];
    // 通过循环所有列数，再根据设定列的数组，得出当前需要渲染的整个列数组
    for (let i = 0; i < columnNum.value; i++) {
      // 第一列默认为整个list数组
      if (i === 0) {
        data[i] = list as ListItem[];
        column = column[childKey];
      } else {
        // 大于第一列时，判断是否有默认选中的，如果没有就用该列的第一项
        data[i] = column as ListItem[];
        column = column[defaultSelector.value[i]] || {};
        column = column[childKey] || [];
      }
    }
  } else if (mode === 'single') {
    let result: ListItem[][] = [];
    if (searchValue.value) {
      let data: ListItem[] = (list as ListItem[]).filter((item) => item[props.labelKey].indexOf(searchValue.value) > -1);
      result.push(data);
    } else {
      result.push(list as ListItem[]);
    }
    data = result;
  } else {
    data = list as ListItem[][];
  }
  columnData.value = data;
});
watchEffect(() => {
  // 获取默认选中的值，如果没有设置，则默认选中第一项
  const { valueKey, labelKey } = props;
  let tmp: ListItem | null = null;
  selectValue.value = [];
  for (let i = 0; i < columnNum.value; i++) {
    tmp = columnData.value[i][defaultSelector.value[i]];
    let data: ListItem = {
      [valueKey]: tmp ? tmp[valueKey] : null,
      [labelKey]: tmp ? tmp[labelKey] : null
    };
    // 判断是否存在额外的参数
    if (tmp && tmp.extra) data.extra = tmp.extra;
    selectValue.value.push(data);
  }
});

const modelLabel = ref<string>('');

// 点击选择框
function open() {
  if (props.disabled) {
    return;
  }
  uPopupShow.value = true;
}

//搜索输入监听
const searchInput = debounce(function (e) {
  searchValue.value = e;
  searchResult();
}, 300);

//执行搜索方法
function searchResult() {
  defaultSelector.value = [0];
}

// 标识滑动开始，只有微信小程序才有这样的事件
function pickStart() {
  // #ifdef MP-WEIXIN
  moving.value = true;
  // #endif
}
// 标识滑动结束
function pickEnd() {
  // #ifdef MP-WEIXIN
  moving.value = false;
  // #endif
}

// 列选项
function columnChange(event) {
  const { mode } = props;
  let index: number = 0;

  let columnIndex = event.detail.value;
  if (mode === 'multi-auto') {
    // 对比前后两个数组，判断变更的是那一列
    lastSelectIndex.value.map((v, idx) => {
      if (v != columnIndex[idx]) index = idx;
    });
    defaultSelector.value = columnIndex;
    // 当前变化列的下一列的数据，需要获取上一列的数据，同时需要指定是上一列的第几个的children，再往后的
    // 默认是队列的第一个为默认选项
    for (let i = index + 1; i < columnNum.value; i++) {
      defaultSelector.value[i] = 0;
    }
    lastSelectIndex.value = columnIndex;
  } else {
    defaultSelector.value = columnIndex;
  }
}
function close() {
  uPopupShow.value = false;
}
function setResult(event: 'cancel' | 'confirm' | null = null) {
  // #ifdef MP-WEIXIN
  if (moving.value) return;
  // #endif
  const { valueKey } = props;
  if (columnData.value?.length) {
    const value = selectValue.value.map((item) => item[valueKey]).join(',');
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
  }
  close();
}
</script>

<style lang="scss" scoped>
.au-select {
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
        top: 30rpx;
      }

      &__list {
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
.au-select--disabled {
  background-color: $u-select-disbaled-background-color;
}
.au-select::v-deep .au-select__input .uni-input-input {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
