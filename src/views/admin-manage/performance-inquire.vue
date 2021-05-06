<template>
  <div class="performance-inquire page-class">
    <div class="header">
      <h3>{{ activeName | filterActiveName }}</h3>
      <div class="header-plugin">
        <SearchRetouchRecord :searchPage.sync="showSearchPage" :search-role="SEARCH_ROLE.OPERATE" />
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="tabItem in labelList"
        :key="tabItem"
        :label="tabItem | filterActiveName"
        :name="tabItem"
      />
    </el-tabs>
    <div
      class="table-box"
      :class="{'no-border': activeName === defaultActiveName}"
      v-show="!showSearchPage"
      v-if="labelList.length"
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
import CloudCollegeReport from './components/CloudCollegeReport' // 云学院抽查评价
import ShowPicCollegeReport from './components/ShowPicCollegeReport' // 修修兽抽查评价
import SearchRetouchRecord from '@/components/SearchRetouchRecord' // 云端查询

import { SEARCH_ROLE } from '@/utils/enumerate'
import { mapGetters } from 'vuex'

export default {
  name: 'PerformanceInquire',
  components: { PartnerPerformance, OverallPerformance, RetoucherGroupPerformance, TimeStatistics, CheckerEvaluate, SearchRetouchRecord, RetoucherChargeBackReport, CloudCollegeReport, ShowPicCollegeReport },
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
        case 'ShowPicCollegeReport':
          return '修修兽报告'
        default:
          return '转换异常'
      }
    }
  },
  data () {
    return {
      SEARCH_ROLE,
      activeName: '',
      showSearchPage: false,
      defaultActiveName: ''
    }
  },
  computed: {
    ...mapGetters([
      'showPartnerPerformance',
      'showOverallPerformance',
      'showTimeStatistics',
      'showCheckerEvaluate',
      'showRetoucherGroupPerformance',
      'showRetoucherChargeBackReport',
      'showCloudCollegeReport',
      'showPicCollegeReport',
    ]),
    labelList () {
      const createData = []
      if (this.showPartnerPerformance) {
        createData.push('PartnerPerformance')
      }
      if (this.showOverallPerformance) {
        createData.push('OverallPerformance')
      }
      if (this.showRetoucherGroupPerformance) {
        createData.push('RetoucherGroupPerformance')
      }
      if (this.showRetoucherChargeBackReport) {
        createData.push('RetoucherChargeBackReport')
      }
      if (this.showTimeStatistics) {
        createData.push('TimeStatistics')
      }
      if (this.showCheckerEvaluate) {
        createData.push('CheckerEvaluate')
      }
      if (this.showCloudCollegeReport) {
        createData.push('CloudCollegeReport')
      }
      if (this.showPicCollegeReport) {
        createData.push('ShowPicCollegeReport')
      }
      return createData
    }
  },
  watch: {
    labelList: {
      handler () {
        this.activeName = this.labelList[0]
        this.defaultActiveName = this.labelList[0]
      },
      immediate: true
    }
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
