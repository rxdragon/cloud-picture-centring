/* eslint-disable max-len */

import { transformPercentage, getAvg, timeFormat } from '@/utils/index.js'
import * as Validate from '@/utils/validate.js'

export default class TargetModel {
  base = {}

  // 单量
  retouchStreamNum = 0 // 正常单量
  storeReturnNum = 0 // 被门店退单数量
  finishStreamNumForQuality = 0 // R流水完成质量问题订单
  finishStreamNumForNotQuality = 0 // R流水完成非质量问题订单
  finishStreamNumForBoth = 0 // R流水完成质量&非质量问题
  storeReturnStreamNumForNormalQuality = 0 // C流水被退质量单量
  storeReturnStreamNumForNormalNotQuality = 0 // C流水被退非质量单量
  storeReturnStreamNumForNormalBoth = 0 // C流水被退质量&非质量单量
  storeReturnStreamNumForReworkQuality = 0 // R流水被退质量单量
  storeReturnStreamNumForReworkNotQuality = 0 // R流水被退非质量单量
  storeReturnStreamNumForReworkBoth = 0 // R流水被退质量&非质量单量
  

  // 张数(正常流水)
  retouchPhotoNum = 0 // 正常张数
  storeReturnPhotoNum = 0 // 被门店退单张数
  finishPhotoNumForQuality = 0 // R流水完成质量问题照片
  finishPhotoNumForNotQuality = 0 // R流水完成非质量问题照片
  finishPhotoNumForBoth = 0 // R流水完成质量&非质量问题照片
  storeReturnPhotoNumForNormalQuality = 0 // C流水被退质量照片
  storeReturnPhotoNumForNormalNotQuality = 0 // C流水被退非质量照片
  storeReturnPhotoNumForNormalBoth = 0 // C流水被退质量&非质量照片
  storeReturnPhotoNumForReworkQuality = 0 // R流水被退质量照片
  storeReturnPhotoNumForReworkNotQuality = 0 // R流水被退非质量照片
  storeReturnPhotoNumForReworkBoth = 0 // R流水被退质量&非质量照片
  rollbackPhotoNumForReturnRework = 0 // r流水回滚质量照片张数
  rollbackPhotoNumForNormalRework = 0 // c流水回滚质量照片张数

  // 修图时间
  avgRetouchTimeStream = 0 // 修图平均时间（单）
  avgRetouchTimePhoto = 0 // 修图平均时间（张）

  // 退张数
  storeReturnPhotoRate = 0 // 退张率

  // 收益
  income = {
    retouchIncome: 0, // 原本收益
    glassPunishIncome: 0, // 沙漏扣除收益
    storeReturnIncomeForQuality: 0, // 质量获取收益（张）
    storeReturnIncomeForNotQuality: 0, // 非质量问题获取收益（张）
    storeReturnIncomeForBoth: 0, // 非质量问题获取收益
    storeReturnIncome: 0, // 退单收益
    reward: 0, // 奖励收益
    impulse: 0, // 冲量奖励
    sunReward: 0, // 奖励总收益
    rollbackIncomeRework: 0, // 退单回滚的总收益
    rollbackIncomeOvertime: 0, // 沙漏回滚的总收益
    punishIncome: 0, // 退单质量扣除收益
    timeIntervalImpulse: 0, // 时段冲量奖励
    timeIntervalReward: 0, // 时段金币奖励
    sumIncome: 0
  }
  
  // 海草
  exp = {
    retouchExp: 0, // 修图海草获取收益
    glassPunishExp: 0, // 沙漏扣除海草
    storeReturnExpForQuality: 0, // 非本人订单产生海草
    storeReturnExpForNotQuality: 0, // 非质量问题订单产生海草
    storeReturnExpForBoth: 0, // 质量&非质量问题收益
    sumStoreReturnExp: 0, // 退单获得海草
    punishExp: 0, // 质量扣除获取收益
    rollbackExpRework: 0, // 退单滚海草值
    rollbackExpOvertime: 0, // 沙漏滚海草值
    timeIntervalReward: 0, // 时段海草奖励
    sumExp: 0
  }

  // 门店指标
  storeEvaluateNum = 0 // 点赞总数
  storeGoodNum = 0 // 点赞数
  storeGoodRate = 0 // 点赞率
  storeBadNum = 0 // 点踩数
  storeBadRate = 0 // 点踩率

  // nps评分
  retoucherNpsScoreAvg = 0

  constructor (targetData) {
    this.base = targetData
    this.getStreamCount()
    this.getPhotoCount()
    // 修图平均时间
    this.getRetouchTime()
    // 退单
    this.getStoreReturnPhotoRate()
    this.getIncomeInfo()
    this.getExpInfo()

    // 门店相关指标
    this.storeEvaluateNum = Number(_.get(targetData, 'storeEvaluate.count')) || 0
    this.storeGoodNum = Number(targetData.goodNum)
    this.storeBadNum = Number(targetData.badNum)
    this.storeGoodRate = transformPercentage(this.storeGoodNum, this.storeEvaluateNum)
    this.storeBadRate = transformPercentage(this.storeBadNum, this.storeEvaluateNum)
    this.retoucherNpsScoreAvg = getAvg(targetData.retoucherNpsScore.sum, targetData.retoucherNpsScore.count)
  }

