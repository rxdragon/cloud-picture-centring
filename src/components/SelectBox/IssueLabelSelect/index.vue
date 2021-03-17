<template>
  <div class="issue-label-select">
    <el-cascader
      :options="options"
      :props="propsValue"
      :popper-append-to-body="false"
      :disabled="!loadingDown || disabled"
      placeholder="请选择标签"
      v-bind="$attrs"
      v-on="$listeners"
      collapse-tags
      filterable
      clearable
    >
      <template slot-scope="{ node, data }">
        <span>{{ data.name }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import * as GradeConfigurationApi from '@/api/gradeConfiguration.js'
import { GRADE_LABEL_TYPE } from '@/utils/enumerate'

export default {
  name: 'IssueLabelSelect',
  props: {
    props: {
      type: Object,
      default: () => {
        return {}
      }
    },
    type: {
      type: String,
      default: GRADE_LABEL_TYPE.CLOUD
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      GRADE_LABEL_TYPE,
      deafultProps: { multiple: true, emitPath: false, value: 'id', label: 'name' },
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
      const data = await Promise.all([
        GradeConfigurationApi.getScoreConfig(this.type),
        GradeConfigurationApi.getOldIssueList(this.type)
      ])
      const list = data[0]
      const oldList = data[1]
      const createList = [...list, ...oldList]
      this.options = createList
      this.loadingDown = true
    }
  }
}
</script>

<style lang="less">
.issue-label-select {
  .el-cascader {
    width: 100%;

    .el-cascader__tags input {
      font-size: 14px;
    }
  }
}
</style>
