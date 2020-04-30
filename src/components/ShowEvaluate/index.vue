<template>
  <div class="show-evaluate">
    <i v-if="evaluate==='good'" class="iconfont icon-like-press like-color" />
    <i v-else-if="evaluate==='bad'" class="iconfont icon-unlike-press unlike-color" />
    <span v-else>-</span>
  </div>
</template>

<script>
export default {
  name: "ShowEvaluate",
  props: {
    evaluate: { type: String, default: '' },
  }
}
</script>

<style lang="less" scoped>
.show-evaluate {
  .like-color {
    font-size: 20px;
    color: coral;
  }

  .unlike-color {
    font-size: 20px;
    color: #909399;
  }
}
</style>
