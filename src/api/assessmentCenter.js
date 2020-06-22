// assessmentCenter
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import ProductModel from '@/model/ProductModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import StreamModel from '@/model/StreamModel.js'
import { getAvg, transformPercentage } from '@/utils/index.js'
import * as SessionTool from '@/utils/sessionTool.js'
import * as PhotoTool from '@/utils/photoTool.js'

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
      const photoVersion = item.photoInfo.photoVersion
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
      item.productInfo = new ProductModel(_.get(item, 'photoData.stream.product'))
      item.photoInfo = new PhotoModel(item.photoData)
      item.streamInfo = new StreamModel(item.photoData.stream)
      item.commitInfo = PhotoTool.handleCommitInfo(item.commitInfo, item.tags)
      item.issueLabel = item.commitInfo.issueLabel
      item.score = item.commitInfo.score
      item.photoInfo.photoVersion.forEach(versionItem => { versionItem.commitInfo = item.commitInfo })
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
    let typeArr = []
    let allLabel = {}
    // mock
    const tempData1 = msg
    const tempData2 = JSON.parse(JSON.stringify(msg))
    const tempData3 = JSON.parse(JSON.stringify(msg))
    const mockData = [
      {
        id: 2,
        name: '种草',
        score_config: tempData1
      },
      {
        id: 1,
        name: '拔草',
        score_config: tempData2.slice(0,2)
      },
      {
        id: 3,
        name: '一般',
        score_config: tempData3.slice(2,3)
      },
    ]
    // 将数据拆开
    mockData.forEach((msgItem) => {
      const {
        name,
        id,
        score_config: scoreConfig
      } = msgItem
      scoreConfig.forEach(scoreConfigItem => {
        scoreConfigItem.child.forEach(issItem => { issItem.isSelect = false })
      })
      typeArr.push({
        name,
        id,
        isSelect: false
      })
      allLabel[name] = scoreConfig
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
export function getIssueList () {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfigList',
    method: 'GET'
  }).then(msg => {
    const createData = msg.map(item => {
      item.children = item.child.map(issueItem => {
        return {
          value: issueItem.id,
          label: issueItem.name
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
    })
    return checkTags
  })
}

/**
 * @description 获取问题标签柱状图
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/12
 * @version @version 2.4.0
 */
export function getCloudProblemReportByGroup (params) {
  return axios({
    url: '/project_cloud/checkPool/getCloudProblemReportByGroup',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
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
      return {
        ...listItem,
        retoucherName: _.get(listItem, 'retoucher.name') || _.get(listItem, 'retoucher.real_name') || '-',
        retoucherLeader: _.get(listItem, 'retoucher.retoucher_leader.nickname') || _.get(listItem, 'retoucher.retoucher_leader.name') || '-',
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
