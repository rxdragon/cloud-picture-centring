// assessmentCenter
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import ProductModel from '@/model/ProductModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import StreamModel from '@/model/StreamModel.js'

import * as SessionTool from '@/utils/sessionTool.js'
import * as PhotoTool from '@/utils/photoTool.js'

import { PLANT_ID_MAP, GRADE_TYPE, PlantTypeNameEnum, PlantIdTypeEnum, CLOUD_ROLE } from '@/utils/enumerate'
import { getAvg, transformPercentage } from '@/utils/index.js'

/**
 * @description 获取今日抽片指标
 */
export function getStatistics () {
  return axios({
    url: '/project_cloud/checkPool/getStatistics',
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
  return axios({
    url: '/project_cloud/checkPool/takePhoto',
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
  return axios({
    url: '/project_cloud/checkPool/getHaveCheckResult',
    method: 'GET',
    params
  })
}

/**
 * @description 获取抽片结果
 * @param {*} params
 */
export function getSpotCheckResult (params) {
  return axios({
    url: '/project_cloud/checkPool/getSpotCheckResult',
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
  return axios({
    url: '/project_cloud/checkPool/commitHistory',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取历史抽片数据
 * @param {*} params
 */
export function getSearchHistory (params) {
  return axios({
    url: '/project_cloud/checkPool/getSearchHistory',
    method: 'POST',
    data: params
  }).then(msg => {
    const data = msg.data
    data.forEach(item => {
      // 取出tag中种拔草等标签
      const pureTag = item.tags
      let typeTag = []
      // 加上激励词
      if (item.exTags && item.exTags.length) {
        typeTag = typeTag.concat(item.exTags)
      }
      // 纯种拔草的时候会在commitInfo中返回type
      if (item.commitInfo && item.commitInfo.type) {
        typeTag.unshift({
          name: PlantTypeNameEnum[item.commitInfo.type],
          type: item.commitInfo.type
        })
      }
      item.typeTag = typeTag
      item.productInfo = new ProductModel(_.get(item, 'photoData.stream.product'))
      item.photoInfo = new PhotoModel(item.photoData)
      item.streamInfo = new StreamModel(item.photoData.stream)
      item.commitInfo = PhotoTool.handleCommitInfo(item.commitInfo, pureTag)
      item.issueLabel = item.commitInfo.issueLabel
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
 * @description 获取问题标签
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/10
 * @version @version 2.4.0
 */
export function getScoreConfigList () {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfigList',
    method: 'GET'
  }).then(msg => {
    // 排序
    const typeArrSort = [PLANT_ID_MAP.PLANT_ID, PLANT_ID_MAP.NONE_ID, PLANT_ID_MAP.PULL_ID]
    const sortMsg = []
    typeArrSort.forEach(typeItem => {
      const findTypeItem = msg.find(item => +item.id === +typeItem)
      sortMsg.push(findTypeItem)
    })
    // 处理数据
    const typeArr = []
    const allLabel = {}
    sortMsg.forEach((msgItem) => {
      const { name, id, score_config: scoreConfig } = msgItem
      scoreConfig.forEach(scoreConfigItem => {
        scoreConfigItem.child.forEach(issItem => { issItem.isSelect = false })
      })

      typeArr.push({
        name,
        id,
        isSelect: false,
        class: PlantIdTypeEnum[id]
      })
      allLabel[id] = scoreConfig
    })

    return {
      typeArr,
      allLabel,
    }
  })
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
 * @description 获取问题标签筛选框
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/10
 * @version @version 2.4.0
 */
export function getOldIssueList () {
  return axios({
    url: '/project_cloud/checkPool/getOldScoreConfigList',
    method: 'GET'
  }).then(msg => {
    const createLabel = [{
      name: '历史标签',
      score_config: msg
    }]
    const createData = createLabel.map(item => {
      item.children = item.score_config.map(configItem => {
        configItem.children = configItem.child.map(chilItem => {
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
 * @description 获取问题标签柱状图
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/07/27
 * @version @version 2.10.0
 */
export function getCloudProblemReportByGroup (params, type) {
  const roleUrl = {
    [CLOUD_ROLE.GROUP_LEADER]: '/project_cloud/retouchLeader/getCloudProblemReportByGroup',
    [CLOUD_ROLE.OPERATE]: '/project_cloud/checkPool/getCloudProblemReportByGroup'
  }
  return axios({
    url: roleUrl[type],
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取修改分数历史记录
 * @param {*} params
 */
export function getUpdateHistoryLog (params) {
  return axios({
    url: '/project_cloud/checkPool/getUpdateHistoryLog',
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
 * @description 获取摄影机构列表
 * @method GET
 * @returns {Obeject} 结果
 * @author cl 2020/07/27
 * @version @version 2.10.0
 */
export function getCheckPoolQuota (params, type) {
  const roleUrl = {
    [CLOUD_ROLE.CREW]: '/project_cloud/retoucher/getCheckPoolQuota',
    [CLOUD_ROLE.GROUP_LEADER]: '/project_cloud/retouchLeader/getCheckPoolQuota',
    [CLOUD_ROLE.OPERATE]: '/project_cloud/operator/getCheckPoolQuota'
  }
  return axios({
    url: roleUrl[type],
    method: 'POST',
    data: params
  }).then(msg => {
    const gradeSum = Number(msg.checkPoolPlantNum) + Number(msg.checkPoolPullNum) + Number(msg.checkPoolNormalNum)
    const createData = {
      [GRADE_TYPE.PLANT]: {
        count: msg.checkPoolPlantNum,
        rate: transformPercentage(msg.checkPoolPlantNum, gradeSum)
      },
      [GRADE_TYPE.PULL]: {
        count: msg.checkPoolPullNum,
        rate: transformPercentage(msg.checkPoolPullNum, gradeSum)
      },
      [GRADE_TYPE.NONE]: {
        count: msg.checkPoolNormalNum,
        rate: transformPercentage(msg.checkPoolNormalNum, gradeSum)
      },
      'score': {
        count: getAvg(msg.checkPoolTotalScore, gradeSum),
        rate: ''
      }
    }
    return createData
  })
}

/**
 * @description 获取摄影机构列表
 * @method GET
 * @returns {Obeject} 结果
 * @author cf 2020/07/27
 * @version @version 2.10.0
 */
export function getCheckPoolSubQuota (params, type) {
  const roleUrl = {
    [CLOUD_ROLE.CREW]: '/project_cloud/retoucher/getCheckPoolSubQuota',
    [CLOUD_ROLE.GROUP_LEADER]: '/project_cloud/retouchLeader/getCheckPoolSubQuota',
    [CLOUD_ROLE.OPERATE]: '/project_cloud/operator/getCheckPoolSubQuota'
  }
  return axios({
    url: roleUrl[type],
    method: 'POST',
    data: params
  }).then(msg => {
    msg = msg.filter(item => item.count)
    let sum = 0
    const checkTags = msg.map(labelItem => {
      sum = sum + Number(labelItem.count)
      return {
        name: labelItem.name,
        value: Number(labelItem.count)
      }
    })
    checkTags.forEach(labelItem => {
      labelItem.rate = transformPercentage(labelItem.value, sum)
    })
    return checkTags
  })
}
