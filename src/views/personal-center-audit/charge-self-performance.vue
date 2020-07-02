<template>
  <div class="personal-center-audit">
    <div class="header">
      <h3>个人绩效</h3>
    </div>
    <!-- 小蜜蜂 -->
    <div class="module-panel apis-florea" v-loading="apisLoading">
      <div class="panel-title">小蜜蜂</div>
      <div class="search-box">
        <div class="search-item">
          <span>查询时间</span>
          <el-date-picker
            v-model="yearValue"
            type="year"
            value-format="yyyy"
            placeholder="选择年"
          />
        </div>
        <div class="search-item">
          <el-button type="primary" @click="getApisFlorea">查询</el-button>
        </div>
      </div>
      <div class="apis-info">
        <el-row class="info-box">
          <el-col
            v-for="(apisItem, apisIndex) in apisFloreaData"
            :key="apisIndex"
            :span="4"
            class="info-item"
          >
            <div class="info-label">{{ apisItem.label }}</div>
            <div class="info-value">{{ apisItem.value }}</div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 月度绩效 -->
    <div class="module-panel monthly-performance" v-loading="performanceLoading">
      <div class="panel-title">月度绩效</div>
      <div class="search-box">
        <div class="search-item">
          <span>查询时间</span>
          <el-date-picker
            v-model="timeSpan"
            type="month"
            value-format="yyyyMM"
            placeholder="选择月"
          />
        </div>
        <div class="search-item">
          <el-button type="primary" @click="getPerformanceInfo">查 询</el-button>
        </div>
      </div>
      <div class="performance-box">
        <el-row class="info-box">
          <el-col :span="6" class="info-item">
            <div class="info-label">退张率</div>
            <div class="info-value">{{ performanceInfo.return_rate || '-' }}%</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">退张排名</div>
            <div class="info-value">{{ performanceInfo.return_rate_rank || '-' }}</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">绩效得分</div>
            <div class="info-value">{{ performanceInfo.leaderKpi || '-' }}</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">绩效排名</div>
            <div class="info-value">{{ performanceInfo.leaderKpiRank || '-' }}</div>
          </el-col>
          <el-col :span="6" class="info-item">
            <div class="info-label">抽查平均分</div>
            <div class="info-value">{{ performanceInfo.average_score || '-' }}</div>
          </el-col>
          <el-col :span="18" class="info-item">
            <div class="info-label">抽查排名</div>
            <div class="info-value">{{ performanceInfo.average_score_rank || '-' }}</div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import * as Performance from '@/api/performance.js'
import { getSearchMonth } from '@/utils/exportPerformanceExcel.js'
import * as RetouchLeader from '@/api/retouchLeader.js'

export default {
  name: 'PersonalCenterAudit',
  data() {
    return {
      yearValue: null, // 小蜜蜂查询日期
      apisLoading: false, // 小蜜蜂加载动态
      timeSpan: null, // 绩效查询时间戳
      performanceLoading: false, // 绩效加载动态
      performanceInfo: {}, // 绩效得分
      apisFloreaData: [{
        label: '金额',
        value: '-'
      }, {
        label: '绩效平均分',
        value: '-'
      }, {
        label: '排名',
        value: '-'
      }] // 小蜜蜂数据
    }
  },
  created () {
    const nowYear = new Date().getFullYear()
    this.yearValue = nowYear.toString()
    this.timeSpan = getSearchMonth()
    this.getPerformanceInfo()
    this.getApisFlorea()
  },
  methods: {
    /**
     * @description 获取小蜜蜂奖励
     */
    async getApisFlorea () {
      try {
        if (!this.yearValue) throw new Error('请选择时间')
        this.apisLoading = true
        const req = {
          year: this.yearValue
        }
        this.apisFloreaData = await RetouchLeader.getLittleBeeInfo(req)
      } catch (error) {
        console.error(error)
        error.message && this.$newMessage.warning(error.message)
      } finally {
        await this.$delayLoading()
        this.apisLoading = false
      }
    },
    /**
     * @description 获取绩效
     */
    async getPerformanceInfo () {
      try {
        if (!this.timeSpan) throw new Error('请选择时间')
        this.performanceLoading = true
        const req = {
          cycle: this.timeSpan,
          cycleFormat: 'Ym',
          type: 'retoucherLeader',
          page: 1,
          pageSize: 99
        }
        const data = await Performance.getGroupScoreRanks(req)
        this.performanceInfo = data[0] || {}
      } catch (error) {
        console.error(error)
        error.message && this.$newMessage.warning(error.message)
      } finally {
        await this.$delayLoading()
        this.performanceLoading = false
      }
    }
  },
}
</script>

<style lang="less" scoped>
.personal-center-audit {
  .module-panel {
    margin-bottom: 20px;

    .panel-title {
      margin-bottom: 20px;
    }

    .info-box {
      margin-top: 20px;
      border-bottom: 1px solid #fafafa;

      .info-label {
        display: flex;
        align-items: center;
        height: 100%;
        max-height: 78px;
        padding: 17px 20px;
        font-family: @pingFang;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
        text-align: left;
        background-color: #f2f2f2;
      }

      .info-value {
        height: 58px;
        padding: 21px 20px;
        font-size: 14px;
        text-align: left;
        background-color: #fff;
      }
    }
  }
}
</style>
