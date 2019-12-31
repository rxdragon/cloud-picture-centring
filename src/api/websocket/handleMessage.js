import { eventEmitter } from '@/plugins/eventemitter.js' // ui布局
import { MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'
import * as SessionTool from '@/utils/sessionTool'
import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default function handleMessage (data) {
  // 调试
  // data.typeName = 'StreamRetoucherReceive'
  // data.streamId = '4290380'
  if (!data.typeName) return
  const { typeName } = data
  switch (typeName) {
    // 门店退单
    case 'StreamPhotographerOrgReturn':
      break
    // 审核退单
    case 'StreamReviewerReturn':
      break
    // 修片师接单
    case 'StreamRetoucherReceive':
      getRetouchStream(data)
      break
    // 审核人接单
    case 'StreamReviewerReceive':
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
  if (!SessionTool.getSureRetouchOrder(streamId)) {
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
      // SessionTool.saveSureRetouchOrder(streamId)
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
}
