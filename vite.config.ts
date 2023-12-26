import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import h5ProdEffectPlugin from 'uni-vite-plugin-h5-prod-effect';

import { baseUrl } from './src/utils/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    uni(),
    // 对h5 production环境打包时的特殊处理，否则uni-crazy-router在这个环境会异常
    h5ProdEffectPlugin(),
    Unocss(),
    AutoImport({
      imports: ['vue', 'uni-app', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/store'],
      eslintrc: {
        enabled: true,
        globalsPropValue: true
      }
    })
  ],
  server: {
    port: 82,
    host: '0.0.0.0',
    open: false,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '^/api/.*': {
        // target: 'http://localhost:8083', // 本地
        target: baseUrl, // 正式
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
