// #ifdef H5
import jweixin from 'weixin-js-sdk';
// #endif
import { getJsApiTicketApi } from '@/api/common';
import { getIsH5 } from '@/utils/index';
function getWxConfigUrl() {
  return /(Android)/i.test(navigator.userAgent) ? location.href.split('#')[0] : (window as any).entryUrl;
}
export const wechat = {
  // 调试模式
  debug: false,
  // 缓存接口数据
  caches: {},
  // api列表
  jsApiList: [
    'updateAppMessageShareData',
    'updateTimelineShareData',
    'closeWindow',
    // 'getLocation',
    'openLocation'
    // 'openAddress',
    // 'scanQRCode',
    // 'chooseImage',
    // 'chooseWXPay'
  ],
  // 判断是否在微信中
  isWechat: function () {
    const isH5 = getIsH5();
    if (!isH5) {
      return false;
    }
    const ua = window.navigator.userAgent.toLowerCase();
    const matchArr = ua.match(/micromessenger/i);
    return (matchArr && matchArr[0]) == 'micromessenger' ? true : false;
  },
  // 初始化sdk配置
  initJssdk: function (callback) {
    if (this.isWechat()) {
      const url = getWxConfigUrl();
      if (!this.caches[url]) {
        const task = getJsApiTicketApi(url);
        task.then((res) => {
          const share = res.bizData;
          jweixin.config({
            debug: share.debug || this.debug,
            appId: share.appId,
            timestamp: share.timestamp,
            nonceStr: share.nonceStr,
            signature: share.signature,
            jsApiList: this.jsApiList
          });
          this.caches[url] = share;
          if (typeof callback === 'function') {
            callback(share);
          }
        });
        return task;
      } else {
        if (typeof callback === 'function') {
          callback(this.caches[url]);
        }
        return Promise.resolve();
      }
    }
  },
  // 关闭页面事件
  closeWindow: function (callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        jweixin.ready(function (wx) {
          wx.closeWindow();
          if (typeof callback === 'function') {
            callback(jweixin);
          }
        });
      });
    }
  },
  // 微信分享
  share: function (data, callback?): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isWechat()) {
        this.initJssdk(function (init) {
          resolve();
          jweixin.ready(function () {
            const link = getWxConfigUrl();
            const shareData = {
              title: data.title,
              desc: data.desc,
              link,
              imgUrl: data.imageUrl,
              success: function (res) {
                callback(res);
              },
              cancel: function (res) {
                callback(res);
              }
            };
            jweixin.updateAppMessageShareData(shareData);
            jweixin.updateTimelineShareData(shareData);
          });
        });
      } else {
        reject();
      }
    });
  },
  // 获取位置信息
  getLocation: function (callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        jweixin.ready(function () {
          jweixin.getLocation({
            type: 'gcj02',
            success: function (res) {
              callback(res);
            },
            fail: function (err) {
              callback(err);
            }
          });
        });
      });
    }
  },
  // 查看位置信息
  openLocation: function (data?, callback?) {
    if (this.isWechat()) {
      return this.initJssdk(function (init) {
        jweixin.ready(function () {
          jweixin.openLocation({
            latitude: parseFloat(data.latitude), // 纬度，浮点数，范围为90 ~ -90
            longitude: parseFloat(data.longitude), // 经度，浮点数，范围为180 ~ -180。
            name: data.name, // 位置名
            address: '', // 地址详情说明
            scale: 18, // 地图缩放级别,整型值,范围从1~28。默认为最大
            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
          });
        });
      });
    }
    return Promise.resolve();
  },
  // 获取微信收货地址
  openAddress: function (callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        jweixin.ready(function () {
          jweixin.openAddress({
            success: function (res) {
              callback(res);
            },
            fail: function (err) {
              callback(err);
            }
          });
        });
      });
    }
  },
  // 微信扫码
  scanQRCode: function (callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        // jweixin.ready(function () {
        //   jweixin.scanQRCode({
        //     needResult: 1, // 0:微信处理|1:返回扫描结果
        //     scanType: ['qrCode', 'barCode'],
        //     success: function (res) {
        //       const durl = /https:\/\/([^\/]+)\//i;
        //       let domain;
        //       res.resultStr.replace(durl, (e) => {
        //         domain = e;
        //       });
        //       callback(res);
        //     },
        //     fail: function (err) {
        //       callback(err);
        //     }
        //   });
        // });
      });
    }
  },
  // 选择图片
  chooseImage: function (callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        jweixin.ready(function () {
          jweixin.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: function (res) {
              callback(res);
            }
          });
        });
      });
    }
  },
  // 微信支付
  wxpay: function (data, callback) {
    if (this.isWechat()) {
      this.initJssdk(function (init) {
        jweixin.ready(function () {
          jweixin.chooseWXPay({
            timestamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: function (res) {
              callback(res);
            },
            cancel: function (res) {
              callback(res);
            },
            fail: function (err) {
              callback(err);
            }
          });
        });
      });
    }
  },
  // 微信支付 另一种方式
  wxpayBridge: function (data, callback) {
    if (this.isWechat()) {
      // this.initJssdk(function (init) {
      //   jweixin.ready(function () {
      //     WeixinJSBridge.invoke(
      //       'getBrandWCPayRequest',
      //       {
      //         appId: data.appId,
      //         timeStamp: data.timeStamp,
      //         nonceStr: data.nonceStr,
      //         package: data.package,
      //         signType: 'MD5',
      //         paySign: data.paySign
      //       },
      //       function (res) {
      //         callback(res);
      //       }
      //     );
      //   });
      // });
    }
  }
};
