export interface BaseResponse<T> {
  bizData: T;
  defaultErrCode: number;
  errCode: number;
  extraData: object;
  msg: string;
  rtnCode: string;
  sessionId: string;
  success: boolean;
  ts: number;
}
