<template>
  <ve-bar
    :data="chartData"
    :legend-visible="false"
    :extend="extend"
    :settings="chartSettings"
    height="340px" />
</template>

<script>
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
        yAxis: {
          
        }
      },
      chartData: {
        columns: ['组名', '张数'],
        rows: [
          { '组名': '惊天魔盗团', '张数': 1393 },
          { '组名': '惊天魔盗团', '张数': 3530 },
          { '组名': '惊天魔盗团', '张数': 2923 },
          { '组名': '惊天魔盗团', '张数': 1723 },
          { '组名': '惊天魔盗团', '张数': 3792 },
          { '组名': '惊天魔盗团', '张数': 4593 }
        ]
      }
    }
  }
}
</script>
