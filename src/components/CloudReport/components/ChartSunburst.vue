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
import colorGenerate from '@/utils/ColorGenerate.js'
import NoData from '@/components/NoData'

import { pieColors } from '@/utils/colors.js'

const option = {
  tooltip: {
    trigger: 'item'
  },
  series: {
    type: 'sunburst',
    data: [],
    radius: [40, '90%'],
    emphasis: {
      focus: 'ancestor'
    },
    levels: [
      {},
      {},
      {
        itemStyle: {
          opacity: 0.6
        }
      }
    ]
  },
  color: pieColors
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
    },
    color: { type: String, default: '' }
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
      if (this.color) {
        option.color = colorGenerate(this.color)
      }
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
