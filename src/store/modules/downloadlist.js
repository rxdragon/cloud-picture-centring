import Vue from 'vue'

const state = {
  downloadList: {}
}

const mutations = {
  ADD_DOWNLOAD_LIST: (state, { uuid, downloadItem }) => {
    Vue.prototype.$set(state.downloadList, uuid, downloadItem)
  },
  DEL_DOWNLOAD_LIST: (state, { uuid }) => {
    delete state.downloadList[uuid]
  }
}

const actions = {
  // 增加列表
  addDownloadItem: ({ commit, state }, { uuid, downloadItem }) => {
    return new Promise(resolve => {
      commit('ADD_DOWNLOAD_LIST', { uuid, downloadItem })
      console.log(downloadItem)
      resolve(state.downloadList)
    })
  },
  // 删除单项
  delDownloadItem: ({ commit, state }, { uuid }) => {
    return new Promise(resolve => {
      commit('DEL_DOWNLOAD_LIST', { uuid })
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
