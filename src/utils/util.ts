import { delay, formatDate, getCurrentPage, getRect, wechat } from '@/utils/index';
import { BaseResponse } from '@/model/BaseResponse';
// #ifdef H5
import html2canvas from 'html2canvas';
// #endif
// #ifdef MP-WEIXIN
import Wxml2Canvas from 'wxml2canvas';
// #endif
export const __hasOwnProp = Object.prototype.hasOwnProperty;

// AOP切面编程before函数
export function before(fn, beforeFn) {
  return function (this: any, ...args: any[]) {
    beforeFn.apply(this, args);
    return fn.apply(this, args);
  };
}
// AOP切面编程after函数
export function after(fn, afterFn) {
  return function (this: any, ...args: any[]) {
    const ret = fn.apply(this, args);
    afterFn.apply(this, args);
    return ret;
  };
}

export function removeElementAt(arr: [], index: number) {
  // 确保 index 在有效范围内
  if (index < 0 || index >= arr.length) {
    return arr; // 如果 index 无效，返回原数组
  }

  // 使用 slice 创建一个新数组，排除要删除的元素
  return arr.slice(0, index).concat(arr.slice(index + 1));
}

export function setStatisticList(
  bizData: object,
  statisticList: StatisticItem[],
  options = {
    valueKey: 'value',
    emptyValue: 0
  }
) {
  const valueKey = options?.valueKey || 'value';
  const emptyValue = options?.emptyValue || 0;
  if (bizData) {
    statisticList.forEach((item) => {
      if (!item.key) {
        return;
      }
      if (__hasOwnProp.call(bizData, item.key)) {
        item[valueKey] = bizData[item.key];
      } else {
        item[valueKey] = emptyValue;
      }
    });
  } else {
    statisticList.forEach((item) => {
      item[valueKey] = emptyValue;
    });
  }
  return statisticList;
}

export function getDateStrs(startDate, endDate, fmt = 'YYYY-MM-DD HH:mm') {
  const startStr = formatDate(startDate, fmt);
  const endStr = formatDate(endDate, fmt);
  if (startStr === endStr) {
    return startStr;
  }
  return startStr + '至' + endStr;
}

export function amend(num1: string | number, num2: string | number, symbol) {
  num1 = Number(num1);
  num2 = Number(num2);
  const str1 = num1.toString(),
    str2 = num2.toString();
  let result, str1Length, str2Length;
  //解决整数没有小数点方法
  try {
    str1Length = str1.split('.')[1].length;
  } catch (error) {
    str1Length = 0;
  }
  try {
    str2Length = str2.split('.')[1].length;
  } catch (error) {
    str2Length = 0;
  }
  const step = Math.pow(10, Math.max(str1Length, str2Length));
  switch (symbol) {
    case '+':
      result = ((num1 * step + num2 * step) / step).toFixed(2);
      break;
    case '-':
      result = ((num1 * step - num2 * step) / step).toFixed(2);
      break;
    case '*':
      result = ((num1 * step * (num2 * step)) / step / step).toFixed(2);
      break;
    case '/':
      result = ((num1 * step) / (num2 * step)).toFixed(2);
      break;
    default:
      break;
  }
  return result;
}

export function customShowToast(res: BaseResponse<unknown>, msg?: string) {
  msg = msg || res.msg;
  if (res.success && msg) {
    setTimeout(() => {
      uni.$u.toast(msg);
    }, 0);
  }
}

export function showModal(content) {
  uni.showModal({
    title: '提示',
    content,
    showCancel: false
  });
}

export function clearObject(obj) {
  Object.keys(obj).forEach((key) => delete obj[key]);
}

export function getCurrentUrl(addQuery?) {
  const page = getCurrentPage() as {
    route: string;
    $page: {
      options: object;
    };
  };
  if (!page) {
    return '';
  }
  let url = '/' + page.route;
  const query = page.$page.options || {};
  if (addQuery && typeof addQuery == 'object') {
    Object.assign(query, addQuery);
  }
  const queryArr: string[] = [];
  Object.keys(query).forEach((item) => {
    if (String(query[item]) !== 'NaN') {
      queryArr.push(`${item}=${query[item]}`);
    }
  });
  if (queryArr.length) {
    url += '?' + queryArr.join('&');
  }
  return url;
}
export function getCurrentFullUrl(addQuery?) {
  return location.origin + getCurrentUrl(addQuery);
}

export function getImageTempPath(url, callBack?): Promise<string> {
  if (!url) {
    return Promise.resolve('');
  }
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      // 根据地址下载并存为临时路径
      src: url,
      success: (res) => {
        resolve(res.path);
        callBack && callBack(res);
      }
    });
  });
}

export function base64ToBlob(code) {
  const parts = code.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]); // 解码base64得到二进制字符串
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength); // 创建8位无符号整数值的类型化数组
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i); // 数组接收二进制字符串
  }
  return new Blob([uInt8Array], { type: contentType });
}
export function downLoadFile(url) {
  if (!url) {
    return;
  }
  if (url.indexOf(';base64,') > -1) {
    const aLink = document.createElement('a');
    const blob = base64ToBlob(url); // new Blob([content]);
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', true, true); // initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    aLink.download = '邀请码';
    aLink.href = URL.createObjectURL(blob);
    // aLink.dispatchEvent(evt);
    aLink.click();
  } else {
    const a = document.createElement('a');
    url = url + '?response-content-type=application/octet-stream'; // 支持跨域下载
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.setAttribute('download', '邀请码');
    a.click(); // 点击下载
    document.body.removeChild(a); // 下载完成移除元素
  }
}

