import Vue from 'vue'
import App from './App.vue'
import store from '../src/store' // vuex
import get from 'lodash/get'

window._ = { get }

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
