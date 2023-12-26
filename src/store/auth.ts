import { UserInfoRes } from '@/model/common';
import { authV2Api, minaAuthApi, userInfoApi, bindPhoneApi, logoutApi } from '@/api/common';
import { customShowToast, getCurrentUrl, getWxLoginCode, setToken, setUserInfo, requestTasks } from '@/utils/index';
import { useSportStore } from '@/store/sport';
export interface AuthStore {
  // 鉴权令牌
  token: string;
  tokenExpir: string | number;
  userInfo: UserInfoRes | null;
  lastRequestPath: string;
  isGetUserInfo: boolean;
  currentTime: number;
  isAuthing: boolean;
}

import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', {
  // state: 返回对象的函数
  state: (): AuthStore => ({
    token: '',
    tokenExpir: '',
    userInfo: null,
    lastRequestPath: '',
    isGetUserInfo: false,
    currentTime: new Date().getTime(),
    isAuthing: false // 判断是否正在鉴权
  }),
  getters: {
    userName: (state) => state.userInfo?.userName || '',
    phone: (state) => state.userInfo?.phone || ''
  },
  actions: {
    logout() {
      logoutApi().then((res) => {
        customShowToast(res);
        setTimeout(() => {
          this.reset();
          uni.clearStorageSync();
          uni.navigateTo({
            url: '/pages/Login/Login?bizAction=login'
          });
        }, 1500);
      });
    },
    reset() {
      const sportStore = useSportStore();
      sportStore.$reset();
      this.$reset();
    },
    auth() {
      this.token = '';
      this.userInfo = null;
      let res;
      // #ifdef H5
      // eslint-disable-next-line prefer-const
      res = this.authH5();
      // #endif
      // #ifdef MP-WEIXIN
      uni.reLaunch({
        url: '/pages/Login/Login'
      });
      this.isAuthing = false;
      // #endif
      return res;
    },
    async authH5() {
      let res = Promise.resolve();
      // #ifdef H5
      const origin = location.origin;
      const url = origin + '/pages/Middle/Middle';
      res = authV2Api(url)
        .then((res) => {
          this.isAuthing = false;
          if (res.bizData) {
            if (import.meta.env.PROD) {
              // 正式必须跳转
              location.replace(res.bizData);
            } else {
              // 测试调试时可以注释
              location.replace(res.bizData);
            }
          }
        })
        .catch((e) => {});
      // #endif
      // #ifndef H5
      this.isAuthing = false;
      // #endif
      return res;
    },
    async authWeixin() {
      // #ifdef MP-WEIXIN
      const code = await getWxLoginCode();
      const params = {
        code
      };
      const task = minaAuthApi(params);
      task
        .then(async (res) => {
          this.isAuthing = false;
          if (res?.bizData?.token) {
            setToken(res.bizData.token);
            // await this.getUserInfo();
            // const currentUrl = getCurrentUrl();
            // uni.navigateTo({ url: currentUrl });
          }
        })
        .catch((e) => {});
      return task;
      // #endif
    },
    async getUserInfo() {
      if (this.token && !this.userInfo && !this.isGetUserInfo) {
        this.isGetUserInfo = true;
        try {
          const res = await userInfoApi();
          this.isGetUserInfo = false;
          const bizData = res?.bizData;
          if (bizData) {
            this.userInfo = setUserInfo(this.userInfo, bizData);
          }
        } catch (e) {
          this.isGetUserInfo = false;
        }
      }
    },
    async bindPhone(phone) {
      const res = await bindPhoneApi(phone);
      await this.getUserInfo();
      return res;
    },
    async loginSuccess() {
      this.toLastRequestPath();
    },

    toLastRequestPath() {
      let url;
      const lastRequestPath = this?.lastRequestPath || '';
      // pages/Middle/Middle中间页是无效页面，上次请求的页面不能是这个页面
      const arr = ['/pages/Middle/Middle', '/pages/Login/Login'];
      if (lastRequestPath && arr.indexOf(lastRequestPath) == -1) {
        url = lastRequestPath;
      } else {
        url = '/athletics/pages/SportIndex/SportIndex';
      }
      uni.reLaunch({
        url
      });
    }
  }
});
