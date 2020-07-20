<template>
  <div v-loading="loading" class="module-panel retouch-performance">
    <div class="panel-title">修图绩效</div>
    <div class="search-box">
      <div class="search-item">
        <span>时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <el-button type="primary" @click="getRetouchQuota">查 询</el-button>
    </div>
    <div class="panel-content">
      <el-table ref="panel-table" :data="performanceData" style="width: 100%;">
        <el-table-column label="修图单量/张数" width="200" fixed>
          <template slot-scope="scope">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">正常单量：</span>
                {{ scope.row.retouchNum }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">质量退单：</span>
                {{ scope.row.retouchNum }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">非质量退单：</span>
                {{ scope.row.retouchNum }}
              </span>
              <span class="span-row">
                <span class="span-title">质量&非质量：</span>
                {{ scope.row.retouchNum }}
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
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.ReworkPhoto">
              {{ scope.row.storeReturnNum }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="修图获得收益" width="220">
          <template slot-scope="scope">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">修图收益（不包含退单）：</span>
                {{ scope.row.retouchIncomeInfo.getIncome }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">沙漏超时扣除收益：</span>
                {{ scope.row.retouchIncomeInfo.rewardIncome }}
              </span>
              <span class="span-row">
                <span class="span-title">退单获得收益：</span>
                {{ scope.row.retouchIncomeInfo.punishIncome }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">退单扣除收益：</span>
                {{ scope.row.retouchIncomeInfo.actualIncome }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">奖励收益：</span>
                {{ scope.row.retouchIncomeInfo.actualIncome }}
              </span>
              <span class="span-row">
                <span class="span-title">总计：</span>
                {{ scope.row.retouchIncomeInfo.actualIncome }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="获得海草" width="220">
          <template slot-scope="scope">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">修图海草（不包含退单）：</span>
                {{ scope.row.exp.retouchExp | toFixedString }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">沙漏超时扣除海草：</span>
                {{ scope.row.exp.punishExp | toFixedString }}
              </span>
              <span class="span-row">
                <span class="span-title">退单获得海草：</span>
                {{ scope.row.exp.rewordExp | toFixedString }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">退单扣除海草：</span>
                {{ scope.row.exp.rewordExp | toFixedString }}
              </span>
              <span class="span-row">
                <span class="span-title">总计：</span>
                {{ scope.row.exp.rewordExp | toFixedString }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="点赞数/点赞率" min-width="120">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.GoodEvaluation">
              {{ scope.row.goodNum }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="点踩数/点踩率" min-width="120">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.GoodEvaluation">
              {{ scope.row.goodNum }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="顾客满意度（平均）" width="150" fixed="right">
          <template slot-scope="scope">
            {{ scope.row.gradeInfo.npsGrade }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { joinTimeSpan } from '@/utils/timespan.js'
import { parseTime } from '@/utils/index.js'
import { SearchType } from '@/utils/enumerate.js'
import DatePicker from '@/components/DatePicker'
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
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.getRetouchQuota()
  },
  methods: {
    /**
     * @description 获取修图绩效
     */
    async getRetouchQuota () {
      try {
        if (!this.timeSpan) {
          this.$newMessage.warning('请输入时间')
          return false
        }
        const reqData = {
          startAt: joinTimeSpan(this.timeSpan[0]),
          endAt: joinTimeSpan(this.timeSpan[1], 1)
        }
        this.loading = true
        this.performanceData = await Retoucher.getRetouchQuota(reqData)
        this.$refs['panel-table'].doLayout()
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    }
  }
}
</script>

<style lang="less">
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
</style>
