/* eslint-disable max-len */
import axios from '@/plugins/axios.js'
import { toFixed } from '@/utils/validate'
import { transformPercentage, getAvg } from '@/utils'
import * as MathUtil from '@/utils/mathUtil'

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
  const finishPhotoNum = (msg.retouchPhotoNum || 0) +
    msg.finishPhotoNumForQuality +
    msg.finishPhotoNumForNotQuality +
    msg.finishPhotoNumForBoth
  // 门店退单率
  msg.storeReturnPhotoRate = transformPercentage(storeReturnForQualityPhoto - msg.RollbackPhotoNumForNormalRework - msg.RollbackPhotoNumForReturnRework, finishPhotoNum)

  // 申诉回滚
  msg.RetoucherAppealRollbackIncome = Number(msg.RetoucherRollbackIncomeForNormalRework) + Number(msg.RetoucherRollbackIncomeForReturnRework) // 收益
  msg.RetoucherAppealRollbackExp = Number(msg.RetoucherRollbackExpForNormalRework) + Number(msg.RetoucherRollbackExpForReturnRework) // 海草

  // 门店退回修图平均时长（单）
  msg.storeReturnRetouchTime = getAvg(msg.storeReturnRetouchTime, msg.finishStoreReturnStream)
  const chatData = [
    {
      name: '被门店退回（总）',
      orderCount: msg.storeReturnAllStream,
      photoCount: msg.storeReturnAllPhoto
    },
    {
      name: '云端完成退回订单（总）',
      orderCount: msg.finishStoreReturnStream,
      photoCount: msg.finishStoreReturnPhoto
    },
    {
      name: '被退回质量问题',
      orderCount: storeReturnForQualityStream,
      photoCount: storeReturnForQualityPhoto
    },
    {
      name: '被退回非质量问题',
      orderCount: storeReturnForNotQualityStream,
      photoCount: storeReturnForNotQualityPhoto
    },
    {
      name: '被退回非质量&质量问退',
      orderCount: storeReturnForBothStream,
      photoCount: storeReturnForBothPhoto
    },
    {
      name: '回滚的质量问题',
      orderCount: msg.RetoucherRollbackReturnQualityStreamNum + msg.RetoucherRollbackNormalQualityStreamNum,
      photoCount: msg.RollbackPhotoNumForNormalRework + msg.RollbackPhotoNumForReturnRework
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
    data: params
  }).then(msg => {
    return handerReturnQuota(msg)
  })
}

// 获取图标信息
export function getStaffReturnChartInfo (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getReworkQuotaGroupByStaff',
    method: 'POST',
    data: params
  }).then(msg => {
    const createData = msg.map(retoucherItem => {
      // 修图总数
      const retoucherFinishPhotoNum = retoucherItem.retoucherFinishPhotoNum

      const orderSumFun = MathUtil.summation(retoucherItem.storeReturnStreamNumForNormalQuality)
      orderSumFun(retoucherItem.storeReturnStreamNumForReworkQuality)
      orderSumFun(-1 * (retoucherItem.reworkRollbackStreamNumQuality))
      orderSumFun(-1 * (retoucherItem.normalRollbackStreamNumQuality))

      const photoCountSumFun = MathUtil.summation(retoucherItem.storeReturnPhotoNumForNormalQuality)
      photoCountSumFun(retoucherItem.storeReturnPhotoNumForReworkQuality)
      photoCountSumFun(-1 * (retoucherItem.normalRollbackPhotoNumRework))
      photoCountSumFun(-1 * (retoucherItem.reworkRollbackPhotoNumRework))

      const orderCount = orderSumFun.toResult()
      const photoCount = photoCountSumFun.toResult()
      const returnRate = retoucherFinishPhotoNum
        ? MathUtil.toFixed((photoCount / retoucherFinishPhotoNum * 100), 2)
        : 0
      return {
        name: retoucherItem.nickName || retoucherItem.name || '-',
        orderCount,
        photoCount,
        returnRate
      }
    })
    return createData
  })
}
