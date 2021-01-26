import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'
import App from './App.vue'
import router from './router' // 路由
import store from './store' // vuex
import * as filters from './filters' // 全局过滤器

import { ipcRenderer } from 'electron'
import { eventEmitter } from './plugins/eventemitter.js' // ui布局
import { delayLoading } from '@/utils/timespan.js' // ui布局

import './plugins/element.js' // ui布局
import './plugins/charts.js' // charts框架
import './plugins/notificationApi.js' // charts框架
import './plugins/errorLogSdk.js' // 错误日志监控
import './plugins/icon-font/iconfont.css' // ui布局
import './styles/font.less' // 全局样式
import './styles/index.less' // 字体
import './styles/variables.less' // 全局样式
import './guards' // 路由守护
import './indexDB/index.js'
import '@/directive'

window._ = { get, cloneDeep }
// 注册websocket
Vue.prototype.$eventEmitter = eventEmitter
Vue.prototype.$delayLoading = delayLoading

// 注入全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 派发中心
Vue.prototype.$bus = new Vue()

window.polling = {}
Vue.prototype.$ipcRenderer = ipcRenderer
Vue.prototype.$isDev = !process.env.VUE_APP_LOGIN_API.includes('k8s')

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
