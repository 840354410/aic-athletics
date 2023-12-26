import { deepClone } from '@/utils/index';
import { PiniaPluginContext } from 'pinia';

export function persist({ store }: PiniaPluginContext) {
  // 暂存State
  let persistState = deepClone(store.$state);
  // 从缓存中读取
  const storageState = uni.getStorageSync(store.$id);
  if (storageState) {
    persistState = storageState;
  }
  store.$state = persistState;
  store.$subscribe(() => {
    // 在存储变化的时候将store缓存
    uni.setStorageSync(store.$id, deepClone(store.$state));
  });
}
