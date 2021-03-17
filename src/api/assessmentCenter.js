// assessmentCenter
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import ProductModel from '@/model/ProductModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import StreamModel from '@/model/StreamModel.js'
import uuidv4 from 'uuid'

import * as SessionTool from '@/utils/sessionTool.js'
import * as PhotoTool from '@/utils/photoTool.js'
import { GRADE_LABEL_TYPE, CLOUD_ROLE, CNLevelToType } from '@/utils/enumerate'
import { getAvg, transformPercentage } from '@/utils/index.js'

export const GRADE_LEVEL = {
  SMALL: 'small',
  MIDDLE: 'middle',
  PULL: 'pull',
  PLANT: 'plant'
}

// 修图标准映射中文
export const gradeLevelToCN = {
  [GRADE_LEVEL.SMALL]: '小',
  [GRADE_LEVEL.MIDDLE]: '中',
  [GRADE_LEVEL.PULL]: '拔草',
  [GRADE_LEVEL.PLANT]: '种草'
}

/**
 * @description 获取今日抽片指标
 */
export function getStatistics (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getStatistics',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/getStatistics'
  }

  return axios({
    url: axiosUrls[params.axiosType],
    method: 'GET'
  }).then(msg => {
    const data = msg
    data.evaluationNum = Math.floor(data.evaluationNum)
    data.avgScore = getAvg(data.evaluationScore, data.evaluationNum)
    return data
  })
}

/**
 * @description 抽片
 * @param {*} params
 */
export function takePhoto (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/takePhoto',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/takePhoto'
  }
  return axios({
    url: axiosUrls[params.axiosType],
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取是否有未评分的抽片
 * @param {*} params
 */
export function getHaveCheckResult (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getHaveCheckResult',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/getHaveCheckResult'
  }
  return axios({
    url: axiosUrls[params.axiosType],
    method: 'GET'
  })
}

/**
 * @description 获取抽片结果
 * @param {*} params
 */
export function getSpotCheckResult (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getSpotCheckResult',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/getSpotCheckResult'
  }
  return axios({
    url: axiosUrls[params.axiosType],
    method: 'GET',
    params
  }).then(msg => {
    const data = msg.data
    let allPhotoPath = [] // 预加载使用
    if (!data.length) {
      SessionTool.removeCloudAssessmentPhotoId()
      return {
        list: [],
        allPhotoPath,
        total: msg.extend.processInfo[0].totalCount,
        pageTotal: msg.total || null
      }
    }
    const total = msg.extend.processInfo[0].totalCount
    data.forEach((item, index) => {
      const productData = _.get(item, 'photoData.stream.product')
      item.productInfo = new ProductModel(productData)
      item.photoInfo = new PhotoModel(item.photoData)
      item.streamInfo = new StreamModel(item.photoData.stream)
      // 照片编号
      const photoIndex = index + params.skip + 1 + msg.commitNum
      item.photoIndex = `${total}-${photoIndex}`
      // 加载预加载，与业务无关
      const photoVersion = item.photoInfo.photoSpotCheckVersion
      allPhotoPath = [...allPhotoPath, ...photoVersion]
    })
    if (!+store.getters.cacheImageSwitch) {
      PhotoTool.readAllPhoto(allPhotoPath)
    }
    const createData = {
      list: data,
      allPhotoPath,
      total,
      pageTotal: msg.total || null
    }
    return createData
  })
}

/**
 * @description 提交评价
 * @param {*} params
 */
