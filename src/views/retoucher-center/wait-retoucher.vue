<template>
  <div class="WaitRetoucher">
    <div v-if="!showDetail" key="list-box" class="list-box">
      <!-- 标题 -->
      <div class="header">
        <h3>我的待修订单</h3>
        <div class="header-left">
          <span v-if="state !== 2" class="queue-info queue-length">修图排队中流水：{{ queueInfo.waitRetouchStream }}</span>
          <span v-if="state === 2" class="queue-info">排队接单中（顺序{{ queueInfo.retouchQueueIndex }}）</span>
          <el-button v-if="state === 1 || state === 3" type="primary" :disabled="state === 3 || Boolean(retouchingListNum)" @click="joinQueue">接单</el-button>
          <el-button v-if="state === 2" type="info" @click="exitQueue">取消排队</el-button>
        </div>
      </div>
      <!-- 今日信息 -->
      <div class="experience-box">
        <!-- 今日海草值 -->
        <div class="today-info">
          <div class="box-left">
            <div class="title">今日海草值</div>
            <div class="data-info">
              <div class="num">
                <span class="actual-num green-color">{{ quotaInfo.todayExp }} </span>
                <span class="goal-num">/ 35</span>
              </div>
              <div class="prop-icon-box">
                <div v-if="buffInfo.expCard" class="prop-icon iconmap-experience-icon" />
                <div v-if="buffInfo.impulseStatus" class="prop-icon iconmap-impulse-icon" />
              </div>
            </div>
          </div>
          <div class="box-right">
            <div class="info-icon iconmap-grass-icon" />
          </div>
        </div>
        <!-- 今日目标张数 -->
        <div class="today-info">
          <div class="box-left">
            <div class="title">今日已修张数</div>
            <div class="data-info">
              <div class="num">
                <span class="actual-num purple-color">{{ quotaInfo.todayFinishPhotoNum }} </span>
              </div>
              <div class="prop-icon-box">
                <div v-if="buffInfo.greenChannelStatus" class="prop-icon iconmap-green-aisle-icon" />
              </div>
            </div>
          </div>
          <div class="box-right">
            <div class="info-icon iconmap-photo-amount-icon" />
          </div>
        </div>
        <!-- 今日获得收益 -->
        <div class="today-info">
          <div class="box-left">
            <div class="title">今日获得收益</div>
            <div class="data-info">
              <div class="num money-num">
                <span class="symbol money-color">¥</span>
                <span class="actual-num money-color">{{ quotaInfo.todayIncome }}</span>
              </div>
              <div class="prop-icon-box">
                <div v-if="buffInfo.goldReward" class="prop-icon iconmap-gold-icon" />
              </div>
            </div>
          </div>
          <div class="box-right">
            <div class="info-icon iconmap-money-icon" />
          </div>
        </div>
      </div>
      <!-- 订单列表 -->
      <div class="order-list">
        <el-tabs v-model="listActive">
          <el-tab-pane :label="'接单中(' + retouchingListNum + ')'" name="retouching" />
          <el-tab-pane :label="'已挂起(' + hangingListNum + ')'" name="hanging" />
        </el-tabs>
        <div class="table-box" :class="{'no-border': listActive === 'retouching'}">
          <transition name="fade-transform" mode="out-in">
            <take-orders-list v-if="listActive === 'retouching'" :aid.sync="aid" :show-detail.sync="showDetail" :table-data="tableData" />
            <hang-up-list v-else :aid.sync="aid" :show-detail.sync="showDetail" :table-data="tableData" />
          </transition>
        </div>
      </div>
    </div>
    <RetouchOrder v-else key="RetouchOrder" :show-detail.sync="showDetail" :aid="aid" />
  </div>
</template>

<script>
import RetouchOrder from './components/RetouchOrder'
import TakeOrdersList from './components/TakeOrdersList'
import HangUpList from './components/HangUpList'

