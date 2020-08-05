import * as UserAction from '@/api/user'
import * as Retoucher from '@/api/retoucher'
import * as SessionTool from '@/utils/sessionTool.js'
import * as RetoucherCenter from '@/api/retoucherCenter.js'
import store from '@/store'
import router, { resetRouter } from '@/router'
import { MessageBox } from 'element-ui'

const state = {
  token: '',
  id: '',
  name: '',
  nickname: '',
  permissions: [],
  departmentName: '-',
  avatarImg: '',
  lineState: 'offline',
  webSocketState: 'connecting',
  nextCheckOnlineTime: null,
  checkInterval: 10 * 60 * 1000,
  confirmationCheckInterval: 3 * 60 * 1000
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_USERINFO: (state, info) => {
    state.id = info.id
    state.name = info.name
    state.nickname = info.nickname
    state.departmentName = info.department.name
    state.avatarImg = info.avatar
  },
  SET_LINE_STATE: (state, condition) => {
    state.lineState = condition
  },
  SET_ACTIVE_TIME: (state) => {
    const nowTime = new Date().getTime()
    state.nextCheckOnlineTime = nowTime + state.checkInterval
  },
  SET_WEB_SCOKET_STATE: (state, data) => {
    state.webSocketState = data
  }
}

const actions = {
  // 用户名登录
  login ({ commit }, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await UserAction.login({ token: key })
        commit('SET_TOKEN', token)
        SessionTool.setXStreamId(token)
        await UserAction.userExpire()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  },
  // 获取用户信息
  getUserInfo ({ commit, dispatch, getters }) {
    return new Promise(async (resolve, reject) => {
      try {
        const saveInfo = SessionTool.getUserInfo()
        const info = saveInfo || await UserAction.info()
        SessionTool.setUserInfo(info)
        commit('SET_USERINFO', info)
        await store.dispatch('user/getUserPermission')
        resolve(info)
      } catch (error) {
        router.push({
          path: '/401'
        })
        reject(error)
      }
    })
  },
  // 获取用户权限
  getUserPermission ({ commit, dispatch, getters }) {
    return new Promise(async (resolve, reject) => {
      try {
        const savePermission = SessionTool.getUserPermission()
        const permissions = savePermission || await UserAction.getAuthority()
        // todo 最后删掉
        permissions.push(
          {
            "id": 5000,
            "name": "retoucher_center.appeal_history.get",
            "title": "修片师-申诉记录-查看",
            "application": 888
          },
          {
            "id": 5001,
            "name": "admin_manage.appeal_handle.get",
            "title": "云端工作管理-申诉处理-查看",
            "application": 888
          }
        )

        SessionTool.setUserPermission(permissions)
        const accessRoutes = await store.dispatch('permission/generateRoutes', permissions)
        resetRouter()
        router.addRoutes(accessRoutes)
        resolve()
      } catch (error) {
        router.push({
          path: '/401'
        })
        reject(error)
      }
    })
  },
  // 设置在线状态
  setUserlineState ({ dispatch, commit }, inState) {
    if (inState === 'online') {
      dispatch('getNowTime')
    }
    commit('SET_LINE_STATE', inState)
  },
  // 轮训是否激活状态
  getNowTime ({ dispatch, state }) {
    clearTimeout(window.polling.getTime)
    const nowTime = new Date().getTime()
    const differTime = state.nextCheckOnlineTime - nowTime
    const time = differTime > 0 ? differTime : 30000
    window.polling.getTime = setTimeout(() => {
      dispatch('checkOnlineTime')
    }, time)
  },
  // 检查是否在线
  async checkOnlineTime ({ dispatch, commit, state }) {
    const nowTime = new Date().getTime()
    if (nowTime >= state.nextCheckOnlineTime) {
      let hasRetouchingStreams = true
      let queueInfo = {}
      try {
        hasRetouchingStreams = await RetoucherCenter.hasRetouchingStreams()
        queueInfo = await RetoucherCenter.getStreamQueueInfo()
      } catch {
        hasRetouchingStreams = false
      }
      if (hasRetouchingStreams || queueInfo.inQueue) {
        commit('SET_ACTIVE_TIME')
        dispatch('getNowTime')
        return
      }
      clearTimeout(window.polling.getTime)
      window.polling.getTime = null
      window.polling.checkOnline = setTimeout(() => {
        const req = { action: 'auto' }
        Retoucher.changeOffline(req)
          .then(() => {
            dispatch('setUserlineState', 'offline')
            MessageBox.close()
          })
          .catch(err => {
            console.error(err)
          })
      }, state.confirmationCheckInterval)
      MessageBox.confirm('3分钟内未操作此弹窗将更换为离线模式', '您已长时间未操作系统是否仍要保持在线状态', {
        confirmButtonText: '确定',
        center: true,
        type: 'warning',
        customClass: 'check-online',
        showCancelButton: false,
        closeOnPressEscape: false,
        showClose: false,
        closeOnClickModal: false
      }).then(() => {
        clearTimeout(window.polling.checkOnline)
        window.polling.checkOnline = null
        commit('SET_ACTIVE_TIME')
        dispatch('getNowTime')
      }).catch()
    } else {
      dispatch('getNowTime')
    }
  },
  // 获取在线状态
  getRetoucherLineState ({ dispatch, commit }) {
    commit('SET_ACTIVE_TIME')
    return new Promise(async (resolve, reject) => {
      try {
        const state = await Retoucher.getOnlineState()
        dispatch('setUserlineState', state)
        resolve()
      } catch (error) {
        dispatch('setUserlineState', 'offline')
        reject(error)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
