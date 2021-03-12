<template>
  <div class="chart-container">
    <div class="title">小问题</div>
    <div ref="main" class="chart" id="chart"> </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

const data = [
  {
    name: '液化',
    value: 25,
    children: [
      {
        name: '头发',
        value: 15,
        // children: [
        //   {
        //     name: '小问题1',
        //     value: 2
        //   },
        //   {
        //     name: '中问题2',
        //     value: 5
        //   },
        //   {
        //     name: '种草3',
        //     value: 4
        //   },
        //   {
        //     name: '拔草4',
        //     value: 4
        //   }
        // ]
      },
      {
        name: '眉毛',
        value: 10,
        // children: [
        //   {
        //     name: '小问题5',
        //     value: 2
        //   },
        //   {
        //     name: '中问题6',
        //     value: 5
        //   },
        //   {
        //     name: '种草7',
        //     value: 4
        //   },
        //   {
        //     name: '拔草8',
        //     value: 4
        //   }
        // ]
      }
    ]
  },
  {
    name: '磨皮',
    children: [
      {
        name: '头发',
        value: 10,
        // children: [
        //   {
        //     name: '小问题9',
        //     value: 1
        //   },
        //   {
        //     name: '中问题10',
        //     value: 2
        //   },
        //   {
        //     name: '种草11',
        //     value: 3
        //   },
        //   {
        //     name: '拔草12',
        //     value: 4
        //   }
        // ]
      },
      {
        name: '眉毛',
        value: 10,
        // children: [
        //   {
        //     name: '小问题13',
        //     value: 2
        //   },
        //   {
        //     name: '中问题14',
        //     value: 5
        //   },
        //   {
        //     name: '种草15',
        //     value: 4
        //   },
        //   {
        //     name: '拔草16',
        //     value: 4
        //   }
        // ]
      }
    ]
  }
]

const option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: 0,
    selectedMode: false,
    data: ['sunburst', '123']
  },
  series: [
    {
      type: 'sunburst',
      name: 'sunburst',
      data: data,
      radius: [60, '90%'],
      emphasis: {
        focus: 'ancestor'
      },
    },
    {
      type: 'sunburst',
      name: '123'
    }
  ]
}

export default {
  name: 'sunburst',
  mounted () {
    const chartDom = this.$refs.main
    // console.log(chartDom);
    const myChart = echarts.init(chartDom)
    option && myChart.setOption(option)
  }
}
</script>

<style scoped lang="less">
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  padding: 20px;

  .title {
    width: 100%;
    text-align: center;
  }

  .chart {
    width: 300px;
    height: 300px;
    margin-top: 10px;
  }
}
</style>
