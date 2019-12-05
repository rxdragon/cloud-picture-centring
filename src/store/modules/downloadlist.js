const state = {
  downloadList: []
}

const mutations = {
  ADD_DOWNLOAD_LIST: (state, { downloadItem }) => {
    state.downloadList.unshift(downloadItem)
  },
  DEL_DOWNLOAD_LIST: (state, { uuid }) => {
    const findDeleteIndex = state.downloadList.findIndex(item => item.config.uuid === uuid)
    if (findDeleteIndex >= 0) {
      state.downloadList.splice(findDeleteIndex, 1)
    }
  },
  CLEAR_ALL_LIST: (state) => {
    state.downloadList = []
  }
}

const actions = {
  // 增加列表
  addDownloadItem: ({ commit, state }, { downloadItem }) => {
    return new Promise(resolve => {
      commit('ADD_DOWNLOAD_LIST', { downloadItem })
      resolve(state.downloadList)
    })
  },
  // 删除单项
  delDownloadItem: ({ commit, state }, { uuid }) => {
    return new Promise(resolve => {
      commit('DEL_DOWNLOAD_LIST', { uuid })
      resolve(state.downloadList)
    })
  },
  clearAllDownList: ({ commit, state }) => {
    return new Promise(resolve => {
      commit('CLEAR_ALL_LIST')
      resolve(state.downloadList)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
