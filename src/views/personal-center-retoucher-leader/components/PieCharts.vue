<template>
  <div class="sunburst-chart">
    <div class="sunburst-no-data" v-show="!chartData.length">
      <no-data />
    </div>
    <div class="sunburst-chart-data" ref="sunburst"></div>
  </div>
</template>

<script>
import echarts from "echarts"
import NoData from '@/components/NoData'
const option = data => {
  return {
    tooltip: {},
    series: {
      radius: ["15%", "90%"],
      type: "pie",
      highlightPolicy: "ancestor",
      data,
      label: {
        rotate: "tangential",
        textBorderColor: 'transparent',
        color: '#000'
      },
      levels: []
    }
  }
}

export default {
  name: "PieChart",
  components: { NoData },
  props: {
    chartData: { type: Array, default: () => [] }
  },
  data () {
    return {
      myChart: null
    }
  },
  mounted () {
    this.drawChart(this.chartData)
  },
  watch: {
    chartData: {
      handler () {
        this.drawChart()
      },
      deep: true
    }
  },
  methods: {
    /**
     * @description 获取dom元素
     */
    drawChart () {
      const dom = this.$refs['sunburst']
      this.myChart = echarts.init(dom)
      const chartOption = option(this.chartData)
      this.myChart.setOption(chartOption, true)
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
