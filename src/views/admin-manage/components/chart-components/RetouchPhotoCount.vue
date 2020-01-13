<template>
  <div class="retouch-photo-count">
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
        <count-to :end-value="allSingle" />
        /
        <count-to :end-value="allMulti" />
      </div>
      <div class="data-desc">总已修张数(单/双)</div>
    </div>
    <div class="legend">
      <div class="legend-item">
        <i class="point-color in-retoucher" />
        云端已修张数
      </div>
      <div class="legend-item">
        <i class="point-color out-retoucher" />
        外包已修张数
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from '@/components/CountTo'
export default {
  name: 'RetouchPhotoCount',
  components: { CountTo },
  props: {
    photoData: { type: Object, required: true }
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
            const single = this.chartData.rows[p.dataIndex].single
            const multi = this.chartData.rows[p.dataIndex].multi
            return `单人：${single}\n多人：${multi}`
          }
        }
      }
    }
    return {
      chartData: {
        columns: ['title', 'num'],
        rows: [
          { title: '外包已修张数', num: 0, single: 0, multi: 0 }, // 外包
          { title: '云端已修张数', num: 0, single: 0, multi: 0 } // 内部
        ]
      }
    }
  },
  computed: {
    allSingle () {
      return this.chartData.rows[0].single + this.chartData.rows[1].single
    },
    allMulti () {
      return this.chartData.rows[0].multi + this.chartData.rows[1].multi
    }
  },
  watch: {
    photoData: {
      handler (value) {
        this.chartData.rows[0].num = value.outerRetouchPhotoNum.single + value.outerRetouchPhotoNum.multi
        this.chartData.rows[0].single = value.outerRetouchPhotoNum.single
        this.chartData.rows[0].multi = value.outerRetouchPhotoNum.multi
        this.chartData.rows[1].num = value.cloudRetouchPhotoNum.single + value.cloudRetouchPhotoNum.multi
        this.chartData.rows[1].single = value.cloudRetouchPhotoNum.single
        this.chartData.rows[1].multi = value.cloudRetouchPhotoNum.multi
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.retouch-photo-count {
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
