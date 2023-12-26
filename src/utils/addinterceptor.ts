const routerLinkArr = ['navigateTo', 'redirectTo', 'reLaunch'];
export function getAuthUrl(url) {
  if (!url) {
    return '';
  }
  let [res, search] = url.split('?');
  if (search) {
    let arr = search.split('&');

    arr.sort((a, b) => {
      // 提取键（以等号分隔）并比较其 ASCII 值
      const keyA = a.split('=')[0];
      const keyB = b.split('=')[0];
      return keyA.localeCompare(keyB);
    });

    arr = arr.map((item) => {
      if (!item) {
        return;
      }
      let param;
      const [key, value] = item.split('=');
      if (key) {
        param = key.toLowerCase();
      }
      if (value) {
        param += '=' + value;
      }
      return param;
    });
    search = arr.join('&');
  }
  if (search) {
    res += '?' + search;
  }
  return res;
}
export function addRouterLinkinterceptor() {
  routerLinkArr.forEach((item) => {
    uni.addInterceptor(item, {
      invoke(args) {
        args.url = getAuthUrl(args.url);
      },
      success(...args) {},
      fail(err) {},
      complete(...args) {}
    });
  });
}
