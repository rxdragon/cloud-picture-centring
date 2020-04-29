<template>
  <div class="report-box">
    <div class="head-box">
      <div class="title">问题报告</div>
      <div class="time">时间：{{ timeSpan[0] }} ～ {{ timeSpan[1] }}</div>
      <i class="el-icon-close" @click="closeDrawer"></i>
    </div>
    <!-- 整体问题统计 -->
    <div class="issues-report module-panel">
      <div class="panel-title">整体问题统计</div>
      <div class="issues-main">
        <pie-chart :chart-data="cloudProblem" />
      </div>
    </div>
    <!-- 详细问题统计 -->
    <div class="issues-detail-report module-panel">
      <div class="panel-title">详细问题统计</div>
      <div class="search-item">
        <span>问题标签</span>
        <issue-label-select v-model="issueValue" />
      </div>
      <div class="issues-detail-main">
        <group-chart :time-span="timeSpan" :tags="issueValue" />
      </div>
    </div>
  </div>
</template>

<script>
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import PieChart from '@/components/charts/PieChart'
import GroupChart from './GroupChart'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as AssessmentCenter from '@/api/assessmentCenter'

export default {
  name: 'ReportBox',
  components: { IssueLabelSelect, PieChart, GroupChart },
  props: {
    timeSpan: { type: Array, default: () => [] }
  },
  data () {
    return {
      issueValue: [],
      cloudProblem: []
    }
  },
  created () {
    this.getCloudProblemReport()
  },
  methods: {
    closeDrawer () {
      this.$emit('update:show-draw', false)
    },
    /**
     * @description 获取订单
     */
    async getCloudProblemReport () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      this.cloudProblem = await AssessmentCenter.getCloudProblemReport(req)
    }
  }
}
</script>

<style lang="less" scoped>
.report-box {
  position: relative;
  width: 500px;
}

.head-box {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  height: 80px;
  padding: 24px;
  background-color: #f2f6fc;

  .title {
    margin-right: 8px;
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    color: #303133;
  }

  .time {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #303133;
  }

  .el-icon-close {
    margin-left: auto;
    cursor: pointer;
  }
}

.issues-report {
  .issues-main {
    height: 300px;
  }
}

.issues-detail-report {
  .panel-title {
    margin-bottom: 20px;
  }

  .search-item {
    margin-right: 0;

    & > span {
      display: inline-block;
      flex-shrink: 0;
      width: 56px;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      color: #303133;
    }
  }
}

.module-panel {
  border-radius: 0;
  box-shadow: none;
}
</style>
