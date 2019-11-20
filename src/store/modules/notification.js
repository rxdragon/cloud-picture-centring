import * as Retoucher from '@/api/retoucher.js'
import * as LogStream from '@/api/logStream'
import * as SessionTool from '@/utils/sessionTool.js'
import { MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'

const state = {
  hasReturnStream: false, // 是否有重修订单
  returnStreamId: '', // 重修流水id
  showAnniversary: false // 是否显示通知栏
}

const mutations = {
  SET_RETURN_STREAM: (state) => {
    state.hasReturnStream = true
  },
  SET_RETURN_STREAM_ID: (state, id) => {
    state.returnStreamId = id
  },
  CLEAR_RETURN_STREAM_ID: (state) => {
    state.returnStreamId = ''
  },
  SET_SHOW_ANNIVERSARY: (state, data) => {
    state.showAnniversary = data
  }
}

const actions = {
  // 查询订单
  hasReturnNotification ({ commit }) {
    return new Promise(async (resolve, reject) => {
      const data = await Retoucher.haveReworkStream()
      if (data && !SessionTool.getReturnRetouchOrder(data)) {
        MessageBox.confirm('您有新的重修流水，为免影响沙漏时间请及时处理。', '', {
          confirmButtonText: '现在处理',
          cancelButtonText: '稍后处理',
          type: 'warning',
          closeOnPressEscape: false,
          center: true
        }).then(() => {
          SessionTool.saveReturnRetouchOrder(data)
          commit('SET_RETURN_STREAM_ID', data)
          if (router.app.$route.name !== 'WaitRetoucher') {
            router.push({
              path: '/retoucher-center'
            })
          }
        }).catch(() => {
          SessionTool.saveReturnRetouchOrder(data)
        }).finally(() => {
          LogStream.retoucherRebuildOk(+data)
          store.dispatch('notification/pollingHasReturn')
        })
      } else {
        store.dispatch('notification/pollingHasReturn')
      }
      resolve()
    })
  },
  // 轮询是够有退单
  pollingHasReturn ({ commit }) {
    clearTimeout(window.polling.haveRework)
    window.polling.haveRework = null
    window.polling.haveRework = setTimeout(() => {
      store.dispatch('notification/hasReturnNotification')
    }, 3000)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
