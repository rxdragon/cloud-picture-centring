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
      v-on="$listeners"
    >
      <div class="issue-main">
        <div class="issue-box">
          <div class="issues-class">
            摄影备注：{{ notes.photographNote }}
          </div>
          <div class="issues-class">
            化妆备注：{{ notes.dressNote }}
          </div>
        </div>
        <div class="issue-box" v-for="(issueClass, issueKey) in issueData" :key="issueKey">
          <div class="issues-class">{{ issueKey | filterName }}</div>
          <el-tooltip
            v-for="issueItem in issueClass"
            :key="issueItem.key"
            effect="dark"
            :content="issueItem.description"
            placement="top-start"
          >
            <el-tag :effect="issueItem.select ? 'light' : 'plain'" @click="selectData(issueKey, issueItem.key)">
              {{ issueItem.label }}
            </el-tag>
          </el-tooltip>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <span @click="submitData(false)" class="no-issue-btn">没有问题</span>
        <el-button type="primary" @click="submitData(true)" :loading="loading">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IssueLabel',
  filters: {
    filterName (value) {
      return value === 'photography' ? '摄影：' : '化妆：'
    }
  },
  props: {
    issueData: { type: Object, default: () => ({}) },
    notes: { type: Object, default: () => ({}) }
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
     * @param {Boolean} true： 提交 false：没有问题
     */
    submitData (hasIssue) {
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
      const hasIssuelength = Boolean(problemTagPhotography.length + problemTagMakeup.length)
      if (hasIssue && !hasIssuelength) return this.$newMessage.warning('请选择问题标签')
      let issue = { problemTagPhotography, problemTagMakeup }
      if (!hasIssue) { issue = null }
      this.loading = true
      this.$emit('submit', issue)
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

    .dialog-footer {
      display: flex;
      align-items: flex-end;
      justify-content: center;

      .no-issue-btn {
        margin-right: 20px;
        font-size: 15px;
        color: #aaa;
        text-decoration: underline;
        cursor: pointer;
      }
    }
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
