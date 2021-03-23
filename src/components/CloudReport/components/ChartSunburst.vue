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
import * as ColorGenerate from '@/utils/ColorGenerate.js'
import NoData from '@/components/NoData'
import { GRADE_CONFIGURATION_TYPE } from '@/utils/enumerate'
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
          opacity: 0.75
        }
      }
    ]
  },
  color: pieColors
}

const colorMap = {
  [GRADE_CONFIGURATION_TYPE.SMALL]: '#fa8c16',
  [GRADE_CONFIGURATION_TYPE.MIDDLE]: '#fa8c16',
  [GRADE_CONFIGURATION_TYPE.PULL]: '#f5222d',
  [GRADE_CONFIGURATION_TYPE.PLANT]: '#52c41a'
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
        const nearColors = ColorGenerate.getNearColors(colorMap[this.color])
        option.color = nearColors
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
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: #303133;
    text-align: center;
  }

  .chart {
    width: 300px;
    height: 300px;
    margin-top: 10px;
  }
}
</style>
