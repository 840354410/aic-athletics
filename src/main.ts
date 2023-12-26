import './assets/fonts/iconfont.css';
import 'virtual:uno.css';
import { createSSRApp } from 'vue';
import App from './App.vue';
import { setupRouter } from './router'; // 引入路由
import { persist } from './store/persist';
import uviewPlus from 'uview-plus';
import { addRouterLinkinterceptor } from '@/utils/index';
// @ts-ignore
// import uviewPlusDefProps from '/node_modules/uview-plus/libs/config/props';
// import { deepMerge } from '@/utils/index';

// #ifdef H5
// 记录进入app时的url
if (typeof window.entryUrl === 'undefined' || window.entryUrl === '') {
  (window as any).entryUrl = location.href.split('#')[0];
}
// #endif

addRouterLinkinterceptor();
const pinia = createPinia();
pinia.use(persist);
export function createApp() {
  const app = createSSRApp(App);
  app.config.warnHandler = () => null;
  // 注册router
  setupRouter(app);
  app.use(pinia);
  app.use(uviewPlus);
  setUConfig();
  return {
    app,
    pinia
  };
}

function getCustomUviewPlusDefProps() {
  return {
    checkbox: {
      size: '32rpx',
      labelSize: '24rpx',
      iconSize: '32rpx'
    },
    empty: {
      textSize: 28
    }
  };
}

function setUConfig() {
  // 调用setConfig方法，方法内部会进行对象属性深度合并，可以放心嵌套配置
  // 需要在app.use(uview-plus)之后执行
  uni.$u.setConfig({
    // 修改$u.config对象的属性
    config: {
      color: {
        'u-primary': '#40ACFF',
        'u-tips-color': '#9BA2AA',
        'u-info': '#9BA2AA',
        'u-main-color': '#2D2D2D',
        'u-content-color': '#2D2D2D'
      },
      // 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
      unit: 'rpx'
    },
    color: {
      borderColor: '#E7E9EC',
      contentColor: '#2D2D2D',
      default: '#9BA2AA',
      mainColor: '#2D2D2D',
      primary: '#40ACFF',
      tipsColor: '#9BA2AA'
    },
    // 不支持，这个是没用的代码
    zIndex: {
      toast: 103,
      noNetwork: 102,
      popup: 101,
      mask: 100,
      navbar: 98,
      topTips: 97,
      sticky: 96,
      indexListSticky: 95
    }
  });
  // const customUviewPlusDefProps = getCustomUviewPlusDefProps();
  // deepMerge(uviewPlusDefProps, customUviewPlusDefProps, false);
}
