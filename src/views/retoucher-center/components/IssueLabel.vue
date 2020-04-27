<template>
  <div class="issue-label" >
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
        <div class="issue-box" v-for="(issueClass, issueKey) in issueData" :key="issueKey">
          <div class="issues-class">{{ issueKey | filterName }}</div>
          <el-tooltip v-for="issueItem in issueClass" :key="issueItem.key" effect="dark" :content="issueItem.description" placement="top-start">
            <el-tag
              :effect="issueItem.select ? 'light' : 'plain'"
              @click="selectData(issueKey, issueItem.key)">
              {{ issueItem.label }}
            </el-tag>
          </el-tooltip>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitData" :loading="loading">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IssueLabel',
  props: {
    issueData: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    /**
     * @description 选中标签
     */
    selectData (classKey, key) {
      const selectLabel = this.issueData[classKey].find(item => item.key === key)
      selectLabel.select = !selectLabel.select
    },
    /**
     * @description 提交
     */
    submitData () {
      this.loading = true
      const problemTagPhotography = []
      const problemTagMakeup = []
      for (const key in this.issueData) {
        const selectIssue = this.issueData[key]
        selectIssue.forEach(item => {
          if (item.select && key === 'photography') {
            problemTagPhotography.push(item.id)
          }
          if (item.select && key === 'makeup') {
            problemTagMakeup.push(item.id)
          }
        })
      }
      const issue = { problemTagPhotography, problemTagMakeup }
      this.$emit('submit', issue)
    }
  },
  filters: {
    filterName (value) {
      return value === 'photography' ? '摄影：' : '化妆：'
    }
  }
}
</script>

<style lang="less" scoped>
.issue-label {
  & /deep/ .el-dialog__body {
    padding: 20px 10px;
  }

  & /deep/ .el-dialog__footer {
    text-align: center;
  }

  .issue-main {
    margin-bottom: -10px;

    .issue-box {
      .issues-class {
        margin-bottom: 10px;
      }

      .el-tag {
        margin: 0 10px 10px 0;
        cursor: pointer;
      }
    }
  }
}
</style>
