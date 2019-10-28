<template>
  <div class="staff-select">
    <el-cascader
      :options="options"
      :props="propsValue"
      collapse-tags
      v-bind="$attrs"
      placeholder="请选择伙伴"
      :show-all-levels="false"
      :popper-append-to-body="false"
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
      options: []
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
    async getStaffList () {
      const list = await Staff.getStaffSelectList()
      this.options = list
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 230px;
}
</style>
