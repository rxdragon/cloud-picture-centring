<template>
  <div class="flow-board" @scroll="scrollMove">
    <div class="flow-header" :class="headerFix">
      云端流量看板
      <span class="count-down">{{ time }}s后刷新</span>
      <div class="close-button" @click="closeFlow">
        <i class="el-icon-close" />
      </div>
    </div>
    <div class="flow-body">
      <!-- 待修数据 -->
      <div class="module-panel wait-retouch">
        <div class="panel-left">
          <div class="panel-title">待修数据</div>
          <div class="panel-data-box">
            <div class="data-title">全部待修订单数</div>
            <div class="data-content">
              <count-to :end-value="flowInfo.waitRetouch.streamNum.today + flowInfo.waitRetouch.streamNum.other" />
            </div>
          </div>
          <div class="panel-data-box">
            <div class="data-title">全部待修照片数</div>
            <div class="data-content">
              <count-to :end-value="flowInfo.waitRetouch.photoNum.today + flowInfo.waitRetouch.photoNum.other" />
              <el-popover
                popper-class="table-popover"
                placement="bottom"
                width="300"
                trigger="hover"
              >
                <table class="popover-table">
                  <tr class="popover-table-header">
                    <th>产品名称</th>
                    <th>今日/其他</th>
                  </tr>
                  <tr
                    v-for="(productItem, productIndex) in flowInfo.waitRetouch.photos"
                    :key="productIndex"
                  >
                    <th>{{ productItem.name }}</th>
                    <th>{{ productItem.today + '/' + productItem.other }}</th>
                  </tr>
                </table>
                <span slot="reference" class="data-desc">详情</span>
              </el-popover>
            </div>
          </div>
          <div class="data-table">
            <table>
              <tr>
                <th />
                <th class="table-title">今日</th>
                <th class="table-title">其它日</th>
              </tr>
              <tr>
                <th class="table-title">订单数</th>
                <th>{{ flowInfo.waitRetouch.streamNum.today }}</th>
                <th>{{ flowInfo.waitRetouch.streamNum.other }}</th>
              </tr>
              <tr>
                <th class="table-title">照片数</th>
                <th>{{ flowInfo.waitRetouch.photoNum.today }}</th>
                <th>{{ flowInfo.waitRetouch.photoNum.other }}</th>
              </tr>
            </table>
          </div>
        </div>
        <div class="panel-right">
          <people-ring
            :retouch-num="flowInfo.retouchingPersonNum"
            :outer-retouch-num="flowInfo.outerRetouchingPersonNum"
          />
        </div>
      </div>
      <!-- 正在修片数据 -->
      <div class="module-panel">
        <div class="panel-title">正在修片数据</div>
        <div class="panel-data-box">
          <div class="data-title">全部修片订单数</div>
          <div class="data-content">
            <count-to :end-value="allRetouchingOrderNum" />
          </div>
        </div>
        <div class="panel-data-box">
          <div class="data-title">云端修片照片数</div>
          <div class="data-content">
            <count-to :end-value="flowInfo.cloudRetouching.photoNum.retouching" />
            <el-popover
              popper-class="table-popover"
              placement="bottom"
              width="300"
              trigger="hover"
            >
              <table border="0" cellspacing="0" class="popover-table">
                <tr class="popover-table-header">
                  <th>产品名称</th>
                  <th>修图/重修</th>
                </tr>
                <tr
                  v-for="(productItem, productIndex) in flowInfo.cloudRetouching.photos"
                  :key="productIndex"
                >
                  <th>{{ productItem.name }}</th>
                  <th>{{ productItem.retouching + '/' + productItem.reworking }}</th>
                </tr>
              </table>
              <span slot="reference" class="data-desc">详情</span>
            </el-popover>
          </div>
        </div>
        <div class="panel-data-box">
          <div class="data-title">外包修片照片数</div>
          <div class="data-content">
            <count-to :end-value="flowInfo.outerRetouching.photoNum.retouching" />
            <el-popover
              popper-class="table-popover"
              placement="bottom"
              width="300"
              trigger="hover"
            >
              <table border="0" cellspacing="0" class="popover-table">
                <tr class="popover-table-header">
                  <th>产品名称</th>
                  <th>修图/重修</th>
                </tr>
                <tr
                  v-for="(productItem, productIndex) in flowInfo.outerRetouching.photos"
                  :key="productIndex"
                >
                  <th>{{ productItem.name }}</th>
                  <th>{{ productItem.retouching + '/' + productItem.reworking }}</th>
                </tr>
              </table>
              <span slot="reference" class="data-desc">详情</span>
            </el-popover>
          </div>
        </div>
        <div class="data-table">
          <table>
            <tr>
              <th />
              <th class="table-title">云端修图</th>
              <th class="table-title">云端重修</th>
              <th class="table-title">外包修图</th>
              <th class="table-title">外包重修</th>
            </tr>
            <tr>
              <th class="table-title">订单数</th>
              <th>{{ flowInfo.cloudRetouching.streamNum.retouching }}</th>
              <th>{{ flowInfo.cloudRetouching.streamNum.reworking }}</th>
              <th>{{ flowInfo.outerRetouching.streamNum.retouching }}</th>
              <th>{{ flowInfo.outerRetouching.streamNum.reworking }}</th>
            </tr>
            <tr>
              <th class="table-title">照片数</th>
              <th>{{ flowInfo.cloudRetouching.photoNum.retouching }}</th>
              <th>{{ flowInfo.cloudRetouching.photoNum.reworking }}</th>
              <th>{{ flowInfo.outerRetouching.photoNum.retouching }}</th>
              <th>{{ flowInfo.outerRetouching.photoNum.reworking }}</th>
            </tr>
          </table>
        </div>
      </div>
      <!-- 云端审核数据 -->
      <div class="module-panel">
        <div class="panel-title">云端审核数据</div>
        <div class="panel-data-box">
          <div class="data-title">全部审核订单数</div>
          <div class="data-content">
            <count-to :end-value="flowInfo.review.streamNum.wait_review + flowInfo.review.streamNum.reviewing" />
          </div>
        </div>
        <div class="panel-data-box">
          <div class="data-title">全部审核照片数</div>
          <div class="data-content">
            <count-to :end-value="flowInfo.review.photoNum.wait_review + flowInfo.review.photoNum.reviewing" />
            <el-popover
              popper-class="table-popover"
              placement="bottom"
              width="300"
              trigger="hover"
            >
              <table class="popover-table">
                <tr class="popover-table-header">
                  <th>产品名称</th>
                  <th>审核中/待审核</th>
                </tr>
                <tr
                  v-for="(productItem, productIndex) in flowInfo.review.photos"
                  :key="productIndex"
                >
                  <th>{{ productItem.name }}</th>
                  <th>{{ productItem.reviewing + '/' + productItem.wait_review }}</th>
                </tr>
              </table>
              <span slot="reference" class="data-desc">详情</span>
            </el-popover>
          </div>
        </div>
        <div class="data-table">
          <table>
            <tr>
              <th />
              <th class="table-title">审核中</th>
              <th class="table-title">待审核</th>
            </tr>
            <tr>
              <th class="table-title">订单数</th>
              <th>{{ flowInfo.review.streamNum.reviewing }}</th>
              <th>{{ flowInfo.review.streamNum.wait_review }}</th>
            </tr>
            <tr>
              <th class="table-title">照片数</th>
              <th>{{ flowInfo.review.photoNum.reviewing }}</th>
              <th>{{ flowInfo.review.photoNum.wait_review }}</th>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as AdminManage from '@/api/adminManage.js'
