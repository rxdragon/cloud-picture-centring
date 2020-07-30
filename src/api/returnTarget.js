import axios from '@/plugins/axios.js'
import { toFixed } from '@/utils/validate'
import { transformPercentage } from '@/utils'


function handerReturnQuota (msg) {
  for (const key in msg) {
    msg[key] = Number(msg[key])
  }
  // 门店总单数
  msg.storeReturnAllStream = msg.storeReturnStreamNumForNormalQuality +
    msg.storeReturnStreamNumForNormalNotQuality +
    msg.storeReturnStreamNumForNormalBoth +
    msg.storeReturnStreamNumForReworkQuality +
    msg.storeReturnStreamNumForReworkNotQuality +
    msg.storeReturnStreamNumForReworkBoth
  // 门店总退张数
  msg.storeReturnAllPhoto = msg.storeReturnPhotoNumForNormalQuality +
    msg.storeReturnPhotoNumForNormalNotQuality +
    msg.storeReturnPhotoNumForNormalBoth +
    msg.storeReturnPhotoNumForReworkQuality +
    msg.storeReturnPhotoNumForReworkNotQuality +
    msg.storeReturnPhotoNumForReworkBoth
  // 门店完成退回数量
  msg.finishStoreReturnStream = msg.finishStreamNumForQuality +
    msg.finishStreamNumForNotQuality +
    msg.finishStreamNumForBoth
  // 门店完成退回张数
  msg.finishStoreReturnPhoto = msg.finishPhotoNumForQuality +
    msg.finishPhotoNumForNotQuality +
    msg.finishPhotoNumForBoth
  // 门店质量问题退单单数
  const storeReturnForQualityStream = msg.storeReturnStreamNumForNormalQuality + msg.storeReturnStreamNumForReworkQuality
  // 门店质量问题退单张数
  const storeReturnForQualityPhoto = msg.storeReturnPhotoNumForNormalQuality + msg.storeReturnPhotoNumForReworkQuality
  // 门店非质量问题退单单数
  const storeReturnForNotQualityStream = msg.storeReturnStreamNumForNormalNotQuality + msg.storeReturnStreamNumForReworkNotQuality
  // 门店非质量问题退单张数
  const storeReturnForNotQualityPhoto = msg.storeReturnPhotoNumForNormalNotQuality + msg.storeReturnPhotoNumForReworkNotQuality
  // 门店质量&非质量问题退单单数
  const storeReturnForBothStream = msg.storeReturnStreamNumForNormalBoth + msg.storeReturnStreamNumForReworkBoth
  // 门店质量&非质量问题退单张数
  const storeReturnForBothPhoto = msg.storeReturnPhotoNumForNormalBoth + msg.storeReturnPhotoNumForReworkBoth
  // 退单总收益
  const storeReturnIncome = msg.storeReturnIncomeForQuality * 100 +
    msg.storeReturnIncomeForNotQuality * 100 +
    msg.storeReturnIncomeForBoth * 100
  msg.storeReturnIncome = toFixed(storeReturnIncome / 100)
  // 退单总海草
  const storeReturnExp = msg.storeReturnExpForQuality * 100 +
    msg.storeReturnExpForNotQuality * 100 +
    msg.storeReturnExpForBoth * 100
  msg.storeReturnExp = toFixed(storeReturnExp / 100)
  // 修图总张数
  const finishPhotoNum = msg.retouchPhotoNum || 0 +
    msg.finishPhotoNumForQuality +
    msg.finishPhotoNumForNotQuality +
    msg.finishPhotoNumForBoth
  // 门店退单率
  msg.storeReturnPhotoRate = transformPercentage(storeReturnForQualityPhoto, finishPhotoNum)
  const chatData = [
    {
      name: '门店退回（总）',
      orderCount: msg.storeReturnAllStream,
      photoCount: msg.storeReturnAllPhoto
    },
    {
      name: '云端完成退回订单（总）',
      orderCount: msg.finishStoreReturnStream,
      photoCount: msg.finishStoreReturnPhoto
    },
    {
      name: '退回质量问题',
      orderCount: storeReturnForQualityStream,
      photoCount: storeReturnForQualityPhoto
    },
    {
      name: '退回非质量问题',
      orderCount: storeReturnForNotQualityStream,
      photoCount: storeReturnForNotQualityPhoto
    },
    {
      name: '退回非质量&质量问退',
      orderCount: storeReturnForBothStream,
      photoCount: storeReturnForBothPhoto
    }
  ]
  const createData = {
    chatData,
    tableInfo: msg
  }
  return createData
}

/**
 * @description 获取退单指标
 * @param {*} req 
 */
export function getStoreReturnQuota (params) {
  return axios({
    url: '/project_cloud/operator/getStoreReturnQuota',
    method: 'POST',
    data: params
  }).then(msg => {
    return handerReturnQuota(msg)
  })
}

/**
 * @description 组长查询组员退单报告
 * @param {*} req 
 */
export function getStaffStoreReturnQuota (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getStoreReturnQuota',
    method: 'POST',
    params
  }).then(msg => {
    return handerReturnQuota(msg)
  })
}

export function getStaffReturnChartInfo (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getReworkQuotaGroupByStaff',
    method: 'POST',
    params
  }).then(msg => {
    const createData = msg.map(retoucherItem => {
      const orderCount = (Number(retoucherItem.storeReturnStreamNumForNormalQuality) || 0) +
        (Number(retoucherItem.storeReturnStreamNumForReworkQuality) || 0)
      const photoCount = (Number(retoucherItem.storeReturnPhotoNumForNormalQuality) || 0) +
        (Number(retoucherItem.storeReturnPhotoNumForReworkQuality) || 0)
      return {
        name: retoucherItem.nickName || retoucherItem.name || '-',
        orderCount,
        photoCount
      }
    })
    return createData
  })
}
