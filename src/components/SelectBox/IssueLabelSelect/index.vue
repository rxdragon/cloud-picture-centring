<template>
  <div class="issue-label-select">
    <el-cascader
      :options="options"
      :props="propsValue"
      :popper-append-to-body="false"
      :disabled="!loadingDown"
      placeholder="请选择标签"
      v-bind="$attrs"
      v-on="$listeners"
      collapse-tags
      filterable
      clearable
    >
      <template slot-scope="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import * as AssessmentCenter from '@/api/assessmentCenter.js'

export default {
  name: 'IssueLabelSelect',
  props: {
    props: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      deafultProps: { multiple: true, emitPath: false },
      options: [],
      loadingDown: false
    }
  },
  computed: {
    propsValue () {
      return Object.assign({}, this.deafultProps, this.props)
    }
  },
  created () {
    this.getIssueList()
  },
  methods: {
    /**
     * @description 获取全部伙伴
     */
    async getIssueList () {
      const list = await AssessmentCenter.getIssueList()
      this.options = list
      this.loadingDown = true
    }
  }
}
</script>

<style lang="less">
.issue-label-select {
  .el-cascader {
    width: 310px;

    .el-cascader__tags input {
      font-size: 14px;
    }
  }
}
</style>
