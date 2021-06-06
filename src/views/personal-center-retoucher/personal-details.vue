<template>
  <div class="personal-details page-class">
    <div class="header">
      <h3>个人修图概况</h3>
    </div>
    <div class="today-box">
      <!-- 今日指标 -->
      <div class="module-panel today-info">
        <div class="panel-title">今日目标完成量</div>
        <div class="panel-main">
          <el-progress
            :percentage="todayData.todayFinishPhotoNumProgress"
            :stroke-width="12"
            :width="180"
            type="circle"
          />
          <div class="progress-num">
            <span class="num">
              <count-to :end-value="todayData.todayFinishPhotoNumProgress || 0" />%
            </span>
            <span>完成率</span>
          </div>
        </div>
        <div class="panel-footer">
          <div class="footer-left">目标张数：{{ todayData.todayTargetPhotoNum || 0 }}</div>
          <div class="footer-right">已完成：{{ todayData.todayAllFinishPhotoNum || 0 }}</div>
        </div>
      </div>
      <!-- 个人修图等级 -->
      <RetouchLevelDetail class="level-info" />
    </div>

    <!-- 修图绩效 -->
    <RetouchPerformance />

    <!-- 云学院报告 -->
    <div class="cloud-report-self module-panel">
      <div class="panel-title">整理抽查数据统计</div>
      <PersonalCloudReport :search-role="CLOUD_ROLE.CREW" :search-type="GRADE_LABEL_TYPE.CLOUD"/>
    </div>

    <!-- 小蜜蜂奖励记录 -->
    <div class="module-panel bee-award" v-loading="LittleBeeLoading">
      <div class="panel-title">小蜜蜂奖励记录</div>
      <el-row class="search-box" :gutter="20">
        <el-col :span="6" :xl="4">
          <div class="search-item">
            <span>年份</span>
            <el-date-picker
              v-model="yearValue"
              type="year"
              value-format="yyyy"
              placeholder="选择年"
            />
          </div>
        </el-col>
        <el-col :span="4" :xl="4">
          <div class="search-item">
            <el-button type="primary" @click="getLittleBeeInfo">查 询</el-button>
          </div>
        </el-col>
      </el-row>

      <div class="panel-content">
        <list-table
          v-if="awardInfo.length"
          key="awardInfo"
          :listdata="awardInfo"
          width="500px"
        />
        <div v-else class="no-data">暂无数据</div>
      </div>
    </div>
    <!-- 我的道具 -->
    <div class="module-panel prop-panel">
      <div class="panel-title">
        <tip message="有效期15天,请尽快使用">我的道具</tip>
      </div>
      <div class="prop-tip">
        <el-alert type="warning" :closable="false">
          <p>1、不可同时激活同类奖励道具。例：已激活了一张1.5倍收益奖励，不可再激活另一张1.2/1.5倍收益奖励，需等待前一张收益奖励失效后方可激活另一张收益奖励。</p>
          <p>2、请在奖励道具过期前使用该道具，过期未激活道具将会自动消失。</p>
        </el-alert>
      </div>
      <div class="panel-main">
        <template v-if="Object.keys(propData).length">
          <el-badge
            v-for="(propItem, propIndex) in propData"
            :key="propIndex"
            :value="propItem.count"
            :hidden="propItem.count === 1"
            class="prop-badge"
          >
            <div class="prop-box">
              <div class="prop-left">
                <div class="prop-icon" :class="propItem.className" />
              </div>
              <div class="prop-content">
                <div class="content-title">{{ propItem.multiple + propItem.multipleText }}</div>
                <div class="content-describe">过期时间：{{ propItem.endAt | toTimeSpan }}</div>
              </div>
              <div class="prop-right">
                <el-popover v-model="propItem.showProp" placement="top" width="160">
                  <p>确认使用道具卡吗？</p>
                  <div style=" margin: 10px; text-align: right;">
                    <el-button size="mini" type="text" @click="propItem.showProp = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="useProp(propItem)">确定</el-button>
                  </div>
                  <el-button
                    slot="reference"
                    type="primary"
                    size="mini"
                    @click="showPropSureBox(propItem)"
                  >
                    使用
                  </el-button>
                </el-popover>
              </div>
            </div>
          </el-badge>
        </template>
        <no-data v-else />
      </div>
    </div>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'
import CountTo from '@/components/CountTo'
import NoData from '@/components/NoData'
import RetouchPerformance from './components/RetouchPerformance'
import RetouchLevelDetail from './components/RetouchLevelDetail'
import Tip from '@/components/Tip'
import PersonalCloudReport from '@/components/CloudReport/PersonalCloudReport'

