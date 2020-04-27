<template>
  <div class="retouch-order-chart">
    <ve-histogram
      :data="chartData"
      :extend="extend"
      :settings="chartSettings"
      height="278px"
    />
  </div>
</template>

<script>
export default {
  name: 'RetouchOrderChart',
  props: {
    chartDatas: { type: Object, default: () => {
      return null
    } }
  },
  data () {
    this.extend = {
      legend: {
        data: ['单量', '张数'],
        right: '27',
        top: '0',
        selectedMode: 'single',
        selected: {
          '单量': false,
          '张数': true
        },
        icon: 'circle'
      },
      grid: { x: 0, x2: 27, y: 60, y2: 0 },
      series: {
        label: {
          show: true,
          position: 'top',
          color: '#4669FB'
        },
        barWidth: 24,
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
        rows: []
      }
    }
  },
  created () {
    this.chartData.rows = [
      {
        name: '总数量',
        orderCount: this.chartDatas.retoucherFinishStreamNum,
        photoCount: this.chartDatas.retoucherFinishPhotoNum
      },
      {
        name: '超时单量',
        orderCount: this.chartDatas.overTimeStreamNum,
        photoCount: 0
      },
      {
        name: '利奇马',
        orderCount: this.chartDatas.lekimaStreamNum,
        photoCount: this.chartDatas.lekimaPhotoNum
      },
      {
        name: '点赞',
        orderCount: this.chartDatas.goodStreamNum,
        photoCount: 0
      },
      {
        name: '门店退单',
        orderCount: this.chartDatas.storeReturnStreamNum,
        photoCount: this.chartDatas.storeReturnPhotoNum
      },
      {
        name: '非质量问题\n门店退单',
        orderCount: this.chartDatas.storeReturnStreamNumForNotQuality,
        photoCount: this.chartDatas.storeReturnPhotoNumForNotQuality
      },
      {
        name: '质量问题\n门店退单',
        orderCount: this.chartDatas.storeReturnStreamNumForQuality,
        photoCount: this.chartDatas.storeReturnPhotoNumForQuality
      }
    ]
  }
}
</script>
