<template>
  <div class="money-award-icon" :style="`--size: ${size}px`">
    <!-- 金币卡 -->
    <el-popover placement="bottom" trigger="hover" :content="`金币奖励：${buffInfo.goldReward}倍`">
      <div v-show="buffInfo.goldReward" slot="reference" class="prop-icon awardmap-gold" />
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'MoneyAwardIcon',
  props: {
    buffInfo: { type: Object, required: true },
    size: { type: [Array, String], default: '16' }
  }
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