interface GenerateImageOptions {
  canvasId?: string;
  drawElemClass?: string;
}
export function generateImage(drawboxRefElem, options?: GenerateImageOptions): Promise<string> {
  options = Object.assign(
    {
      canvasId: 'shareCanvas',
      drawElemClass: 'canvas-wrap'
    },
    options || {}
  );
  const { canvasId, drawElemClass } = options;
  let task = Promise.resolve('');
  // #ifdef H5
  task = new Promise((resolve, reject) => {
    const inviteRef = drawboxRefElem as unknown as {
      $el: HTMLDivElement | null;
    };
    const elem = inviteRef?.$el as HTMLDivElement | null;
    if (!elem) {
      return;
    }
    const width = elem.scrollWidth; //获取dom 宽度
    const height = elem.scrollHeight; //获取dom 高度
    const canvas = document.createElement('canvas'); //创建一个canvas节点
    const scale = 2; //定义任意放大倍数 支持小数
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.scale(scale, scale); //获取context,设置scale
    html2canvas(elem, { useCORS: true }).then((canvas) => {
      const url = canvas.toDataURL();
      resolve(url);
    });
  });
  // #endif
  // #ifdef MP-WEIXIN
  task = new Promise((resolve, reject) => {
    const systemInfo = uni.getSystemInfoSync();
    const devicePixelRatio = systemInfo.pixelRatio;
    const drawImage = new Wxml2Canvas({
      element: canvasId,
      progress(percent) {
        // 绘制进度
      },
      async finish(url) {
        resolve(url);
      },
      error: (err) => {
        reject(err);
      }
    });
    const data = {
      // 获取wxml数据
      list: [
        {
          type: 'wxml',
          class: `.${drawElemClass} .draw`,
          limit: `.${drawElemClass}`,
          x: 0,
          y: 0
        }
      ]
    };
    // 绘制canvas
    drawImage.draw(data);
  });
  // #endif

  return task;
}

export function pxToRpx(px) {
  // 获取设备宽度
  const screenWidth = uni.getSystemInfoSync().windowWidth;
  // 计算转换后的rpx值
  const rpx = px * (375 / screenWidth) * 2;
  return rpx;
}

export function setObjectOwnProperty(obj: object, bizData: object) {
  for (const key in obj) {
    if (__hasOwnProp.call(bizData, key)) {
      obj[key] = bizData[key];
    }
  }
}

export function getIsImg(url): boolean {
  if (!url) {
    return false;
  }
  const index = url.lastIndexOf('.');
  const ext = url.substring(index + 1);
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff', 'heic'].indexOf(ext.toLowerCase()) !== -1;
}

export function createLowercasePropertyProxy<
  T extends {
    [propName: string]: any;
  }
>(target: T): T {
  return new Proxy(target, {
    get: (obj, prop) => {
      if (__hasOwnProp.call(obj, prop)) {
        return obj[prop as string];
      }
      let propertyName = prop as string;
      if (typeof prop === 'string') {
        propertyName = (prop as string).toLowerCase();
      }
      return obj[propertyName];
    }
  });
}

export async function getCalcHeight(elem1, elem2, delayTime, num = 0) {
  if (delayTime === undefined) {
    // #ifdef H5
    delayTime = 800;
    // #endif
    // #ifndef H5
    delayTime = 0;
    // #endif
  }
  await delay(delayTime);
  const elem1Rect = getRect(elem1);
  const elem2Rect = getRect(elem2);
  return new Promise((resolve, reject) => {
    Promise.all([elem1Rect, elem2Rect]).then((res) => {
      const r = res as {
        top: number;
        height: number;
      }[];
      if (r[0] && r[1]) {
        const value = r[1].top - r[0].top - r[0].height + num + 'px';
        resolve(value);
      }
    });
  });
}
export function removeNonNumericCharacters(inputString) {
  // 使用正则表达式替换非数字字符为空字符串
  return inputString.replace(/[^0-9]/g, '');
}

export function setUserInfo(userInfo, bizData) {
  userInfo = Object.assign(userInfo || {}, bizData);
  userInfo.avatar = userInfo.avatar || '';
  return userInfo;
}

export function getWxLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      success(res) {
        if (res.code) {
          resolve(res.code);
        } else {
          reject();
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

export function getPlatform(): string {
  const platform = process.env.UNI_PLATFORM;
  return platform || '';
}
export function getPlatformVal() {
  const platform = getPlatform();
  const map = {
    h5: 1,
    'mp-weixin': 2
  };
  return map[platform] || '';
}
export function getIsH5() {
  const platform = getPlatform();
  return platform === 'h5';
}

export function doPaySuccess(res) {
  // #ifdef H5
  const bizData = res?.bizData;
  if (!bizData) {
    return;
  }
  document.write(bizData);
  // #endif
  // #ifdef MP-WEIXIN
  console.log(res);
  // #endif
}

export function getCanvasToTempFilePath(canvasId): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId,
      fileType: 'png', //设置图片类型，否则图片无背景色
      success: function (res) {
        resolve(res.tempFilePath);
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

export function getUParseTagStyle() {
  return {
    table: 'border-collapse: collapse;',
    td: 'border: 1px solid #ccc;padding: 3px 5px;'
  };
}
