<template>
  <div class="WaitRetoucher page-class">
    <transition name="fade" mode="out-in">
      <div v-if="!showDetail" key="list-box" class="list-box">
        <!-- 标题 -->
        <div class="header">
          <h3>
            我的待修订单
            <p class="driver-icon" @click.stop="guide">?</p>
            <div class="header-desc">（以下数据统计纬度为：今早8点～次日早8点）</div>
            <div class="eye-box">
              <div v-if="showRecord" class="icon hide" @click="toggleShowRecord">隐藏</div>
              <div v-else class="icon vision" @click="toggleShowRecord">显示</div>
            </div>
          </h3>
          <div class="header-left">
            <span v-if="state !== 2" class="queue-info queue-length">修图排队中流水：{{ queueInfo.waitRetouchStream }}</span>
            <span v-else class="queue-info">排队接单中（顺序{{ queueInfo.retouchQueueIndex }}）</span>
            <el-button
              v-if="state !== 2"
              type="primary"
              :disabled="disabledJoinQueue"
              @click="joinQueue"
            >
              接单
            </el-button>
            <el-button v-else type="info" @click="exitQueue">取消排队</el-button>
          </div>
        </div>
        <!-- 今日信息 -->
        <div class="experience-box">
          <!-- 今日海草值 -->
          <div class="today-info">
            <div class="box-left">
              <div class="title">
                <span class="title-content">今日海草值</span>
                <div class="prop-icon-box">
                  <grass-prop-icon :buff-info="buffInfo" :show-morning-award="showMorningAward" />
                </div>
              </div>
              <div class="data-info">
                <div class="num">
                  <span class="actual-num green-color">
                    <count-to v-if="showRecord" show-point :end-value="quotaInfo.todayExp" />
                    <div v-else class="hidden-data">.</div>
                  </span>
                  <span class="goal-num">/ 35</span>
                </div>
                <div class="prop-icon-big-box">
                  <grass-prop-icon :buff-info="buffInfo" :show-morning-award="showMorningAward" size="40" />
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
              <div class="title">
                <span class="title-content">今日已修张数</span>
                <div class="prop-icon-box">
                  <green-channel-icon :buff-info="buffInfo" />
                </div>
              </div>
              <div class="data-info">
                <div class="num">
                  <span class="actual-num purple-color">
                    <count-to v-if="showRecord" :end-value="quotaInfo.todayFinishNormalPhotoNum" />
                    <div v-else class="photo-hidden-data">*</div>
                    /
                    <count-to :end-value="quotaInfo.todayFinishReworkPhotoNum" />
                  </span>
                </div>
                <div class="prop-icon-big-box">
                  <green-channel-icon :buff-info="buffInfo" size="40" />
                </div>
              </div>
            </div>
            <div class="box-right">
              <div class="info-icon iconmap-photo-amount-icon" />
            </div>
          </div>
          <!-- 今日获得收益 -->
          <div class="today-info" id="todayEarning">
            <div class="box-left">
              <div class="title">
                <span class="title-content">今日获得收益</span>
                <div class="prop-icon-box">
                  <money-award-icon :buff-info="buffInfo" />
                </div>
              </div>
              <div class="data-info">
                <div class="num money-num" :class="{ 'no-income': isNoIncome }">
                  <span class="symbol money-color">¥</span>
                  <span class="actual-num money-color">
                    <count-to v-if="showRecord" show-point :end-value="quotaInfo.todayRewordIncome" />
                    <div v-else class="hidden-data">.</div>
                  </span>
                </div>
                <div class="prop-icon-big-box">
                  <money-award-icon :buff-info="buffInfo" size="40" />
                </div>
              </div>
            </div>
            <div class="box-right">
              <div class="info-icon iconmap-money-icon" />
            </div>
          </div>
          <!-- 今日负收益 -->
          <div class="today-info" id="todayLose">
            <div class="box-left">
              <div class="title">今日负收益</div>
              <div class="data-info">
                <div class="num">
                  <div class="loss-num">
                    <span class="loss-title">退回惩罚海草：</span>
                    <span class="pink-color loss-value">
                      <count-to v-if="showRecord" show-point :end-value="quotaInfo.todayPunishExp" />
                      <div v-else class="loss-hidden-data"> *.**</div>颗
                    </span>
                  </div>
                  <div class="loss-num">
                    <span class="loss-title">超时惩罚海草：</span>
                    <span class="pink-color loss-value">
                      <count-to v-if="showRecord" show-point :end-value="quotaInfo.overTimePunishExp" />
                      <div v-else class="loss-hidden-data"> *.**</div>颗
                    </span>
                  </div>
                  <div class="loss-num">
                    <span class="loss-title">回滚海草：</span>
                    <span class="money-color loss-value">
                      <count-to v-if="showRecord" show-point :end-value="quotaInfo.rollbackExp" />
                      <div v-else class="loss-hidden-data"> *.**</div>颗
                    </span>
                  </div>
                  <div class="loss-num">
                    <el-tooltip effect="dark" content="超时扣除收益 + 退回扣除收益" placement="top">
                      <span class="loss-title">惩罚收益：</span>
                    </el-tooltip>
                    <span class="pink-color loss-value">
                      <span>¥</span>
                      <count-to v-if="showRecord" show-point :end-value="quotaInfo.punishIncome" />
                      <div v-else class="loss-hidden-data"> *.**</div>
                    </span>
                  </div>
                  <div class="loss-num">
                    <span class="loss-title">回滚收益：</span>
                    <span class="money-color loss-value">
                      <span>¥</span>
                      <count-to v-if="showRecord" show-point :end-value="quotaInfo.rollbackIncome" />
                      <div v-else class="loss-hidden-data"> *.**</div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="box-right">
              <div class="info-icon iconmap-loss-income-icon" />
            </div>
          </div>
        </div>
        <!-- 订单列表 -->
        <div class="order-list">
          <el-tabs v-model="listActive">
            <el-tab-pane :label="'接单中(' + retouchingListNum + ')'" name="retouching">
              <div
                class="table-box"
                :class="{'no-border': listActive === 'retouching'}"
              >
                <take-orders-list :show-detail.sync="showDetail" :table-data="tableData" />
              </div>
            </el-tab-pane>
            <el-tab-pane :label="'已挂起(' + hangingListNum + ')'" name="hanging">
              <div
                class="table-box"
                :class="{'no-border': listActive === 'retouching'}"
              >
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
import 'driver.js/dist/driver.min.css'

