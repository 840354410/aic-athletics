module.exports = {
  '*.{js,ts,vue}': (files) => {
    // 过滤掉不需要 lint 的文件
    const filteredFiles = files.filter((file) => !file.endsWith('iconfont.js'));

    if (filteredFiles.length > 0) {
      return `eslint --fix --ext .js,.vue,.ts ${filteredFiles.join(' ')}`;
    }

    return null;
  }
};
