import * as GradeConfigurationApi from '@/api/gradeConfiguration'

const state = {
  cloudGradeConfigurationList: [],
  showRadeConfigurationList: []
}

const mutations = {
  SAVE_CLOUD_GRADE_CONFIGURATION_LIST: (state, list) => {
    state.cloudGradeConfigurationList = list
  }
}

const actions = {
  getCloudGradeConfigurationList: async ({ commit, state }) => {
    if (state.cloudGradeConfigurationList && state.cloudGradeConfigurationList.length) return []
    const res = await GradeConfigurationApi.getScoreConfig()
    commit('SAVE_CLOUD_GRADE_CONFIGURATION_LIST', res)
    return res
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
