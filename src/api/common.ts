import http from '@/http/HttpClient';
import { BaseResponse } from '@/model/BaseResponse';
import {
  UploadReq,
  UploadRes,
  UserInfoRes,
  GetJsApiTicketRes,
  CheckUserSubscribeRes,
  MinaAuthReq,
  MinaAuthRes,
  Login4PhoneReq,
  Login4PhoneRes
} from '@/model/common';
import { getToken, getBaseUrl } from '@/utils/index';
const formDataConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
export function uploadApi(data: UploadReq): Promise<BaseResponse<UploadRes>> {
  return http.post('sport/common/upload', data, formDataConfig);
}
export function customUploadApi(url, file: FileItem): Promise<BaseResponse<UploadRes>> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: getBaseUrl() + url,
      filePath: file.url,
      name: 'file',
      header: {
        Authorization: getToken()
      },
      formData: {
        name: file.name,
        key: file.name
      },
      success: function (res) {
        if (res.data) {
          try {
            resolve(JSON.parse(res.data));
          } catch (e) {
            console.log(e);
          }
        }
      },
      fail: function (errMsg) {
        uni.$u.toast('上传失败');
        reject();
      },
      complete() {}
    });
  });
}
export function requestVerifyCodeApi(phone): Promise<BaseResponse<undefined>> {
  return http.post('sport/common/requestVerifyCode', {
    phone
  });
}
export function verifyCodeApi(phone, code): Promise<BaseResponse<undefined>> {
  return http.post('sport/user/verifyCode', {
    phone,
    code
  });
}
export function userInfoApi(): Promise<BaseResponse<UserInfoRes>> {
  return http.get('sport/user/userInfo');
}

export function verifyCodeAndGetUserInfoApi(params): Promise<BaseResponse<UserInfoRes> | null> {
  const p1: Promise<BaseResponse<undefined>> = http.post('sport/user/verifyCode', params);
  return p1.then((res) => {
    if (res.success) {
      return userInfoApi();
    } else {
      return null;
    }
  });
}

export function authApi(): Promise<BaseResponse<undefined>> {
  return http.get('sport/auth');
}
export function authV2Api(redirectUrl): Promise<BaseResponse<undefined>> {
  return http.get('sport/auth/v2', {
    params: {
      redirectUrl
    }
  });
}

export function minaAuthApi(params: MinaAuthReq): Promise<BaseResponse<MinaAuthRes>> {
  return http.post('sport/minaAuth/login', params);
}

export function downloadFileApi(fileUrl): Promise<{
  bizData: string;
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/sport/file/downloadFile', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', token);
    }
    xhr.responseType = 'arraybuffer'; // 设置响应类型为arraybuffer，接收二进制数据
    xhr.send(JSON.stringify({ fileUrl, fileName: `file${new Date().getTime()}.png` }));
    xhr.onload = function () {
      if (xhr.status === 200) {
        const arrayBuffer = xhr.response; // 获取到二进制数据
        // 在这里进行下一步处理
        const imageType = xhr.getResponseHeader('Content-Type') as string;
        const blob = new Blob([arrayBuffer], { type: imageType }); // 将arraybuffer转换成Blob对象
        const img = new Image();
        img.src = URL.createObjectURL(blob); // 创建图片对象，设置其src为Blob对象的URL
        img.onload = function () {
          // URL.revokeObjectURL(img.src); // 释放Blob对象的URL
          if (img.src) {
            const bizData = img.src as string;
            resolve({
              bizData
            });
          }
        };
      }
    };
  });
}
export function getJsApiTicketApi(url): Promise<BaseResponse<GetJsApiTicketRes>> {
  const data = {
    url
  };
  return http.post('sport/auth/getJsApiTicket', data, formDataConfig);
}

export function checkUserSubscribeApi(): Promise<BaseResponse<CheckUserSubscribeRes>> {
  let task;
  // #ifdef H5
  task = http.get('sport/auth/checkUserSubscribe');
  // #endif
  // #ifndef H5
  task = Promise.resolve();
  // #endif
  return task;
}
export function uploadAvatarApi(avatar): Promise<BaseResponse<undefined>> {
  const data = {
    avatar
  };
  return http.post('sport/user/uploadAvatar', data);
}

export function bindPhoneApi(code): Promise<BaseResponse<undefined>> {
  const data = {
    code
  };
  return http.post('sport/minaAuth/bindPhone', data, formDataConfig);
}
export function login4PhoneApi(params: Login4PhoneReq): Promise<BaseResponse<Login4PhoneRes>> {
  return http.post('sport/user/login4Phone', params);
}
export function logoutApi(): Promise<BaseResponse<undefined>> {
  return http.get('sport/user/logout');
}
