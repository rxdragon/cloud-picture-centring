<template>
  <div class="sunburst-chart">
    <div class="sunburst-no-data" v-show="isNoData">
      <no-data />
    </div>
    <div class="sunburst-chart-data" ref="sunburst"></div>
  </div>
</template>

<script>
import echarts from "echarts"
import NoData from '@/components/NoData'
import { joinTimeSpan } from '@/utils/timespan.js'
import * as AssessmentCenter from '@/api/assessmentCenter'
const option = data => {
  return {
    tooltip: {},
    series: {
      radius: ["15%", "80%"],
      type: "sunburst",
      sort: null,
      highlightPolicy: "ancestor",
      data,
      label: {
        rotate: "tangential",
        textBorderColor: 'transparent',
        color: '#fff'
      },
      levels: [],
      itemStyle: {
        color: "#ddd",
        borderWidth: 2
      }
    }
  }
}

export default {
  name: "SunburstChart",
  components: { NoData },
  props: {
    timeSpan: { type: Array, default: () => [] }
  },
  data () {
    return {
      myChart: null,
      isNoData: true
    }
  },
  watch: {
    timeSpan: {
      handler (value) {
        if (value.length) {
          this.handleData(value)
        }
      }
    }
  },
  async mounted () {
    this.drawChart()
    if (this.timeSpan.length) {
      await this.handleData(this.timeSpan)
    }
  },
  methods: {
    /**
     * @description 处理数据
     */
    async handleData (timeSpan) {
      try {
        const req = {
          startAt: joinTimeSpan(timeSpan[0]),
          endAt: joinTimeSpan(timeSpan[1], 1)
        }
        const chartData = await AssessmentCenter.getCloudProblemReport(req)
        if (!chartData) {
          this.isNoData = true
          return false
        }
        this.isNoData = false
        const chartOption = option(chartData)
        this.myChart.setOption(chartOption, true)
      } catch (error) {
        console.error(error)
        this.isNoData = true
      }
    },
    /**
     * @description 获取dom元素
     */
    drawChart () {
      const dom = this.$refs['sunburst']
      this.myChart = echarts.init(dom)
    }
  }
}
</script>

<style lang="less" scoped>
.sunburst-chart {
  height: 100%;
  overflow: hidden;

  .sunburst-no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .sunburst-chart-data {
    height: 100%;
  }
}
</style>
