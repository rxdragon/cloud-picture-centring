<template>
  <div class="timeout-area">
    <p class="info-item">沙漏预计时长：{{ orderData.hourGlassAllTime }}</p>
    <p class="info-item">实际修图时长：{{ orderData.retouchAllTime }}</p>
    <div class="info-item">
      <p class="info-title">问题描述(必填)：</p>
      <el-input
        type="textarea"
        placeholder="问题描述,最多100个字符"
        v-model="orderData.timeoutAppealReason"
        maxlength="100"
      />
    </div>
  </div>
</template>

<script>

export default {
  name: 'TimeoutAppeal',
  props: {
    orderData: { type: Object, required: true }
  }
}
</script>

<style lang="less" scoped>
.timeout-area {
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .info-title {
    width: 100px;
    font-size: 14px;
    color: #303133;
  }
}
</style>
