<template>
  <div class="personal-details">
    <div class="header">
      <h3>个人修图概况</h3>
    </div>
    <div class="today-box">
      <!-- 今日指标 -->
      <div class="module-panel today-info">
        <div class="panel-title">今日指标</div>
        <div class="panel-main">
          <el-progress
            :percentage="todayData.todayFinishPhotoNumProgress"
            :stroke-width="12"
            :width="180"
            type="circle"
          />
          <div class="progress-num">
            <span class="num">{{ todayData.todayFinishPhotoNumProgress || 0 }}%</span>
            <span>完成率</span>
          </div>
        </div>
        <div class="panel-footer">
          <div class="footer-left">目标张数：{{ todayData.todayTargetPhotoNum || '暂无数据' }}</div>
          <div class="footer-right">已完成：{{ todayData.todayFinishPhotoNum || '暂无数据' }}</div>
        </div>
      </div>
      <!-- 个人修图等级 -->
      <div class="module-panel level-info">
        <div class="panel-title ">
          <span>
            个人修图等级
            <el-tag size="medium">{{ gradeInfo.levelName }}</el-tag>
          </span>
          <div class="tip">
            <el-popover
              placement="bottom-end"
              width="700"
              trigger="hover"
            >
              <div class="tip-content">
                <div>修图等级升级规则：</div>
                <div>1、种草率：近期修图获得的<span class="emphasis">种草数</span>占比，升级条件需<span class="emphasis">达到</span>种草达标率</div>
                <div>2、拔草率：近期修图获得的<span class="emphasis">拔草数</span>占比，升级条件需<span class="emphasis">低于</span>拔草合格率</div>
                <div>3、总海草：历史获得海草(即经验值)，升级需达到<span class="emphasis">达标海草数</span>。</div>
                <div>系统按照过去30天内（滚动周期，由当天往前推30天）的
                  <span class="emphasis">种草数、拔草数</span>
                  除以等级要求固定分母得出种拔草率</div>
                <div class="grade-box">
                  <el-table :data="gradeData">
                    <el-table-column label="固定分母">
                      <el-table-column
                        v-for="(gradeNumber, gradeNumberIndex) in 11"
                        :key="gradeNumberIndex"
                        min-width="50"
                        :label="gradeNumber.toString()"
                        :prop="gradeNumber.toString()"
                        align="center"
                      />
                    </el-table-column>
                  </el-table>
                </div>
              </div>
              <span slot="reference" class="tip-title"><i class="el-icon-warning-outline" />升级规则</span>
            </el-popover>
          </div>
        </div>
        <div class="panel-main">
          <div class="main-content">
            <span class="num plant-color">{{ gradeInfo.nearly30DaysPlantNum }}<i>.{{ gradeInfo.nearly30DaysPlantNum | getPoint }}</i></span>
            <span>近30日种草</span>
          </div>
          <div class="main-content">
            <span class="num pull-color">{{ gradeInfo.nearly30DaysPullNum }}<i>.{{ gradeInfo.nearly30DaysPullNum | getPoint }}</i></span>
            <span>近30日拔草</span>
          </div>
          <div class="main-content">
            <span class="num">{{ gradeInfo.exp }}<i>.{{ gradeInfo.exp | getPoint }}</i></span>
            <span>历史海草数</span>
          </div>
          <div class="main-content">
            <span class="num">{{ gradeInfo.needLevelUpExp }}<i>.{{ gradeInfo.needLevelUpExp | getPoint }}</i></span>
            <span>达标海草数</span>
          </div>
        </div>
        <div class="panel-footer">
          <el-row :gutter="51">
            <el-col :span="12">
              <div class="rote-title">
                <span>近30日种草率</span>
                <span class="num">{{ gradeInfo.nearly30DaysPlantRate }}%</span>
              </div>
              <el-progress :percentage="gradeInfo.nearly30DaysPlantRate" :show-text="false" />
            </el-col>
            <el-col :span="12" class="pull-box">
              <div class="rote-title">
                <span>近30日拔草率</span>
                <span class="num">{{ gradeInfo.nearly30DaysPullRate }}%</span>
              </div>
              <el-progress :percentage="gradeInfo.nearly30DaysPullRate" :show-text="false" />
            </el-col>
            <el-col :span="12">
              <div class="rote-title col-two">
                <span>种草达标率</span>
                <span class="num">{{ gradeInfo.needLevelUpPhotoPlantRate }}%</span>
              </div>
              <el-progress :percentage="gradeInfo.needLevelUpPhotoPlantRate" :show-text="false" />
            </el-col>
            <el-col :span="12" class="pull-box">
              <div class="rote-title col-two">
                <span>拔草合格率</span>
                <span class="num">{{ gradeInfo.needLevelUpPhotoPullRate }}%</span>
              </div>
              <el-progress :percentage="gradeInfo.needLevelUpPhotoPullRate" :show-text="false" />
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 修图绩效 -->
    <div class="module-panel retouch-performance">
      <div class="panel-title">修图绩效</div>
      <div class="search-box">
        <div class="search-item">
          <span>时间</span>
          <date-picker v-model="timeSpan" />
        </div>
        <el-button type="primary" @click="getRetouchQuota">查 询</el-button>
      </div>
      <div class="panel-content">
        <list-table v-if="performanceData.length" key="performanceData" :listdata="performanceData" />
        <div v-else class="no-data">暂无数据</div>
      </div>
    </div>
    <!-- 小蜜蜂奖励记录 -->
    <div class="module-panel bee-award">
      <div class="panel-title">小蜜蜂奖励记录</div>
      <div class="search-box">
        <div class="search-item">
          <span>年份</span>
          <el-date-picker
            v-model="yearValue"
            type="year"
            value-format="yyyy"
            placeholder="选择年"
          />
        </div>
        <el-button type="primary" @click="getLittleBeeInfo">查 询</el-button>
      </div>
      <div class="panel-content">
        <list-table v-if="awardInfo.length" key="awardInfo" :listdata="awardInfo" width="500px" />
        <div v-else class="no-data">暂无数据</div>
      </div>
    </div>
    <!-- 我的道具 -->
    <div class="module-panel prop-panel">
      <div class="panel-title">我的道具</div>
      <div class="panel-main">
        <div v-for="(propItem, propIndex) in propData" :key="propIndex" class="prop-box">
          <div class="prop-left">
            <div class="prop-icon" :class="propItem.className" />
          </div>
          <div class="prop-content">
            <div class="content-title">{{ propItem.card.multiple + propItem.multipleText }}</div>
            <div class="content-describe">24小时内仅可用1次</div>
          </div>
          <div class="prop-right">
            <el-button type="primary" size="mini" @click="useProp(propItem)">使用</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'
