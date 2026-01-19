import { createApp } from 'vue';
import App from './App.vue';
import { createVSchemaPlugin } from '../src';

const app = createApp(App);

// 安装 VSchema 插件
app.use(createVSchemaPlugin({
  // 全局配置
  baseURL: 'https://jsonplaceholder.typicode.com',
  responseDataPath: '', // JSONPlaceholder 直接返回数据
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  // 请求拦截器
  requestInterceptor: (config) => {
    console.log('[请求拦截器]', config.method, config.url);
    return config;
  },
  // 响应拦截器
  responseInterceptor: (response) => {
    console.log('[响应拦截器]', response);
    return response;
  },
  // 错误拦截器
  errorInterceptor: (error) => {
    console.error('[错误拦截器]', error);
    return Promise.reject(error);
  }
}));

app.mount('#app');
