import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'

/**
 * @description 获取在线看片工作信息
 */
export async function getOnlineInfo () {
  const res = await axios({
    // TODO mock
    // url: '/project_cloud/workTool/pictureOnline',
    url: 'https://doc.pre.hzmantu.com/project_cloud/release-2-10-14/project_cloud/workTool/pictureOnline',
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
    // TODO mock
    // url: '/project_cloud/workTool/productCheck',
    url: 'https://doc.pre.hzmantu.com/project_cloud/release-2-10-14/project_cloud/workTool/productCheck',
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
export async function getRetouchInfo () {
  const res = await axios({
    // TODO mock
    // url: '/project_cloud/workTool/retouch',
    url: 'https://doc.pre.hzmantu.com/project_cloud/release-2-10-14/project_cloud/workTool/retouch',
    method: 'GET',
  })

  const streamInfo = res.retouchingStream
  const streamOrder = new StreamModel(streamInfo)
  const createData = {
    retouchingStream: streamOrder,
    hourGlass: streamInfo.hour_glass,
    dealStreamNum: res.dealStreamNum,
    returnRate: _.get(res, 'todayQuota.returnRate') || 0,
    retouchPhotoNumTimeSum: _.get(res, 'todayQuota.retouchPhotoNumTimeSum') || 0
  }
  return createData
}
