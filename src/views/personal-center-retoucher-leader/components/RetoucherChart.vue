<template>
  <div class="retoucher-chart">
    <el-popover v-if="descMap[showKey]" placement="top" trigger="hover">
      <div class="tip-content">
        <p>{{ descMap[showKey] }}</p>
      </div>
      <span
        :class="`cursor-point panel-title-${showKey} panel-title`"
        slot="reference"
      >{{ showKey | titleName }}
      </span>
    </el-popover>
    <div v-else :class="`panel-title-${showKey}`" class="panel-title">{{ showKey | titleName }}</div>
    <ve-histogram
      class="chart-box"
      :data="chartData"
      :extend="extend"
      :settings="chartSettings"
      :legend-visible="false"
      height="254px"
    />
  </div>
</template>

<script>
const DataType = {
  finishPhotoNum: '修图张数',
  retouchAvgTime: '平均时长（张）/ 分钟',
  lekimaCount: '利奇马张数',
  goodStreamNum: '点赞单量',
  storeReturnStreamNum: '门店退单',
  avgScore: '平均分'
}
const DataColor = {
  finishPhotoNum: ['#4669FB', '#71B9FD'],
  retouchAvgTime: ['#6B46FB', '#DCD3FF'],
  lekimaCount: ['#4669FB', '#71B9FD'],
  goodStreamNum: ['#4669FB', '#91F5FF'],
  storeReturnStreamNum: ['#FF3974', '#FFB4CA'],
  avgScore: ['#4669FB', '#71B9FD']
}
export default {
  name: 'RetoucherChart',
  filters: {
    titleName (value) {
      return DataType[value]
    }
  },
  props: {
    chartDatas: { type: Array, default: () => [] },
    showKey: { type: String, required: true }
  },
  data () {
    this.extend = {
      grid: { x: 0, x2: 27, y: 30, y2: 0 },
      series: {
        label: {
          show: true,
          position: 'top',
          color: DataColor[this.showKey][0]
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
                color: DataColor[this.showKey][0] // 0% 处的颜色
              },
              {
                offset: 1,
                color: DataColor[this.showKey][1] // 100% 处的颜色
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
      labelMap: DataType
    }
    return {
      chartData: {
        columns: ['name', 'value'],
        rows: []
      },
      descMap: {
        storeReturnStreamNum: '2.6之后为订单完成时间,之前为订单退回时间',
        goodStreamNum: '2.6之后为订单完成时间,之前为点赞时间',
      }
    }
  },
  watch: {
    chartDatas: {
      handler (value) {
        if (!value.length) return
        this.chartData.rows = value
      },
      immediate: true
    }
  },
  created () {
    this.chartData.columns = ['name', this.showKey]
  }
}
</script>

<style lang="less">
.retoucher-chart {
  .panel-title {
    display: inline-block;
  }

  .panel-title-retouchAvgTime {
    &::before {
      background-color: #6b46fb;
    }
  }

  .panel-title-reviewPlantPhotoNum {
    &::before {
      background-color: #38bc7f;
    }
  }

  .panel-title-reviewPullPhotoNum {
    &::before {
      background-color: #ff3974;
    }
  }

  .chart-box {
    margin-bottom: 48px;
  }
}
</style>
