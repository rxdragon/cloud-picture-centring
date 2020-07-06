<template>
  <div class="tip">
    <el-tooltip effect="dark" placement="top" popper-class="tip-tooltip">
      <div slot="content" class="message-content" v-html="message"></div>
      <div class="question-box">
        <i class="el-icon-question" />
      </div>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'Tip',
  props: {
    message: { type: String, default: '提示' }
  }
}
</script>

<style lang="less" scoped>
.tip {
  .question-box {
    .el-icon-question {
      font-size: 20px;
      color: #909399;
      cursor: pointer;
    }
  }
}
</style>

<style lang="less">
.tip-tooltip {
  .message-content {
    line-height: 1.5;

    i {
      padding: 0 4px;
      color: @red;
    }

    code {
      color: @green;
    }
  }
}
</style>
