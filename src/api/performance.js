import axios from '@/plugins/axios.js'
import PerformanceModel from '@/model/PerformanceModel.js'
import * as Validate from '@/utils/validate.js'

/**
 * @description 查询伙伴
 */
export function getCanScoreStaff (type) {
  const params = { type }
  return axios({
    url: '/project_cloud/staff/getCanScoreStaffs',
    method: 'POST',
    data: params
  }).then(msg => {
    const createData = msg.map(item => {
      const nickName = _.get(item, 'nickname') || '-'
      return {
        name: item.name,
        nickName,
        staffNum: item.id,
        score: ''
      }
    })
    return createData
  })
}

/**
 * @description 获取组员分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function getStaffPerformance (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/getStaffScores'
    : '/project_cloud/staff/getStaffScores'
  return axios({
    url,
    method: 'PUT',
    data: params
  }).then(msg => {
    const createData = msg.list.map(item => {
      const performanceData = new PerformanceModel(item)
      const joinName = `${performanceData.name}(${performanceData.nickname})`
      return {
        joinName,
        ...performanceData
      }
    })
    return {
      list: createData,
      total: msg.total
    }
  })
}

/**
 * @description 保存伙伴分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function batchSaveStaffScores (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/batchSaveStaffScores'
    : '/project_cloud/staff/batchSaveStaffScores'
  return axios({
    url,
    method: 'POST',
    data: params
  })
}

/**
 * @description 编辑分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function editStaffScore (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/editStaffScore'
    : '/project_cloud/staff/editStaffScore'
  return axios({
    url,
    method: 'PUT',
    data: params
  })
}

/**
 * @description 编辑分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function getGroupScoreRanks (params) {
  const groupId = params.groupId || ''
  delete params.groupId

  return axios({
    url: '/project_cloud/staff/getGroupScores',
    method: 'PUT',
    data: params
  }).then(msg => {
    const createList = msg.map(listItem => {
      const leaderName = _.get(listItem, 'leader_info.nickname') || ''
      const leaderNickName = _.get(listItem, 'leader_info.name') || ''
      if (!listItem) { listItem = {} }
      return {
        ...listItem,
        groupName: _.get(listItem, 'name') || '-',
        groupLeader: leaderNickName || leaderName || '-',
        groupLeaderJobNumber: _.get(listItem, 'leader_info.id') || '-',
        returnRate: Validate.toFixed(listItem.return_rate || 0),
        kpiScore: Validate.toFixed(listItem.leader_kpi_score || 0),
        averageScore: Validate.toFixed(listItem.average_score || 0)
      }
    })

    createList.sort((a, b) => b.kpiScore - a.kpiScore)
    createList.forEach((item, index) => {
      item.kpiScoreRank = index + 1
    })
    createList.sort((a, b) => b.averageScore - a.averageScore)
    createList.forEach((item, index) => {
      item.averageScoreRank = index + 1
    })
    createList.sort((a, b) => a.returnRate - b.returnRate)
    createList.forEach((item, index) => {
      item.returnRateRank = index + 1
    })

    // 如果查询修图组，前端过滤修图组
    if (groupId) {
      const filterGroupList = createList.filter(item => item.id === groupId)
      return filterGroupList
    }
    return createList
  })
}

/**
 * @description 编辑分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function getSelfGroupScoreRanks (params) {
  return axios({
    url: '/project_cloud/staff/getGroupScoreRanks',
    method: 'PUT',
    data: params
  }).then(msg => {
    const createList = msg.list.map(listItem => {
      const leaderName = _.get(listItem, 'group_info.leader_info.nickname') || ''
      const leaderNickName = _.get(listItem, 'group_info.leader_info.name') || ''
      return {
        ...listItem,
        groupName: _.get(listItem, 'group_info.name') || '-',
        groupLeader: leaderNickName || leaderName || '-',
        groupLeaderJobNumber: _.get(listItem, 'group_info.leader_info.id') || '-',
        leaderKpi: Validate.toFixed(listItem.leader_kpi_score) || '-',
        leaderKpiRank: _.get(listItem, 'leader_kpi_rank') || '-'
      }
    })
    return createList
  })
}

/**
 * @description 获取修图组目标
 * @param { String } date retoucher 组员 retoucherLeader 组管
 */
export function getRetoucherGoalList (params) {
  const mock = [
    {
      "_id": "608a26299557a7151f5ea6e2",
      "date": "2021-04-29",
      "group_id": 1,
      "staff_id": 613911,
      "base_goal_num": 347,
      "expect_float_num": 186,
      "finish_num": 924,
      "goal_num": 510,
      "achieve": 1,
      "extend": {
        "leave_decrease_num": 33,
        "weight_increase_num": 39
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a26299557a7151f5ea6e3",
      "date": "2021-04-29",
      "group_id": 1,
      "staff_id": 613911,
      "base_goal_num": 387,
      "expect_float_num": 655,
      "finish_num": 798,
      "goal_num": 417,
      "achieve": 0,
      "extend": {
        "leave_decrease_num": 30,
        "weight_increase_num": 18
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a27a583f75d7a08116272",
      "date": "2021-04-29",
      "group_id": 1,
      "staff_id": 613911,
      "base_goal_num": 835,
      "expect_float_num": 928,
      "finish_num": 631,
      "goal_num": 335,
      "achieve": 0,
      "extend": {
        "leave_decrease_num": 35,
        "weight_increase_num": 40
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a27a583f75d7a08116273",
      "date": "2021-04-29",
      "group_id": 1,
      "staff_id": 613911,
      "base_goal_num": 452,
      "expect_float_num": 855,
      "finish_num": 771,
      "goal_num": 177,
      "achieve": 1,
      "extend": {
        "leave_decrease_num": 10,
        "weight_increase_num": 37
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a4777ee408c7cca66d412",
      "date": "2021-04-29",
      "group_id": 1,
      "staff_id": 613911,
      "base_goal_num": 249,
      "expect_float_num": 357,
      "finish_num": 747,
      "goal_num": 816,
      "achieve": 0,
      "extend": {
        "leave_decrease_num": 35,
        "weight_increase_num": 33
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a4777ee408c7cca66d413",
      "date": "2021-04-29",
      "group_id": 2,
      "staff_id": 613911,
      "base_goal_num": 418,
      "expect_float_num": 960,
      "finish_num": 770,
      "goal_num": 637,
      "achieve": 1,
      "extend": {
        "leave_decrease_num": 26,
        "weight_increase_num": 28
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    },
    {
      "_id": "608a655dae438e57341e23d2",
      "date": "2021-04-29",
      "group_id": 2,
      "staff_id": 613911,
      "base_goal_num": 279,
      "expect_float_num": 814,
      "finish_num": 748,
      "goal_num": 326,
      "achieve": 0,
      "extend": {
        "leave_decrease_num": 13,
        "weight_increase_num": 17
      },
      "retouch_standard": "大师",
      "operator_id": "phpunit-test",
      "duty_state": [
        "new"
      ],
      "is_new_staff": 1,
      "created_at": "1998-01-01 12:00:00",
      "updated_at": "1998-01-01 12:00:00",
      "staff": {
        "id": 613911,
        "name": "李生",
        "nickname": "迈克"
      }
    }
  ]

  return Promise.resolve(mock)
  // return axios({
  //   url: '/project_cloud_oa/goal/retoucher/list',
  //   method: 'GET',
  //   data: params
  // }).then(msg => {
  //   return msg
  // })
}
