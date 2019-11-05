import * as UserAction from '@/api/user'
import * as SessionTool from '@/utils/sessionTool.js'
import store from '@/store'
import router from '@/router'
import { resetRouter } from '@/router'

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
    return new Promise(async (resolve, reject) => {
      try {
        const token = await UserAction.login({ token: key })
        commit('SET_TOKEN', token)
        await UserAction.userExpire()
        SessionTool.setXStreamId(token)
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
