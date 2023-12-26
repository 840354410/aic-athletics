<template>
  <view
    class="au-wrapper fixed-full"
    :style="{
      backgroundImage: 'url(' + loginBgUrl + ')'
    }"
  >
    <view class="pt-16rpx mt-64rpx mb-56rpx mx-auto text-center">
      <image class="icon-112" :src="aicLogoUrl" mode="scaleToFill" />
    </view>
    <view class="au-wrapper__body">
      <u-tabs
        :list="[
          {
            name: '手机登录'
          }
        ]"
        lineWidth="150rpx"
        lineHeight="14rpx"
        lineColor="linear-gradient(270deg, #FFFFFF 0%, #5A9CFF 100%)"
        :activeStyle="{
          color: '#2D2D2D',
          fontWeight: 'bold',
          fontSize: '32rpx'
        }"
        :inactiveStyle="{
          color: '#80878F',
          fontSize: '28rpx'
        }"
        itemStyle=" height: 54rpx;"
      ></u-tabs>

      <!-- 手机验证码登录 -->
      <view v-show="loginAction === 'phone'">
        <u-form ref="loginForm" :rules="rules" :model="loginFormData" labelWidth="0">
          <u-form-item label="" prop="phone">
            <AuInput
              type="number"
              v-model="loginFormData.phone"
              placeholder="请输入手机号码"
              :maxlength="11"
              shape="circle"
              border="none"
              customClass="input--circle-bg-f9"
            ></AuInput>
          </u-form-item>
          <u-form-item label="" prop="code">
            <view class="flex-y-center w-full">
              <AuInput
                type="text"
                :isCode="true"
                v-model="loginFormData.code"
                placeholder="请输入验证码"
                :maxlength="6"
                shape="circle"
                border="none"
                customClass="input--circle-bg-f9"
              ></AuInput>

              <view class="ml-16rpx">
                <AuCountButton :plain="true" shape="circle" :disabled="disabledCode" @click="clickGetCode"></AuCountButton>
              </view>
            </view>
          </u-form-item>

          <u-form-item class="agree" label="" name="agree" v-if="platform == 'weixin'">
            <view class="flex-xy-center">
              <u-checkbox-group class="flex-auto flex-xy-center text-24rpx" v-model="agreeArr" placement="row">
                <u-checkbox v-for="(item, index) in agreeList" :key="index" :label="item.label" :name="item.value"></u-checkbox>
                <view class="mt-8rpx text-24rpx">
                  <text class="u-primary">《用户服务协议》</text>
                  和
                  <text class="u-primary">《隐私政策》</text>
                </view>
              </u-checkbox-group>
            </view>
          </u-form-item>

          <view class="mt-32rpx">
            <u-button type="primary" text="开始使用" shape="circle" @click="submit"></u-button>
          </view>
        </u-form>
      </view>
      <!-- 微信授权手机号登录 -->
      <view class="mt-32rpx" v-show="loginAction === 'weixin'">
        <view v-show="agreeArr.length == 1">
          <u-button
            type="primary"
            text="一键登录"
            shape="circle"
            open-type="getPhoneNumber"
            @getphonenumber="getPhoneNumber"
          ></u-button>
        </view>
        <view v-show="agreeArr.length == 0">
          <u-button type="primary" text="一键登录" shape="circle" @click="clickLogin"></u-button>
        </view>
        <view class="flex-xy-center mt-32rpx">
          <u-checkbox-group class="flex-auto flex-xy-center text-24rpx" v-model="agreeArr" placement="row">
            <u-checkbox v-for="(item, index) in agreeList" :key="index" :label="item.label" :name="item.value"></u-checkbox>
            <view class="mt-8rpx text-24rpx">
              <text class="u-primary" @click="clickUserRemark">《用户服务协议》</text>
              和
              <text class="u-primary" @click="clickPrivacyRemark">《隐私政策》</text>
            </view>
          </u-checkbox-group>
        </view>
      </view>
    </view>
    <template v-if="platform === 'weixin'">
      <view class="mx-auto w-520rpx" v-show="loginAction === 'weixin'" @click="loginAction = 'phone'">
        <u-divider text="使用短信验证码登录" textSize="24rpx" textColor="#40acff" :hairline="false"></u-divider>
      </view>
      <view class="mx-auto w-520rpx" v-show="loginAction === 'phone'" @click="loginAction = 'weixin'">
        <u-divider text="微信登录" textSize="24rpx" textColor="#40acff" :hairline="false"></u-divider>
      </view>
    </template>
    <!-- <view class="flex-x-center">
      <u-icon name="weixin-circle-fill" size="64rpx" color="#46bb36"></u-icon>
    </view> -->
  </view>
</template>

