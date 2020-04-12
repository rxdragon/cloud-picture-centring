<template>
  <ve-bar
    :data="chartData"
    :legend-visible="false"
    :extend="extend"
    :settings="chartSettings"
    height="750px" />
</template>

<script>
import { joinTimeSpan } from '@/utils/timespan.js'
import * as AssessmentCenter from '@/api/assessmentCenter'

export default {
  name: 'GroupChart',
  data () {
    return {
      chartSettings: {},
      extend: {
        grid: {
          top: 20,
          bottom: 20,
          right: 20
        },
        series: {
          label: {
            show: true,
            position: 'right',
            color: '#4669FB'
          },
          barGap: '10%',
          barWidth: 24,
          itemStyle: {
            barBorderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear',
              x: 1,
              y: 0,
              x2: 0,
              y2: 0,
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
        tooltip: {
          formatter: (params) => {
            const data = params[0]
            return `${data.name}：${data.value}张`
          }
        }
      },
      chartData: {
        columns: ['name', 'count'],
        rows: []
      }
    }
  },
  props: {
    timeSpan: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] }
  },
  watch: {
    timeSpan: {
      handler (value) {
        if (value.length) {
          this.getChartData()
        }
      },
      immediate: true
    },
    tags: {
      handler (value) {
        this.getChartData()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description 获取小组数据
     */
    async getChartData () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.tags.length) {
        req.tagId = this.tags
      }
      this.chartData.rows = await AssessmentCenter.getCloudProblemReportByGroup(req)
    }
  }
}
</script>
