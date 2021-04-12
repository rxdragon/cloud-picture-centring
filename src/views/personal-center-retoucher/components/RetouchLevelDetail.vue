<template>
  <div class="retouch-level-detail module-panel">
    <div class="panel-title ">
      <span>
        个人修图等级
        <el-tag size="medium">{{ gradeInfo.levelName }}（{{ gradeInfo.level }}级）</el-tag>
      </span>
      <div class="tip">
        <el-popover
          placement="bottom-end"
          popper-class="level-tip-popover"
          width="700"
          trigger="click"
        >
          <div class="tip-pop">
            <div class="tip-module">
              <div class="tip-header">升降级规则</div>
              <div class="tip-content">
                <table class="update-table">
                  <tr class="table-header">
                    <th>等级</th>
                    <th>升级历史海草</th>
                    <th>升级抽查张数</th>
                    <th>升级抽查分数</th>
                  </tr>
                  <tr v-for="(item, index) in updateInfo" :key="index">
                    <th>{{ item.level }}级（{{ item.levelName }}）</th>
                    <th>{{ item.exp }}</th>
                    <th>{{ item.upSpotCount }}</th>
                    <th>{{ item.updateScore }}</th>
                  </tr>
                </table>
              </div>
            </div>
            <div class="tip-module">
              <div class="tip-header">升级规则</div>
              <div class="tip-content">
                <p>1、近N张抽查均分（非主管）</p>
                <ul>
                  <li>近N张的非主管抽查的平均分，抽查范围包含<span class="emphasis">云学校抽查和修修兽抽查</span>。</li>
                  <li>每次升级完成或者降级完成统计分数将会 <span class="emphasis">清零</span>。</li>
                  <li>升级时间为<span class="emphasis">每日早上08:30</span>，该时间系统将自动判断是否达到升级要求。</li>
                </ul>
                <p>2、历史海草数：账号开通以来所获得的海草总数，包含扣除海草、奖励海草、回滚海草。</p>
              </div>
            </div>
            <div class="tip-module">
              <div class="tip-header">降级说明</div>
              <div class="tip-content">
                <p>1、近N张抽查均分（非主管）</p>
                <ul>
                  <li>近N张的非主管抽查的平均分，抽查范围包含<span class="emphasis">云学校抽查和修修兽抽查</span>。</li>
                  <li>每次升级完成或者降级完成统计分数将会 <span class="emphasis">清零</span>。</li>
                  <li>降级时间为<span class="emphasis">每日早上08:30</span>，该时间系统将自动判断是否达到降级要求。</li>
                  <li>同时满足降级和升级条件时优先降级。</li>
                </ul>
              </div>
            </div>
          </div>
          <span slot="reference" class="tip-title"><i class="el-icon-warning-outline" />升级规则</span>
        </el-popover>
      </div>
    </div>
    <div class="panel-main">
      <el-row :gutter="51">
        <!-- 近30日点赞数 -->
        <el-col :span="7">
          <div class="main-content">
            <span class="num" v-if="gradeInfo.level !== 11">
              <count-to :end-value="gradeInfo.staffLevelCheck.checked_level_up_avg_score | getInteger" />
              <i>.<count-to
                decimals
                :end-value="gradeInfo.staffLevelCheck.checked_level_up_avg_score | getPoint"
              /></i>
              <span class="check-tip">（已统计{{ gradeInfo.staffLevelCheck.checked_level_up_num }}张）</span>
            </span>
            <span class="num" v-else>-</span>
            <span>升级统计近{{ matchLevelInfo.upDateSpotCount || '-' }}张抽查均分(非主管 )</span>
          </div>
        </el-col>
        <!-- 近30日被退张数(质量问题) -->
        <el-col :span="7">
          <div class="main-content">
            <span class="num" v-if="gradeInfo.level !== 1">
              <count-to :end-value="gradeInfo.staffLevelCheck.checked_level_down_avg_score | getInteger" />
              <i>.<count-to
                decimals
                :end-value="gradeInfo.staffLevelCheck.checked_level_down_avg_score | getPoint"
              /></i>
              <span class="check-tip">（已统计{{ gradeInfo.staffLevelCheck.checked_level_down_num }}张）</span>
            </span>
            <span class="num" v-else>-</span>
            <span>降级统计近{{ matchLevelInfo.downDateSpotCount || '-' }}张抽查均分(非主管)</span>
          </div>
        </el-col>
        <!-- 历史海草数 -->
        <el-col :span="7">
          <div class="main-content">
            <span class="num">
              <count-to :end-value="gradeInfo.exp | getInteger" />
              <i>.<count-to decimals :end-value="gradeInfo.exp | getPoint" /></i>
            </span>
            <span>历史海草数</span>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="panel-footer">
      <div class="levelup-info" v-if="gradeInfo.level !== 11">
        <div class="info-title">
          <span>距下一等级要求:</span>
        </div>
        <div class="info-row">
          <span>前{{ matchLevelInfo.upDateSpotCount }}张抽查平均分(非主管)需 ≥ {{ matchLevelInfo.upNeedCheckScore | toFixedString }} 分</span>
        </div>
        <div class="info-row">
          <span class="row-title">海草值</span>
          <span class="progress">
            <el-progress class="" :percentage="expPercentage" :show-text="false" />
            （{{ gradeInfo.exp }} / {{ matchLevelInfo.needExp }}）颗
          </span>
        </div>
      </div>
      <div class="demotion-info" v-if="gradeInfo.level !== 1">
        <span>提示: 近{{ matchLevelInfo.downDateSpotCount }}张抽查平均分(非主管) &lt; {{ matchLevelInfo.downCheckScore  | toFixedString }}分将会降级</span>
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from '@/components/CountTo'

