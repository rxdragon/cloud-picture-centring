const state = {
  hasReturnStream: false, // 是否有重修订单
  retouchId: '', // 正在修图id
  showAnniversary: false // 是否显示通知栏
}

const mutations = {
  SET_RETURN_STREAM: (state) => {
    state.hasReturnStream = true
  },
  SET_RETOUCH_STREAM_ID: (state, id) => {
    state.retouchId = id
  },
  CLEAR_RETOUCH_STREAM_ID: (state) => {
    state.retouchId = ''
  },
  SET_SHOW_ANNIVERSARY: (state, data) => {
    state.showAnniversary = data
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
