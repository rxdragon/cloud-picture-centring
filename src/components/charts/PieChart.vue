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
import { pieColors } from '@/utils/colors.js'

function filterLabelName (data) {
  const group = data.data.group
  if (!group) return `<p>${data.data.name}：<span class="text-right">${data.data.value}张---${data.data.rate}</span></p>`
  let msg = ''
  group.forEach(item => {
    const name = item.nickname || item.name
    msg += `<p>${name}：<span class="text-right">${item.count}张---${item.rate}</span></p>`
  })
  return msg
}

const option = data => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (v) => {
        return filterLabelName(v)
      }
    },
    series: {
      radius: ["30%", "70%"],
      type: "pie",
      data,
      label: {
        alignTo: 'labelLine',
        textBorderColor: 'transparent',
        formatter: (v) => {
          const msg = `${v.data.name}：${v.data.rate}`
          return msg
        },
        color: '#000'
      }
    },
    color: pieColors
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
  watch: {
    chartData: {
      handler () {
        this.handlerData()
      }
    }
  },
  mounted () {
    this.drawChart()
  },
  methods: {
    /**
     * @description 获取dom元素
     */
    drawChart () {
      const dom = this.$refs['pie']
      this.myChart = echarts.init(dom)
      this.handlerData()
    },
    /**
     * @description 处理数据
     */
    handlerData () {
      const chartOption = option(this.chartData)
      this.myChart.setOption(chartOption, true)
    }
  }
}
</script>

<style lang="less" scoped>
.pie-chart {
  height: 100%;

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

<style lang="less">
.text-right {
  float: right;
}
</style>
