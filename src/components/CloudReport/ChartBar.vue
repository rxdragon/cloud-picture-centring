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
      v-if="chartDatas.length"
    />
    <NoData v-else></NoData>
  </div>
</template>

<script>
import NoData from '@/components/NoData'
export default {
  name: 'chart-bar',
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
  watch: {
    chartDatas () {
      this.init()
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
