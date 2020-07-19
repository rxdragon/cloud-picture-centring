<template>
  <div>
    <div class="header">
      <h3>组员报告</h3>
      <div class="header-plugin">
        <search-retouch-record :search-role="SEARCH_ROLE.GROUP_LEADER" />
      </div>
    </div>
    <el-tabs v-model="activeName" v-show="isShowTab">
      <el-tab-pane label="修图报告" name="RetouchStaffReport" />
      <el-tab-pane label="云学院报告" name="AssessmentReport" />
      <el-tab-pane label="退单报告" name="ChargeBackReport" />
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
import ChargeBackReport from './components/ChargeBackReport'
import CrewPerformanceManagement from './components/CrewPerformanceManagement'
import SearchRetouchRecord from '@/components/SearchRetouchRecord'
import { SEARCH_ROLE } from '@/utils/enumerate'

export default {
  name: 'RetouchReport',
  components: { RetouchStaffReport, ChargeBackReport, AssessmentReport, CrewPerformanceManagement, SearchRetouchRecord },
  data () {
    return {
      SEARCH_ROLE,
      isShowTab: true,
      // TODO
      activeName: 'ChargeBackReport'
    }
  },
  methods: {
    changeShowTab (val) {
      this.isShowTab = !val
    }
  }
}
</script>