export function commitHistory (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/commitHistory',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/commitHistory'
  }
  return axios({
    url: axiosUrls[params.axiosType],
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取历史抽片数据
 * @param {*} params
 */
export function getSearchHistory (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getSearchHistory',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/getSearchHistory'
  }

  return axios({
    url: axiosUrls[params.axiosType],
    method: 'POST',
    data: params
  }).then(msg => {
    const data = msg.data
    data.forEach(item => {
      item.productInfo = new ProductModel(_.get(item, 'photoData.stream.product'))
      item.photoInfo = new PhotoModel(item.photoData)
      item.streamInfo = new StreamModel(item.photoData.stream)
      item.commitInfo = PhotoTool.handleCommitInfo(item.commitInfo, item.tags)
      item.labelTag = item.commitInfo.issueLabel

      item.score = item.commitInfo.score

      item.photoInfo.photoSpotCheckVersion.forEach(versionItem => {
        versionItem.commitInfo = item.commitInfo
      })
      // 是否复评
      item.isReevaluatePhoto = Boolean(item.oldTakeStaffInfo)
      // 评价人
      let gradeStaff = _.get(item, 'takeStaffInfo.name') || _.get(item, 'takeStaffInfo.real_name') || '-'
      if (item.isReevaluatePhoto) {
        gradeStaff = _.get(item, 'oldTakeStaffInfo.name') || _.get(item, 'oldTakeStaffInfo.real_name') || '-'
      }
      // 复评人
      const reevaluate = _.get(item, 'takeStaffInfo.name') || _.get(item, 'takeStaffInfo.real_name') || '-'
      item.takeInfo = {
        gradeStaff,
        reevaluate
      }
    })
    return {
      list: data,
      total: msg.total
    }
  })
}

/**
 * @description 获取评分配置标签
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/10
 * @version @version 2.24
 */
export async function getScoreConfigList () {
  // TODO 更改配置
  const res = await axios({
    url: '/project_cloud/checkPool/getScoreConfig',
    method: 'GET'
  })
  const chainLine = []

  const createData = res.map(item => {
    const childrenData = item.children || []
    const children = childrenData.map(childrenItem => {
      chainLine.push(childrenItem.id)
      return {
        id: childrenItem.id,
        idString: String(childrenItem.id),
        name: childrenItem.name,
        children: childrenItem.children,
        parentId: childrenItem.score_type_id,
        value: ''
      }
    })
    // 如果有子项目才添加
    if (children.length) {
      children.unshift({
        id: uuidv4(),
        idString: uuidv4(),
        name: '一键评分',
        isOneAll: true,
        value: ''
      })
    }

    return {
      id: item.id,
      idString: String(item.id),
      name: item.name,
      children
    }
  })
  const labelClass = createData.filter(item => item.children.length)
  return {
    labelClass,
    chainLine
  }
}

/**
 * @description 获取问题标签筛选框
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/10
 * @version @version 2.4.0
 */
export function getIssueList (params) {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfigList',
    method: 'GET',
    params
  }).then(msg => {
    const createData = msg.map(item => {
      item.children = item.score_config.map(configItem => {
        // 特殊处理没有权限的参数
        const child = configItem.child_with_zero || configItem.child
        configItem.children = child.map(chilItem => {
          return {
            value: chilItem.id,
            label: chilItem.name
          }
        })
        return {
          value: configItem.id,
          label: configItem.name,
          children: configItem.children
        }
      })
      return {
        value: item.id,
        label: item.name,
        children: item.children
      }
    })
    return createData
  })
}

/**
 * @description 获取问题标签报告数据
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/12
 * @version @version 2.4.0
 */
export function getCloudProblemReport (params) {
  return axios({
    url: '/project_cloud/checkPool/getCloudProblemReport',
    method: 'GET',
    params
  }).then(msg => {
    msg = msg.filter(item => item.count)
    let sum = 0
    const checkTags = msg.map(labelItem => {
      sum = sum + Number(labelItem.count)
      return {
        name: labelItem.name,
        value: Number(labelItem.count),
        group: labelItem.child
      }
    })
    checkTags.forEach(labelItem => {
      labelItem.rate = transformPercentage(labelItem.value, sum)
      labelItem.group.forEach(item => {
        item.rate = transformPercentage(item.count, sum)
      })
    })
    return checkTags
  })
}

/**
 * @description 获取修改分数历史记录
 * @param {*} params
 */
