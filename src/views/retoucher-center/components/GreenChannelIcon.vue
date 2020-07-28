<template>
  <div class="green-channel-icon" :style="`--size: ${size}px`">
    <!-- 绿色通道 -->
    <div v-if="buffInfo.greenChannelStatus" class="prop-icon awardmap-greenAisle" />
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
