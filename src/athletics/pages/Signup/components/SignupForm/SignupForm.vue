<template>
  <view class="au-form text-28rpx">
    <view class="au-form__body au-form-item-pr-24rpx au-form-text-right" :class="[disabled ? 'au-form--disabled' : '']">
      <u-form ref="form" :rules="rules" :model="formData">
        <u-form-item
          v-for="item in formDataList"
          :key="item.id"
          :label="item.collectionTitle"
          :prop="item.id"
          :required="item.requiredType == 1"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <template v-if="item.inputMode == 1">
            <template v-if="['date', 'time', 'datetime', 'year-month'].includes(item.inputMap?.charType || '')">
              <AuDatetimePicker
                :mode="(item.inputMap?.charType as 'date' | 'time' | 'datetime' | 'year-month')"
                v-model="formData[item.id]"
                :border="formShapeData.border"
                :fontSize="formShapeData.fontSize"
                :inputAlign="formShapeData.valueAlign"
                :customStyle="formShapeData.inputCustomStyle"
                :placeholder="item?.inputMap?.inputHint"
              ></AuDatetimePicker>
            </template>
            <template v-else>
              <AuInput
                :type="(item.inputMap?.charType as 'text' | 'number')"
                v-model="formData[item.id]"
                :border="formShapeData.border"
                :fontSize="formShapeData.fontSize"
                :inputAlign="formShapeData.valueAlign"
                :customStyle="formShapeData.inputCustomStyle"
                :placeholder="item?.inputMap?.inputHint"
                :maxlength="inputMaxlengthMap[item.collectionDesc] || -1"
                :disabled="
                  (disabledPhone && item?.collectionDesc === 'USER_PHONE') ||
                  (disabledName && item?.collectionDesc === 'USER_NAME')
                "
              ></AuInput>
            </template>
          </template>
          <template v-else-if="item.inputMode == 2">
            <AuSelect
              mode="single"
              v-model="formData[item.id]"
              :list="item.inputMap?.itemList || []"
              value-key="itemValue"
              label-key="itemLabel"
              :border="formShapeData.border"
              :fontSize="formShapeData.fontSize"
              :inputAlign="formShapeData.valueAlign"
              :placeholder="item?.inputMap?.inputHint"
            ></AuSelect>
          </template>

          <template v-else-if="item.inputMode == 3">
            <AuMultiSelect
              v-model="formData[item.id]"
              :list="item.inputMap?.itemList || []"
              value-key="itemValue"
              label-key="itemLabel"
              :border="formShapeData.border"
              :fontSize="formShapeData.fontSize"
              :inputAlign="formShapeData.valueAlign"
              :placeholder="item?.inputMap?.inputHint"
            ></AuMultiSelect>
          </template>

          <template v-else-if="item.inputMode == 4">
            <template v-if="item.collectionDesc != 'USER_CERT_PIC'">
              <AuUpload
                v-model="formData[item.id]"
                :maxCount="item.inputMap.maxCount"
                :width="uploaderWidth(item.collectionDesc)"
                :height="uploaderHeight(item.collectionDesc)"
                suffixIcon="arrow-right"
                fontSize="18rpx"
                :uploadAlign="formShapeData.valueAlign"
                :multiple="true"
              >
                <!-- 人脸 -->
                <template v-if="item.collectionDesc == 'USER_FACE'">
                  <view class="w-full flex-y-center flex-justify-end text-24rpx">
                    <text class="u-tips-color">{{ item?.inputMap?.inputHint }}</text>
                    <image class="icon-58 ml-12rpx flex-none" :src="personFaceUrl"></image>
                  </view>
                </template>
                <!-- 普通照片 -->
                <template v-else-if="item.inputMap?.inputType == 'Photo' || !item.inputMap?.inputType">
                  <view class="h-lh-80rpx">
                    <i class="iconfont icon-upload_a_picture u-tips-color text-80rpx"></i>
                  </view>
                </template>
              </AuUpload>
            </template>
            <template v-else>
              <view class="w-full -mr-24rpx relative left-48rpx flex USER_CERT_PIC">
                <view class="flex-1">
                  <u-form-item
                    :prop="item.id + '.0'"
                    :required="false"
                    :labelWidth="formShapeData.itemLabelWidth"
                    :borderBottom="false"
                  >
                    <AuUpload
                      v-model="formData[item.id][0]"
                      :maxCount="1"
                      :width="uploaderWidth(item.collectionDesc)"
                      :height="uploaderHeight(item.collectionDesc)"
                      fontSize="18rpx"
                      :uploadAlign="formShapeData.valueAlign"
                      :multiple="true"
                    >
                      <view class="w-full flex flex-col items-center text-28rpx">
                        <image class="w-164rpx h-112rpx" :src="uploadIdCardFaceUrl"></image>
                        <text class="u-tips-color mt-8rpx">证件正面</text>
                      </view>
                    </AuUpload>
                  </u-form-item>
                </view>
                <view class="flex-1">
                  <u-form-item
                    :prop="item.id + '.1'"
                    :required="false"
                    :labelWidth="formShapeData.itemLabelWidth"
                    :borderBottom="false"
                  >
                    <AuUpload
                      v-model="formData[item.id][1]"
                      :maxCount="1"
                      :width="uploaderWidth(item.collectionDesc)"
                      :height="uploaderHeight(item.collectionDesc)"
                      fontSize="18rpx"
                      :uploadAlign="formShapeData.valueAlign"
                      :multiple="true"
                    >
                      <view class="w-full flex flex-col items-center text-28rpx">
                        <image class="w-164rpx h-112rpx" :src="uploadIdCardNationalUrl"></image>
                        <text class="u-tips-color mt-8rpx">证件反面</text>
                      </view>
                    </AuUpload>
                  </u-form-item>
                </view>
              </view>
            </template>
          </template>
        </u-form-item>
      </u-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuInput from '@/components/AuInput/AuInput.vue';
