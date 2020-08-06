<template>
  <div class="charge-back-chat">
    <ve-histogram
      :data="chartData"
      :extend="extend"
      :settings="chartSettings"
      height="278px"
    />
  </div>
</template>

<script>
import echarts from 'echarts'

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
  name: 'ChargeBackChat',
  props: {
    chartDatas: { type: Array, default: () => [] }
  },
  data () {
    this.extend = {
      legend: {
        data: ['单量', '张数'],
        right: '27',
        top: '0',
        icon: 'circle'
      },
      grid: { x: 0, x2: 27, y: 60, y2: 0 },
      series: {
        label: {
          show: true,
          position: 'top',
          color: ['#4669FB', '#38BC7F']
        },
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
        'orderCount': '单量',
        'photoCount': '张数'
      }
    }
    return {
      chartData: {
        columns: ['name', 'orderCount', 'photoCount'],
        rows: []
      }
    }
  },
  watch: {
    'chartDatas': {
      handler (value) {
        if (!value) return
        this.chartData.rows = value
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
