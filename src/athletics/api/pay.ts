import http from '@/http/HttpClient';
import { BaseResponse } from '@/model/BaseResponse';
import { DoPayReq } from '@/athletics/model/pay';
import { getPlatformVal } from '@/utils/index';
const formDataConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
export function doPayApi(data: DoPayReq): Promise<BaseResponse<undefined>> {
  const platform = getPlatformVal();
  data.platform = platform;
  return http.post('sport/pay/doPay', data);
}
