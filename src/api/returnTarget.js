/* eslint-disable max-len */
import axios from '@/plugins/axios.js'
import { transformPercentage, getAvg } from '@/utils'
import * as MathUtil from '@/utils/mathUtil'

function handerReturnQuota (msg) {
  for (const key in msg) {
    msg[key] = Number(msg[key])
  }
  // 门店总单数
  const sumStoreReturnAllStreamFun = MathUtil.summation()
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForNormalQuality)
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForNormalNotQuality)
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForNormalBoth)
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForReworkQuality)
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForReworkNotQuality)
  sumStoreReturnAllStreamFun(msg.storeReturnStreamNumForReworkBoth)
  msg.storeReturnAllStream = sumStoreReturnAllStreamFun.toResult()

  // 门店总退张数
  const sumStoreReturnAllPhotoFun = MathUtil.summation()
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForNormalQuality)
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForNormalNotQuality)
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForNormalBoth)
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForReworkQuality)
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForReworkNotQuality)
  sumStoreReturnAllPhotoFun(msg.storeReturnPhotoNumForReworkBoth)
  msg.storeReturnAllPhoto = sumStoreReturnAllPhotoFun.toResult()

  // 门店完成退回数量
  const sumFinishStoreReturnStreamFun = MathUtil.summation()
  sumFinishStoreReturnStreamFun(msg.finishStreamNumForQuality)
  sumFinishStoreReturnStreamFun(msg.finishStreamNumForNotQuality)
  sumFinishStoreReturnStreamFun(msg.finishStreamNumForBoth)
  msg.finishStoreReturnStream = sumFinishStoreReturnStreamFun.toResult()

  // 门店完成退回张数
  const sumFinishStoreReturnPhotoFun = MathUtil.summation()
  sumFinishStoreReturnPhotoFun(msg.finishPhotoNumForQuality)
  sumFinishStoreReturnPhotoFun(msg.finishPhotoNumForNotQuality)
  sumFinishStoreReturnPhotoFun(msg.finishPhotoNumForBoth)
  msg.finishStoreReturnPhoto = sumFinishStoreReturnPhotoFun.toResult()

  // 门店质量问题退单单数
  const sumStoreReturnForQualityStreamFun = MathUtil.summation()
  sumStoreReturnForQualityStreamFun(msg.storeReturnStreamNumForNormalQuality)
  sumStoreReturnForQualityStreamFun(msg.storeReturnStreamNumForReworkQuality)
  const storeReturnForQualityStream = sumStoreReturnForQualityStreamFun.toResult()

  // 门店质量问题退单张数
  const sumStoreReturnForQualityPhotoFun = MathUtil.summation()
  sumStoreReturnForQualityPhotoFun(msg.storeReturnPhotoNumForNormalQuality)
  sumStoreReturnForQualityPhotoFun(msg.storeReturnPhotoNumForReworkQuality)
  const storeReturnForQualityPhoto = sumStoreReturnForQualityPhotoFun.toResult()

  // 门店非质量问题退单单数
  const sumStoreReturnForNotQualityStreamFun = MathUtil.summation()
  sumStoreReturnForNotQualityStreamFun(msg.storeReturnStreamNumForNormalNotQuality)
  sumStoreReturnForNotQualityStreamFun(msg.storeReturnStreamNumForReworkNotQuality)
  const storeReturnForNotQualityStream = sumStoreReturnForNotQualityStreamFun.toResult()

  // 门店非质量问题退单张数
  const sumStoreReturnForNotQualityPhotoFun = MathUtil.summation()
  sumStoreReturnForNotQualityPhotoFun(msg.storeReturnPhotoNumForNormalNotQuality)
  sumStoreReturnForNotQualityPhotoFun(msg.storeReturnPhotoNumForReworkNotQuality)
  const storeReturnForNotQualityPhoto = sumStoreReturnForNotQualityPhotoFun.toResult()

  // 门店质量&非质量问题退单单数
  const sumStoreReturnForBothStreamFun = MathUtil.summation()
  sumStoreReturnForBothStreamFun(msg.storeReturnStreamNumForNormalBoth)
  sumStoreReturnForBothStreamFun(msg.storeReturnStreamNumForReworkBoth)
  const storeReturnForBothStream = sumStoreReturnForBothStreamFun.toResult()

  // 门店质量&非质量问题退单张数
  const sumStoreReturnForBothPhotoFun = MathUtil.summation()
  sumStoreReturnForBothPhotoFun(msg.storeReturnPhotoNumForNormalBoth)
  sumStoreReturnForBothPhotoFun(msg.storeReturnPhotoNumForReworkBoth)
  const storeReturnForBothPhoto = sumStoreReturnForBothPhotoFun.toResult()

  // 退单总收益
  const sumStoreReturnIncomeFun = MathUtil.summation()
  sumStoreReturnIncomeFun(msg.storeReturnIncomeForQuality)
  sumStoreReturnIncomeFun(msg.storeReturnIncomeForNotQuality)
  sumStoreReturnIncomeFun(msg.storeReturnIncomeForBoth)
  const storeReturnIncome = sumStoreReturnIncomeFun.toResult()
  msg.storeReturnIncome = MathUtil.toFixed(storeReturnIncome)

  // 退单总海草
  const sumStoreReturnExpFun = MathUtil.summation()
  sumStoreReturnExpFun(msg.storeReturnExpForQuality)
  sumStoreReturnExpFun(msg.storeReturnExpForNotQuality)
  sumStoreReturnExpFun(msg.storeReturnExpForBoth)
  const storeReturnExp = sumStoreReturnExpFun.toResult()
  msg.storeReturnExp = MathUtil.toFixed(storeReturnExp)

  // 修图总张数
  const sumFinishPhotoNumFun = MathUtil.summation()
  sumFinishPhotoNumFun(msg.retouchPhotoNum || 0)
  sumFinishPhotoNumFun(msg.finishPhotoNumForQuality || 0)
  sumFinishPhotoNumFun(msg.finishPhotoNumForNotQuality || 0)
  sumFinishPhotoNumFun(msg.finishPhotoNumForBoth || 0)
  const finishPhotoNum = sumFinishPhotoNumFun.toResult()

  // 门店退单率
  // 实际退张数，减去回滚
  const sumRealStoreReturnForQualityPhotoFun = MathUtil.summation()
  sumRealStoreReturnForQualityPhotoFun(storeReturnForQualityPhoto)
  sumRealStoreReturnForQualityPhotoFun(-1 * msg.RollbackPhotoNumForNormalRework)
  sumRealStoreReturnForQualityPhotoFun(-1 * msg.RollbackPhotoNumForReturnRework)
  const realStoreReturnForQualityPhoto = sumRealStoreReturnForQualityPhotoFun.toResult()
  msg.storeReturnPhotoRate = transformPercentage(realStoreReturnForQualityPhoto, finishPhotoNum)

  // 申诉回滚
  const sumRetoucherAppealRollbackIncomeFun = MathUtil.summation()
  sumRetoucherAppealRollbackIncomeFun(msg.RetoucherRollbackIncomeForNormalRework)
  sumRetoucherAppealRollbackIncomeFun(msg.RetoucherRollbackIncomeForReturnRework)
  // 申诉回滚收益
  msg.RetoucherAppealRollbackIncome = sumRetoucherAppealRollbackIncomeFun.toResult()
  // 申诉回滚海草
  const sumRetoucherAppealRollbackExpFun = MathUtil.summation()
  sumRetoucherAppealRollbackExpFun(msg.RetoucherRollbackExpForNormalRework)
  sumRetoucherAppealRollbackExpFun(msg.RetoucherRollbackExpForReturnRework)
  msg.RetoucherAppealRollbackExp = sumRetoucherAppealRollbackExpFun.toResult()

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
      // 修图总张数
      const sumFinishPhotoNumFun = MathUtil.summation()
      sumFinishPhotoNumFun(retoucherItem.retoucherFinishPhotoNum || 0)
      sumFinishPhotoNumFun(retoucherItem.finishPhotoNumForBoth || 0)
      sumFinishPhotoNumFun(retoucherItem.finishPhotoNumForNotQuality || 0)
      sumFinishPhotoNumFun(retoucherItem.finishPhotoNumForQuality || 0)
      const retoucherFinishPhotoNum = sumFinishPhotoNumFun.toResult()

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
