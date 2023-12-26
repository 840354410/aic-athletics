import { formatDate, getToken, getCurrentUrl, getBaseUrl } from '@/utils/index';
import axios, { AxiosAdapter } from 'axios';
// 小程序axios适配器
import mpAdapter from 'axios-miniprogram-adapter';
import AxiosCancelToken from './AxiosCancelToken';
import { useAuthStore } from '@/store/auth';
const axiosCancelToken = new AxiosCancelToken();
axios.defaults.adapter = mpAdapter as AxiosAdapter;
axios.defaults.timeout = 30000;
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
export class HttpClient {
  /**
   * 创建axios
   * @param abortRequest 取消请求配置，可选值：same(取消相同请求)、all(取消所有请求)、none(不取消请求)
   * @returns
   */
  public static server(abortRequest: 'same' | 'all' | 'none' = 'none') {
    // 可以在这里拦截
    const baseURL = getBaseUrl();
    return HttpClient.create(baseURL, abortRequest);
  }

  private static create(baseURL: string, abortRequest: 'same' | 'all' | 'none' = 'none') {
    const instance = axios.create({
      withCredentials: true,
      baseURL: baseURL
    });
    instance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore();
        // 设置conten-type
        config.headers = config?.headers || {};
        // 设置请求唯一标识（便于查询请求日志）
        config.headers.trace_id = formatDate(new Date().getTime(), 'yyyyMMddHHmmssSSS');

        // 是否需要设置 token
        const isNotNeedToken = (config?.headers || {}).isToken === false;
        const token = getToken();
        if (!isNotNeedToken && token) {
          config.headers['Authorization'] = token; // 让每个请求携带自定义token 请根据实际情况自行修改
        }

        switch (abortRequest) {
          case 'all':
            axiosCancelToken.removeAllRequest();
            break;
          case 'same':
            axiosCancelToken.removeRequest(config);
            break;
          default:
            break;
        }
        axiosCancelToken.addRequest(config);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (res) => {
        // 此处为前后端约定的接口成功的字段，旨在处理状态码为200的错误响应，开发者可自行调整
        const authStore = useAuthStore();
        if (res.data.success) {
          if (authStore.token && authStore.userInfo) {
            authStore.tokenExpir = new Date().getTime() + 60 * 60 * 1000;
          }
          if (res.data.ts) {
            authStore.currentTime = res.data.ts;
          }
          return res.data;
        }
        // isAuthing为true说明调用了无效接口，除了鉴权的接口都应该排除掉
        const isAuthing = authStore.isAuthing;
        const authUrlArr = ['/sport/minaAuth/login', 'sport/auth/v2'];
        if (isAuthing && authUrlArr.indexOf(res.request.url) == -1) {
          return Promise.reject();
        }
        if (res.data.msg) {
          const authStore = useAuthStore();
          // 没token，需要授权
          if ((res.data.errCode == 10001 || res.data.errCode == 10002) && authUrlArr.indexOf(res.request.url) == -1) {
            authStore.isAuthing = true;
            const url = getCurrentUrl();
            if (url) {
              authStore.lastRequestPath = url;
            }
            authStore.auth();
            return;
          }
          // 没手机号，需要验证手机号
          if (res.data.errCode == 11001) {
            authStore.isAuthing = true;
            const url = getCurrentUrl();
            if (url) {
              authStore.lastRequestPath = url;
            }
            if (authStore.userInfo) {
              authStore.userInfo.phone = '';
            }
            uni.redirectTo({
              url: '/pages/Login/Login?bizAction=bindPhone',
              success: () => {
                authStore.isAuthing = false;
                uni.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: false
                });
              }
            });
            return;
          }
          uni.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          });
        }
        return Promise.reject(res.data);
      },
      (error) => {
        if ((error.status !== 0 && !error.status) || error.status == 500) {
          if (error.msg === 'config:fail') {
            uni.showModal({
              title: '提示',
              content: '连接超时，请稍后重试',
              showCancel: false
            });
          }
          return Promise.reject(error);
        }
        const pages = getCurrentPages() as any[];
        const authStore = useAuthStore();
        switch (error.status) {
          // 小程序切换页面会导致正在处理中的请求返回状态码为0 这里还没有什么比较好的处理方案
          // case 0:
          //   error.msg = '请检查网络设置'
          //   break
          case 1:
            error.msg = '网络超时!';
            break;
          case 401:
            authStore.logout();
            setTimeout(() => {
              uni.showToast({ title: '登录已过期,请重新登录!', icon: 'none' });
            }, 300);
            // 如果当前页面不是登录页面则跳转至登录页面
            if (
              !pages[pages.length - 1].$page ||
              (pages[pages.length - 1].$page && pages[pages.length - 1].$page.fullPath !== '/pages/login/Login')
            ) {
              uni.reLaunch({ url: '/pagesOther/login/Login' });
            }
            break;

          case 403:
            error.msg = `${error.status} 禁止访问!`;
            break;
          case 500:
            error.msg = `${error.status} 服务内部异常!`;
            break;
          case 502:
            error.msg = `${error.status} 服务器暂不可用!`;
            break;
          case 503:
            error.msg = `${error.status} 服务器升级中!`;
            break;
          case 404:
            error.msg = `${error.status} 服务器无回应!`;
            break;
          default:
            error.msg = `${error.status} 未知错误!`;
        }
        return Promise.reject(error);
      }
    );
    return instance;
  }
}
const http = HttpClient.server();
export default http;
