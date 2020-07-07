<template>
  <div class="staff-select">
    <el-cascader
      ref="staffCascader"
      :options="options"
      :props="propsValue"
      collapse-tags
      v-bind="$attrs"
      placeholder="请选择伙伴"
      :show-all-levels="false"
      :popper-append-to-body="false"
      :disabled="loadingDown"
      filterable
      clearable
      v-on="$listeners"
    >
      <template slot-scope="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import * as Staff from '@/api/staff.js'

export default {
  name: 'StaffSelect',
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
      loadingDown: true
    }
  },
  computed: {
    propsValue () {
      return Object.assign({}, this.deafultProps, this.props)
    }
  },
  created () {
    this.getStaffList()
  },
  methods: {
    /**
     * @description 获取伙伴列表
     */
    async getStaffList () {
      const list = await Staff.getStaffSelectList()
      this.options = list
      this.loadingDown = false
    },
    /**
     * @description 获取选中节点
     */
    getCheckedStaff () {
      return this.$refs['staffCascader'].getCheckedNodes(true)
    }
  }
}
</script>

<style lang="less">
.staff-select {
  .el-cascader {
    width: 220px;

    .el-cascader__tags input {
      font-size: 14px;
    }
  }
}
</style>
