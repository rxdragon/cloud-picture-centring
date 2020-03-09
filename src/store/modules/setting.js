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
  guestInfiniteScroll: 0
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
  /**
   * @deprecated 更改域名
   * @param domainType // 1 又拍云 2 阿里云
   */
  SET_DOMAIN: (state, domainType) => {
    if (+domainType === 1) {
      state.imgDomain = state.imgDomain.replace('.cdn2.', '.cdn.')
      state.imgUploadDomain = state.imgUploadDomain.replace('.cdn2.', '.cdn.')
    } else {
      state.imgDomain = state.imgDomain.replace('.cdn.', '.cdn2.')
      state.imgUploadDomain = state.imgUploadDomain.replace('.cdn.', '.cdn2.')
    }
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
  // 更换域名
  changeDomain ({ commit }, domainType) {
    commit('SET_DOMAIN', domainType)
  },
  setSavePath ({ commit }, path) {
    commit('SET_SAVE_PATH', path)
  },
  setImageCacheSwitch ({ commit }, data) {
    commit('SET_IMAGE_CACHE_PATH', data)
  },
  setGuestInfiniteScroll ({ commit }, data) {
    commit('SET_GUEST_INFINITE_SCROLL', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
