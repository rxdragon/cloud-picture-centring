<template>
  <div class="green-channel-icon" :style="`--size: ${size}px`">
    <!-- 绿色通道 -->
    <el-tooltip
      v-if="buffInfo.greenChannelStatus"
      class="item"
      effect="dark"
      content="绿色通道"
      placement="top"
    >
      <div class="prop-icon awardmap-greenAisle" />
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'GreenChannelIcon',
  props: {
    buffInfo: { type: Object, required: true },
    size: { type: [Array, String], default: '16' }
  }
}
</script>

<style lang="less" scoped>
.green-channel-icon {
  --size: 16px;

  display: flex;

  .prop-icon {
    width: var(--size);
    height: var(--size);
    margin-right: 6px;
  }
}
</style>
