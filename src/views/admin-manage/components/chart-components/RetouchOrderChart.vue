<template>
  <div class="retouch-order-chart">
    <ve-histogram
      :data="chartData"
      :legend-visible="false"
      :extend="extend"
      height="300px"
    />
  </div>
</template>

<script>
export default {
  name: 'RetouchOrderChart',
  props: {
    chartDatas: { type: Object, default: () => {
      return null
    } }
  },
  data () {
    this.extend = {
      grid: { x: 0, x2: 27, y: 60, y2: 0 },
      series: {
        label: {
          show: true,
          position: 'top',
          color: '#4669FB'
        },
        barWidth: 24,
        barCategoryGap: '80%',
        itemStyle: {
          barBorderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#4669FB' // 0% 处的颜色
              },
              {
                offset: 1,
                color: '#71B9FD' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        }
      },
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
      },
      tooltip: {
        formatter: (params) => {
          const data = params[0]
          return `${data.name}：${data.value}`
        }
      }
    }
    return {
      chartData: {
        columns: ['name', 'count'],
        rows: []
      }
    }
  },
  created () {
    this.chartData.rows = [
      {
        name: '修图总单量',
        count: this.chartDatas.retoucherFinishStreamNum
      },
      {
        name: '超时单量',
        count: this.chartDatas.overTimeStreamNum
      },
      {
        name: '修图总张数',
        count: this.chartDatas.retoucherFinishPhotoNum
      },
      {
        name: '点赞单量',
        count: this.chartDatas.goodStreamNum
      },
      {
        name: '点踩单量',
        count: this.chartDatas.badStreamNum
      }
    ]
  }
}
</script>
