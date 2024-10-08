import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 读取环境变量
const env = loadEnv('', process.cwd())
// https://vitejs.dev/config/
export default defineConfig({
  base: env.VITE_APP_BASE_URL || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 本服务暴露的端口
    host: '127.0.0.1',
    port: 9090,
    // 跨域配置
    proxy: {
      // /api相关接口跨域配置
      '/api': {
        //实际请求地址
        target: 'http://127.0.0.1:13303',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
