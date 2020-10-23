<template>
  <div class="grass-prop-icon" :style="`--size: ${size}px`">
    <!-- 双倍经验 -->
    <el-popover placement="bottom" trigger="hover" :content="``">
      <div class="popover-content">
        <p>经验奖励：{{ expCardMultiple }}倍</p>
        <p>截止时间：{{ expCardEndat }}</p>
      </div>
      <div v-show="showExpCard" slot="reference" class="prop-icon awardmap-experience" />
    </el-popover>
    <!-- 冲量奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div
        v-for="(infoItem, infoIndex) in buffInfo.impulseInfo"
        :key="infoIndex"
        class="impulse-info"
      >
        {{ `当前海草值达到${infoItem.reachExp}海草 奖励${infoItem.reward}元` }}
      </div>
      <div v-show="buffInfo.impulseStatus" slot="reference" class="prop-icon awardmap-impulse" />
    </el-popover>
    <!-- 早鸟奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="impulse-info">1.5倍经验加成</div>
      <div v-show="showMorningAward" slot="reference" class="prop-icon awardmap-morningAward" />
    </el-popover>

    <!-- 时段经验奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="popover-content">
        <p>经验奖励：{{ timeExpMultiple }}倍</p>
        <p>截止时间：{{ timeExpEndat }}</p>
      </div>
      <div v-show="timeExpMultiple" slot="reference" class="prop-icon awardmap-timeExp" />
    </el-popover>

    <!-- 时段冲量奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div v-for="(infoItem, infoIndex) in timeImpulseInfo" :key="infoIndex" class="impulse-info">
        {{ `当前海草值达到${infoItem.reach_exp}海草 奖励${infoItem.reward}元` }}
      </div>
      <div v-show="timeImpulseInfo" slot="reference" class="prop-icon awardmap-timeImpulse" />
    </el-popover>
  </div>
</template>

<script>
import * as Validate from '@/utils/validate'

export default {
  name: 'GrassPropIcon',
  props: {
    buffInfo: { type: Object, required: true },
    showMorningAward: { type: Boolean },
    size: { type: [Array, String], default: '16' }
  },
  computed: {
    /**
     * @description 是否显示经验卡
     */
    showExpCard () {
      return this.buffInfo.expCard
    },
    /**
     * @description 卡片经验倍数信息
     */
    expCardMultiple () {
      const multiple = _.get(this.buffInfo, 'expCard.card.multiple') || ''
      return multiple
    },
    /**
     * @description 卡片过期时间
     */
    expCardEndat () {
      const endat = _.get(this.buffInfo, 'expCard.end_at') || ''
      return endat
    },
    // 时段经验奖励 
    timeExpMultiple () {
      const timeExpMultiple = _.get(this.buffInfo, 'timeIntervalReward.exp_power.exp') || ''
      return timeExpMultiple
    },
    // 时间截止
    timeExpEndat () {
      const endat = _.get(this.buffInfo, 'timeIntervalReward.exp_power.stop_at') || ''
      const nowTime = new Date().getTime()
      const waitTime = Validate.waitTime(nowTime, endat)
      return waitTime
    },
    // 时段冲量奖励
    timeImpulseInfo () {
      const timeImpulseInfo = _.get(this.buffInfo, 'timeIntervalReward.impulse') || ''
      return timeImpulseInfo
    }
  }
}
</script>

<style lang="less" scoped>
.grass-prop-icon {
  --size: 16px;

  display: flex;

  .prop-icon {
    width: var(--size);
    height: var(--size);
    margin-right: 6px;
  }
}
</style>
