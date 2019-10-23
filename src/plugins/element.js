import Vue from 'vue'
import Element from 'element-ui'
import './individuation-element-ui/index.css' // ui 主题
import './individuation-element-ui/elementChangeUi.less' // 个性话主题

Vue.use(Element)
// 重制顶部量
Vue.prototype.$newMessage = (params) => {
  let newParams = { ...params, ...{ offset: 62 } }
  Vue.prototype.$message(newParams)
}

['success', 'warning', 'info', 'error'].forEach(type => {
  Vue.prototype.$newMessage[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    options.type = type
    return Vue.prototype.$newMessage(options)
  }
})