import PeopleRing from './PeopleRing.vue'
import CountTo from '@/components/CountTo'

export default {
  name: 'FlowBoard',
  components: { PeopleRing, CountTo },
  data () {
    return {
      flowInfo: {
        retouchingPersonNum: 0,
        outerRetouchingPersonNum: 0,
        waitRetouch: {
          streamNum: {
            today: 0,
            other: 0
          },
          photoNum: {
            today: 0,
            other: 0
          },
          photos: []
        },
        cloudRetouching: {
          streamNum: {
            retouching: 0,
            reworking: 0
          },
          photoNum: {
            retouching: 0,
            reworking: 0
          },
          photos: []
        },
        outerRetouching: {
          streamNum: {
            retouching: 0,
            reworking: 0
          },
          photoNum: {
            retouching: 0,
            reworking: 0
          },
          photos: []
        },
        review: {
          streamNum: {
            wait_review: 0,
            reviewing: 0
          },
          photoNum: {
            wait_review: 0,
            reviewing: 0
          },
          photos: []
        }
      },
      time: 30,
      timer: null,
      headerFix: ''
    }
  },
  computed: {
    allRetouchingOrderNum () {
      const sum = this.flowInfo.cloudRetouching.streamNum.retouching + this.flowInfo.outerRetouching.streamNum.retouching
      return sum
    }
  },
  created () {
    this.getFlowInfo()
  },
  mounted () {
    this.pollFlowInfo()
  },
  beforeDestroy () {
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    /**
     * @description 获取流量看板数据
     */
    async getFlowInfo () {
      this.flowInfo = await AdminManage.getFlowInfo()
    },
    /**
     * @description 轮询监听
     */
    pollFlowInfo () {
      clearTimeout(this.timer)
      this.timer = null
      this.timer = setTimeout(() => {
        this.time--
        if (this.time === 0) {
          this.time = 30
          this.getFlowInfo()
        }
        this.pollFlowInfo()
      }, 1000)
    },
    /**
     * @description 关闭抽屉
     */
    closeFlow () {
      this.$emit('update:visible', false)
    },
    /**
     * @description 监听滚动条滚动
     */
    scrollMove (e) {
      const scrollTop = e.target.scrollTop
      this.headerFix = scrollTop > 0 ? 'header-fix' : ''
    }
  }
}
</script>

