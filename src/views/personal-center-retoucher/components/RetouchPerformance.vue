<template>
  <div v-loading="loading" class="module-panel retouch-performance">
    <div class="panel-title">
      修图绩效
      <div class="title-plugin">
        <el-popover placement="bottom-end" width="900" trigger="hover">
          <div class="tip-plugin-content">
            <h3>绩效规则：</h3>
            <p>1、修图单量 / 张数：查询时间范围内所修正常/质量问题/非质量问题/质量&非质量都有的流水单量和照片张数，其中照片张数若不计收入的则不会被统计。</p>
            <p>2、修图平均用时：查询时间范围内的单张平均修图时长和每单的平均修图时长。</p>
            <p>3、退张数 / 退张率(质量问题)：</p>
            <div class="message-content">
              <ul>
                <li>查询时间范围内被门店退回的照片张数和占比。该数据统计仅统计照片为质量问题的照片数据以及统计时间无关接单时间，即：3月10日接到一个流水单，退单时间为3月12日，退张数据会统计入3月12日。</li>
                <li>点击数字可跳转修图历史记录进行查询。</li>
                <li>退张率公式：(正常流水被退回张数 + 退回流水被退回张数) / (正常流水修图张数 + 退回流水修图张数)</li>
              </ul>
            </div>
            <p>4、修图收益(元)：</p>
            <div class="message-content">
              <ul>
                <li>修图收益(不包含退单)：查询时间范围内的正常修图收益(金币加成也直接计入该数据内)，不包含退单及其他扣除收益。</li>
                <li>沙漏超时扣除收益：查询时间范围内的流水单超时所扣除的收益。</li>
                <li>退单获得收益：查询时间范围内接到的其他人的退单所有获得的收益(此类照片收益会继承上一修图伙伴修图对应的的收益)或门店伙伴退回非质量问题照片获得的收益。</li>
                <li>退单扣除收益：查询时间范围内被门店退回的质量问题所扣除的收益。</li>
                <li>奖励收益：查询时间范围内所获得的冲量奖励所获得收益。</li>
                <li>总计=修图收益(不包含退单)-沙漏超时收益+退单获得收益-退单扣除收益+奖励收益</li>
              </ul>
            </div>
            <p>5、修图海草(颗)：</p>
            <div class="message-content">
              <ul>
                <li>修图海草(不包含退单)：查询时间范围内的正常修图海草(经验加成也直接计入该数据内)，不包含退单及其他扣除收海草。</li>
                <li>沙漏超时扣除海草：查询时间范围内的流水单超时所扣除的海草。</li>
                <li>退单获得收益：查询时间范围内接到的其他人的退单所有获得的海草(此类照片收益会继承上一修图伙伴修图对应的海草益)或门店伙伴退回非质量问题照片获得的海草。</li>
                <li>退单扣除海草：查询时间范围内被门店退回的质量问题所扣除的海草。</li>
                <li>总计=修图海草(不包含退单)-沙漏超时海草+退单获得海草-退单扣除海草。</li>
              </ul>
            </div>
            <p>6、点赞数 / 点赞率：查询时间内被门店伙伴点赞的流水单数量和占比，点击数字可跳转修图历史记录进行查询。</p>
            <p>7、点踩数 / 点踩率：查询时间内被门店伙伴点踩的流水单数量和占比，点击数字可跳转修图历史记录进行查询。</p>
            <p>8、顾客满意度：顾客对流水单的修图评价平均值。</p>
          </div>
          <div class="tip-box" slot="reference">
            <i class="el-icon-warning-outline"></i>
            绩效规则
          </div>
        </el-popover>
      </div>
    </div>
    <el-row class="search-box" :gutter="20">
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <span>修图完成时间</span>
          <date-picker v-model="timeSpan" />
        </div>
      </el-col>
      <el-col :span="8" :xl="4">
        <div class="search-item">
          <el-button type="primary" @click="getRetouchQuota">查 询</el-button>
        </div>
      </el-col>
    </el-row>

    <div class="panel-content">
      <el-table ref="panel-table" :data="performanceData" style="width: 100%;">
        <el-table-column label="修图单量/张数" width="200" fixed>
          <template slot-scope="{ row }">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">正常单量：</span>
                {{ row.retouchStreamNum }} / {{ row.retouchPhotoNum }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">质量退单：</span>
                {{ row.finishStreamNumForQuality }} / {{ row.finishPhotoNumForQuality }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">非质量退单：</span>
                {{ row.finishStreamNumForNotQuality }} / {{ row.finishPhotoNumForNotQuality }}
              </span>
              <span class="span-row">
                <span class="span-title">质量&非质量：</span>
                {{ row.finishStreamNumForBoth }} / {{ row.finishPhotoNumForBoth }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgRetouchTime" label="修图平均用时" min-width="120">
          <template slot-scope="{ row }">
            <div class="avg-time">
              <span>{{ row.avgRetouchTimeStream }}(单)</span>
              <span>{{ row.avgRetouchTimePhoto }}(张)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="退张数/退张率" width="120">
          <template slot-scope="{ row }">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.ReworkPhoto">
              {{ row.storeReturnPhotoNumForNormalQuality + row.storeReturnPhotoNumForReworkQuality - row.rollbackPhotoNumForNormalRework - row.rollbackPhotoNumForReturnRework }} / {{ row.storeReturnPhotoRate }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="修图获得收益" width="220">
          <template slot-scope="{ row }">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">修图收益（不包含退单）：</span>
                {{ row.income.retouchIncome }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">沙漏超时扣除收益：</span>
                {{ row.income.glassPunishIncome }}
              </span>
              <span class="span-row">
                <span class="span-title">退单获得收益：</span>
                {{ row.income.storeReturnIncome }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">退单扣除收益：</span>
                {{ row.income.punishIncome }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">时段冲量收益：</span>
                {{ row.income.timeIntervalImpulse }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">时段金币收益：</span>
                {{ row.income.timeIntervalReward }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">其他奖励收益：</span>
                {{ row.income.sunReward }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">退单回滚收益：</span>
                {{ row.income.rollbackIncomeRework }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">沙漏回滚收益：</span>
                {{ row.income.rollbackIncomeOvertime }}
              </span>

              <span class="span-row">
                <span class="span-title">总计：</span>
                {{ row.income.sumIncome }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="获得海草" width="220">
          <template slot-scope="{ row }">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">修图海草（不包含退单）：</span>
                {{ row.exp.retouchExp | toFixedString }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">沙漏超时扣除海草：</span>
                {{ row.exp.glassPunishExp | toFixedString }}
              </span>
              <span class="span-row">
                <span class="span-title">退单获得海草：</span>
                {{ row.exp.sumStoreReturnExp | toFixedString }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">退单扣除海草：</span>
                {{ row.exp.punishExp | toFixedString }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">时段奖励海草：</span>
                {{ row.exp.timeIntervalReward | toFixedString }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">退单回滚海草：</span>
                {{ row.exp.rollbackExpRework | toFixedString }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">沙漏回滚海草：</span>
                {{ row.exp.rollbackExpOvertime | toFixedString }}
              </span>
              <span class="span-row">
                <span class="span-title">总计：</span>
                {{ row.exp.sumExp | toFixedString }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="点赞数/点赞率" min-width="120">
          <template slot-scope="{ row }">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.GoodEvaluation">
              {{ row.storeGoodNum }} / {{ row.storeGoodRate }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="点踩数/点踩率" min-width="120">
          <template slot-scope="{ row }">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.BadEvaluation">
              {{ row.storeBadNum }} / {{ row.storeBadRate }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="顾客满意度（平均）" width="150" fixed="right">
          <template slot-scope="{ row }">
            {{ row.retoucherNpsScoreAvg }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { joinTimeSpan, delayLoading } from '@/utils/timespan.js'
import { SearchType } from '@/utils/enumerate.js'

import DatePicker from '@/components/DatePicker'
import moment from 'moment'

import * as Retoucher from '@/api/retoucher.js'

export default {
  name: 'RetouchPerformance',
  components: { DatePicker },
  data () {
    return {
      performanceData: [], // 修图绩效
      timeSpan: null, // 时间戳
      SearchType,
      loading: false,
      routeBase: '/retoucher-center/retouch-history'
    }
  },
  mounted () {
    const nowTime = moment().format('YYYY-MM-DD')
    this.timeSpan = [nowTime, nowTime]
    this.getRetouchQuota()
  },
  methods: {
    /**
     * @description 获取修图绩效
     */
    async getRetouchQuota () {
      try {
        if (!this.timeSpan) return this.$newMessage.warning('请输入时间')
        const reqData = {
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        this.loading = true
        this.performanceData = await Retoucher.getRetouchQuota(reqData)
        this.$refs['panel-table'].doLayout()
      } finally {
        await delayLoading()
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.panel-title {
  display: flex;
  justify-content: space-between;

  .title-plugin {
    .tip-box {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: @blue;

      i {
        margin-right: 10px;
        font-size: 14px;
      }
    }
  }
}

.retouch-performance {
  .text-red {
    color: @red;
  }

  .text-money {
    color: @moneyColor;
  }

  .text-plant {
    color: @panGreen;
  }

  .panel-content {
    margin-top: 0;

    a {
      color: @blue;
      text-decoration: underline;
    }

    .avg-time {
      & > span {
        display: block;
      }
    }

    .grade-box,
    .income-box {
      .span-row {
        display: flex;
        justify-content: space-between;

        .span-title {
          display: inline-block;
          text-align: left;
        }

        .nps-grade {
          width: 90px;
        }
      }
    }

    ::-webkit-scrollbar {
      height: 8px;
    }

    .el-table--scrollable-x .el-table__body-wrapper {
      overflow-x: overlay;
    }
  }
}

.tip-plugin-content {
  h3 {
    margin-bottom: 12px;
  }

  p {
    padding-left: 12px;
    line-height: 24px;
  }
}

.message-content {
  ul {
    margin: 0;

    li {
      line-height: 24px;
    }
  }
}
</style>
