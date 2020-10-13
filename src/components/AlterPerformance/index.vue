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
        <el-form-item label="伙伴姓名（花名）：">{{ editInfo.joinName }}</el-form-item>
        <el-form-item label="工号：">{{ editInfo.jobNumber }}</el-form-item>
        <el-form-item label="绩效得分：">
          <el-input v-decimalOnly v-model="performanceScore" placeholder="填写修改后的得分" />
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancelDialog">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="affirmAlter">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as Performance from '@/api/performance.js'

export default {
  name: 'AlterPerformance',
  props: {
    editInfo: { type: Object, required: true }
  },
  data () {
    return {
      performanceScore: '', // 绩效分数
      loading: false
    }
  },
  methods: {
    /**
     * @description 关闭弹出框
     */
    cancelDialog () {
      this.$emit('visibeClose')
    },
    /**
     * @description 确认编辑
     */
    async affirmAlter () {
      try {
        if (!this.performanceScore) return this.$newMessage.warning('请输入分数')
        const score = Number(this.performanceScore)
        if (score > 200 || score < 0) return this.$newMessage.warning('请输入正确的绩效分数')
        this.loading = true
        const req = {
          id: this.editInfo.id,
          score
        }
        await Performance.editStaffScore(req, Boolean(this.$parent.performancType))
        this.$emit('visibeClose', 'refreshList')
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
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
