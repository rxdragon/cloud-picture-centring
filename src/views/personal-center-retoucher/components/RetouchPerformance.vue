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
        <el-table-column label="修图单量/张数" min-width="120" fixed>
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=default'">{{ scope.row.retouchNum }}</router-link>
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
        <el-table-column label="点赞数/点赞率" min-width="120">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.GoodEvaluation">
              {{ scope.row.goodNum }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="退单数/退单率" min-width="120">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=' + SearchType.ReworkPhoto">
              {{ scope.row.storeReturnNum }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="超时单量" min-width="80">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=default'">{{ scope.row.overNum }}</router-link>
          </template>
        </el-table-column>
        <el-table-column label="利奇马单量/张数" min-width="140">
          <template slot-scope="scope">
            <router-link :to="routeBase + '?retouchHistoryTimeSpan=' + timeSpan + '&retouchHistorySearchType=default'">{{ scope.row.lekimaCount }}</router-link>
          </template>
        </el-table-column>
        <el-table-column label="修图获得收益" min-width="150">
          <template slot-scope="scope">
            <div class="income-box">
              <span class="span-row">
                <span class="span-title">修图收益：</span>
                {{ scope.row.retouchIncomeInfo.getIncome }}
              </span>
              <span class="span-row text-money">
                <span class="span-title">奖励收益：</span>
                {{ scope.row.retouchIncomeInfo.rewardIncome }}
              </span>
              <span class="span-row text-red">
                <span class="span-title">惩罚收益：</span>
                {{ scope.row.retouchIncomeInfo.punishIncome }}
              </span>
              <span class="span-row">
                <span class="span-title">实获收益：</span>
                {{ scope.row.retouchIncomeInfo.actualIncome }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="exp" label="获得海草" min-width="110" />
        <el-table-column label="评分（平均值）" min-width="150" fixed="right">
          <template slot-scope="scope">
            <div class="grade-box">
              <span class="span-row">
                <span class="span-title">门店评分：</span>
                {{ scope.row.gradeInfo.storeGrade }}
              </span>
              <span class="span-row">
                <span class="span-title nps-grade">顾客满意度：</span>
                {{ scope.row.gradeInfo.npsGrade }}
              </span>
            </div>
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
@import "~@/styles/variables.less";

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
          width: 80px;
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

    .el-table__fixed-right,
    .el-table__fixed {
      height: 156px !important;
    }
  }
}
</style>
