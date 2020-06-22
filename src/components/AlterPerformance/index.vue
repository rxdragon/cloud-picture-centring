<template>
  <el-dialog
    title="修改绩效"
    class="alter-performance-dialog"
    visible
    :before-close="cancelDialog"
    width="30%"
  >
    <div class="alter-performance">
      <el-form label-width="150px">
        <el-form-item label="伙伴姓名（花名）：">张三（泰德）</el-form-item>
        <el-form-item label="工号：">610299</el-form-item>
        <el-form-item label="绩效得分：">
          <el-input v-model="performanceScore" placeholder="填写修改后的得分"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancelDialog">取 消</el-button>
      <el-button type="primary" @click="affirmAlter">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'AlterPerformance',
  props: {
    // alterInfo: {}
  },
  data () {
    return {
      performanceScore: ''
    }
  },
  methods: {
    cancelDialog () {
      this.$emit('visibeClose')
    },
    affirmAlter () {
      this.$emit('visibeClose')
    },
  }
}
</script>

<style lang="less" scoped>
.alter-performance-dialog {
  & /deep/ .el-dialog__body {
    padding: 10px 20px 0;
  }

  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
