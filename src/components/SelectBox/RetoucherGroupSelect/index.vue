<template>
  <div class="retoucher-group">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      placeholder="请选择修图组"
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
  name: 'RetoucherGroup',
  data () {
    return {
      options: [],
      disableState: false
    }
  },
  created () {
    this.getRetoucherGroup()
  },
  methods: {
    async getRetoucherGroup () {
      const list = await Staff.getRetoucherGroup()
      this.options = list
      this.options.length === 0 && (this.disableState = true)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
