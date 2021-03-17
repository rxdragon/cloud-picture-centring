<template>
  <div class="chart-container">
    <div
      v-show="chartDatas.length"
      ref="main"
      class="chart"
      id="chart"
    >
    </div>
    <no-data class="chart" v-if="!chartDatas.length"></no-data>
    <div class="title">{{ title }}</div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import NoData from '@/components/NoData'

const option = {
  tooltip: {
    trigger: 'item'
  },
  series: {
    type: 'sunburst',
    data: [],
    radius: [60, '90%'],
    emphasis: {
      focus: 'ancestor'
    }
  }
}

export default {
  name: 'sunburst',
  components: { NoData },
  props: {
    title: String,
    chartDatas: {
      type: Array,
      default () {
        return []
      }
    }
  },
  watch: {
    chartDatas: {
      immediate: false,
      handler () {
        this.init()
      }
    }
  },
  mounted () {
    const chartDom = this.$refs.main
    this.myChart = echarts.init(chartDom)
    this.init()
  },
  methods: {
    init () {
      if (!this.myChart) return
      option.series.data = this.chartDatas
      this.myChart.setOption(option)
    }
  }
}
</script>

<style scoped lang="less">
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  padding: 20px;

  .title {
    width: 100%;
    text-align: center;
  }

  .chart {
    width: 300px;
    height: 300px;
    margin-top: 10px;
  }
}
</style>
