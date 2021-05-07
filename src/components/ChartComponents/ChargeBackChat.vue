<template>
  <div class="charge-back-chat">
    <div class="histogram" ref="histogramChart"></div>
  </div>
</template>

<script>
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

const RedLinearGradient = new echarts.graphic.LinearGradient(
  0, 0, 0, 1,
  [
    {
      offset: 0,
      color: '#FF3974'
    },
    {
      offset: 1,
      color: '#FFB4CA'
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
    data: ['单量', '张数', '退张率'],
    right: '27',
    top: '0',
    icon: 'circle'
  },
  grid: { x: 30, x2: 20, y: 60 },
  series: [],
  color: [blueLinearGradient, GreenLinearGradient, RedLinearGradient],
  xAxis: {
    boundaryGap: ['10%', '10%'],
    axisLabel: {
      color: '#45454D',
      fontSize: '10',
      interval: 0,
      align: 'center'
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

export default {
  name: 'ChargeBackChat',
  props: {
    chartDatas: { type: Array, default: () => [] },
    showRate: { type: Boolean }
  },
  data () {
    return {
      myChartObj: null,
      labelMap: {
        orderCount: {
          name: '单量',
          color: '#4669FB'
        },
        photoCount: {
          name: '张数',
          color: '#38BC7F'
        },
        returnRate: {
          name: '退张率',
          color: '#FF3974'
        }
      }
    }
  },
  watch: {
    'chartDatas': {
      handler () {
        this.initData()
      },
      immediate: false
    }
  },
  mounted () {
    const dom = this.$refs['histogramChart']
    if (!dom) return
    this.myChartObj = echarts.init(dom)
    this.initData()
    window.addEventListener('resize', this.resizeHandler)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeHandler)
  },
  created () {
    if (!this.showRate) {
      delete this.labelMap['returnRate']
    }
  },
  methods: {
    /**
     * @description 初始化信息
     */
    initData () {
      if (!this.chartDatas.length) return
      if (!this.myChartObj) return
      option.series = []
      for (const dataKey in this.labelMap) {
        const baseSeriesOption = {
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: (data) => {
              return data.seriesName === '退张率' ? `${data.value}%` : `${data.value}`
            },
          },
          itemStyle: {
            borderRadius: [6, 6, 0, 0]
          }
        }
        const labelMapItem = this.labelMap[dataKey]
        baseSeriesOption.label.color = labelMapItem.color
        const createData = {
          name: labelMapItem.name,
          data: this.chartDatas.map(item => item[dataKey]),
          ...baseSeriesOption
        }
        option.series.push(createData)
      }
      option.xAxis.data = this.chartDatas.map(item => item.name) || []
      this.myChartObj.setOption(option)
    },
    resizeHandler () {
      this.myChartObj.resize()
    }
  }
}
</script>

<style lang="less" scoped>
.histogram {
  width: 100%;
  height: 278px;
}
</style>
