<template>
  <div class="timeout-area">
    <p class="info-item">沙漏预计时长：10min</p>
    <p class="info-item">实际修图时长：12min</p>
    <div class="info-item">
      <p class="info-title">问题描述(必填)：</p>
      <el-input
        type="textarea"
        placeholder="问题描述,最多100个字符"
        v-model="appealReason"
        maxlength="100"
      />
    </div>
  </div>
</template>

<script>

export default {
  name: 'TimeOutAppeal',
  props: {
    photoItem: { type: Object, required: true }
  },
  data () {
    return {
      appealReason: ''
    }
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

    &.red {
      color: red;
    }
  }
}
</style>
