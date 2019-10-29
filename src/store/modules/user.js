import * as UserAction from '@/api/user'
import * as SessionTool from '@/utils/sessionTool.js'
import store from '@/store'
import router from '@/router'

const state = {
  token: '',
  id: '',
  name: '',
  nickname: '',
  permissions: [],
  departmentName: '-',
  avatarImg: ''
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
  }
}

const actions = {
  // 用户名登录
  login ({ commit }, key) {
    return new Promise((resolve, reject) => {
      UserAction.login({ token: key })
        .then(async token => {
          commit('SET_TOKEN', token)
          await UserAction.userExpire()
          SessionTool.setXStreamId(token)
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  // 获取用户信息
  getUserInfo ({ commit, dispatch, getters }) {
    return new Promise((resolve, reject) => {
      const saveInfo = SessionTool.getUserInfo()
      if (saveInfo) {
        commit('SET_USERINFO', saveInfo)
        store.dispatch('permission/generateRoutes', '')
          .then((data) => {
            const accessRoutes = data
            router.addRoutes(accessRoutes)
            resolve(saveInfo)
          })
      } else {
        UserAction.info()
          .then(info => {
            SessionTool.setUserInfo(info)
            commit('SET_USERINFO', info)
            store.dispatch('permission/generateRoutes', '')
              .then((data) => {
                const accessRoutes = data
                router.addRoutes(accessRoutes)
                resolve(info)
              })
          })
          .catch(err => {
            reject(err)
          })
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