  // 获取订单数量相关信息
  getStreamCount () {
    this.retouchStreamNum = Number(this.base.retouchStreamNum)
    this.storeReturnNum = Number(this.base.storeReturnNum)
    this.finishStreamNumForQuality = Number(this.base.finishStreamNumForQuality)
    this.finishStreamNumForNotQuality = Number(this.base.finishStreamNumForNotQuality)
    this.finishStreamNumForBoth = Number(this.base.finishStreamNumForBoth)
    this.storeReturnStreamNumForNormalQuality = Number(this.base.storeReturnStreamNumForNormalQuality)
    this.storeReturnStreamNumForNormalNotQuality = Number(this.base.storeReturnStreamNumForNormalNotQuality)
    this.storeReturnStreamNumForNormalBoth = Number(this.base.storeReturnStreamNumForNormalBoth)
    this.storeReturnStreamNumForReworkQuality = Number(this.base.storeReturnStreamNumForReworkQuality)
    this.storeReturnStreamNumForReworkNotQuality = Number(this.base.storeReturnStreamNumForReworkNotQuality)
    this.storeReturnStreamNumForReworkBoth = Number(this.base.storeReturnStreamNumForReworkBoth)
  }

  // 获取照片数量相关信息
  getPhotoCount () {
    this.retouchPhotoNum = Number(this.base.retouchPhotoNum)
    this.storeReturnPhotoNum = Number(this.base.storeReturnPhotoNum)
    this.finishPhotoNumForQuality = Number(this.base.finishPhotoNumForQuality)
    this.finishPhotoNumForNotQuality = Number(this.base.finishPhotoNumForNotQuality)
    this.finishPhotoNumForBoth = Number(this.base.finishPhotoNumForBoth)
    this.storeReturnPhotoNumForNormalQuality = Number(this.base.storeReturnPhotoNumForNormalQuality)
    this.storeReturnPhotoNumForNormalNotQuality = Number(this.base.storeReturnPhotoNumForNormalNotQuality)
    this.storeReturnPhotoNumForNormalBoth = Number(this.base.storeReturnPhotoNumForNormalBoth)
    this.storeReturnPhotoNumForReworkQuality = Number(this.base.storeReturnPhotoNumForReworkQuality)
    this.storeReturnPhotoNumForReworkNotQuality = Number(this.base.storeReturnPhotoNumForReworkNotQuality)
    this.rollbackPhotoNumForNormalRework = Number(this.base.rollbackPhotoNumForNormalRework)
    this.rollbackPhotoNumForReturnRework = Number(this.base.rollbackPhotoNumForReturnRework)
    this.storeReturnPhotoNumForReworkBoth = Number(this.base.storeReturnPhotoNumForReworkBoth)
  }

  // 修图平均时间
  getRetouchTime () {
    const avgTime = this.base.avgRetouchAndRebuildTime
    const avgRetouchTimeStream = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    this.avgRetouchTimeStream = timeFormat(avgRetouchTimeStream, 'text', true)
    const avgRetouchTimePhoto = getAvg(avgTime.retouchTimeForPhoto.sum, avgTime.retouchTimeForPhoto.count)
    this.avgRetouchTimePhoto = timeFormat(avgRetouchTimePhoto, 'text', true)
  }

  // 计算退张率
  getStoreReturnPhotoRate () {
    const returnCount = this.storeReturnPhotoNumForNormalQuality + this.storeReturnPhotoNumForReworkQuality - this.rollbackPhotoNumForNormalRework - this.rollbackPhotoNumForReturnRework
    this.finishPhotoNum = this.retouchPhotoNum +
      this.finishPhotoNumForQuality +
      this.finishPhotoNumForNotQuality +
      this.finishPhotoNumForBoth
    this.storeReturnPhotoRate = transformPercentage(returnCount, this.finishPhotoNum)
  }

