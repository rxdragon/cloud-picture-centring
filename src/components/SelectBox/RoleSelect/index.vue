<template>
  <div class="role-select">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      :popper-append-to-body="false"
      placeholder="请选择角色组"
      v-on="$listeners"
    >
      <!-- <el-option label="全部" :value="0" /> -->
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
      disableState: true
    }
  },
  created () {
    this.getAllRole()
  },
  methods: {
    /**
     * @description 获取全部角色组
     */
    async getAllRole () {
      const list = await Staff.getAllRole()
      this.options = list
      this.disableState = false
    }
  }
}
</script>

<style lang="less" scoped>
.role-select {
  width: 100%;
}
</style>
