<template>
  <div class="performance-chart">
    <ve-histogram
      :data="chartData"
      :extend="extend"
      :settings="chartSettings"
      height="278px"
    />
  </div>
</template>

<script>
export default {
  name: 'PerformanceChart',
  props: {
    chartDatas: { type: Object, default: () => {
      return null
    } }
  },
  data () {
    this.extend = {
      legend: {
        data: ['数量', '比率'],
        right: '0',
        top: '0',
        selectedMode: 'single',
        selected: {
          '数量': true,
          '比率': false
        },
        icon: 'circle'
      },
      grid: { x: 0, x2: 0, y: 50, y2: 0 },
      series: {
        label: {
          show: true,
          position: 'top',
          color: '#4669FB'
        },
        clip: false,
        barWidth: 24,
        barCategoryGap: '80%',
        itemStyle: {
          barBorderRadius: [6, 6, 0, 0],
          color: (param) => {
            const baseColor = {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#4669FB' },
                { offset: 1, color: '#91F5FF' }
              ]
            }
            if (param.name.includes('种草')) {
              return Object.assign({}, baseColor, {
                colorStops: [
                  { offset: 0, color: '#38BC7F' },
                  { offset: 1, color: '#7ce088' }
                ]
              })
            }
            if (param.name.includes('拔草')) {
              return Object.assign({}, baseColor, {
                colorStops: [
                  { offset: 1, color: '#ff3974' },
                  { offset: 0, color: '#ff89ad' }
                ]
              })
            }
            return baseColor
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
      }
    }
    this.chartSettings = {
      labelMap: {
        'count': '数量',
        'rate': '比率'
      }
    }
    return {
      chartData: {
        columns: ['name', 'count', 'rate'],
        rows: []
      }
    }
  },
  created () {
    this.chartData.rows = [
      {
        name: '审核种草',
        count: this.chartDatas.reviewPlant,
        rate: this.chartDatas.reviewPlantRate
      },
      {
        name: '审核拔草',
        count: this.chartDatas.reviewPull,
        rate: this.chartDatas.reviewPullRate
      },
      {
        name: '抽查种草',
        count: this.chartDatas.retoucherEvaluatedPlantNum,
        rate: this.chartDatas.retoucherEvaluatedPlantRate
      },
      {
        name: '抽查拔草',
        count: this.chartDatas.retoucherEvaluatedPullNum,
        rate: this.chartDatas.retoucherEvaluatedPullRate
      },
      {
        name: '直接通过',
        count: this.chartDatas.retoucherEvaluatedNoPlantNoPullNum,
        rate: this.chartDatas.retoucherEvaluatedNoPlantNoPullRate
      }
    ]
  }
}
</script>