<style lang="less">


.table-popover {
  .popover-table {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow: overlay;
    border-collapse: collapse;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cdcdcd;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-button {
      display: none;
      background: #fff;
    }

    &::-webkit-scrollbar-corner {
      display: none;
    }

    tr {
      border-bottom: 1px solid #f2f6fc;
    }

    th {
      width: 50%;
      padding: 21px 20px;
      font-size: 14px;
      font-weight: 400;
      line-height: 14px;
      color: #606266;
    }

    .popover-table-header {
      position: sticky;
      top: 0;
      display: block;
      background-color: #fafafa;
      border: none;

      & > th {
        padding: 17px 20px;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #303133;
      }
    }
  }
}

.flow-board {
  height: @drawerHeight;
  padding: 0 24px;
  overflow: overlay;
  background-color: #f2f6fc;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cdcdcd;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-button {
    display: none;
    background: #fff;
  }

  &::-webkit-scrollbar-corner {
    display: none;
  }

  .flow-header {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 24px;
    margin: 0 -24px;
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    color: #303133;
    background-color: #f2f6fc;

    .count-down {
      margin-left: 12px;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #606266;
    }

    .close-button {
      float: right;
      cursor: pointer;
    }

    &.header-fix {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    }
  }

  .flow-body {
    .wait-retouch {
      .panel-left {
        display: inline-block;
        width: calc(~"100% - 256px");
        vertical-align: bottom;
        border-right: 1px solid @borderColor;
      }

      .panel-right {
        display: inline-block;
        width: 256px;
      }
    }

    .module-panel {
      margin-bottom: 24px;
      border-radius: 8px;

      .panel-title {
        padding-left: 10px;
        margin-bottom: 16px;
      }
    }

    .panel-data-box {
      display: inline-block;
      width: 183px;
      padding: 12px 10px;

      .data-title {
        padding-bottom: 8px;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        color: #909399;
      }

      .data-content {
        font-size: 24px;
        font-weight: 600;
        line-height: 28px;
        color: @blue;

        .data-desc {
          margin-left: 6px;
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }

    .data-table {
      padding-top: 16px;
      margin: 0 10px;
      border-top: 1px solid @borderColor;

      table {
        font-size: 12px;
        font-weight: 600;
        line-height: 20px;
        color: #303133;

        th {
          min-width: 30px;
          padding: 0 24px 12px;
          text-align: left;
          border-right: 1px solid @borderColor;

          &:nth-of-type(1) {
            padding: 0 0 12px;
            border: none;
          }

          &:nth-last-of-type(1) {
            border: none;
          }
        }

        tr {
          margin-bottom: 12px;

          &:nth-last-of-type(1) {
            th {
              padding-bottom: 0;
            }
          }
        }

        .table-title {
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          color: #909399;
        }
      }
    }
  }
}
</style>
