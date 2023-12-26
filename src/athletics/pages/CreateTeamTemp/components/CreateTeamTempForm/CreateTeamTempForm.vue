<template>
  <view class="au-form text-28rpx">
    <view class="au-form__body au-form-item-pr-24rpx au-form-text-right">
      <u-form ref="form" :rules="rules" :model="formData">
        <view class="flex-y-center py-24rpx">
          <view class="icon-154 bg-hex-eee rounded-1/2 -ml-24rpx">
            <AuUpload
              v-model="formData.teamLogo"
              v-model:fileList="formData.teamLogoList"
              :maxCount="1"
              width="154rpx"
              height="154rpx"
              uploadAlign="right"
              shape="circle"
              :disabled="!!formDisabledData?.teamLogo"
            >
              <view class="icon-154 flex-xy-center flex-col u-tips-color">
                <i class="iconfont icon-upload_a_picture u-tips-color text-58rpx"></i>
                <text class="text-24rpx">队伍LOGO</text>
              </view>
            </AuUpload>
          </view>
          <view class="ml-24rpx flex-1">
            <u-form-item
              label=""
              prop="teamName"
              :required="false"
              :labelWidth="formShapeData.itemLabelWidth"
              :borderBottom="formShapeData.itemBorderBottom"
            >
              <AuInput
                type="text"
                v-model="formData.teamName"
                :border="formShapeData.border"
                :fontSize="formShapeData.fontSize"
                :customStyle="formShapeData.inputCustomStyle"
                placeholder="请输入队伍名称"
                :disabled="!!formDisabledData?.teamName"
              ></AuInput>
            </u-form-item>
          </view>
        </view>

        <u-form-item
          label="创建者姓名"
          prop="leaderName"
          :required="requiredData.leaderName"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <AuInput
            type="text"
            v-model="formData.leaderName"
            :border="formShapeData.border"
            :fontSize="formShapeData.fontSize"
            :inputAlign="formShapeData.valueAlign"
            :customStyle="formShapeData.inputCustomStyle"
            :disabled="!!formDisabledData?.leaderName"
          ></AuInput>
        </u-form-item>

        <u-form-item
          label="创建者手机号码"
          prop="leaderPhone"
          :required="requiredData.leaderPhone"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <AuInput
            type="number"
            v-model="formData.leaderPhone"
            :maxlength="11"
            :border="formShapeData.border"
            :fontSize="formShapeData.fontSize"
            :inputAlign="formShapeData.valueAlign"
            :customStyle="formShapeData.inputCustomStyle"
            :disabled="true"
          ></AuInput>
        </u-form-item>
      </u-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuInput from '@/components/AuInput/AuInput.vue';
import AuUpload from '@/components/AuUpload/AuUpload.vue';
import { personFaceUrl } from '@/athletics/config/images';
import { validatorPhone } from '@/utils/index';
import { useAuthStore } from '@/store/auth';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
const emit = defineEmits<{
  (e: 'update:formData', formData: Partial<FormData>);
}>();
interface FormData {
  teamLogo: string;
  teamLogoList: any[];
  teamName: string;
  leaderName: string;
  leaderPhone: string;
}
interface CreateTeamFormProps {
  formData: Partial<FormData>;
  formDisabledData?: Record<keyof Partial<FormData> & string, boolean>;
}
const props = withDefaults(defineProps<CreateTeamFormProps>(), {
  formData: () => ({})
});
const authStore = useAuthStore();
const { formData } = useVModels(props, emit);
const rules = reactive({
  leaderName: [
    {
      required: true,
      message: '创建者姓名必填'
    }
  ],
  leaderPhone: [
    {
      required: true,
      message: '创建者手机号码必填'
    },
    {
      message: '手机号码输入有误',
      validator: validatorPhone
    }
  ]
});
const requiredData = reactive<Record<keyof FormData, boolean>>({
  teamLogo: true,
  teamLogoList: true,
  teamName: true,
  leaderName: true,
  leaderPhone: true
});
const formShapeData: FormShapeData = {
  itemBorderBottom: true,
  itemLabelWidth: '7em',
  fontSize: '28rpx',
  border: 'none',
  valueAlign: 'right'
};

const form = ref();
function validate() {
  if (!formData.value.teamLogo) {
    uni.$u.toast('请上传队伍logo');
    return Promise.reject();
  }
  return form.value.validate();
}
defineExpose({
  validate
});
</script>

<style scoped lang="scss">
::v-deep {
  .u-form-item {
    .u-form-item__body {
      height: 50px;
      box-sizing: border-box;
    }
  }
}
</style>
