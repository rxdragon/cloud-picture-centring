<template>
  <div class="cloud-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item" v-if="searchRole === CLOUD_ROLE.OPERATE">
        <span>修图伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="product-box search-item" v-if="searchRole === CLOUD_ROLE.OPERATE">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <div class="title">
      <span>平均分对比</span>
      <span>抽查平均分：{{ avgScore }}</span>
    </div>
    <div class="chat-warp" v-if="gradeConfigurations.length">
      <chart-sunburst
        v-for="item in GRADE_CONFIGURATION_TYPE"
        :key="item"
        :chartDatas="getChartDatas(item)"
        :title="`${item}问题对比`"
      ></chart-sunburst>
    </div>
    <div class="chat-warp" v-else> <no-data></no-data></div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker/index'
import StaffSelect from '@SelectBox/StaffSelect/index'
import NoData from '@/components/NoData'
import ChartSunburst from './components/ChartSunburst'
import ProductSelect from '@SelectBox/ProductSelect/index'
import { CLOUD_ROLE, gradeConfigurationToCN } from '@/utils/enumerate'
import * as TimespanUtil from '@/utils/timespan'
import * as AssessmentCenterApi from '@/api/assessmentCenter'

export default {
  name: 'personal-cloud-report',
  components: { DatePicker, StaffSelect, ProductSelect, ChartSunburst, NoData },
  props: {
    searchRole: {
      type: String,
      require: true
    }
  },
  data () {
    return {
      gradeConfigurationToCN,
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      GRADE_CONFIGURATION_TYPE: Object.values(gradeConfigurationToCN),
      CLOUD_ROLE,
      avgScore: '', // 抽查平均分
      gradeConfigurations: [], // 图表数据
    }
  },
  mounted () {
    this.timeSpan = [
      TimespanUtil.revertTimeSpan(TimespanUtil.getNowDate(), 1),
      TimespanUtil.revertTimeSpan(TimespanUtil.getNowDate(), 2)
    ]
    this.searchData()
  },
  methods: {
    /**
     * @description 搜搜数据
     */
    async searchData () {
      if (!this.timeSpan) return this.$message.warning('请选择时间')
      this.loading = true
      try {
        const req = {
          startAt: TimespanUtil.joinTimeSpan(this.timeSpan[0]),
          endAt: TimespanUtil.joinTimeSpan(this.timeSpan[1], 1)
        }
        if (this.staffIds.length) req.retoucherIds = this.staffIds
        if (this.productValue.length) req.productIds = this.productValue
        const res = await AssessmentCenterApi.getCheckPoolSubQuota(req, this.searchRole)
        this.avgScore = res.avgScore || '-'
        this.gradeConfigurations = res.data
      } finally {
        await TimespanUtil.delayLoading()
        this.loading = false
      }
    },
    /**
     * 获取当前的数据
     * @param name
     * @returns {*[]|*}
     */
    getChartDatas (name) {
      const chartDatas = this.gradeConfigurations.find(g => g.name === name) || {}
      return chartDatas.data || []
    }
  }
}
</script>

<style lang="less" scoped>

.search-box {
  padding-bottom: 24px;
  margin-top: 24px;
  border-bottom: 1px solid #ecedee;
}

.title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  margin-top: 20px;
  font-size: 16px;
  font-weight: bold;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 2px;
    height: 16px;
    margin-top: -8px;
    content: '';
    background-color: @green;
  }
}

.chat-warp {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
</style>
