const state = {
  loading: false,
  imgDomain: process.env.VUE_APP_DOMAIN,
  imgUploadDomain: process.env.VUE_APP_IMG_UPLOAD_DOMAIN,
  updateDomain: process.env.VUE_APP_UPDATE_DOMAIN
}

const mutations = {
  SET_LOADING: (state, loading) => {
    state.loading = loading
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
  }
}

const actions = {
  showLoading ({ commit }) {
    commit('SET_LOADING', true)
  },
  hiddenLoading ({ commit }) {
    setTimeout(() => {
      commit('SET_LOADING', false)
    }, 300)
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
