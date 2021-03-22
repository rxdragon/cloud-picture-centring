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
import { getAvg, getNumberString } from '@/utils/index.js'

/**
 * @description 获取请求地址
 * @param {*} type GRADE_LABEL_TYPE
 * @returns
 */
function getUrl (type) {
  return type === GRADE_LABEL_TYPE.CLOUD ? '/project_cloud/checkPool' : '/project_cloud/showPicPool'
}

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
  const url = getUrl(params.axiosType) + '/getStatistics'
  return axios({
    url,
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
  const url = getUrl(params.axiosType) + '/takePhoto'
  return axios({
    url,
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
  const url = getUrl(params.axiosType) + '/getHaveCheckResult'
  return axios({
    url,
    method: 'GET'
  })
}

/**
 * @description 获取抽片结果
 * @param {*} params
 */
export function getSpotCheckResult (params) {
  const url = getUrl(params.axiosType) + '/getSpotCheckResult'
  return axios({
    url,
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
  const url = getUrl(params.axiosType) + '/commitHistory'
  return axios({
    url: url,
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取历史抽片数据
 * @param {*} params
 */
export function getSearchHistory (params) {
  const url = getUrl(params.axiosType) + '/getSearchHistory'
  return axios({
    url,
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
 * @author cf 2021/03/19
 * @version @version 2.24
 */
export async function getScoreConfigList (params) {
  const url = getUrl(params.axiosType) + '/getScoreConfig'
  const res = await axios({
    url,
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
 * @description 获取修改分数历史记录
 * @param {*} params
 */
export function getUpdateHistoryLog (params) {
  const url = getUrl(params.axiosType) + '/getUpdateHistoryLog'
  return axios({
    url,
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
 * @description 重新评价云学院抽片或修修兽抽片
 * @method PUT
 * @returns {Boolean}
 * @author cf 2021/03/19
 * @version @version 2.24.0
 */
export function updateCommitHistory (params) {
  const url = getUrl(params.axiosType) + '/updateCommitHistory'

  return axios({
    url,
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
 * @param searchRole 角色： 运营 or组长
 * @param searchType 类型： 云端 or 修修兽
 * @method POST
 * @returns {Array} 标记数据
 * @author nx 2020/07/27
 * @version @version 2.24.0
 */
export function getCloudScoreByGroup (params, searchRole, searchType) {
  const urlMap = {
    [CLOUD_ROLE.OPERATE]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getCloudScoreByGroup', // 运营-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/showPicPool/getCloudScoreByGroup', // 运营-修修兽
    },
    [CLOUD_ROLE.GROUP_LEADER]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/retouchLeader/getCloudScoreByGroup', // 组长-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/retouchLeader/getShowPicScoreByGroup', // 组长 -修修兽
    }
  }
  const url = urlMap[searchRole][searchType]
  return axios({
    url,
    method: 'POST',
    data: params
  }).then(res => {
    if (!res.group) res.group = []
    const group = res.group.map(g => {
      return {
        ...g,
        count: ((g.totalScore / g.totalPeople) || 0).toFixed(2)
      }
    })
    return {
      group,
      avgScore: getNumberString(res.avgScore)
    }
  })
}

/**
 * @description 获取修图组分数统计(柱状图)， 这个是按照问题类型分组的
 * @method POST
 * @param searchRole 角色： 运营 or组长
 * @param searchType 类型： 云端 or 修修兽
 * @returns {Array} 标记数据
 * @author nx 2020/07/27
 * @version @version 2.24.0
 */
export function getCloudProblemByGroup (params, searchRole, searchType) {
  const urlMap = {
    [CLOUD_ROLE.OPERATE]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/checkPool/getCloudProblemByGroup', // 运营-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/showPicPool/getCloudProblemByGroup', // 运营-修修兽
    },
    [CLOUD_ROLE.GROUP_LEADER]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/retouchLeader/getCloudProblemByGroup', // 组长-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/retouchLeader/getShowPicProblemByGroup', // 组长 -修修兽
    }
  }
  const url = urlMap[searchRole][searchType]
  return axios({
    url: url,
    method: 'POST',
    data: params
  }).then(res => {
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
 * @param searchRole 角色： 运营 or 组长
 * @param searchType 类型： 云端 or 修修兽
 * @returns {Obeject} 结果
 * @author cf 2020/07/27
 * @version @version 2.10.0
 */
export function getCheckPoolSubQuota (params, searchRole, searchType) {
  const urlMap = {
    [CLOUD_ROLE.OPERATE]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/operator/getCheckPoolSubQuota', // 运营-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/operator/getShowPicPoolSubQuota' // 运营-修修兽
    },
    [CLOUD_ROLE.CREW]: {
      [GRADE_LABEL_TYPE.CLOUD]: '/project_cloud/retoucher/getCheckPoolSubQuota', // 修图师-云端
      [GRADE_LABEL_TYPE.SHOW_PIC]: '/project_cloud/retoucher/getShowPicPoolSubQuota' // 修图师-修修兽
    }
  }
  const url = urlMap[searchRole][searchType]
  return axios({
    url,
    method: 'POST',
    data: params
  }).then(res => {

    function filterLevel (list) {
      const mapList = {}
      list.forEach(g => {
        const parentId = _.get(g, 'parent.id')
        const parentName = _.get(g, 'parent.name')
        const typeId = _.get(g, 'parent.score_type.id')
        const typeName = _.get(g, 'parent.score_type.name')
        if (mapList[typeId]) {
          const parentList = mapList[typeId].children
          const findParent = parentList.find(item => item.id === parentId)
          if (findParent) {
            findParent.value++
          } else {
            parentList.push({
              id: parentId,
              name: parentName,
              value: 1
            })
          }
        } else {
          mapList[typeId] = {
            name: typeName,
            id: typeId,
            children: [
              {
                id: parentId,
                name: parentName,
                value: 1
              }
            ]
          }
        }
      })
      return Object.values(mapList)
    }
    const group = res.group

    const smallList = group.filter(item => item.name === '小')
    const middleList = group.filter(item => item.name === '中')
    const plantList = group.filter(item => item.name === '种草')
    const pullList = group.filter(item => item.name === '拔草')

    const mapData = [
      {
        name: '小',
        data: filterLevel(smallList),
        color: '#ff8f00'
      },
      {
        name: '中',
        data: filterLevel(middleList),
        color: '#ff8f00'
      },
      {
        name: '种草',
        data: filterLevel(plantList),
        color: '#38bc7f'
      },
      {
        name: '拔草',
        data: filterLevel(pullList),
        color: '#ff3974'
      }
    ]
    return {
      avgScore: getNumberString(res.avgScore),
      data: mapData
    }
  })
}