import DatePicker from '@/components/DatePicker'

import { joinTimeSpan } from '@/utils/timespan.js'
import { parseTime } from '@/utils/index.js'
import * as Retoucher from '@/api/retoucher.js'

export default {
  name: 'PersonalDetails',
  components: { ListTable, DatePicker },
  filters: {
    getPoint (value) {
      if (!value) return '00'
      const num = Number(value).toFixed(2)
      const pointIndex = num.indexOf('.')
      const result = num.substring(pointIndex + 1, pointIndex + 3)
      return result
    }
  },
  data () {
    return {
      routeName: this.$route.name, // 路由名字
      timeSpan: null, // 时间戳
      yearValue: '2019',
      todayData: {}, // 今日指标
      gradeInfo: {},
      performanceData: [], // 修图绩效
      gradeData: [{
        1: 800,
        2: 1266,
        3: 1514,
        4: 1798,
        5: 1798,
        6: 1798,
        7: 1812,
        8: 1812,
        9: 1812,
        10: 1900,
        11: 1900
      }],
      awardInfo: [],
      propData: []
    }
  },
  created () {
    const nowTime = parseTime(new Date(), '{y}-{m}-{d}')
    this.timeSpan = [nowTime, nowTime]
    this.$store.dispatch('setting/showLoading', this.routeName)
    Promise.all([
      this.getSelfQuota(),
      this.getRankInfo(),
      this.getRetouchQuota(),
      this.getLittleBeeInfo(),
      this.getProps()
    ])
    this.$store.dispatch('setting/hiddenLoading', this.routeName)
  },
  methods: {
    /**
     * @description 获取个人指标
     */
    async getSelfQuota () {
      this.todayData = await Retoucher.getSelfQuota()
    },
    /**
     * @description 获取个人等级
     */
    async getRankInfo () {
      this.gradeInfo = await Retoucher.getRankInfo()
    },
    /**
     * @description 获取修图绩效
     */
    async getRetouchQuota () {
      if (!this.timeSpan) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const reqData = {
        startAt: joinTimeSpan(this.timeSpan[0]),
        endAt: joinTimeSpan(this.timeSpan[1], 1)
      }
      this.performanceData = await Retoucher.getRetouchQuota(reqData)
    },
    /**
     * @description 获取小蜜蜂奖
     */
    async getLittleBeeInfo () {
      if (!this.yearValue) {
        this.$newMessage.warning('请输入时间')
        return false
      }
      const reqData = {
        year: this.yearValue
      }
      this.awardInfo = await Retoucher.getLittleBeeInfo(reqData)
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
        this.$store.dispatch('setting/showLoading', this.routeName)
        this.getProps()
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
      } catch (error) {
        this.$store.dispatch('setting/hiddenLoading', this.routeName)
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/variables.less';
.personal-details {
  .today-box {
    display: flex;
  }

  .today-info {
    width: 289px;
    margin-right: 24px;

    .panel-main {
      text-align: center;
      position: relative;

      .progress-num {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        display: flex;
        flex-direction: column;
        color: #606266;

        .num {
          font-size: 44px;
          font-family:DINAlternate-Bold,DINAlternate;
          font-weight: bold;
          color: @blue;
        }
      }
    }

    .panel-footer {
      display: flex;
      margin-top: 15px;
      justify-content: space-between;
      color: #606266;
      font-family:PingFangSC-Regular,PingFangSC;
      font-size: 12px;
      line-height: 20px;

      &>div {
        &::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #EBEEF5;
          border-radius: 50%;
          margin-right: 4px;
        }
      }

      .footer-right {
        &::before {
          background:linear-gradient(51deg,rgba(145,245,255,1) 0%,rgba(70,105,251,1) 100%);
        }
      }
    }
  }

  .level-info {
    height: 282px;
    width: calc(~'100% - 289px');

    .panel-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .tip {
        color: @blue;
        font-size: 12px;
        font-weight: 400;

        .el-icon-warning-outline {
          margin-right: 4px;
        }
      }

      &>span {
        display: flex;
        align-items: center;

        .el-tag {
          margin-left: 12px;
        }
      }
    }

    .panel-main {
      display: grid;
      grid-template-columns: repeat(4, 1fr);

      .main-content {
        font-size: 12px;
        display: flex;
        flex-direction: column;
        font-family: DINAlternate-Bold,DINAlternate;
        color: #909399;
        margin-top: 28px;
        padding-bottom: 18px;
        border-bottom: 1px solid #EBEEF5;

        .num {
          font-size: 36px;
          font-weight: bold;
          color: #303133;

          i {
            font-size: 20px;
            font-style: normal;
          }
        }
      }
    }

    .panel-footer {
      margin-top: 23px;
      padding-bottom: 5px;

      .rote-title {
        color: #606266;
        font-size: 12px;
        display: flex;
        justify-content: space-between;

        .num {
          font-size:14px;
          font-family:DINAlternate-Bold,DINAlternate;
          font-weight:bold;
          color:#303133;
          line-height:16px;
        }
      }

      .el-progress {
        margin-top: 4px;

        .el-progress-bar__inner {
          background: @gradualGreen;
          box-shadow: @greenBoxShadow;
        }
      }

      .col-two {
        margin-top: 20px;
      }

      .pull-box {
        .el-progress {
          .el-progress-bar__inner {
            background: @gradualRed;
          }
        }
      }
    }
  }

  .retouch-performance {
    margin-top: 24px;
  }

  .bee-award {
    margin-top: 24px;
  }

  .search-box {
    display: flex;
    margin-top: 20px;
    align-items: center;

    button {
      margin-left: 20px;
    }
  }

  .panel-content {
    margin-top: 20px;
  }

  .prop-panel {
    margin-top: 24px;

    .prop-icon {
      width: 44px;
      height: 34px;
    }

    .panel-main {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
    }

    .prop-box {
      width: 313px;
      height: 68px;
      border: 1px solid #D8DCE6;
      border-radius: 4px;
      padding: 17px 16px;
      display: flex;
      margin-bottom: 16px;
      margin-right: 24px;
      justify-content: space-between;
      align-items: center;

      .prop-content {
        .content-title {
          font-size:14px;
          font-weight:500;
          color:#303133;
          line-height:20px;
        }

        .content-describe {
          font-size:12px;
          font-weight:400;
          color:#909399;
          line-height:20px;
        }
      }
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
</style>
