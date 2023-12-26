import { wechat, getImageTempPath } from '@/utils/index';
import { downloadFileApi } from '@/api/common';
export function openLocation(options) {
  let task: Promise<any> = Promise.resolve();
  // #ifdef H5
  task = wechat.openLocation(options) || Promise.resolve();
  // #endif
  // #ifdef MP-WEIXIN
  uni.openLocation(options);
  // #endif
  return task;
}

export async function getCanvasDrawImage(url) {
  let task = Promise.resolve({
    bizData: ''
  });
  // #ifdef H5
  task = downloadFileApi(url);
  // #endif
  // #ifdef MP-WEIXIN
  const tempTask = await getImageTempPath(url);
  task = Promise.resolve({
    bizData: tempTask
  });
  // #endif
  return task;
}

export function getOrigin() {
  let origin = '';
  // #ifdef H5
  origin = location.origin;
  // #endif
  return origin;
}

export function showShareMenu(menus: any[] = ['shareAppMessage', 'shareTimeline']) {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    menus
  });
  // #endif
}
