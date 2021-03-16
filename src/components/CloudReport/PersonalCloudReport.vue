<template>
  <div class="cloud-report" v-loading="loading">
    <div class="search-box">
      <div class="search-item">
        <span>评价时间</span>
        <date-picker v-model="timeSpan" />
      </div>
      <div class="staff-search search-item">
        <span>修图伙伴</span>
        <staff-select v-model="staffIds" />
      </div>
      <div class="product-box search-item">
        <span>产品</span>
        <product-select v-model="productValue" />
      </div>
      <div class="button-box search-item">
        <el-button type="primary" @click="searchData">查 询</el-button>
      </div>
    </div>
    <div class="title">
      <span>平均分对比</span>
      <span>抽查平均分：80</span>
    </div>
    <div class="chat-warp">
      <chart-sunburst v-for="item in GRADE_CONFIGURATION_TYPE" :key="item" :title="`${gradeConfigurationToCN[item]}问题对比`"></chart-sunburst>
    </div>
  </div>
</template>

<script>
import DatePicker from '@/components/DatePicker/index'
import StaffSelect from '@SelectBox/StaffSelect/index'
import ChartSunburst from './ChartSunburst'
import ProductSelect from '@SelectBox/ProductSelect/index'
import { GRADE_CONFIGURATION_TYPE, gradeConfigurationToCN } from '@/utils/enumerate'
import * as timespanUtil from "@/utils/timespan"

export default {
  name: 'personal-cloud-report',
  components: { DatePicker, StaffSelect, ProductSelect, ChartSunburst },
  data () {
    return {
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
      GRADE_CONFIGURATION_TYPE,
      gradeConfigurationToCN
    }
  },
  methods: {
    /**
     * @description 搜搜数据
     */
    async searchData () {
      this.loading = true
      try {
        await Promise.all([
          this.getCheckPoolQuota(),
          this.getCheckPoolSubQuota()
        ])
      } finally {
        await timespanUtil.delayLoading()
        this.loading = false
      }
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
