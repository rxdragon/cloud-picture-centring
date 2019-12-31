import * as Retoucher from '@/api/retoucher.js'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool.js'
import { MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'

const state = {
  hasReturnStream: false, // 是否有重修订单
  retouchId: '', // 正在修图id
  showAnniversary: false // 是否显示通知栏
}

const mutations = {
  SET_RETURN_STREAM: (state) => {
    state.hasReturnStream = true
  },
  SET_RETOUCH_STREAM_ID: (state, id) => {
    state.retouchId = id
  },
  CLEAR_RETOUCH_STREAM_ID: (state) => {
    state.retouchId = ''
  },
  SET_SHOW_ANNIVERSARY: (state, data) => {
    state.showAnniversary = data
  }
}

const actions = {
  // 查询订单
  async hasReturnNotification ({ commit }) {
    const data = await Retoucher.haveReworkStream()
    const newReturnMsg = data.filter(item => {
      return !SessionTool.getReturnRetouchOrder(item.streamId)
    })
    if (!newReturnMsg.length) {
      store.dispatch('notification/pollingHasReturn')
      return
    }
    for (const returnMsg of newReturnMsg) {
      const { streamId, type } = returnMsg
      const returnMessageText = type === 'review_return_retouch'
        ? '您有新的重修流水，未免影响沙漏时间请及时处理。'
        : '您当前有门店退回订单需要处理，未免影响顾客取片时间请及时处理。'
      SessionTool.saveReturnRetouchOrder(streamId)
      try {
        MessageBox.confirm(returnMessageText, '', {
          confirmButtonText: '现在处理',
          cancelButtonText: '稍后处理',
          type: 'warning',
          closeOnPressEscape: false,
          center: true
        })
        commit('SET_RETOUCH_STREAM_ID', streamId)
        if (router.app.$route.name !== 'WaitRetoucher') {
          router.push({ path: '/retoucher-center' })
        }
      } catch (error) {
        console.error(error)
      } finally {
        LogStream.retoucherRebuildOk(+streamId)
      }
    }
    store.dispatch('notification/pollingHasReturn')
  },
  // 轮询是够有退单
  pollingHasReturn ({ commit }) {
    clearTimeout(window.polling.haveRework)
    window.polling.haveRework = null
    window.polling.haveRework = setTimeout(async () => {
      try {
        await store.dispatch('notification/hasReturnNotification')
      } catch {
        setTimeout(async () => {
          await store.dispatch('notification/pollingHasReturn')
        }, 17000)
      }
    }, 3000)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
