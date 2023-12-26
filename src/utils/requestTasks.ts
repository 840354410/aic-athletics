const promiseList: (() => Promise<any>)[] = [];
function start() {
  uni.showLoading({
    mask: true
  });
}
function add(promiseFunc) {
  promiseList.push(promiseFunc);
}
function execute(callback?, errCallBack?) {
  const executePromise = Promise.all(promiseList);
  executePromise
    .then(function (results) {
      uni.hideLoading();
      clear();
      callback && callback(results);
    })
    .catch((error) => {
      uni.hideLoading();
      clear();
      errCallBack && errCallBack(error);
    });
}
function clear() {
  promiseList.length = 0;
}
function end(...args) {
  execute(...args);
}
export const requestTasks = {
  promiseList,
  start,
  add,
  execute,
  clear,
  end
};
