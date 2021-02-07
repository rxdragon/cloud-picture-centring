import Vue from 'vue'
import Element from 'element-ui'
import { newMessage } from '@/utils/message'
import newNotification from './notification'
import './individuation-element-ui/index.css' // ui 主题
import './individuation-element-ui/elementChangeUi.less' // 个性话主题

Vue.use(Element)
// 重制顶部量
Vue.prototype.$newMessage = newMessage
Vue.prototype.$newNotification = newNotification
