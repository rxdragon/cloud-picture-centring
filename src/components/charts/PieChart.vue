<template>
  <div class="pie-chart">
    <div class="pie-no-data" v-show="!chartData.length">
      <no-data />
    </div>
    <div class="pie-chart-data" ref="pie"></div>
  </div>
</template>

<script>
import echarts from "echarts"
import NoData from '@/components/NoData'
const option = data => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b} <br/>{c}'
    },
    series: {
      radius: ["30%", "60%"],
      type: "pie",
      data,
      label: {
        alignTo: 'labelLine',
        textBorderColor: 'transparent',
        formatter: '{b}{c}',
        color: '#000'
      },
      color: ['#ffdb78', '#b7ff8f', '#91c2ff', '#ffb4ca','#fe9c43']
    }
  }
}

export default {
  name: "PieChart",
  components: { NoData },
  props: {
    chartData: { type: Array, default: () => [] },
  },
  data () {
    return {
      myChart: null
    }
  },
  mounted () {
    this.drawChart()
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
      const dom = this.$refs['pie']
      this.myChart = echarts.init(dom)
      const chartOption = option(this.chartData)
      this.myChart.setOption(chartOption, true)
    }
  }
}
</script>

<style lang="less" scoped>
.pie-chart {
  height: 100%;
  overflow: hidden;

  .pie-no-data,
  .pie-chart-data {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
