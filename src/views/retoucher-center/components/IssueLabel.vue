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
          :key="issueItem.key"
          :effect="issueItem.select ? 'light' : 'plain'"
          @click="selectData(issueItem.key)">
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
    selectData (key) {
      const selectLabel = this.issueData.find(item => item.key === key)
      selectLabel.select = !selectLabel.select
    },
    /**
     * @description 提交
     */
    submitData () {
      const problemTagPhotography = []
      const problemTagMakeup = []
      const selectIssue = this.issueData.filter(item => item.select)
      selectIssue.forEach(item => {
        if (item.type === 'problemTagPhotography') {
          problemTagPhotography.push(item.id)
        } else {
          problemTagMakeup.push(item.id)
        }
      })
      const issue = { problemTagPhotography, problemTagMakeup }
      this.$emit('submit', issue)
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
