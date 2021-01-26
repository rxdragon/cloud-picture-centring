const state = {
  hasReturnStream: false, // 是否有重修订单
  retouchId: '', // 正在修图id
  announcementUnreadCount: 0, // 未读数量
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
  // 设置未读数量
  setAnnouncementUnreadCount ({ state }, count) {
    state.announcementUnreadCount = count
  },
  // 累加未读数量
  addAnnouncementUnreadCount ({ state }) {
    state.announcementUnreadCount++
  },
  // 减去未读数量
  subtractAnnouncementUnreadCount ({ state }) {
    if (state.announcementUnreadCount === 0) return
    state.announcementUnreadCount--
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
