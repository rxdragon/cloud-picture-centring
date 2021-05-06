<template>
  <div class="chart-bar-wrap">
    <div class="title">
      <span>{{ title }}</span>
      <slot name="other"></slot>
    </div>
    <template v-if="chartDatas.length">
      <div class="histogram" ref="histogramChart"></div>
    </template>
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

const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['张数', '占比率'],
    right: '27',
    top: '0',
    icon: 'circle'
  },
  grid: { x: 30, x2: 20, y: 60 },
  series: [
    {
      name: '张数',
      type: 'bar',
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: '#4669FB'
      },
      data: []
    },
    {
      name: '占比率',
      type: 'bar',
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: '#38BC7F'
      },
      data: []
    }
  ],
  color: [blueLinearGradient, GreenLinearGradient],
  xAxis: {
    boundaryGap: ['10%', '10%'],
    axisLabel: {
      color: '#45454D',
      fontSize: '10',
      interval: 0,
      rotate: 30,
      align: 'right'
    },
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

const labelMap = {
  '张数': 'count',
  '占比率': 'percentage'
}

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
    return {
      myChartObj: null
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
    const dom = this.$refs['histogramChart']
    if (!dom) return
    this.myChartObj = echarts.init(dom)
    this.init()
    window.addEventListener('resize', this.resizeHandler)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeHandler)
  },
  methods: {
    /**
     * @description 初始化视图
     */
    init () {
      if (!this.chartDatas.length) return
      if (!this.myChartObj) return
      option.series.forEach(item => {
        const dataKey = labelMap[item.name]
        item.data = this.chartDatas.map(item => item[dataKey])
      })
      option.xAxis.data = this.chartDatas.map(item => item.name) || []
      this.myChartObj.setOption(option)
    },
    /**
     * @description 重新渲染视图
     */
    resizeHandler () {
      this.myChartObj.resize()
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

  .histogram {
    width: 100%;
    height: 400px;
  }
}
</style>
