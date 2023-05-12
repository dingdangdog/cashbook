import { createApp } from 'vue';
import App from './App.vue';

import ElementPlus from 'element-plus';

import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

import 'element-plus/dist/index.css';
// 如果只想导入css变量
import 'element-plus/theme-chalk/dark/css-vars.css'

createApp(App).use(ElementPlus, { locale: zhCn }).mount('#app')