import AuDatetimePicker from '@/components/AuDatetimePicker/AuDatetimePicker.vue';
import AuUpload from '@/components/AuUpload/AuUpload.vue';
import AuSelect from '@/components/AuSelect/AuSelect.vue';
import AuMultiSelect from '@/components/AuMultiSelect/AuMultiSelect.vue';
import { personFaceUrl, uploadIdCardFaceUrl, uploadIdCardNationalUrl } from '@/athletics/config/images';
import { validatorPhone, __hasOwnProp } from '@/utils/index';
import { CollectionConfItem } from '@/athletics/model/sport';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { showModal } from '../../../../../utils/util';

const emit = defineEmits<{
  (e: 'update:formData', formData: Partial<FormData>);
}>();
const props = withDefaults(
  defineProps<{
    formDataList: CollectionConfItem[];
    formData: object;
    disabled?: boolean;
    disabledPhone?: boolean;
    disabledName?: boolean;
  }>(),
  {
    formDataList: () => [],
    formData: () => ({}),
    disabled: false,
    disabledPhone: true,
    disabledName: false
  }
);
const { formData } = useVModels(props, emit);
const rules = reactive({});
const formShapeData: FormShapeData = {
  itemBorderBottom: true,
  itemLabelWidth: '7em',
  fontSize: '28rpx',
  border: 'none',
  valueAlign: 'right'
};
const inputMaxlengthMap = reactive({
  USER_PHONE: 11,
  USER_CERT_NUM: 18,
  EMERGENCY_CONTACT_MOBILE_1: 11,
  EMERGENCY_CONTACT_MOBILE_2: 11
});
const formDataMap = reactive({});
// 0: 未提示 1: 确认不修改 2 确认要修改
const certNumTipsStatus = ref<number>(0);
const form = ref();
watchEffect(() => {
  props.formDataList.forEach((item) => {
    const id: string = item.id as string;
    if (item.requiredType == 1) {
      if (!rules[id]) {
        rules[id] = [];
      }
      if (item.collectionDesc === 'USER_CERT_PIC') {
        rules[id + '.0'] = [];
        rules[id + '.1'] = [];
        rules[id + '.0'].push({
          required: true,
          message: item.collectionTitle + '必填'
        });
        rules[id + '.1'].push({
          required: true,
          message: item.collectionTitle + '必填'
        });
      } else {
        rules[id].push({
          required: true,
          message: item.collectionTitle + '必填'
        });
      }
    }
    if (item.inputMap?.limitRule) {
      const limitRule = new RegExp(decodeURIComponent(item.inputMap?.limitRule)) as unknown as RegExp;
      if (!rules[id]) {
        rules[id] = [];
      }
      const message = item.inputMap?.limitErrorHint || '输入有误';
      rules[item.id].push({
        message,
        validator: function (rule, value, callback) {
          if (value === '') {
            callback && callback();
            return;
          }
          const res = limitRule.test(value);
          if (!res) {
            callback && callback(message);
          } else {
            callback && callback();
          }
        }
      });
    }
    form.value?.setRules(rules);
  });
  props.formDataList.forEach((item) => (formDataMap[item.collectionDesc] = item));
});
const uploaderWidthMap = {
  USER_FACE: '58rpx',
  USER_CERT_PIC: '164rpx',
  USER_PHOTO: '80rpx'
};
const uploaderHeightMap = {
  USER_FACE: '58rpx',
  USER_CERT_PIC: '112rpx',
  USER_PHOTO: '80rpx'
};
function uploaderWidth(collectionDesc) {
  return uploaderWidthMap[collectionDesc] || '80rpx';
}
function uploaderHeight(collectionDesc) {
  return uploaderHeightMap[collectionDesc] || '80rpx';
}
function getItemValue(key) {
  const item = formDataMap[key];
  if (item) {
    return formData.value[item.id];
  }
  return;
}
function validate() {
  return form.value.validate().then((res) => {
    const certNum = getItemValue('USER_CERT_NUM');
    if (certNum.length && certNum.length < 18 && certNumTipsStatus.value != 1) {
      uni.showModal({
        title: '提示',
        content: '您输入的证件号码位数少于常用证件号的位数，请问是否仍以该证件号报名？',
        showCancel: true,
        cancelText: '不修改',
        confirmText: '我要修改',
        success: ({ confirm, cancel }) => {
          if (cancel) {
            certNumTipsStatus.value = 1;
          }
          if (confirm) {
            certNumTipsStatus.value = 2;
          }
        }
      });
      return Promise.reject();
    }
    const phone = getItemValue('USER_PHONE');
    const contactMobile1 = getItemValue('EMERGENCY_CONTACT_MOBILE_1');
    const contactMobile2 = getItemValue('EMERGENCY_CONTACT_MOBILE_2');
    if (phone && (contactMobile1 || contactMobile2) && (phone === contactMobile1 || phone === contactMobile2)) {
      showModal('紧急联系人电话不允许与报名人电话一致');
      return Promise.reject();
    }
    if (contactMobile1 && contactMobile1 === contactMobile2) {
      showModal('请输入不同紧急联系人的电话');
      return Promise.reject();
    }
    return Promise.resolve(res);
  });
}
defineExpose({
  validate
});
</script>

<style scoped lang="scss">
::v-deep .u-form-item .u-form-item__body {
  min-height: 50px;
  box-sizing: border-box;
}
::v-deep .USER_CERT_PIC .u-form-item__body__right__message {
  margin-left: 0 !important;
  text-align: center;
}
</style>
