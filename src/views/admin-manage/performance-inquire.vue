<template>
  <div class="performance-inquire page-class">
    <div class="header">
      <h3>{{ activeName | filterActiveName }}</h3>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane v-if="showPartnerPerformance" label="伙伴绩效" name="PartnerPerformance" />
      <el-tab-pane v-if="showOverallPerformance" label="总体绩效" name="OverallPerformance" />
      <el-tab-pane v-if="showAuditPerformance" label="审核绩效" name="AuditPerformance" />
      <el-tab-pane v-if="showTimeStatistics" label="用时统计" name="TimeStatistics" />
      <el-tab-pane v-if="showCheckerEvaluate" label="看片评价" name="CheckerEvaluate" />
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
import AuditPerformance from './components/AuditPerformance' // 审核绩效
import TimeStatistics from './components/TimeStatistics' // 用时统计
import CheckerEvaluate from './components/CheckerEvaluate' // 看片评价
import { mapGetters } from 'vuex'

export default {
  name: 'PerformanceInquire',
  components: { PartnerPerformance, OverallPerformance, AuditPerformance, TimeStatistics, CheckerEvaluate },
  filters: {
    filterActiveName (value) {
      switch (value) {
        case 'PartnerPerformance':
          return '伙伴绩效'
        case 'OverallPerformance':
          return '总体绩效'
        case 'AuditPerformance':
          return '审核绩效'
        case 'TimeStatistics':
          return '用时统计'
        case 'CheckerEvaluate':
          return '看片评价'
        default:
          return '转换异常'
      }
    }
  },
  props: {},
  data () {
    return {
      activeName: 'PartnerPerformance'
    }
  },
  computed: {
    ...mapGetters([
      'showPartnerPerformance',
      'showOverallPerformance',
      'showAuditPerformance',
      'showTimeStatistics',
      'showCheckerEvaluate'
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
