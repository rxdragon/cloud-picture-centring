<template>
  <div class="performance-inquire page-class">
    <div class="header">
      <h3>{{ activeName | filterActiveName }}</h3>
      <div class="header-plugin">
        <search-retouch-record :search-role="SEARCH_ROLE.OPERATE" />
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane v-if="showPartnerPerformance" label="伙伴绩效" name="PartnerPerformance" />
      <el-tab-pane v-if="showOverallPerformance" label="总体绩效" name="OverallPerformance" />
      <el-tab-pane v-if="showRetoucherGroupPerformance" label="修图组绩效" name="RetoucherGroupPerformance" />
      <!-- TODO -->
      <el-tab-pane label="退单统计" name="RetoucherChargeBackReport" />
      <el-tab-pane v-if="showTimeStatistics" label="用时统计" name="TimeStatistics" />
      <el-tab-pane v-if="showCheckerEvaluate" label="看片评价" name="CheckerEvaluate" />
      <!-- TODO -->
      <el-tab-pane label="云学院报告" name="CloudCollegeReport" />
    </el-tabs>
    <div
      class="table-box"
      :class="{'no-border': activeName === 'PartnerPerformance'}"
    >
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <component :is="activeName" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
import PartnerPerformance from './components/PartnerPerformance' // 伙伴绩效
import OverallPerformance from './components/OverallPerformance' // 总体绩效
import RetoucherGroupPerformance from './components/RetoucherGroupPerformance' // 修图组绩效
import RetoucherChargeBackReport from './components/RetoucherChargeBackReport' // 退单统计
import TimeStatistics from './components/TimeStatistics' // 用时统计
import CheckerEvaluate from './components/CheckerEvaluate' // 看片评价
import CloudCollegeReport from './components/CloudCollegeReport' // 云学院评价
import SearchRetouchRecord from '@/components/SearchRetouchRecord' // 查询
import { SEARCH_ROLE } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

export default {
  name: 'PerformanceInquire',
  components: { PartnerPerformance, OverallPerformance, RetoucherGroupPerformance, TimeStatistics, CheckerEvaluate, SearchRetouchRecord, RetoucherChargeBackReport, CloudCollegeReport },
  filters: {
    filterActiveName (value) {
      switch (value) {
        case 'PartnerPerformance':
          return '伙伴绩效'
        case 'OverallPerformance':
          return '总体绩效'
        case 'RetoucherGroupPerformance':
          return '修图组绩效'
        case 'RetoucherChargeBackReport':
          return '退单统计'
        case 'TimeStatistics':
          return '用时统计'
        case 'CheckerEvaluate':
          return '看片评价'
        case 'CloudCollegeReport':
          return '云学院报告'
        default:
          return '转换异常'
      }
    }
  },
  props: {},
  data () {
    return {
      SEARCH_ROLE,
      // TODO
      activeName: 'RetoucherChargeBackReport'
    }
  },
  computed: {
    ...mapGetters([
      'showPartnerPerformance',
      'showOverallPerformance',
      'showTimeStatistics',
      'showCheckerEvaluate',
      'showRetoucherGroupPerformance'
    ])
  }
}
</script>

<style lang="less" scoped>
.performance-inquire {
  width: 100%;
}

.table-box {
  margin-top: 0;
}
</style>
