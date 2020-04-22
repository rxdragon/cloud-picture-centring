<template>
  <div class="show-evaluate">
    <img v-if="evaluate==='good'" src="../../assets/icon/evaluate_good.png" />
    <img v-else-if="evaluate==='bad'" src="../../assets/icon/evaluate_bad.png" />
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
  img {
    height: 20px;
    font-size: 20px;
  }
}
</style>