<script lang="ts" setup>
import AuInput from '@/components/AuInput/AuInput.vue';
import { loginBgUrl, aicLogoUrl } from '@/config/images';
import {
  validatorPhone,
  isPhone,
  createLowercasePropertyProxy,
  requestTasks,
  customShowToast,
  setUserInfo,
  setToken
} from '@/utils/index';
import { requestVerifyCodeApi, verifyCodeAndGetUserInfoApi, login4PhoneApi } from '@/api/common';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  if (key == 'clickGetCode') {
    requestTasks.add(requestVerifyCodeFn());
  } else if (key == 'submit') {
    if (optionInfo.bizAction === 'bindPhone') {
      requestTasks.add(verifyCodeAndGetUserInfoFn());
    } else {
      requestTasks.add(login4PhoneFn());
    }
  } else if (key == 'getPhoneNumber') {
    try {
      await authStore.authWeixin();
      const res = await authStore.bindPhone(args[0]);
      if (res.success) {
        customShowToast(res);
        setTimeout(() => {
          authStore.loginSuccess();
        }, 1500);
      } else {
        authStore.token = '';
      }
    } catch (e) {
      requestTasks.end();
    }
  }
  requestTasks.end();
}

async function requestVerifyCodeFn() {
  const { phone } = loginFormData;
  if (!phone) {
    return;
  }
  const task = requestVerifyCodeApi(phone);
  task.then((res) => {
    let bizData = res?.bizData;
  });
  return task;
}
async function verifyCodeAndGetUserInfoFn() {
  const task = verifyCodeAndGetUserInfoApi(loginFormData);
  task.then((res) => {
    if (!res || !res?.bizData) {
      return;
    }
    let bizData = res?.bizData;
    authStore.userInfo = setUserInfo(authStore.userInfo, bizData);
    setTimeout(() => {
      authStore.loginSuccess();
    }, 1500);
  });
  return task;
}
async function login4PhoneFn() {
  const task = login4PhoneApi(loginFormData);
  task.then(async (res) => {
    if (!res?.bizData?.token) {
      return;
    }
    setToken(res.bizData.token);
    await authStore.getUserInfo();
    setTimeout(() => {
      authStore.loginSuccess();
    }, 1500);
  });
  return task;
}

const loginAction = ref<'weixin' | 'phone' | ''>('');
const platform = ref<'weixin' | 'h5' | ''>('');
const rules = reactive({
  phone: [
    {
      required: true,
      message: '手机号码不能为空'
    },
    {
      message: '手机号码输入有误',
      validator: validatorPhone
    }
  ],
  code: [
    {
      required: true,
      message: '验证码不能为空'
    }
  ]
});
const loginFormData = reactive({
  phone: '',
  code: ''
});
const loginForm = ref<Form | null>(null);
const agreeList = reactive([
  {
    label: '已阅读并同意',
    value: 1
  }
]);
const agreeArr = ref([]);

function clickLogin() {
  uni.$u.toast('请先阅读相关协议');
}
function submit() {
  if (platform.value === 'weixin' && !agreeArr.value.length) {
    uni.$u.toast('请先阅读相关协议');
    return;
  }
  if (!loginForm.value) {
    return;
  }
  loginForm.value
    .validate()
    .then((res) => {
      requestAll('submit');
    })
    .catch((err) => {});
}
async function getPhoneNumber(e) {
  if (!e?.detail?.code) {
    return;
  }
  requestAll('getPhoneNumber', e.detail.code);
}

// 验证码功能
const disabledCode = ref(true);
watch(
  () => loginFormData.phone,
  function (newVal, oldVal) {
    const validateRes = isPhone(newVal);
    disabledCode.value = !validateRes;
  }
);
function clickGetCode() {
  if (disabledCode.value) {
    return;
  }
  requestAll('clickGetCode');
}

function clickUserRemark() {
  uni.navigateTo({ url: '/pages/UserAgreement/UserAgreement?bizAction=userRemark' });
}
function clickPrivacyRemark() {
  uni.navigateTo({ url: '/pages/UserAgreement/UserAgreement?bizAction=privacyRemark' });
}

interface OptionInfo {
  bizAction: 'bindPhone' | 'login' | undefined;
}
let optionInfo: OptionInfo;
onLoad((options) => {
  optionInfo = createLowercasePropertyProxy<OptionInfo>(options as OptionInfo);
  // #ifdef MP-WEIXIN
  loginAction.value = 'weixin';
  platform.value = 'weixin';
  // #endif
  // #ifndef MP-WEIXIN
  loginAction.value = 'phone';
  platform.value = 'h5';
  // #endif
});
</script>

<style scoped lang="scss">
.au-wrapper {
  --u-checkbox-text-font-size: 24rpx;
  background-position: right bottom;
  background-repeat: no-repeat;
  background-size: 100% auto;
}

.au-wrapper__body {
  margin: 0 60rpx 0;
  background: #fff;
  box-shadow: 0px 0px 40rpx 2rpx rgba(17, 105, 255, 0.1);
  border-radius: 20rpx;
  opacity: 1;
  padding: 36rpx 24rpx 48rpx;
}

::v-deep .au-wrapper__body {
  .u-form {
    padding: 0 8rpx;
    margin-top: 52rpx;
  }

  .u-count-down__text {
    color: $u-primary;
  }
}
</style>