import RetouchOrder from './components/RetouchOrder'
import TakeOrdersList from './components/TakeOrdersList'
import GrassPropIcon from './components/GrassPropIcon'
import GreenChannelIcon from './components/GreenChannelIcon'
import MoneyAwardIcon from './components/MoneyAwardIcon'
import HangUpList from './components/HangUpList'
import CountTo from '@/components/CountTo'
import moment from 'moment'
import guideData from './guideData.js'
import Driver from 'driver.js' // 引导框

import { mapGetters } from 'vuex'

import * as Retoucher from '@/api/retoucher.js'
import * as RetoucherCenter from '@/api/retoucherCenter.js'
import * as Setting from '@/indexDB/getSetting.js'

export default {
  name: 'WaitRetoucher',
  components: { RetouchOrder, TakeOrdersList, HangUpList, CountTo, GrassPropIcon, GreenChannelIcon, MoneyAwardIcon },
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
        todayFinishNormalPhotoNum: 0,
        todayFinishReworkPhotoNum: 0,
        todayExp: 0.00,
        todayRewordIncome: 0.00,
        todayPunishExp: 0,
        overTimePunishExp: 0,
        rollbackExp: 0,
        punishIncome: 0.00,
        rollbackIncome: 0.00
      },
      buffInfo: { // buff 信息
        expCard: null, // 经验卡
        impulseStatus: false, // 冲量奖
        impulseInfo: [], // 冲量信息
        goldReward: null, // 金币卡
        greenChannelStatus: false // 绿色通道
      },
      driver: null,
      timeId: null,
      showMorningAward: false // 是否显示时间
    }
  },
  computed: {
    ...mapGetters(['lineState', 'showRecord']),
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
    // 今日是否有收益
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
    this.initializeData()
    this.driver = new Driver({
      nextBtnText: '下一个',
      prevBtnText: '上一个',
      doneBtnText: '完成',
      closeBtnText: '关闭',
      animate: true
    })
  },
  mounted () {
    this.intervalShowMorning()
  },
  beforeDestroy () {
    // 销毁轮训 是否早鸟奖
    if (this.timeId) { clearTimeout(this.timeId) }
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
     * @description 循环监听是否有早鸟
     */
    intervalShowMorning () {
      const startTime = moment().set({ 'h': 8, 'm': 0 })
      const endTime = moment().set({ 'h': 10, 'm': 0 })
      this.showMorningAward = moment().isBetween(startTime, endTime)
      clearTimeout(this.timeId)
      if (!this.showMorningAward) return
      this.timeId = setTimeout(() => {
        this.intervalShowMorning()
      }, 1000)
    },
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
        if (error.message === '离线无法加入队列') {
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
    },
    /**
       * @description 提示按钮
       */
    guide () {
      const steps = guideData
      this.driver.defineSteps(steps)
      this.driver.start()
    },
    /**
     * @description 控制显示开关
     */
    toggleShowRecord () {
      this.$store.commit('setting/TOGGLE_SHOW_RECORD')
      const data = Boolean(this.showRecord) ? 1 : 0
      Setting.updateSetting('showRecord', data)
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  // 引导的问号
  .driver-icon {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-bottom: 4px;
    margin-left: 4px;
    font-size: 12px;
    line-height: 18px;
    color: #edf0ff;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    background-color: #c0c4cc;
    border-radius: 50%;
  }

  .eye-box {
    font-size: 14px;

    .icon {
      cursor: pointer;
    }
  }

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
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        font-size: 16px;
        color: #606266;

        .title-content {
          margin-right: 4px;
        }
      }

      .data-info {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        min-width: 170px;

        .hidden-data {
          position: relative;
          display: inline-block;
          margin-right: 32px;
          margin-left: 16px;

          &::before {
            position: absolute;
            top: 14px;
            left: -16px;
            content: '*';
          }

          &::after {
            position: absolute;
            top: 14px;
            right: -29px;
            content: '**';
          }
        }

        .photo-hidden-data {
          position: relative;
          top: 12px;
          display: inline-block;
        }

        .loss-hidden-data {
          display: inline-block;
          margin-right: 4px;
          margin-left: 6px;
          font-size: 14px;
        }

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
            color: @red;
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

@media screen and (max-width: 1620px) {
  .prop-icon-big-box {
    display: none !important;
  }
}

@media screen and (min-width: 1620px) {
  .prop-icon-box {
    display: none !important;
  }
}
</style>

<style lang="less">
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

