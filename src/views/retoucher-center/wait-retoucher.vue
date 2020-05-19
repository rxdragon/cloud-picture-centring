<template>
  <div class="WaitRetoucher page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showDetail" key="list-box" class="list-box">
        <!-- 标题 -->
        <div class="header">
          <h3>我的待修订单</h3>
          <div class="header-left">
            <span v-if="state !== 2" class="queue-info queue-length">修图排队中流水：{{ queueInfo.waitRetouchStream }}</span>
            <span v-else class="queue-info">排队接单中（顺序{{ queueInfo.retouchQueueIndex }}）</span>
            <el-button v-if="state !== 2" type="primary" :disabled="disabledJoinQueue" @click="joinQueue">接单</el-button>
            <el-button v-else type="info" @click="exitQueue">取消排队</el-button>
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
                  <span class="actual-num green-color">
                    <count-to show-point :end-value="quotaInfo.todayExp" />
                  </span>
                  <span class="goal-num">/ 35</span>
                </div>
                <div class="prop-icon-box">
                  <el-popover
                    placement="bottom"
                    trigger="hover"
                    :content="`经验奖励：${buffInfo.expCard}倍`"
                  >
                    <div v-show="buffInfo.expCard" slot="reference" class="prop-icon iconmap-experience-icon" />
                  </el-popover>
                  <el-popover
                    placement="bottom"
                    trigger="hover"
                  >
                    <div v-for="(infoItem, infoIndex) in buffInfo.impulseInfo" :key="infoIndex" class="impulse-info">
                      {{ `当前海草值达到${infoItem.reachExp} 奖励${infoItem.reward}` }}
                    </div>
                    <div v-show="buffInfo.impulseStatus" slot="reference" class="prop-icon iconmap-impulse-icon" />
                  </el-popover>
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
                  <span class="actual-num purple-color">
                    <count-to :end-value="quotaInfo.todayFinishPhotoNum" />
                  </span>
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
                <div class="num money-num" :class="{ 'no-income': isNoIncome }">
                  <span class="symbol money-color">¥</span>
                  <span class="actual-num money-color">
                    <count-to show-point :end-value="quotaInfo.todayIncome" />
                  </span>
                </div>
                <div class="prop-icon-box">
                  <el-popover
                    placement="bottom"
                    trigger="hover"
                    :content="`金币奖励：${buffInfo.goldReward}倍`"
                  >
                    <div v-show="buffInfo.goldReward" slot="reference" class="prop-icon iconmap-gold-icon" />
                  </el-popover>
                </div>
              </div>
            </div>
            <div class="box-right">
              <div class="info-icon iconmap-money-icon" />
            </div>
          </div>
          <!-- 今日负收益 -->
          <div class="today-info">
            <div class="box-left">
              <div class="title">今日负收益</div>
              <div class="data-info">
                <div class="num">
                  <div class="loss-num">
                    <span class="loss-title">惩罚海草：</span>
                    <span class="pink-color loss-value">
                      <count-to :end-value="quotaInfo.todayFinishPhotoNum" />颗
                    </span>
                  </div>
                  <div class="loss-num">
                    <span class="loss-title">惩罚收益：</span>
                    <span class="pink-color loss-value">
                      <span>¥</span>
                      <count-to show-point :end-value="quotaInfo.todayFinishPhotoNum" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="box-right">
              <div class="info-icon iconmap-photo-amount-icon" />
            </div>
          </div>
        </div>
        <!-- 订单列表 -->
        <div class="order-list">
          <el-tabs v-model="listActive">
            <el-tab-pane :label="'接单中(' + retouchingListNum + ')'" name="retouching">
              <div class="table-box" :class="{'no-border': listActive === 'retouching'}">
                <take-orders-list :show-detail.sync="showDetail" :table-data="tableData" />
              </div>
            </el-tab-pane>
            <el-tab-pane :label="'已挂起(' + hangingListNum + ')'" name="hanging">
              <div class="table-box" :class="{'no-border': listActive === 'retouching'}">
                <hang-up-list :show-detail.sync="showDetail" :table-data="tableData" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <RetouchOrder v-else key="RetouchOrder" :show-detail.sync="showDetail" />
    </transition>
  </div>
</template>

<script>
import RetouchOrder from './components/RetouchOrder'
import TakeOrdersList from './components/TakeOrdersList'
import HangUpList from './components/HangUpList'
import CountTo from '@/components/CountTo'
import { mapGetters } from 'vuex'

import * as Retoucher from '@/api/retoucher.js'
import * as RetoucherCenter from '@/api/retoucherCenter.js'

