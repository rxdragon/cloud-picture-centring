<template>
  <div class="retouch-stream-count">
    <ve-ring
      :data="chartData"
      :legend-visible="false"
      :settings="chartSettings"
      :extend="chartExtend"
      width="320px"
      height="320px"
    />
    <div class="data-num">
      <div class="data-sum">
        <count-to :end-value="allStreamCount" />
      </div>
      <div class="data-desc">总已修单量</div>
    </div>
    <div class="legend">
      <div class="legend-item">
        <i class="point-color in-retoucher" />
        云端已修单量
      </div>
      <div class="legend-item">
        <i class="point-color out-retoucher" />
        外包已修单量
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from '@/components/CountTo'
export default {
  name: 'RetouchStreamCount',
  components: { CountTo },
  props: {
    streamData: { type: Object, required: true }
  },
  data () {
    this.chartSettings = {
      itemStyle: {
        color: (p) => {
          const colorList = ['#56BCFF', '#4669FB']
          return colorList[p.dataIndex]
        }
      }
    }
    this.chartExtend = {
      series: {
        clip: false,
        center: ['50%', '50%'],
        radius: ['50%', '60%'],
        label: {
          alignTo: 'labelLine',
          bleedMargin: 0,
          formatter: (p) => {
            return p.data.value + '单'
          }
        }
      }
    }
    return {
      chartData: {
        columns: ['title', 'num'],
        rows: [
          { title: '外包已修单量', num: 0 }, // 外包
          { title: '云端已修单量', num: 0 } // 内部
        ]
      }
    }
  },
  computed: {
    allStreamCount () {
      return this.chartData.rows[0].num + this.chartData.rows[1].num
    }
  },
  watch: {
    streamData: {
      handler (value) {
        this.chartData.rows[0].num = value.outerRetouchStreamNum
        this.chartData.rows[1].num = value.cloudRetouchPhotoStream
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.retouch-stream-count {
  position: relative;

  .ve-ring {
    margin: -56px auto -30px;
    position: relative;
    z-index: 11;
  }

  .data-num {
    position: absolute;
    margin: auto;
    z-index: 1;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    font-size: 22px;
    font-weight: 600;
    color: @blue;
    line-height: 40px;
    margin-top: 4.5px;

    .data-sum {
      small {
        font-size: 12px;
      }
    }

    .data-desc {
      font-size: 12px;
      font-weight: 400;
      color: #45454d;
      line-height: 17px;
    }
  }

  .legend {
    display: flex;
    height: 23px;
    justify-content: space-around;
    padding: 0 60px;

    .legend-item {
      font-size: 12px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
      text-align: center;

      .point-color {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
      }

      .in-retoucher {
        background-color: @blue;
      }

      .out-retoucher {
        background-color: #56bcff;
      }
    }
  }
}
</style>
