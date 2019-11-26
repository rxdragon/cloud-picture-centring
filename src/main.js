import Vue from 'vue'
import App from './App.vue'
import router from './router' // 路由
import store from './store' // vuex
import './plugins/element.js' // ui布局
import './plugins/charts.js' // charts框架
import './plugins/icon-font/iconfont.css' // ui布局
import './styles/font.less' // 全局样式
import './styles/index.less' // 字体
import './styles/variables.less' // 全局样式
import * as filters from './filters' // 全局过滤器
import '@/directive'
import './guards' // 路由守护
import { ipcRenderer } from 'electron'
import lottie from 'lottie-web'

window.bodymovin = lottie
// 注入全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

window.polling = {}
Vue.prototype.$ipcRenderer = ipcRenderer
Vue.prototype.$isDev = !process.env.VUE_APP_LOGIN_API.includes('k8s')

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
