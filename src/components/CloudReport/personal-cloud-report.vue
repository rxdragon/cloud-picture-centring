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
    <div class="chat-warp">
      <chart-sunburst v-for="i in 4" :key="i"></chart-sunburst>
    </div>
  </div>
</template>

<script>
import { delayLoading } from "@/utils/timespan"
import DatePicker from '@/components/DatePicker/index'
import StaffSelect from '@SelectBox/StaffSelect/index'
import ProductSelect from '@SelectBox/ProductSelect/index'

import ChartSunburst from './chart-sunburst'

export default {
  name: 'personal-cloud-report',
  components: { DatePicker, StaffSelect, ProductSelect, ChartSunburst },
  data () {
    return {
      loading: false,
      timeSpan: null,
      staffIds: [], // 云端伙伴
      productValue: [], // 产品
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
        await delayLoading()
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.chat-warp {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
</style>
