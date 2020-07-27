<template>
  <ve-histogram
    :data="chartData"
    :legend-visible="false"
    :extend="extend"
    :settings="chartSettings"
    height="400px"
  />
</template>

<script>
import { joinTimeSpan } from '@/utils/timespan.js'
import { CLOUD_ROLE } from '@/utils/enumerate'

import * as AssessmentCenter from '@/api/assessmentCenter'

export default {
  name: 'GroupChart',
  props: {
    timeSpan: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] },
    role: { type: String, default: CLOUD_ROLE.OPERATE }
  },
  data () {
    return {
      CLOUD_ROLE,
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
            position: 'top',
            color: '#4669FB'
          },
          barGap: '10%',
          barWidth: 24,
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
  watch: {
    timeSpan: {
      handler (value) {
        if (value.length) {
          this.searchData()
        }
      },
      immediate: true,
      deep: true
    },
    tags: {
      handler (value) {
        this.searchData()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    searchData () {
      this.getChartData()
    },
    /**
     * @description 获取小组数据
     */
    async getChartData () {
      const req = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      if (this.tags.length) { req.tagId = this.tags }
      const roleType = this.role
      this.chartData.rows = await AssessmentCenter.getCloudProblemReportByGroup(req, roleType)
    }
  }
}
</script>
