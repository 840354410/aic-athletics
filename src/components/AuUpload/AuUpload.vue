<template>
  <view
    class="au-upload"
    :class="[
      'au-upload--' + shape,
      selfUploadAlign,
      customClass,
      disabled ? 'au-upload--disabled' : '',
      replaceable ? 'au-upload--replaceable' : ''
    ]"
    :style="customStyle"
  >
    <u-upload
      :fileList="fileList"
      :accept="accept"
      :capture="capture"
      :compressed="compressed"
      :camera="camera"
      :maxDuration="maxDuration"
      :uploadIcon="uploadIcon"
      :uploadIconColor="uploadIconColor"
      :useBeforeRead="useBeforeRead"
      :beforeRead="beforeRead"
      :afterRead="afterRead"
      :previewFullImage="previewFullImage"
      :maxCount="selfMaxCount"
      :disabled="!replaceable && (disabled || (maxCount && maxCount == fileList.length))"
      :imageMode="imageMode"
      :name="name"
      :sizeType="sizeType"
      :multiple="multiple"
      :deletable="deletable"
      :maxSize="maxSize"
      :uploadText="uploadText"
      :width="width"
      :height="height"
      :previewImage="previewImage"
      @beforeRead="triggerBeforeRead"
      @afterRead="triggerAfterRead"
      @oversize="triggerOversize"
      @clickPreview="triggerclickPreview"
      @delete="triggerDelete"
    >
      <template #default>
        <view class="flex-y-center default-slot">
          <slot name="default"></slot>
          <view class="u-input__content__subfix-icon">
            <u-icon :name="suffixIcon" v-if="suffixIcon" :size="fontSize"></u-icon>
          </view>
        </view>
      </template>
    </u-upload>
  </view>
</template>

<script lang="ts" setup>
import defprops from 'uview-plus/libs/config/props';
import { CSSProperties } from 'vue';
import { requestTasks, customShowToast } from '@/utils/index';
import { customUploadApi } from '@/api/common';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';

interface File {
  name: string;
  size: number;
  thumb: string;
  type: string;
  url: string;
}
interface BaseArg {
  index: number;
  name: string;
}
interface UploadArg extends BaseArg {
  file: File | File[];
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:fileList', list: FileItem[]): void;
  (e: 'beforeRead', event: UploadArg): void;
  (e: 'afterRead', event: UploadArg): void;
  (e: 'oversize', event: UploadArg): void;
  (e: 'clickPreview', event: UploadArg): void;
  (e: 'delete', event: UploadArg): void;
}>();
type AuInputAlign = 'left' | 'center' | 'right';
interface AuUploadProps {
  modelValue?: string;
  accept?: 'all' | 'media' | 'image' | 'file' | 'video';
  // 	图片或视频拾取模式，当accept为image类型时设置capture可选额外camera可以直接调起摄像头
  capture?: string | [];
  // 当accept为video时生效，是否压缩视频，默认为true
  compressed?: boolean;
  // 当accept为video时生效，可选值为back或front
  camera?: string;
  // 当accept为video时生效，拍摄视频最长拍摄时间，单位秒
  maxDuration?: number;
  // 上传区域的图标，只能内置图标
  uploadIcon?: string;
  // 上传区域的图标的颜色，默认
  uploadIconColor?: string;
  // 是否开启文件读取前事件
  useBeforeRead?: boolean;
  // 读取后的处理函数
  afterRead?: (file: File, detail: BaseArg) => any | null;
  // 读取前的处理函数
  beforeRead?: (file: File, detail: BaseArg) => any | null;
  // 是否显示组件自带的图片预览功能
  previewFullImage?: boolean;
  // 最大上传数量
  maxCount?: string | number;
  // 是否启用
  disabled?: boolean;
  // 预览上传的图片时的裁剪模式，和image组件mode属性一致
  imageMode?: string;
  // 标识符，可以在回调函数的第二项参数中获取
  name?: string;
  // 所选的图片的尺寸, 可选值为original compressed
  sizeType?: [];
  // 是否开启图片多选，部分安卓机型不支持
  multiple?: boolean;
  // 是否展示删除按钮
  deletable?: boolean;
  // 文件大小限制，单位为byte
  maxSize?: string | number;
  // 上传区域的提示文字
  uploadText?: string;
  // 内部预览图片区域和选择图片按钮的区域宽度
  width?: string | number;
  // 内部预览图片区域和选择图片按钮的区域高度
  height?: string | number;
  // 是否在上传完成后展示预览图
  previewImage?: boolean;
  // 是否自动删除
  autoDelete?: boolean;
  // 是否自动上传
  autoUpload?: boolean;
  // 上传的url路径
  action?: string;
  customStyle?: CSSProperties;
  customClass?: string;
  suffixIcon?: string;
  fontSize?: string;
  uploadAlign?: AuInputAlign;
  shape?: 'square' | 'circle';
  replaceable?: boolean;
}
const props = withDefaults(defineProps<AuUploadProps>(), {
  modelValue: '',
  accept: defprops.upload.accept,
  capture: defprops.upload.capture,
  compressed: defprops.upload.compressed,
  camera: defprops.upload.camera,
  maxDuration: defprops.upload.maxDuration,
  uploadIcon: defprops.upload.uploadIcon,
  uploadIconColor: defprops.upload.uploadIconColor,
  useBeforeRead: defprops.upload.useBeforeRead,
  afterRead: undefined,
  beforeRead: undefined,
  previewFullImage: defprops.upload.previewFullImage,
  maxCount: defprops.upload.maxCount,
  disabled: defprops.upload.disabled,
  imageMode: defprops.upload.imageMode,
  name: defprops.upload.name,
  sizeType: defprops.upload.sizeType,
  multiple: defprops.upload.multiple,
  deletable: defprops.upload.deletable,
  maxSize: defprops.upload.maxSize,
  uploadText: defprops.upload.uploadText,
  width: defprops.upload.width,
  height: defprops.upload.height,
  previewImage: defprops.upload.previewImage,
  autoDelete: true,
  autoUpload: true,
  action: '/sport/common/upload',
  customStyle: () => ({}),
  customClass: '',
  suffixIcon: '',
  fontSize: '28rpx',
  uploadAlign: 'left',
  shape: 'square',
  replaceable: false
});

