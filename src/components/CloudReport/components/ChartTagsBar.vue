<template>
  <div class="chart-bar-wrap">
    <div class="title">
      <span>{{ title }}</span>
      <slot name="other"></slot>
    </div>
    <ve-histogram
      :data="chartData"
      :legend-visible="false"
      :extend="extend"
      height="300px"
      :settings="chartSettings"
      v-if="chartDatas.length"
    />
    <NoData v-else></NoData>
  </div>
</template>

<script>
import NoData from '@/components/NoData/index'
import * as echarts from 'echarts'

const blueLinearGradient = new echarts.graphic.LinearGradient(
  0, 0, 0, 1,
  [
    {
      offset: 0,
      color: '#4669FB'
    },
    {
      offset: 1,
      color: '#91F5FF'
    }
  ]
)

const GreenLinearGradient = new echarts.graphic.LinearGradient(
  0, 0, 0, 1,
  [
    {
      offset: 0,
      color: '#38BC7F'
    },
    {
      offset: 1,
      color: '#B7FF8F'
    }
  ]
)

export default {
  name: 'chartTagsbar',
  components: { NoData },
  props: {
    title: String,
    type: {
      type: String,
      default: 'Group'
    },
    chartDatas: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    this.extend = {
      legend: {
        data: ['张数', '占比率'],
        right: '27',
        top: '0',
        icon: 'circle'
      },
      grid: { x: 0, x2: 27, y: 60, y2: 0 },
      series: {
        barWidth: 24,
        barCategoryGap: '80%',
        itemStyle: {
          barBorderRadius: [6, 6, 0, 0]
        }
      },
      color: [blueLinearGradient, GreenLinearGradient],
      xAxis: {
        boundaryGap: ['10%', '10%'],
        axisLabel: {
          color: '#45454D',
          fontSize: '10',
          interval: 0
        }
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            color: '#DDDFE6',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#C0C4CC',
          fontSize: '10'
        }
      }
    }
    this.chartSettings = {
      labelMap: {
        'count': '张数',
        'percentage': '占比率'
      }
    }
    return {
      chartData: {
        columns: ['name', 'count', 'percentage'],
        rows: []
      }
    }
  },
  watch: {
    chartDatas: {
      immediate: true,
      handler () {
        this.init()
      }
    }
  },
  methods: {
    init () {
      if (!this.chartDatas.length) return
      this.chartData.rows = this.chartDatas
    }
  }
}
</script>

<style lang="less" scoped>

.chart-bar-wrap {
  width: 100%;

  .title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 10px;
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

  .chart-bar-main {
    width: 100%;
    height: 300px;
  }
}
</style>
