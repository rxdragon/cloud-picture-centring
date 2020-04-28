// assessmentCenter
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import ProductModel from '@/model/ProductModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import StreamModel from '@/model/StreamModel.js'
import { getAvg } from '@/utils/index.js'
import * as SessionTool from '@/utils/sessionTool.js'
import * as PhotoTool from '@/utils/photoTool.js'
import * as Colors from "@/utils/colors"

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
      item.productInfo = new ProductModel(item.photoData.stream.product)
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
      item.photoInfo.photoVersion.forEach(versionItem => {
        versionItem.commitInfo = item.commitInfo
      })
      
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
    msg.forEach(item => {
      item.child.forEach(issItem => issItem.isSelect = false)
    })
    return msg
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
    let allCount = 0
    msg = msg.filter(item => item.count)
    msg.forEach((classItem, classIndex) => {
      classItem.value = 0
      allCount += Number(classItem.count)
      classItem.itemStyle = {
        color: Colors.getColor(msg.length, classIndex)
      }
      classItem.child.forEach((issueItem, issueIndex) => {
        issueItem.value = issueItem.count
        classItem.value += Number(issueItem.count)
        issueItem.itemStyle = {
          color: Colors.getColorNear(msg.length, classIndex, issueIndex)
        }
      })
      classItem.children = classItem.child
    })
    if (!allCount) return null
    return msg
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
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}
