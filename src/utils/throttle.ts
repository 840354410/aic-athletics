/**
 * 节流原理：在一定时间内，只能触发一次
 *
 * @param {Function} func 要执行的回调函数
 * @param {Number} wait 延时的时间
 * @param {Boolean} immediate 是否立即执行
 * @return null
 */
export function throttle(func: (...any) => any, wait: number = 500, immediate: boolean = true, autoClear: boolean = true) {
  let timer: Nullable<number> | any = null; // 定时器
  let flag = false; // 定时器是否还在跑
  function throttlefunc(...args: any) {
    if (immediate) {
      if (!flag) {
        flag = true;
        // 如果是立即执行，则在wait毫秒内开始时执行
        typeof func === 'function' && func(...args);
        timer = setTimeout(() => {
          if (autoClear) {
            flag = false;
          }
        }, wait);
      }
    } else if (!flag) {
      flag = true;
      // 如果是非立即执行，则在wait毫秒内的结束处执行
      timer = setTimeout(() => {
        if (autoClear) {
          flag = false;
        }
        typeof func === 'function' && func(...args);
      }, wait);
    }
  }
  throttlefunc.clear = function () {
    flag = false;
  };
  return throttlefunc;
}

/**
 * 节流原理：在一定时间内，只能触发一次
 *
 * @param {Function} func 要执行的回调函数
 */
export function ajaxThrottle(func: (...any) => any) {
  return throttle(func, 500, true, false);
}

// ajaxThrottle是一般使用于请求节流，只有通过返回函数内置的clear方法来主动清除flag才能继续触发函数
// import { ajaxThrottle, delay } from '@/utils/index';
// const fn = ajaxThrottle(function () {
// });
// fn();
// await delay(1000);
// fn.clear();
// fn();
