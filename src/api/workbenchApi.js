import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'
import * as MathUtil from '@/utils/mathUtil'
import { timeFormat } from '@/utils/index.js'

/**
 * @description 获取在线看片工作信息
 */
export async function getOnlineInfo () {
  const res = await axios({
    url: '/project_cloud/workTool/pictureOnline',
    method: 'GET',
  })
  const createData = {
    waitDeal: res.waitDeal || 0,
    needOtherPhoto: res.needOtherPhoto || 0,
    todayPhoto: res.todayPhoto || 0
  }
  return createData
}

/**
 * @description 获取在线看片工作信息
 */
export async function getProductInfo () {
  const res = await axios({
    url: '/project_cloud/workTool/productCheck',
    method: 'GET',
  })
  const createData = {
    waitCheck: res.waitCheck || 0,
    todayWaitCheck: res.todayWaitCheck || 0
  }
  return createData
}

/**
 * @description 获取修图信息
 */
export async function getRetouchInfo (params) {
  const res = await axios({
    url: '/project_cloud/workTool/retouch',
    method: 'GET',
    params
  })

  const streamInfo = res.retouchingStream
  const streamOrder = new StreamModel(streamInfo)
  streamOrder.photoNum = streamInfo.photos_have_person_count || 0
  const dealStreamNum = res.dealStreamNum || 0
  let returnRate = _.get(res, 'todayQuota.returnRate') || 0
  returnRate = MathUtil.toFixed(returnRate * 100)
  const retouchTimeAvgSum = _.get(res, 'todayQuota.retouchTimeAvg.sum') || 0
  const retouchTimeAvgCount = _.get(res, 'todayQuota.retouchTimeAvg.count') || 0
  let retouchPhotoNumTimeSum = MathUtil.toFixed(retouchTimeAvgSum / retouchTimeAvgCount)

  retouchPhotoNumTimeSum = timeFormat(retouchPhotoNumTimeSum)
  const createData = {
    retouchingStream: streamOrder,
    hourGlass: streamInfo.hour_glass,
    dealStreamNum,
    returnRate,
    retouchPhotoNumTimeSum,
  }
  return createData
}
