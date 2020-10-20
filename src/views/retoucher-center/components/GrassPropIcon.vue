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
        {{ `当前海草值达到${infoItem.reachExp} 奖励${infoItem.reward}` }}
      </div>
      <div v-show="buffInfo.impulseStatus" slot="reference" class="prop-icon awardmap-impulse" />
    </el-popover>
    <!-- 早鸟奖励 -->
    <el-popover placement="bottom" trigger="hover">
      <div class="impulse-info">1.5倍经验加成</div>
      <div v-show="showMorningAward" slot="reference" class="prop-icon awardmap-morningAward" />
    </el-popover>
  </div>
</template>

<script>
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
    }
  },
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
