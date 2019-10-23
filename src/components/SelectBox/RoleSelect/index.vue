<template>
  <div class="role-select">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      placeholder="请选择角色组"
      v-on="$listeners"
    >
      <el-option label="全部" :value="0" />
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import * as Staff from '@/api/staff.js'

export default {
  name: 'RoleSelect',
  data () {
    return {
      options: [],
      disableState: false
    }
  },
  created () {
    this.getAllRole()
  },
  methods: {
    async getAllRole () {
      const list = await Staff.getAllRole()
      this.options = list
      this.options.length === 0 && (this.disableState = true)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 230px;
}
</style>