import * as Retoucher from '@/api/retoucher.js'

import { CLOUD_ROLE, GRADE_LABEL_TYPE } from '@/utils/enumerate'

export default {
  name: 'PersonalDetails',
  components: { ListTable, CountTo, NoData, RetouchPerformance, Tip, PersonalCloudReport, RetouchLevelDetail },
  data () {
    return {
      CLOUD_ROLE,
      GRADE_LABEL_TYPE,
      routeName: this.$route.name, // 路由名字
      yearValue: '',
      todayData: {}, // 今日指标
      awardInfo: [],
      propData: [],
      LittleBeeLoading: false, // 小蜜蜂 加载信息
    }
  },
  created () {
    this.$store.dispatch('setting/showLoading', this.routeName)
    const nowYear = new Date().getFullYear()
    this.yearValue = nowYear.toString()
    Promise.all([
      this.getSelfQuota(),
      this.getLittleBeeInfo(),
      this.getProps()
    ]).then(() => {
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
    }).catch(error => {
      console.error(error)
      this.$store.dispatch('setting/hiddenLoading', this.routeName)
    })
  },
  methods: {
    showPropSureBox (propItem) {
      const data = JSON.parse(JSON.stringify(propItem))
      data.showProp = true
      propItem = data
    },
    /**
     * @description 获取个人指标
     */
    async getSelfQuota () {
      this.todayData = await Retoucher.getSelfQuota()
    },
    /**
     * @description 获取小蜜蜂奖
     */
    async getLittleBeeInfo () {
      if (!this.yearValue) return this.$newMessage.warning('请输入时间')
      try {
        this.LittleBeeLoading = true
        const reqData = { year: this.yearValue }
        this.awardInfo = await Retoucher.getLittleBeeInfo(reqData)
      } finally {
        await this.$delayLoading()
        this.LittleBeeLoading = false
      }
    },
    /**
     * @description 获取道具库
     */
    async getProps () {
      this.propData = await Retoucher.getProps()
    },
    /**
     * @description 使用道具
     */
    async useProp (data) {
      try {
        const reqData = { id: data.id }
        this.$store.dispatch('setting/showLoading', this.routeName)
        await Retoucher.useProp(reqData)
        this.getProps()
      } finally {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      }
    }
  }
}
</script>

<style lang="less">
.personal-details {
  .today-box {
    display: flex;
  }

  .today-info {
    width: 289px;
    margin-right: 24px;

    .panel-main {
      position: relative;
      text-align: center;

      .progress-num {
        position: absolute;
        top: 50%;
        left: 50%;
        display: flex;
        flex-direction: column;
        color: #606266;
        transform: translateX(-50%) translateY(-50%);

        .num {
          font-family: @DINAlternate;
          font-size: 44px;
          font-weight: bold;
          color: @blue;
        }
      }
    }

    .panel-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-family: @pingFang;
      font-size: 12px;
      line-height: 20px;
      color: #606266;

      & > div {
        &::before {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 4px;
          content: '';
          background: @borderColor;
          border-radius: 50%;
        }
      }

      .footer-right {
        &::before {
          background: linear-gradient(51deg, rgba(145, 245, 255, 1) 0%, rgba(70, 105, 251, 1) 100%);
        }
      }
    }
  }

  .level-info {
    width: calc(~'100% - 289px');
    height: 282px;
  }

  .retouch-performance {
    margin-top: 24px;
  }

  .bee-award {
    margin-top: 24px;

    .panel-title {
      margin-bottom: 20px;
    }
  }

  .prop-panel {
    margin-top: 24px;

    .prop-tip {
      margin-top: 12px;
    }

    .prop-icon {
      width: 44px;
      height: 34px;
    }

    .panel-main {
      display: flex;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .prop-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 313px;
      height: 68px;
      padding: 17px 16px;
      margin-right: 24px;
      margin-bottom: 16px;
      border: 1px solid #d8dce6;
      border-radius: 4px;

      .prop-content {
        .content-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
          color: #303133;
        }

        .content-describe {
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          color: #909399;
        }
      }
    }
  }

  .cloud-report-self {
    margin-top: 24px;

    .panel-title {
      margin-bottom: 20px;
    }
  }
}

.emphasis {
  color: red;
}

.grade-box {
  margin-top: 20px;
}
</style>

<style lang="less">
.panel-main {
  .el-progress__text {
    display: none;
  }
}

.prop-badge {
  color: red;

  .el-badge__content.is-fixed {
    right: 34px;
  }
}
</style>
