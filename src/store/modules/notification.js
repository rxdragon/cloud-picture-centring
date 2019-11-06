import * as Retoucher from '@/api/retoucher.js'
import * as Notification from '@/api/notification.js'
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
  },
  // 获取周年起通知
  getAnniversary ({ commit }) {
    return new Promise(async (resolve, reject) => {
      try {
        const startTime = 1573488000000 // 11月12号00:00:00
        const midTime = 1573574399000 // 11月12号23:59:59
        const endTime = 1573660799000 // 11月13号23:59:59
        const nowTime = new Date().getTime()
        if (nowTime > endTime || nowTime < startTime) return
        let data = await Notification.getCacheCount()
        if (!data) { data = 0 }
        if (+data >= 3) return
        const nowHour = new Date().getHours()
        if (+data >= 0 && nowTime < midTime) {
          commit('SET_SHOW_ANNIVERSARY', true)
          let discrepancyHour
          if ((12 - nowHour) > 0) {
            discrepancyHour = 12 - nowHour
          } else if ((18 - nowHour) > 0) {
            discrepancyHour = 18 - nowHour
          } else {
            discrepancyHour = 1
          }
          const discrepancyTime = discrepancyHour * 60 * 60 * 1000
          setTimeout(() => {
            store.dispatch('notification/getAnniversary')
          }, discrepancyTime)
        } else if (data === 0) {
          commit('SET_SHOW_ANNIVERSARY', true)
        }
      } catch (error) {
        console.error(error)
      }
    })
  },
  // 关闭周年起通知
  setAnniversaryHidden ({ commit }) {
    commit('SET_SHOW_ANNIVERSARY', false)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