  // 获取收益相关信息
  getIncomeInfo () {
    this.income.retouchIncome = Validate.toFixed(_.get(this.base, 'income.retouchIncome')) || 0
    this.income.glassPunishIncome = Validate.toFixed(_.get(this.base, 'income.glassPunishIncome')) || 0
    this.income.storeReturnIncomeForQuality = Validate.toFixed(_.get(this.base, 'income.storeReturnIncomeForQuality')) || 0
    this.income.storeReturnIncomeForNotQuality = Validate.toFixed(_.get(this.base, 'income.storeReturnIncomeForNotQuality')) || 0
    this.income.storeReturnIncomeForBoth = Validate.toFixed(_.get(this.base, 'income.storeReturnIncomeForBoth')) || 0
    this.income.reward = Validate.toFixed(_.get(this.base, 'income.reward')) || 0
    this.income.impulse = Validate.toFixed(_.get(this.base, 'income.impulse')) || 0
    this.income.punishIncome = Validate.toFixed(_.get(this.base, 'income.punishIncome')) || 0
    this.income.timeIntervalImpulse = Validate.toFixed(_.get(this.base, 'income.timeIntervalImpulse')) || 0
    this.income.timeIntervalReward = Validate.toFixed(_.get(this.base, 'income.timeIntervalReward')) || 0

    let sunReward = this.income.reward * 100 + this.income.impulse * 100
    sunReward = Validate.toFixed(sunReward / 100)
    this.income.sunReward = sunReward

    // 正常流水的会回补收益
    const retoucherRollbackIncomeForNormalRework = Validate.toFixed(_.get(this.base, 'income.retoucherRollbackIncomeForNormalRework') || 0)
    // 退单流水的回补收益
    const retoucherRollbackIncomeForReturnRework = Validate.toFixed(_.get(this.base, 'income.retoucherRollbackIncomeForReturnRework') || 0)
    this.income.rollbackIncomeRework = retoucherRollbackIncomeForNormalRework + retoucherRollbackIncomeForReturnRework
    this.income.rollbackIncomeOvertime = Validate.toFixed(_.get(this.base, 'income.retoucherRollbackIncomeForOverTime') || 0)

    let storeReturnIncome =
      this.income.storeReturnIncomeForQuality * 100 +
      this.income.storeReturnIncomeForNotQuality * 100 +
      this.income.storeReturnIncomeForBoth * 100
    storeReturnIncome = Validate.toFixed(storeReturnIncome / 100)
    this.income.storeReturnIncome = storeReturnIncome

    let sumIncome =
      this.income.retouchIncome * 100 -
      this.income.glassPunishIncome * 100 +
      this.income.storeReturnIncomeForQuality * 100 +
      this.income.storeReturnIncomeForNotQuality * 100 +
      this.income.storeReturnIncomeForBoth * 100 +
      this.income.timeIntervalImpulse * 100 +
      this.income.timeIntervalReward * 100 +
      this.income.reward * 100 +
      this.income.impulse * 100 -
      this.income.punishIncome * 100
    sumIncome = Validate.toFixed(sumIncome / 100)
    this.income.sumIncome = sumIncome
  }

  // 获取经验相关
  getExpInfo () {
    this.exp.retouchExp = Validate.toFixed(_.get(this.base, 'exp.retouchExp')) || 0
    this.exp.glassPunishExp = Validate.toFixed(_.get(this.base, 'exp.glassPunishExp')) || 0
    this.exp.storeReturnExpForQuality = Validate.toFixed(_.get(this.base, 'exp.storeReturnExpForQuality')) || 0
    this.exp.storeReturnExpForNotQuality = Validate.toFixed(_.get(this.base, 'exp.storeReturnExpForNotQuality')) || 0
    this.exp.storeReturnExpForBoth = Validate.toFixed(_.get(this.base, 'exp.storeReturnExpForBoth')) || 0
    this.exp.punishExp = Validate.toFixed(_.get(this.base, 'exp.punishExp')) || 0
    this.exp.timeIntervalReward = Validate.toFixed(_.get(this.base, 'exp.timeIntervalReward')) || 0

    // 正常流水的回补海草
    const retoucherRollbackExpForNormalRework = Validate.toFixed(_.get(this.base, 'exp.retoucherRollbackExpForNormalRework') || 0)
    // 退单流水的回补海草
    const retoucherRollbackExpForReturnRework = Validate.toFixed(_.get(this.base, 'exp.retoucherRollbackExpForReturnRework') || 0)
    this.exp.rollbackExpRework = retoucherRollbackExpForNormalRework + retoucherRollbackExpForReturnRework
    this.exp.rollbackExpOvertime = Validate.toFixed(_.get(this.base, 'exp.retoucherRollbackExpForOverTime') || 0)

    let sumStoreReturnExp =
      this.exp.storeReturnExpForQuality * 100 +
      this.exp.storeReturnExpForNotQuality * 100 +
      this.exp.storeReturnExpForBoth * 100
    sumStoreReturnExp = Validate.toFixed(sumStoreReturnExp / 100)
    this.exp.sumStoreReturnExp = sumStoreReturnExp

    let sumExp =
      this.exp.retouchExp * 100 -
      this.exp.glassPunishExp * 100 +
      this.exp.storeReturnExpForQuality * 100 +
      this.exp.storeReturnExpForNotQuality * 100 +
      this.exp.storeReturnExpForBoth * 100 +
      this.exp.timeIntervalReward * 100 -
      this.exp.punishExp * 100
    sumExp = Validate.toFixed(sumExp / 100)
    this.exp.sumExp = sumExp
  }
}
