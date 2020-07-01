<template>
  <div>
    <div class="header">
      <h3>组员修图报告</h3>
    </div>
    <el-tabs v-model="activeName" v-show="isShowTab">
      <el-tab-pane label="修图报告" name="RetouchStaffReport" />
      <el-tab-pane label="云学院报告" name="AssessmentReport" />
      <el-tab-pane label="组员绩效管理" name="CrewPerformanceManagement" />
    </el-tabs>
    <keep-alive>
      <component :is="activeName" @changeShowTab="changeShowTab"/>
    </keep-alive>
  </div>
</template>

<script>
import RetouchStaffReport from './components/RetouchStaffReport'
import AssessmentReport from './components/AssessmentReport'
import CrewPerformanceManagement from './components/CrewPerformanceManagement'

export default {
  name: 'RetouchReport',
  components: { RetouchStaffReport, AssessmentReport, CrewPerformanceManagement },
  data () {
    return {
      isShowTab: true,
      activeName: 'CrewPerformanceManagement',//  初始化显示修图报告
    }
  },
  methods: {
    changeShowTab (val) {
      this.isShowTab = !val
    }
  }
}
</script>
