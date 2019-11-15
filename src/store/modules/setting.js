const state = {
  imgDomain: process.env.VUE_APP_DOMAIN,
  imgUploadDomain: process.env.VUE_APP_IMG_UPLOAD_DOMAIN,
  updateDomain: process.env.VUE_APP_UPDATE_DOMAIN,
  loadRoutes: [],
  showCat: false,
  showOverTag: false
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
