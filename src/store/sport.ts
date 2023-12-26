export interface SportStore {
  joinCode: string | number;
}

import { defineStore } from 'pinia';
export const useSportStore = defineStore('sport', {
  // state: 返回对象的函数
  state: (): SportStore => ({
    joinCode: ''
  }),
  getters: {},
  actions: {}
});
