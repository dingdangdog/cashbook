// 引入自定义样式
import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入ElementPlus
import ElementPlus from 'element-plus';
// 引入中文支持
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
// 引入ElementPlus-css
import 'element-plus/dist/index.css';
// 如果只想导入css变量
import 'element-plus/theme-chalk/dark/css-vars.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 应用ElementPlus
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