import * as Retoucher from '@/api/retoucher.js'
import * as Utils from '@/utils/index.js'
import LevelUpInfo from './LevelUpInfo.json'

const updateInfo = [
  {
    level: 1,
    levelName: '修图助理',
    exp: '/',
    updateScore: '/',
    upSpotCount: '/',
  },
  {
    level: 2,
    levelName: '初级修图师',
    exp: 800,
    updateScore: 81,
    upSpotCount: 20,
  },
  {
    level: 3,
    levelName: '修图师',
    exp: 2000,
    updateScore: 82,
    upSpotCount: 20
  },
  {
    level: 4,
    levelName: '资深修图师',
    exp: 3500,
    updateScore: 83,
    upSpotCount: 30
  },
  {
    level: 5,
    levelName: '高级修图师',
    exp: 7000,
    updateScore: 84,
    upSpotCount: 30
  },
  {
    level: 6,
    levelName: '修图专家',
    exp: 11000,
    updateScore: 85,
    upSpotCount: 30
  },
  {
    level: 7,
    levelName: '资深修图专家',
    exp: 20000,
    updateScore: 86,
    upSpotCount: 35
  },
  {
    level: 8,
    levelName: '高级修图专家',
    exp: 30000,
    updateScore: 87,
    upSpotCount: 35
  },
  {
    level: 9,
    levelName: '首席修图专家',
    exp: 42000,
    updateScore: 88,
    upSpotCount: 35
  },
  {
    level: 10,
    levelName: '工匠大师',
    exp: 55000,
    updateScore: 89,
    upSpotCount: 40
  },
  {
    level: 11,
    levelName: '首席工匠大师',
    exp: 70000,
    updateScore: 90,
    upSpotCount: 40
  }
]

export default {
  name: 'RetouchLevelDetail',
  components: { CountTo },
  filters: {
    getPointThree (value) {
      if (!value) return '00'
      const num = Number(value).toFixed(3)
      const pointIndex = num.indexOf('.')
      const result = num.substring(pointIndex + 1, pointIndex + 4)
      return result
    },
    // 获取小数
    getPoint (value) {
      if (!value) return '00'
      const num = Number(value).toFixed(2)
      const pointIndex = num.indexOf('.')
      const result = num.substring(pointIndex + 1, pointIndex + 3)
      return result
    },
    // 获取整数
    getInteger (value) {
      if (!Number(value)) return '0'
      const result = Number(value)
      return Math.floor(result)
    },
  },
  data () {
    return {
      gradeInfo: {
        staffLevelCheck: {}
      },
      updateInfo
    }
  },
  computed: {
    matchLevelInfo () {
      const level = this.gradeInfo.level
      return LevelUpInfo[level] || {}
    },
    // 升级所需海草百分比
    expPercentage () {
      const nowExp = _.get(this, 'gradeInfo.exp') || 0
      const needExp = _.get(this, 'matchLevelInfo.needExp') || 0
      const percent = Utils.getAvg(nowExp, needExp, 4) * 100
      return percent > 100 ? 100 : percent
    }
  },
  created () {
    this.getRankInfo()
  },
  methods: {
    /**
     * @description 获取个人等级
     */
    async getRankInfo () {
      this.gradeInfo = await Retoucher.getRankInfo()
    },
  }
}
</script>

<style lang="less" scoped>
.retouch-level-detail {
  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tip {
      font-size: 12px;
      font-weight: 400;
      color: @blue;

      .el-icon-warning-outline {
        margin-right: 4px;
      }
    }

    & > span {
      display: flex;
      align-items: center;

      .el-tag {
        margin-left: 12px;
      }
    }
  }

  .panel-main {
    border-bottom: 1px solid @borderColor;

    .main-content {
      display: flex;
      flex-direction: column;
      padding-bottom: 12px;
      margin-top: 24px;
      font-family: @DINAlternate;
      font-size: 12px;
      color: #909399;

      .num {
        font-size: 44px;
        font-weight: bold;
        color: #303133;

        i {
          font-size: 36px;
          font-style: normal;
        }

        .check-tip {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .panel-footer {
    padding-bottom: 5px;
    margin-top: 12px;
    font-size: 12px;

    .levelup-info {
      .info-title {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 600;

        .check-time {
          font-weight: 400;
        }
      }

      .info-row {
        display: flex;
        align-items: center;
        margin-top: 8px;

        .row-title {
          margin-right: 12px;
        }

        .progress {
          display: flex;
          align-items: center;
          width: 400px;
        }
      }
    }

    .demotion-info {
      margin-top: 8px;
      color: @red;
    }

    & /deep/ .el-progress {
      width: 50%;
      margin-right: 24px;

      .el-progress-bar__inner {
        background: @gradualGreen;
        box-shadow: @greenBoxShadow;
      }
    }
  }
}
</style>

<style lang="less">
.level-tip-popover {
  .tip-pop {
    height: 400px;
    overflow: overlay;

    .update-table {
      width: 100%;
      border: 1px solid #ebeef5;

      .table-header {
        background-color: #fafafa;
      }

      th {
        border-bottom: 1px solid #ebeef5;
      }

      tr {
        line-height: 32px;

        &:nth-last-child(1) {
          th {
            border: none;
          }
        }
      }
    }

    .tip-module {
      margin-bottom: 12px;

      .tip-header {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}
</style>