export default {
  name: 'WaitRetoucher',
  components: { RetouchOrder, TakeOrdersList, HangUpList, CountTo },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      listActive: 'retouching', // retouching 接单中 hanging 挂起
      retouchingListNum: 0, // 接单中数量
      hangingListNum: 0, // 挂起中数量
      tableData: [], // 列表数据
      showDetail: false, // 是否显示订单详情
      queueInfo: {
        inQueue: false,
        retouchQueueIndex: 0, // 排队接单中（顺序)
        retouchQueueTotal: 0, // 总共排队人数
        waitRetouchStream: 0 // 修图排队中流水
      },
      quotaInfo: { // 个人信息
        todayFinishPhotoNum: 0,
        todayExp: 0.00,
        todayIncome: 0.00
      },
      buffInfo: { // buff 信息
        expCard: 0, // 经验卡
        impulseStatus: false, // 冲量奖
        impulseInfo: [], // 冲量信息
        goldReward: 0, // 金币卡
        greenChannelStatus: false // 绿色通道
      },
      hasInitialization: false // 是否有初始化数据
    }
  },
  computed: {
    ...mapGetters(['lineState']),
    // 排队状态
    state () {
      // 1 未接单  2 排队 3 接单中
      if (this.queueInfo.inQueue) return 2
      if (this.retouchingListNum) return 3
      return 1
    },
    // 禁止接单
    disabledJoinQueue () {
      return this.state === 3 || Boolean(this.retouchingListNum) || this.lineState === 'offline'
    },
    isNoIncome () {
      return Number(this.quotaInfo.todayIncome) === 0
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
      handler (value) {
        if (value) return
        this.initializeData()
      }
    },
    '$store.state.notification.retouchId': {
      handler (value) {
        this.showDetail = Boolean(value)
      },
      immediate: true
    }
  },
  created () {
    this.$eventEmitter.on('getRetouchStream', () => {
      this.queueInfo.inQueue = false
      this.getStreamQueueInfo()
    })
    this.hasInitialization = true
    this.initializeData()
  },
  deactivated () {
    this.$store.commit('notification/CLEAR_RETOUCH_STREAM_ID')
    this.showDetail = false
  },
  destroyed () {
    this.$eventEmitter.removeAllListeners('getRetouchStream')
  },
  methods: {
    /**
     * @description 获取个人今日指标
     */
    async getSelfQuota () {
      this.quotaInfo = await Retoucher.getSelfQuota()
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
      const res = await RetoucherCenter.getRetouchStreams(reqData)
      this.tableData = res.data
      this.hangingListNum = res.hangingNum
      this.retouchingListNum = res.retouchingNum
    },
    /**
     * @description 获取排队信息
     */
    async getStreamQueueInfo () {
      this.queueInfo = await RetoucherCenter.getStreamQueueInfo()
      clearTimeout(window.polling.getQueue)
      window.polling.getQueue = null
      if (this.queueInfo.inQueue) {
        window.polling.getQueue = setTimeout(() => {
          this.getStreamQueueInfo()
        }, 10000)
      }
    },
    /**
     * @description 退出队列
     */
    async exitQueue () {
      try {
        this.$confirm('确认退出排队吗？', '', {
          confirmButtonText: '确认',
          cancelButtonText: '再等等',
          type: 'warning',
          center: true
        }).then(async () => {
          this.$store.dispatch('setting/showLoading', this.routeName)
          await RetoucherCenter.exitQueue()
          this.$newMessage.success('退出队列成功')
          this.queueInfo.inQueue = false
          this.getStreamQueueInfo()
          this.$store.dispatch('setting/hiddenLoading', this.routeName)
        })
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    },
    /**
     * @description 排队成功
     */
    async joinQueue () {
      try {
        this.$store.dispatch('setting/showLoading', this.routeName)
        await RetoucherCenter.joinQueue()
        this.$newMessage.success('进入排队成功')
        this.queueInfo.inQueue = true
        this.getStreamQueueInfo()
      } catch (error) {
        console.error(error)
        if (error === '离线无法加入队列') {
          this.$store.dispatch('user/setUserlineState', 'offline')
        }
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    },
    /**
     * @description 初始化页面数据
     */
    initializeData () {
      this.$store.dispatch('setting/showLoading', this.routeName)
      Promise.all([
        this.getSelfQuota(),
        this.getSelfBuffInfo(),
        this.getRetouchStreamList(),
        this.getStreamQueueInfo()
      ]).then(() => {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }).finally(() => {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';

.header {
  .header-left {
    .queue-info {
      margin-right: 14px;
      font-size: 14px;
      font-weight: 500;
      color: @blue;
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
  -webkit-user-select: none;

  .today-info {
    display: flex;
    flex-wrap: wrap;
    width: 24%;
    padding: 18px 21px 12px 24px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: @boxShadow;

    .box-left {
      width: calc(~'100% - 76px');
      margin-top: 6px;

      .title {
        margin-bottom: 4px;
        font-size: 16px;
        color: #606266;
      }

      .data-info {
        display: flex;
        align-items: center;

        .num {
          margin-right: 15px;
          white-space: nowrap;

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

          .pink-color {
            color: @pink;
          }

          .symbol {
            margin-right: 2px;
            font-size: 20px;
            vertical-align: 1px;
          }
        }

        .money-num {
          margin-right: 12px;
        }

        .no-income {
          .money-color {
            color: #909399 !important;
          }
        }

        .loss-num {
          .loss-title {
            font-size: 13px;
            color: #909399;
          }

          .loss-value {
            font-size: 13px;
          }
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

.order-list {
  .el-tabs__content {
    overflow: inherit;
  }
}

.check-online {
  .el-message-box__title {
    span {
      font-size: 16px;
    }
  }
}
</style>

