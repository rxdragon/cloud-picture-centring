<template>
  <div class="report-box">
    <div class="head-box">
      <div class="title">问题报告</div>
      <div class="time">时间：2015-10-02 ～ 2015-10-05</div>
      <i class="el-icon-close" @click="closeDrawer"></i>
    </div>
    <!-- 整体问题统计 -->
    <div class="issues-report module-panel">
      <div class="panel-title">整体问题统计</div>
      <div class="issues-main"></div>
    </div>
    <!-- 详细问题统计 -->
    <div class="issues-detail-report module-panel">
      <div class="panel-title">详细问题统计</div>
      <div class="search-item">
        <span>问题标签</span>
        <issue-label-select v-model="issueValue" />
      </div>
      <div class="issues-detail-main"></div>
    </div>
  </div>
</template>

<script>
import IssueLabelSelect from '@SelectBox/IssueLabelSelect'
import echarts from 'echarts'

export default {
  name: 'ReportBox',
  components: { IssueLabelSelect },
  data () {
    return {
      issueValue: []
    }
  },
  created () {
    console.log(echarts)
  },
  methods: {
    closeDrawer () {
      this.$emit('update:show-draw', false)
    }
  }
}
</script>

<style lang="less" scoped>
.head-box {
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
    background-color: red;
  }
}

.issues-detail-report {
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

  .issues-detail-main {
    height: 300px;
    background-color: red;
  }
}

.module-panel {
  border-radius: 0;
  box-shadow: none;
}
</style>
