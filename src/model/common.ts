export interface UploadReq {
  file: string;
}

export interface UploadRes {
  url: string;
}

export interface UserInfoRes {
  avatar: string;
  classId: string | number;
  from: string;
  id: string | number;
  openId: string;
  operator: string;
  password: string;
  phone: string;
  role: string | number;
  roleLevel: string | number;
  salt: string;
  schoolIds: (string | number)[];
  studentId: string | number;
  teacherType: string | number;
  unionId: string | number;
  userId: string | number;
  userName: string;
}

export interface GetJsApiTicketRes {
  debug?: string;
  appId: string;
  jsApiTicket: string;
  nonceStr: string;
  signature: string;
  timestamp: string;
  url: string;
  jsApiList?: [];
}

export interface CheckUserSubscribeRes {
  subscribe: string;
  subscribeTime: string;
}

export interface MinaAuthReq {
  avatar?: string;
  code: string;
  nickName?: string;
  sex?: string;
}

export interface MinaAuthRes {
  token: string;
}

export interface Login4PhoneReq {
  code: string;
  phone: string;
}

export interface Login4PhoneRes {
  token: string;
}
