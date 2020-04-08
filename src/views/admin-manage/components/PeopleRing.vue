<template>
  <div class="people-ring">
    <ve-ring
      :data="chartData"
      :legend-visible="false"
      :settings="chartSettings"
      :extend="chartExtend"
      width="256px"
      height="200px"
    />
    <div class="people-num">
      <div class="people-sum">
        <count-to :end-value="retouchNum + outerRetouchNum" />
        <small>人</small>
      </div>
      <div class="people-desc">正在修图</div>
    </div>
    <div class="legend">
      <div class="legend-item">
        <i class="point-color in-retoucher" />
        云端修图师
      </div>
      <div class="legend-item">
        <i class="point-color out-retoucher" />
        外包修图师
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from '@/components/CountTo'
export default {
  name: 'PeopleRing',
  components: { CountTo },
  props: {
    retouchNum: { type: [String, Number], required: true },
    outerRetouchNum: { type: [String, Number], required: true }
  },
  data () {
    return {
      chartData: {
        columns: ['title', 'num'],
        rows: [
          { title: '外包修图师', num: 0 }, // 外包
          { title: '云端修图师', num: 0 } // 内部
        ]
      },
      chartSettings: {
        itemStyle: {
          color: (p) => {
            const colorList = ['#56BCFF', '#4669FB']
            return colorList[p.dataIndex]
          }
        },
        label: {
          formatter: (p) => {
            return p.data.value + '人'
          }
        }
      },
      chartExtend: {
        series: {
          clip: false,
          center: ['50%', '50%'],
          radius: ['60%', '75%']
        }
      }
    }
  },
  watch: {
    retouchNum: {
      handler () {
        this.chartData.rows[0].num = this.outerRetouchNum
        this.chartData.rows[1].num = this.retouchNum
      },
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.people-ring {
  position: relative;

  .ve-ring {
    position: relative;
    z-index: 11;
    margin: auto;
  }

  .people-num {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    margin: auto;
    margin-top: -12.5px;
    font-size: 28px;
    font-weight: 600;
    line-height: 40px;
    color: @blue;
    text-align: center;
    transform: translateX(-50%) translateY(-50%);

    .people-sum {
      small {
        font-size: 12px;
      }
    }

    .people-desc {
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      color: #45454d;
    }
  }

  .legend {
    display: flex;
    height: 23px;

    .legend-item {
      width: 50%;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      color: #606266;
      text-align: center;

      .point-color {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 4px;
        border-radius: 50%;
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
