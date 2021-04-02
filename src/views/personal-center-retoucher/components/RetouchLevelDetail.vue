<template>
  <div class="retouch-level-detail module-panel">
    <div class="panel-title ">
      <span>
        个人修图等级
        <el-tag size="medium">{{ gradeInfo.levelName }}（{{ gradeInfo.level }}级）</el-tag>
      </span>
      <div class="tip">
        <el-popover placement="bottom-end" width="700" trigger="hover">
          <div class="tip-content">
            <div>修图等级升级规则：</div>
            <div>1、退单率：近期修图获得的<span class="emphasis">质量问题退张数</span>占比，升级条件需<span class="emphasis">低于</span>退张合格率</div>
            <div>2、总海草：历史获得海草(即经验值)，升级需达到<span class="emphasis">达标海草数</span>。</div>
            <div>3、平均单张修图时长：近期平均单张修图时长不可超过升级规定的平均修图时长。</div>
          </div>
          <span slot="reference" class="tip-title"><i class="el-icon-warning-outline" />升级规则</span>
        </el-popover>
      </div>
    </div>
    <div class="panel-main">
      <el-row :gutter="51">
        <!-- 近30日点赞数 -->
        <el-col :span="6">
          <div class="main-content">
            <span class="num" v-if="gradeInfo.level !== 11">
              <count-to :end-value="gradeInfo.nearly30DaysGoodNum | getInteger" />
              <i>.<count-to
                decimals
                :end-value="gradeInfo.nearly30DaysGoodNum | getPoint"
              /></i>
              <span class="check-tip">（已统计10天）</span>
            </span>
            <span class="num" v-else>-</span>
            <span>近{{ matchLevelInfo.checkDay || '∞' }}天抽查均分(非主管 )</span>
          </div>
        </el-col>
        <!-- 近30日被退张数(质量问题) -->
        <el-col :span="6">
          <div class="main-content">
            <span class="num" v-if="gradeInfo.level !== 1">
              <count-to :end-value="gradeInfo.nearly30DaysReturnNum | getInteger" />
              <i>.<count-to
                decimals
                :end-value="gradeInfo.nearly30DaysReturnNum | getPoint"
              /></i>
              <span class="check-tip">（已统计10张）</span>
            </span>
            <span class="num" v-else>-</span>
            <span>近30张抽查均分(非主管)</span>
          </div>
        </el-col>
        <!-- 历史海草数 -->
        <el-col :span="6">
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
          <span class="check-time">升级核算时间: 2020-08-08 08:30:00</span>
        </div>
        <div class="info-row">
          <span>前{{ matchLevelInfo.checkDay }}天抽查平均分(非主管)需 ≥ {{ matchLevelInfo.upNeedCheckScore | toFixedString }} 分</span>
        </div>
        <div class="info-row">
          <span class="row-title">海草值</span>
          <span class="progress">
            <el-progress class="" :percentage="80" :show-text="false" />
            （100000 / {{ matchLevelInfo.needExp }}）颗
          </span>
        </div>
      </div>
      <div class="demotion-info" v-if="gradeInfo.level !== 1">
        <span>提示: 近30张抽查平均分(非主管) &lt; {{ matchLevelInfo.downCheckScore  | toFixedString }}分将会降级</span>
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from '@/components/CountTo'

import * as Retoucher from '@/api/retoucher.js'
import LevelUpInfo from './LevelUpInfo.json'

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
      gradeInfo: {},
    }
  },
  computed: {
    matchLevelInfo () {
      const level = this.gradeInfo.level
      return LevelUpInfo[level] || {}
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
