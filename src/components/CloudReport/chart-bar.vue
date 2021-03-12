<template>
  <div ref="main" class="chart-bar-main"></div>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'chart-bar',
  mounted () {
    const chartDom = this.$refs.main
    const myChart = echarts.init(chartDom)

    const option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      title: {
        text: '平均分对比',
        left: 'center'
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
      }]
    }

    option && myChart.setOption(option)
  }
}
</script>

<style lang="less" scoped>
.chart-bar-main {
  width: 100%;
  height: 300px;
}
</style>
