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

    <!-- 时段奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="impulse-info">1.5倍经验加成</div>
      <div slot="reference" class="prop-icon awardmap-timeMoney" />
    </el-popover>
  </div>
</template>

<script>
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