export function getUpdateHistoryLog (params) {
  const axiosUrls = {
    [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getUpdateHistoryLog',
    [GRADE_LABEL_TYPE.SHOWPIC]: '/project_cloud/showPicPool/getUpdateHistoryLog'
  }
  return axios({
    url: axiosUrls[params.axiosType],
    method: 'POST',
    data: params
  }).then(msg => {
    const updateList = msg.list.map(listItem => {
      const retoucherLeaderNickName = _.get(listItem, 'retoucher.retoucher_leader.nickname')
      const retoucherLeaderName = _.get(listItem, 'retoucher.retoucher_leader.name')
      const retoucherName = _.get(listItem, 'retoucher.name')
      const retoucherRealName = _.get(listItem, 'retoucher.real_name')

      return {
        ...listItem,
        retoucherName: retoucherName || retoucherRealName || '-',
        retoucherLeader: retoucherLeaderNickName || retoucherLeaderName || '-',
        takeStaff: listItem.take_staff.name || '-'
      }
    })
    return {
      list: updateList,
      total: msg.total
    }
  })
}

/**
 * @description 重新评价愿学院抽片
 * @method PUT
 * @returns {Boolean}
 * @author cf 2020/05/20
 * @version @version 2.6.0
 */
export function updateCommitHistory (params) {
  return axios({
    url: '/project_cloud/checkPool/updateCommitHistory',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取摄影机构列表
 * @method GET
 * @returns {Obeject} 结果
 * @author cl 2020/06/24
 * @version @version 2.8.0
 */
export function getPhotographerOrgList () {
  return axios({
    url: '/project_cloud/operator/getPhotographerOrgList',
    method: 'GET'
  })
}

/**
 * @description 获取云学院修图组分数统计(柱状图)
 * @method POST
 * @returns {Array} 标记数据
 * @author nx 2020/07/27
 * @version @version 2.24.0
 */
export function getCloudProblemReportByGroup (params, searchRole) {
  const urlMap = {
    [CLOUD_ROLE.OPERATE]: '/project_cloud/checkPool/getCloudScoreByGroup',
    [CLOUD_ROLE.GROUP_LEADER]: '/project_cloud/retouchLeader/getCloudScoreByGroup',
  }
  return axios({
    url: urlMap[searchRole],
    method: 'POST',
    data: params
  }).then(res => {
    if (!res.group) res.group = []
    const group = res.group.map(g => {
      return {
        ...g,
        count: g.totalScore
      }
    })

    return {
      group,
      avgScore: res.avgScore ? Number(res.avgScore).toFixed(2) : '-'
    }
  })
}

/**
 * @description 获取云学院修图组分数统计(柱状图)， 这个是按照问题类型分组的
 * @method POST
 * @returns {Array} 标记数据
 * @author nx 2020/07/27
 * @version @version 2.24.0
 */
export function getCloudProblemByGroup (params, searchRole) {
  const urlMap = {
    [CLOUD_ROLE.OPERATE]: '/project_cloud/checkPool/getCloudProblemByGroup',
    [CLOUD_ROLE.GROUP_LEADER]: '/project_cloud/retouchLeader/getCloudProblemByGroup',
  }
  return axios({
    url: urlMap[searchRole],
    method: 'POST',
    data: params
  }).then(res => {
    // if (!(res.group && res.group.length)) return []
    const group = res.group || []
    // 按照小问题.中等问题分组
    const config = Object.keys(CNLevelToType)
    const list = config.map(name => {
      const data = group.map(g => {
        if (!Array.isArray(g.problems)) {
          g.problems = []
        }
        const item = g.problems.find(problem => problem.name === name)
        const count = item ? item.count : 0
        return {
          id: g.id,
          name: g.name,
          count,
        }
      })

      return {
        name,
        data
      }
    })

    return list
  })
}

/**
 * @description 获取个人抽查平均分
 * @method GET
 * @returns {Obeject} 结果
 * @author cf 2020/07/27
 * @version @version 2.10.0
 */
export function getCheckPoolSubQuota (params, type) {
  const roleUrl = {
    [CLOUD_ROLE.CREW]: '/project_cloud/retoucher/getCheckPoolSubQuota',
    [CLOUD_ROLE.OPERATE]: '/project_cloud/operator/getCheckPoolSubQuota'
  }
  return axios({
    url: roleUrl[type],
    method: 'POST',
    data: params
  }).then(res => {
    const group = res.group

    const config = Object.keys(CNLevelToType)
    // map {"小":{},"中":{},"种草":{},"拔草":{}
    const map = config.reduce((tol, cur ) => Object.assign(tol, { [cur]: { } }), {})
    // 1 按照小中大问题分组
    group.forEach(g => {
      if (!map[g.name]) {
        throw new Error('配置错误')
      }
      const parentName = _.get(g, 'parent.name')
      const typeName = _.get(g, 'parent.score_type.name')

      if (!map[g.name][parentName]) {
        map[g.name][parentName] = {
          name: parentName,
          value: 0,
          children: []
        }
      }
      map[g.name][parentName].value += Number(g.count) || 0
      map[g.name][parentName].children.push({
        name: typeName,
        value: Number(g.count) || 0
      })
    })

    const list = Object.keys(map).map(key => {
      return {
        data: Object.values(map[key]),
        name: key
      }
    })

    return {
      avgScore: res.avgScore ? Number(res.avgScore).toFixed(2) : '-',
      data: list
    }
  })
}
