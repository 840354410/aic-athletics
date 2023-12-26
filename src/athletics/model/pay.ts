export interface DoPayReq {
  businessIds: (string | number)[];
  // 1是h5，2是小程序
  platform?: string | number;
}
