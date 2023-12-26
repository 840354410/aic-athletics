export const config = {
  dev: {
    url: 'http://192.168.30.213:8083/',
    // url: 'http://192.168.40.5:8083/',
    appId: 'wxc7166474ceb8a677'
  },
  pro: {
    // url: "https://ainclass.qfudao.com/",
    url: 'https://sport.aicschool.cn', //正式服
    appId: 'wxc7166474ceb8a677'
  }
};
export const ENV: 'pro' | 'dev' = 'dev';
export const baseUrl = config[ENV].url;
export const proBaseUrl = config['pro'].url;

export function getBaseUrl() {
  const NODE_ENV = process.env.NODE_ENV;
  const UNI_PLATFORM = process.env.UNI_PLATFORM;
  if (UNI_PLATFORM === 'h5') {
    // h5
    return '/api';
  } else {
    // 小程序
    if (NODE_ENV == 'development') {
      if (ENV == 'pro') {
        return baseUrl + '/api';
      }
      return baseUrl;
    } else {
      return proBaseUrl;
    }
  }
}
