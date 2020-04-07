<template>
  <div class="issue-label">
    <el-dialog
      width="30%"
      title="当前照片是否存在以下摄影&化妆问题："
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="25vh"
      v-bind="$attrs"
      v-on="$listeners">
      <div class="issue-main">
        <el-tag v-for="issueItem in issueData"
          :key="issueItem.id"
          :effect="issueItem.select ? 'light' : 'plain'"
          @click="selectData(issueItem.id)">
          {{ issueItem.label }}
        </el-tag>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitData">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IssueLabel',
  props: {
    issueData: { type: Array, default: () => [] }
  },
  methods: {
    /**
     * @description 选中标签
     */
    selectData (id) {
      const selectLabel = this.issueData.find(item => item.id === id)
      selectLabel.select = !selectLabel.select
    },
    /**
     * @description 提交
     */
    submitData () {
      const selectId = []
      this.issueData.forEach(item => {
        if (item.select) {
          selectId.push(item.id)
        }
      })
      this.$emit('submit', selectId)
    }
  }
}
</script>

<style lang="less" scoped>
.issue-label {
  & /deep/ .el-dialog__footer {
    text-align: center;
  }

  .issue-main {
    .el-tag {
      margin-right: 20px;
      cursor: pointer;
    }
  }
}
</style>
