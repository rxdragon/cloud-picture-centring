<template>
  <div class="retouch-order-chart">
    <ve-histogram
      :data="chartData"
      :extend="extend"
      :settings="chartSettings"
    />
  </div>
</template>

<script>
export default {
  name: 'RetouchOrderChart',
  data () {
    this.extend = {
      legend: {
        data: ['单量', '张数'],
        right: '0',
        selectedMode: 'single',
        selected: {
          '单量': false,
          '张数': true
        },
        icon: 'circle'
      },
      series: {
        label: {
          show: true,
          position: 'top',
          color: '#4669FB'
        },
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
                color: '#91F5FF' // 100% 处的颜色
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
      }
    }
    this.chartSettings = {
      labelMap: {
        'orderCount': '单量',
        'photoCount': '张数'
      }
    }
    return {
      chartData: {
        columns: ['name', 'orderCount', 'photoCount'],
        rows: [
          { 'name': '总单量', orderCount: 1393, photoCount: 12312 },
          { 'name': '超时单量', orderCount: 3530, photoCount: 12312 },
          { 'name': '门店退单', orderCount: 2923, photoCount: 12312 },
          { 'name': '非质量问题门店退单', orderCount: 1723, photoCount: 12312 },
          { 'name': '质量问题门店退单', orderCount: 3792, photoCount: 12312 }
        ]
      }
    }
  }
}
</script>
