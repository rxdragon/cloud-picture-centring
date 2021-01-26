import Vue from 'vue'
import App from './App.vue'
import store from '../src/store' // vuex
import get from 'lodash/get'
import * as filters from '../src/filters' // 全局过滤器

import { ipcRenderer } from 'electron'

import '../src/styles/index.less' // 字体
import '../src/styles/variables.less' // 全局样式

import '../src/plugins/element.js' // ui布局
import initIndexDb from '../src/indexDB/index.js'

initIndexDb(false)
  .then(() => {
    window._ = { get }
    Vue.prototype.$ipcRenderer = ipcRenderer

    // 注入全局过滤器
    Object.keys(filters).forEach(key => {
      Vue.filter(key, filters[key])
    })

    window.polling = {}

    new Vue({
      store,
      render: h => h(App)
    }).$mount('#app')
  })

