import { NOTIFY_STATUS, WORKBENCH_LOCATION } from '@/utils/enumerate'

const state = {
  imgDomain: process.env.VUE_APP_DOMAIN,
  imgCompressDomain: process.env.VUE_APP_COMPRESS_DOMAIN,
  imgUploadDomain: process.env.VUE_APP_IMG_UPLOAD_DOMAIN,
  updateDomain: process.env.VUE_APP_UPDATE_DOMAIN,
  loadRoutes: [],
  showCat: false,
  showOverTag: true,
  savePath: '',
  cacheImageSwitch: 0,
  guestInfiniteScroll: 0,
  notificationStatus: NOTIFY_STATUS.DEFAULT,
  showRecord: 1, // 修图师页面数据显示
  showWorkbench: false, // 是否显示工作看板
  workbenchLocation: WORKBENCH_LOCATION.APP, // 是否显示工作看板
}

const mutations = {
  SHOW_LOADING: (state, routeName) => {
    const loadRoutes = new Set(state.loadRoutes)
    loadRoutes.add(routeName)
    state.loadRoutes = [...loadRoutes]
  },
  HIDDEN_LOADING: (state, routeName) => {
    const loadRoutes = new Set(state.loadRoutes)
    loadRoutes.delete(routeName)
    state.loadRoutes = [...loadRoutes]
  },
  SET_CAT: (state, data) => {
    state.showCat = data
  },
  SET_OVER_TAG: (state, data) => {
    state.showOverTag = data
  },
  SET_SAVE_PATH: (state, data) => {
    state.savePath = data
  },
  SET_IMAGE_CACHE_PATH: (state, data) => {
    state.cacheImageSwitch = data
    const isTurnOn = Boolean(Number(data))
    state.imgDomain = isTurnOn ? process.env.VUE_APP_LOCAL_DOMAIN : process.env.VUE_APP_DOMAIN
  },
  SET_GUEST_INFINITE_SCROLL: (state, data) => {
    state.guestInfiniteScroll = data
  },
  // 设置权限
  SET_NOTIFY_STATUS (state, status) {
    state.notificationStatus = status
  },
  // 开关控制是否显示数据
  TOGGLE_SHOW_RECORD (state) {
    state.showRecord = !state.showRecord
  }
}

const actions = {
  showLoading ({ commit }, routeName) {
    commit('SHOW_LOADING', routeName)
  },
  hiddenLoading ({ commit }, routeName) {
    setTimeout(() => {
      commit('HIDDEN_LOADING', routeName)
    }, 300)
  },
  setShowCat ({ commit }, data) {
    commit('SET_CAT', data)
  },
  setShowOverTag ({ commit }, data) {
    commit('SET_OVER_TAG', data)
  },
  setSavePath ({ commit }, path) {
    commit('SET_SAVE_PATH', path)
  },
  setImageCacheSwitch ({ commit }, data) {
    commit('SET_IMAGE_CACHE_PATH', data)
  },
  setGuestInfiniteScroll ({ commit }, data) {
    commit('SET_GUEST_INFINITE_SCROLL', data)
  },
  setShowRecord ({ state }, data) {
    state.showRecord = data
  },
  setShowWorkbench ({ state }, data) {
    state.showWorkbench = Boolean(data)
  },
  setWorkbenchLocation ({ state }, data) {
    state.workbenchLocation = data
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
