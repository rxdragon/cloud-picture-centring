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
                width="200"
                trigger="click"
              >
                <table class="popover-table">
                  <tr class="popover-table-header">
                    <th>产品名称</th>
                    <th>今日/其他</th>
                  </tr>
                  <tr>
                    <th>缦图凭借</th>
                    <th>5/0</th>
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
          <people-ring :retouch-num="flowInfo.retouchingPersonNum" :outer-retouch-num="flowInfo.outerRetouchingPersonNum" />
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
          <div class="data-title">全部修片照片数</div>
          <div class="data-content">
            <count-to :end-value="allRetouchingPhotoNum" />
            <span class="data-desc">详情</span>
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
            <span class="data-desc">详情</span>
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
    },
    allRetouchingPhotoNum () {
      const sum = this.flowInfo.cloudRetouching.photoNum.retouching + this.flowInfo.outerRetouching.photoNum.retouching
      return sum
    }
  },
  created () {
    this.getFlowInfo()
  },
  mounted () {
    this.timer = setInterval(() => {
      this.time--
      if (this.time === 0) {
        this.time = 30
        this.getFlowInfo()
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
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
@import "~@/styles/variables.less";

.flow-board {
    padding: 0 24px;
    background-color: #f2f6fc;
    height: @drawerHeight;
    overflow: overlay;

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
        background: #fff;
        display: none;
    }

    &::-webkit-scrollbar-corner {
        display: none;
    }

    .flow-header {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        line-height: 24px;
        padding: 24px;
        margin: 0 -24px;
        background-color: #f2f6fc;
        position: sticky;
        top: 0;
        z-index: 20;

        .count-down {
            color: #606266;
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            margin-left: 12px;
        }

        .close-button {
            float: right;
            cursor: pointer;
        }

        &.header-fix {
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .08);
        }
    }

    .flow-body {
        .wait-retouch {
            .panel-left {
                width: calc(~"100% - 256px");
                display: inline-block;
                border-right: 1px solid #ebeef5;
                vertical-align: bottom;
            }

            .panel-right {
                width: 256px;
                display: inline-block;
            }
        }

        .module-panel {
            border-radius: 8px;
            margin-bottom: 24px;

            .panel-title {
                padding-left: 10px;
                margin-bottom: 16px;
            }
        }

        .panel-data-box {
            width: 183px;
            padding: 12px 10px;
            display: inline-block;

            .data-title {
                font-size: 12px;
                font-weight: 400;
                color: #909399;
                line-height: 17px;
                padding-bottom: 8px;
            }

            .data-content {
                font-size: 24px;
                font-weight: 600;
                color: #4669fb;
                line-height: 28px;

                .data-desc {
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 17px;
                    margin-left: 6px;
                    cursor: pointer;
                    text-decoration: underline;
                }
            }
        }

        .data-table {
            border-top: 1px solid #ebeef5;
            padding-top: 16px;
            margin: 0 10px;

            table {
                font-size: 12px;
                font-weight: 600;
                color: #303133;
                line-height: 20px;

                th {
                    min-width: 30px;
                    border-right: 1px solid #ebeef5;
                    text-align: left;
                    padding: 0 24px 12px;

                    &:nth-of-type(1) {
                        border: none;
                        padding: 0 0 12px;
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
                    color: #909399;
                    line-height: 17px;
                }
            }
        }
    }
}

.table-popover {
    .popover-table {
        width: 100%;

        .popover-table-header {
            background-color: #fafafa;

            & > th {
                padding: 17px 20px;
            }
        }
    }
}
</style>
