import Vue from 'vue'
import App from './App.vue'
import store from '../src/store' // vuex
import get from 'lodash/get'

import { ipcRenderer } from 'electron'

import '../src/styles/index.less' // 字体
import '../src/styles/variables.less' // 全局样式

import '../src/plugins/element.js' // ui布局

window._ = { get }
Vue.prototype.$ipcRenderer = ipcRenderer

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