const selfMaxCount = computed(() => {
  if (props.maxCount == 0 || !props.maxCount || props.replaceable) {
    return 52;
  } else {
    return props.maxCount;
  }
});

const selfUploadAlign = computed(() => {
  const map = {
    left: 'flex-justify-start',
    center: 'flex-justify-center',
    right: 'flex-justify-end'
  };
  return map[props.uploadAlign] || 'flex-justify-start';
});

const fileList = ref<FileItem[]>([]);
watch(
  fileList,
  (newList, oldList) => {
    const value: string = newList?.map((item) => item.url).join(',');
    emit('update:modelValue', value);
    emit('update:fileList', newList);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newModelValue) => {
    if (newModelValue) {
      const list: FileItem[] = newModelValue.split(',').map((item) => ({
        url: item,
        status: 'success',
        message: ''
      }));
      fileList.value = list;
    } else {
      fileList.value = [];
    }
  },
  {
    immediate: true
  }
);

function triggerBeforeRead(event) {
  emit('beforeRead', event);
}
async function triggerAfterRead(event) {
  emit('afterRead', event);
  if (!props.autoUpload || !props.action) {
    return;
  }

  // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
  let lists: File[] = [].concat(event.file);
  if (props.replaceable) {
    fileList.value.length = 0;
  }
  let fileListLen = fileList.value.length;
  lists.map((item) => {
    fileList.value.push({
      ...item,
      status: 'uploading',
      message: '上传中'
    });
  });
  for (let i = 0; i < lists.length; i++) {
    const result = await uploadFilePromise(lists[i]);
    let item = fileList[fileListLen];
    fileList.value.splice(fileListLen, 1, {
      ...item,
      status: 'success',
      message: '',
      url: result
    });
    fileListLen++;
  }
}
function triggerOversize(event) {
  emit('oversize', event);
}
function triggerclickPreview(event) {
  emit('clickPreview', event);
}
function triggerDelete(event) {
  emit('delete', event);
  if (props.autoDelete) {
    const index: number = event.index;
    fileList.value.splice(index, 1);
  }
}

function reqestAll(key, ...args: any[]) {
  requestTasks.start();
  let res;
  if (key == 'upload') {
    // @ts-ignore
    requestTasks.add((res = uploadFn(...args)));
  }
  requestTasks.end();
  return res;
}

function uploadFn(file) {
  if (!file || !props.action) {
    return;
  }
  const task = customUploadApi(props.action, file);
  return task.then((res) => {
    const url = res?.bizData?.url;
    return url || '';
  });
}

async function uploadFilePromise(file: FileItem) {
  return reqestAll('upload', file);
}
</script>

<style scoped lang="scss"></style>
