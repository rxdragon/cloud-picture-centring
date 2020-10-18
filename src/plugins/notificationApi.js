import Vue from 'vue'
import store from '@/store/index'
import * as uuid from 'uuid'


import { NOTIFY_STATUS } from '@/utils/enumerate'


/**
 * @description 获取权限
 */
async function getPermission () {
  if(!('Notification' in window)) {
    console.log('不存在')
    Vue.prototype.$newMessage.warning('请使用Chrome浏览器或升级Chrome浏览器')
    return false
  }
  const status = await Notification.requestPermission()
  console.log(status)
  store.commit('setting/SET_NOTIFY_STATUS', status)
  return status === NOTIFY_STATUS.GRANTED
}


// 初始化权限
async function initNotification () {
  const permission = await getPermission()
  if (!permission) {
    Vue.prototype.$notification = () => {
      Vue.prototype.$newMessage.warning('请开启通知权限')
    }
  } else {
    Vue.prototype.$notification = ({ title, body, icon, clickCB }) => {
      const options = {
        body,
        tag: uuid.v4(),
        icon,
        requireInteraction: true //表示通知应保持有效，直到用户点击或关闭它，而不是自动关闭。默认值为false。 
      } 
      const notification = new Notification(title, options)
      notification.onclick = clickCB ? clickCB : (event) => {
        window.focus()
        event.target.close()
      }
      notification.onshow = (event) => {
        console.warn(`${event.target.title}`, 'onshow')
      }
      notification.onerror = (event) => {
        console.log(`${event.target.title}`, 'onerror')
      }
      notification.onclose = (event) => {
        console.error(`${event.target.title}`, 'onclose')
      }
      return notification
    }
  }
}

initNotification()