import * as SessionTool from '@/utils/sessionTool'
import * as Retoucher from '@/api/retoucher.js'
import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default {
  name: 'WaitRetoucher',
  components: { RetouchOrder, TakeOrdersList, HangUpList },
  data () {
    return {
      listActive: 'retouching', // retouching 接单中 hanging 挂起
      retouchingListNum: 0, // 接单中数量
      hangingListNum: 0, // 挂起中数量
      tableData: [], // 列表数据
      showDetail: false, // 是否显示订单详情
      queueInfo: {
        inQueue: false,
        retouchQueueIndex: 0,
        retouchQueueTotal: 0,
        retouchStreamId: '',
        waitRetouchStream: 0
      },
      quotaInfo: { // 个人信息
        todayFinishPhotoNum: 0,
        todayExp: 0.00,
        todayIncome: 0.00
      },
      buffInfo: { // buff 信息
        expCard: 0, // 经验卡
        impulseStatus: false, // 冲量奖
        goldReward: 0, // 金币卡
        greenChannelStatus: false // 绿色通道
      },
      aid: '' // 订单id
    }
  },
  computed: {
    // 排队状态
    state () {
      // 1 未接单  2 排队接单 3 接单中
      if (this.queueInfo.inQueue) return 2
      if (this.retouchingListNum) return 3
      return 1
    }
  },
  watch: {
    // 是否显示激活
    listActive: {
      handler: 'getRetouchStreamList',
      immediate: false
    },
    // 详情页显示
    showDetail: {
      handler: function (value) {
        if (!value) {
          this.initializeData()
        }
      }
    }
  },
  created () {
    this.initializeData()
    this.hasReturn()
  },
  activated: function () {
    this.showDetail = false
  },
  methods: {
    /**
     * @description 获取个人今日指标
     */
    async getSelfQuota () {
      this.quotaInfo = await Retoucher.getSelfQuota()
      console.log(this.quotaInfo, 1)
    },
    /**
     * @description 获取buff 信息
     */
    async getSelfBuffInfo () {
      this.buffInfo = await Retoucher.getSelfBuffInfo()
    },
    /**
     * @description 获取流水列表数据
     */
    async getRetouchStreamList () {
      const reqData = { state: this.listActive }
      const data = await RetoucherCenter.getRetouchStreams(reqData)
      console.log(data)
      this.tableData = data.data
      this.hangingListNum = data.hangingNum
      this.retouchingListNum = data.retouchingNum
    },
    /**
     * @description 获取排队信息
     */
    async getStreamQueueInfo () {
      this.queueInfo = await RetoucherCenter.getStreamQueueInfo()
      console.log(this.queueInfo)
      clearTimeout(window.polling.getQueue)
      window.polling.getQueue = null
      if (this.queueInfo.inQueue) {
        window.polling.getQueue = setTimeout(() => {
          this.getStreamQueueInfo()
        }, 3000)
      }
      if (+this.queueInfo.retouchStreamId && !SessionTool.getSureRetouchOrder(this.queueInfo.retouchStreamId)) {
        this.$confirm('', '你有新的订单请及时处理', {
          confirmButtonText: '确定',
          center: true,
          type: 'warning',
          showCancelButton: false
        }).then(() => {
          SessionTool.saveSureRetouchOrder(this.queueInfo.retouchStreamId)
          this.aid = this.queueInfo.retouchStreamId
          this.showDetail = true
        }).catch(() => {})
      }
    },
    /**
     * @description 退出队列
     */
    async exitQueue () {
      this.$store.dispatch('setting/showLoading')
      await RetoucherCenter.exitQueue()
      this.$newMessage.success('退出队列成功')
      clearTimeout(window.polling.getQueue)
      window.polling.getQueue = null
      await this.getStreamQueueInfo()
      this.$store.dispatch('setting/hiddenLoading')
    },
    /**
     * @description 排队成功
     */
    joinQueue () {
      this.$store.dispatch('setting/showLoading')
      RetoucherCenter.joinQueue()
        .then(msg => {
          this.$newMessage.success('进入排队成功')
          this.$store.dispatch('setting/hiddenLoading')
          this.getStreamQueueInfo()
        })
    },
    /**
     * @description 初始化页面数据
     */
    initializeData () {
      this.$store.dispatch('setting/showLoading')
      this.aid = ''
      Promise.all([
        this.getSelfQuota(),
        this.getSelfBuffInfo(),
        this.getRetouchStreamList(),
        this.getStreamQueueInfo()
      ]).then(() => {
        this.$store.dispatch('setting/hiddenLoading')
      }).catch(err => {
        console.log(err, 'err')
      })
    },
    /**
     * @description 有退单
     */
    async hasReturn () {
      const data = await Retoucher.haveReworkStream()
      if (data) {
        this.$confirm('您有新的重修流水，未免影响沙漏时间请及时处理。', '', {
          confirmButtonText: '现在处理',
          cancelButtonText: '稍后处理',
          type: 'warning',
          center: true
        }).then(() => {
          this.aid = data
          this.showDetail = true
        }).catch(() => {})
      } else {
        this.haveReworkStream()
      }
      console.log('获取是否有退单')
    },
    /**
     * @description 是否有重修订单
     */
    haveReworkStream () {
      clearTimeout(window.polling.haveRework)
      window.polling.haveRework = null
      window.polling.haveRework = setTimeout(async () => {
        this.hasReturn()
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
.header {
  .header-left {
    .queue-info {
      color: @blue;
      font-size: 14px;
      font-weight: 500;
      margin-right: 14px;
    }

    .queue-length {
      color: #606266;
    }

    .el-button {
      border-radius: 8px;
    }
  }
}

.experience-box {
  display: flex;
  justify-content: space-between;

  .today-info {
    width: 32%;
    padding: 18px 21px 12px 24px;
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    box-shadow: @boxShadow;
    border-radius: 16px;

    .box-left {
      margin-top: 6px;
      width: calc(~'100% - 76px');

      .title {
        margin-bottom: 4px;
        color: #606266;
        font-size: 16px;
      }

      .data-info {
        display: flex;
        align-items: center;

        .num {
          margin-right: 24px;

          .actual-num {
            font-size: 34px;
            font-weight: 500px;
          }

          .goal-num {
            font-size: 20px;
            color: @gray;
          }

          .green-color {
            color: @panGreen;
          }

          .purple-color {
            color: @purple;
          }

          .money-color {
            color: @moneyColor;
          }

          .symbol {
            font-size: 20px;
            margin-right: 2px;
          }
        }

        .money-num {
          margin-right: 12px;
        }

        .prop-icon-box {
          display: flex;

          .prop-icon {
            width: 44px;
            height: 34px;
            margin-right: 6px;
          }
        }
      }
    }

    .box-right {
      width: 76px;
      height: 84px;

      .info-icon {
        width: 100%;
        height: 100%;
      }
    }

    .box-bottom {
      width: 100%;
      margin-top: 14px;

      .el-progress-bar__inner {
        background: @gradualGreen;
      }
    }
  }
}

.order-list {
  margin-top: 20px;

  .table-box {
    margin-top: 0;
  }
}
</style>

<style lang="less">
@import '../../styles/variables.less';
.today-info {
  .green-progress {
    box-shadow: @greenBoxShadow;

    .el-progress-bar__inner {
      background: @gradualGreen;
    }
  }

  .purple-progress {
    box-shadow: @purpleBoxShadow;

    .el-progress-bar__inner {
      background: @gradualPurple;
    }
  }

  .orange-progress {
    box-shadow: @orangeBoxShadow;

    .el-progress-bar__inner {
      background: @gradualOrange;
    }
  }
}
</style>

