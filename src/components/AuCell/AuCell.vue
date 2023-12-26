<template>
  <view
    class="au-cell flex flex-items-start flex-justify-between"
    :class="[border || item.border ? 'border-b-2' : '']"
    :style="{ padding: padding }"
  >
    <view class="u-tips-color flex-none" :style="{ width: labelWidth }">
      <slot name="label">{{ item[labelKey] }}</slot>
    </view>
    <view class="u-content-color flex-1 text-right" :class="[item.labelBlod ? 'font-bold' : '']" @click="clickAuCellItemValue()">
      <slot name="value">
        <view class="flex">
          <text class="flex-1 text-right min-w-0">{{ item.valuePrefix }}{{ item[valueKey] }}{{ item.valueSuffix }}</text>
          <i class="iconfont ml-12rpx u-primary flex-none" :class="item.valueSuffixIcon" v-if="item.valueSuffixIcon"></i>
        </view>
      </slot>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { requestTasks, openLocation } from '@/utils/index';
interface Item {
  label?: string;
  value?: string;
  labelBlod?: boolean;
  border?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  [propName: string]: any;
}
interface Props {
  item: Item;
  labelWidth?: string | number;
  padding?: string | number;
  labelKey?: keyof Item;
  valueKey?: keyof Item;
  border?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  item: () => ({}),
  labelWidth: '6em',
  padding: '12rpx 0',
  labelKey: 'label',
  valueKey: 'value',
  border: false
});

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'clickOpenLocation') {
    requestTasks.add(getJsApiTicketFn());
  }
  requestTasks.end();
}

async function getJsApiTicketFn() {
  let task = openLocation(props.item);
  return task;
}

function clickAuCellItemValue() {
  if (props.item.openLocation) {
    requestAll('clickOpenLocation');
  }
}
</script>

<style scoped lang="scss">
.au-cell::v-deep .u-album__row {
  justify-content: flex-end;
}
</style>
