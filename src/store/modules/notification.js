import * as Retoucher from '@/api/retoucher.js'
import * as SessionTool from '@/utils/sessionTool.js'
import { MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'

const state = {
  hasReturnStream: false,
  returnStreamId: ''
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
  }
}

const actions = {
  // 查询订单
  hasReturnNotification ({ commit }) {
    return new Promise(async (resolve, reject) => {
      let data
      try {
        data = await Retoucher.haveReworkStream()
      } catch (error) {
        store.dispatch('notification/pollingHasReturn')
      }
      if (data && !SessionTool.getReturnRetouchOrder(data)) {
        MessageBox.confirm('您有新的重修流水，未免影响沙漏时间请及时处理。', '', {
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
