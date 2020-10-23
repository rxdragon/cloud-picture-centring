<template>
  <div class="money-award-icon" :style="`--size: ${size}px`">
    <!-- 金币卡 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="popover-content">
        <p>金币奖励：{{ goldRewardMultiple }}倍</p>
        <p>截止时间：{{ goldRewardEndat }}</p>
      </div>
      <div v-show="showGoldReward" slot="reference" class="prop-icon awardmap-gold" />
    </el-popover>

    <!-- 时段金币奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="popover-content">
        <p>金币奖励：{{ timeMoneyMultiple }}倍</p>
        <p>截止时间：{{ timeMoneyEndat }}</p>
      </div>
      <div v-show="timeMoneyMultiple" slot="reference" class="prop-icon awardmap-timeMoney" />
    </el-popover>
  </div>
</template>

<script>
import * as Validate from '@/utils/validate'

export default {
  name: 'MoneyAwardIcon',
  props: {
    buffInfo: { type: Object, required: true },
    size: { type: [Array, String], default: '16' }
  },
  computed: {
    /**
     * @description 是否显示经验卡
     */
    showGoldReward () {
      return this.buffInfo.goldReward
    },
    /**
     * @description 卡片经验倍数信息
     */
    goldRewardMultiple () {
      const multiple = _.get(this.buffInfo, 'goldReward.card.multiple') || ''
      return multiple
    },
    /**
     * @description 卡片过期时间
     */
    goldRewardEndat () {
      const endat = _.get(this.buffInfo, 'goldReward.end_at') || ''
      return endat
    },
    // 时段金币奖励
    timeMoneyMultiple () {
      const gold = _.get(this.buffInfo, 'timeIntervalReward.gold.gold') || ''
      return gold
    },
    // 时段金币奖励截止时间
    timeMoneyEndat () {
      const endat = _.get(this.buffInfo, 'timeIntervalReward.gold.stop_at') || ''
      const nowTime = new Date().getTime()
      const waitTime = Validate.waitTime(nowTime, endat)
      return waitTime
    }
  },
}
</script>

<style lang="less" scoped>
.money-award-icon {
  --size: 16px;

  display: flex;

  .prop-icon {
    width: var(--size);
    height: var(--size);
    margin-right: 6px;
  }
}
</style>
