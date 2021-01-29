import Vue from 'vue'
import { eventEmitter } from '@/plugins/eventemitter.js' // ui布局
import { MessageBox } from 'element-ui'
import { timeFormat } from '@/utils/index.js'
import { ipcRenderer } from 'electron'
import store from '@/store'
import router from '@/router'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool'
import * as RetoucherCenter from '@/api/retoucherCenter.js'
import * as UserApi from '@/api/user'

import errorPng from '@/assets/error.png'
import photocount from '@/assets/photocount.png'

export default function handleMessage (data, chat) {
  if (!data.typeName) return
  const { typeName, typeMessage } = data
  switch (typeName) {
    // 门店退单
    case 'StreamPhotographerOrgReturn':
      getReturnStream(typeMessage, typeName)
      break
    // 审核退单
    case 'StreamReviewerReturn':
      getReturnStream(typeMessage, typeName)
      break
    // 修片师接单
    case 'StreamRetoucherReceive':
      getRetouchStream(typeMessage)
      break
    // 审核人接单
    case 'StreamReviewerReceive':
      getReviewerReceive()
      break
    case 'StaffOffline':
      setStaffOffline()
      break
    case 'BeforeLogout':
      logoutApp()
      break
    default:
      break
  }
}

/**
 * @description 修图是接到订单
 */
async function getRetouchStream (data) {
  // 接到订单
  const { streamId } = data
  if (SessionTool.getSureRetouchOrder(streamId)) return
  await RetoucherCenter.exitQueue()

  // 桌面通知
  const notificationMsg = '你有新的订单请及时处理'
  const notificationData = {
    title: notificationMsg,
    icon: photocount
  }
  Vue.prototype.$notification(notificationData)

  eventEmitter.emit('getRetouchStream')
  MessageBox.confirm('', '你有新的订单请及时处理', {
    confirmButtonText: '确定',
    center: true,
    type: 'warning',
    showCancelButton: false,
    closeOnPressEscape: false,
    showClose: false,
    closeOnClickModal: false
  }).then(() => {
    SessionTool.saveSureRetouchOrder(streamId)
    store.commit('notification/SET_RETOUCH_STREAM_ID', streamId)
    const nowRouterName = router.app.$route.name
    if (nowRouterName !== 'WaitRetoucher') {
      router.push({
        path: '/retoucher-center',
        query: { aid: streamId }
      })
    }
  })
}

/**
 * @description 退单通知
 */
async function getReturnStream (data, type) {
  const { streamId, hourglass = {} } = data
  if (SessionTool.getReturnRetouchOrder(streamId)) return
  const returnMessageText = type === 'StreamReviewerReturn'
    ? '您有新的重修流水，未免影响沙漏时间请及时处理。'
    : '您当前有门店退回订单需要处理，未免影响顾客取片时间请及时处理。'

  // 桌面通知
  const notificationMsg = type === 'StreamReviewerReturn'
    ? '您有新的重修流水，未免影响沙漏时间请及时处理。'
    : '您有门店退回流水需要处理'
  
  // 处理沙漏时间显示
  const residueTime = Number(hourglass.green_time) + Number(hourglass.orange_time) // 剩余时间
  const overTime = Number(hourglass.over_time) // 超时时间
  const isOver = overTime > 0 || residueTime === 0 // 是否超时
  const residueTimeCN = timeFormat(residueTime, 'text')
  const overTimeCN = timeFormat(overTime, 'text')

  const notificationData = {
    title: notificationMsg,
    body: isOver ? `沙漏超时时间：${overTimeCN}` : `沙漏剩余时间：${residueTimeCN}`,
    icon: errorPng
  }
  Vue.prototype.$notification(notificationData)

  try {
    await MessageBox.confirm(returnMessageText, '', {
      confirmButtonText: '现在处理',
      cancelButtonText: '稍后处理',
      type: 'warning',
      closeOnPressEscape: false,
      center: true
    })
    store.commit('notification/SET_RETOUCH_STREAM_ID', streamId)
    if (router.app.$route.name !== 'WaitRetoucher') {
      router.push({ path: '/retoucher-center' })
    }
  } finally {
    SessionTool.saveReturnRetouchOrder(streamId)
    LogStream.retoucherRebuildOk(+streamId)
  }
}

/**
 * @description 审核人接到订单
 */
async function getReviewerReceive () {
  
  // 桌面通知
  const notificationMsg = '你有新的审核订单请及时处理'
  const notificationData = {
    title: notificationMsg
  }
  Vue.prototype.$notification(notificationData)

  eventEmitter.emit('getReviewerReceive')
}

/**
 * @description 设置下线
 */
function setStaffOffline () {
  store.dispatch('user/setUserlineState', 'offline')
}

/**
 * @description 退出
 */
function logoutApp () {
  const autoLogout = async () => {
    try {
      await UserApi.logout()
    } finally {
      ipcRenderer.sendSync('close-app')
    }
  }
  setTimeout(() => {
    autoLogout()
  }, 1 * 30 * 1000)
  MessageBox.confirm('', '在其他地方登录系统，30s后自动关闭app', {
    confirmButtonText: '确定',
    center: true,
    type: 'warning',
    showCancelButton: false,
    closeOnPressEscape: false,
    showClose: false,
    closeOnClickModal: false
  }).then(() => {
    autoLogout()
  })

}
