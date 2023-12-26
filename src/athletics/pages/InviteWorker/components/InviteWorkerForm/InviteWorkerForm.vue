<template>
  <view class="au-form text-28rpx">
    <view class="au-form__body au-form-item-pr-24rpx au-form-text-right">
      <u-form ref="form" :rules="rules" :model="formData">
        <u-form-item
          label="姓名"
          prop="memberName"
          :required="requiredData.memberName"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <AuInput
            type="text"
            v-model="formData.memberName"
            :border="formShapeData.border"
            :fontSize="formShapeData.fontSize"
            :inputAlign="formShapeData.valueAlign"
            :customStyle="formShapeData.inputCustomStyle"
          ></AuInput>
        </u-form-item>

        <u-form-item
          label="手机号码"
          prop="memberPhone"
          :required="requiredData.memberPhone"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <AuInput
            type="number"
            v-model="formData.memberPhone"
            :maxlength="11"
            :border="formShapeData.border"
            :fontSize="formShapeData.fontSize"
            :inputAlign="formShapeData.valueAlign"
            :customStyle="formShapeData.inputCustomStyle"
            :disabled="true"
          ></AuInput>
        </u-form-item>

        <u-form-item
          label="角色类型"
          prop="roleId"
          :required="requiredData.roleId"
          :labelWidth="formShapeData.itemLabelWidth"
          :borderBottom="formShapeData.itemBorderBottom"
        >
          <AuSelect
            mode="single"
            v-model="formData.roleId"
            :list="roleList"
            :border="formShapeData.border"
            :fontSize="formShapeData.fontSize"
            :inputAlign="formShapeData.valueAlign"
          ></AuSelect>
        </u-form-item>
      </u-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import AuInput from '@/components/AuInput/AuInput.vue';
import AuSelect from '@/components/AuSelect/AuSelect.vue';
import { validatorPhone, requestTasks } from '@/utils/index';
import { useAuthStore } from '@/store/auth';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { TeamWorkerRolesRes } from '@/athletics/model/sport';
import { teamWorkerRolesApi } from '@/athletics/api/sport';

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'onLoad') {
    requestTasks.add(teamWorkerRolesFn());
  }
  requestTasks.end();
}
async function teamWorkerRolesFn() {
  const task = teamWorkerRolesApi();
  task.then((res) => {
    let bizData = res?.bizData || [];
    const list = bizData.map((item) => ({
      label: item.roleName,
      value: item.id
    }));
    roleList.push(...list);
  });
  return task;
}

const emit = defineEmits<{
  (e: 'update:formData', formData: Partial<FormData>);
}>();
interface FormData {
  memberName: string;
  memberPhone: string;
  roleId: string;
}
interface InviteWorkerFormProps {
  formData: Partial<FormData>;
}
const props = withDefaults(defineProps<InviteWorkerFormProps>(), {
  formData: () => ({})
});
const authStore = useAuthStore();
const { formData } = useVModels(props, emit);
const rules = reactive({
  memberName: [
    {
      required: true,
      message: '姓名必填'
    }
  ],
  memberPhone: [
    {
      required: true,
      message: '手机号码必填'
    },
    {
      message: '手机号码输入有误',
      validator: validatorPhone
    }
  ],
  roleId: [
    {
      required: true,
      message: '角色类型必选'
    }
  ]
});
const requiredData = reactive<Record<keyof FormData, boolean>>({
  memberName: true,
  memberPhone: true,
  roleId: false
});
const formShapeData: FormShapeData = {
  itemBorderBottom: true,
  itemLabelWidth: '7em',
  fontSize: '28rpx',
  border: 'none',
  valueAlign: 'right'
};
const roleList = reactive<Option[]>([]);

const form = ref();
function validate() {
  return form.value.validate();
}
defineExpose({
  validate
});

onLoad(() => {
  requestAll('onLoad');
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
