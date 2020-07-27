<template>
  <div>
    <div class="header">
      <h3>组员报告</h3>
      <div class="header-plugin">
        <search-retouch-record ref="searchRetouchRecord" :search-role="SEARCH_ROLE.GROUP_LEADER" />
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="修图报告" name="RetouchStaffReport" />
      <el-tab-pane label="云学院报告" name="AssessmentReport" />
      <el-tab-pane label="退单报告" name="ChargeBackReport" />
      <el-tab-pane label="组员绩效管理" name="CrewPerformanceManagement" />
    </el-tabs>
    <keep-alive>
      <component :is="activeName" @showSearchPage="onShowSearchPage"/>
    </keep-alive>
  </div>
</template>

<script>
import RetouchStaffReport from './components/RetouchStaffReport'
import AssessmentReport from './components/AssessmentReport'
import ChargeBackReport from './components/ChargeBackReport'
import CrewPerformanceManagement from './components/CrewPerformanceManagement'
import SearchRetouchRecord from '@/components/SearchRetouchRecord'
import { SEARCH_ROLE, SearchType } from '@/utils/enumerate'

export default {
  name: 'RetouchReport',
  components: { RetouchStaffReport, ChargeBackReport, AssessmentReport, CrewPerformanceManagement, SearchRetouchRecord },
  data () {
    return {
      SEARCH_ROLE,
      activeName: 'RetouchStaffReport'
    }
  },
  methods: {
    /**
     * @description 监听打开页面
     */
    onShowSearchPage (val) {
      const { timeSpan, searchType, staffId } = val
      this.$refs['searchRetouchRecord'].resetSearchType()
      if (searchType) {
        switch (searchType) {
          case SearchType.GoodEvaluation:
            this.$refs['searchRetouchRecord'].isGood = true
            break
          case SearchType.BadEvaluation:
            this.$refs['searchRetouchRecord'].isGood = false
            break
          default:
            break
        }
      }
      if (staffId) { this.$refs['searchRetouchRecord'].staffId = staffId }
      this.$refs['searchRetouchRecord'].cloudAuditTimeSpan = timeSpan
      this.$refs['searchRetouchRecord'].showSearchPage = true
      this.$refs['searchRetouchRecord'].searchCloudInfo(1)
    }
  }
}
</script>
