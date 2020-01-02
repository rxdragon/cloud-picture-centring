import { eventEmitter } from '@/plugins/eventemitter.js' // ui布局
import { MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool'
import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default function handleMessage (data) {
  data.typeName = 'StreamReviewerReceive'
  if (!data.typeName) return
  const { typeName } = data
  switch (typeName) {
    // 门店退单
    case 'StreamPhotographerOrgReturn':
      getReturnStream(data, typeName)
      break
    // 审核退单
    case 'StreamReviewerReturn':
      getReturnStream(data, typeName)
      break
    // 修片师接单
    case 'StreamRetoucherReceive':
      getRetouchStream(data)
      break
    // 审核人接单
    case 'StreamReviewerReceive':
      getReviewerReceive()
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
  const { streamId } = data
  if (SessionTool.getReturnRetouchOrder(streamId)) return
  const returnMessageText = type === 'StreamReviewerReturn'
    ? '您有新的重修流水，未免影响沙漏时间请及时处理。'
    : '您当前有门店退回订单需要处理，未免影响顾客取片时间请及时处理。'
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
  } catch (error) {
    console.error(error)
  } finally {
    SessionTool.saveReturnRetouchOrder(streamId)
    LogStream.retoucherRebuildOk(+streamId)
  }
}

/**
 * @description 审核人接到订单
 */
async function getReviewerReceive () {
  eventEmitter.emit('getReviewerReceive')
}
