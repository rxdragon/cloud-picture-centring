import Vue from 'vue'
import App from './App.vue'
import store from '../src/store' // vuex
import get from 'lodash/get'

import '../src/styles/index.less' // 字体
import '../src/styles/variables.less' // 全局样式

window._ = { get }

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
