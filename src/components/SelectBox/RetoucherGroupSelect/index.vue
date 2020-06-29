<template>
  <div class="retoucher-group">
    <el-select
      :disabled="disableState"
      v-bind="$attrs"
      filterable
      clearable
      :popper-append-to-body="false"
      placeholder="请选择修图组"
      v-on="$listeners"
    >
      <el-option v-if="showAll" label="全部" :value="0" />
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
  props: {
    showAll: { type: Boolean }
  },
  data () {
    return {
      options: [],
      disableState: true
    }
  },
  created () {
    this.getRetoucherGroup()
  },
  methods: {
    /**
     * @description 获取修图组
     */
    async getRetoucherGroup () {
      const list = await Staff.getRetoucherGroup()
      this.options = list
      this.disableState = false
    }
  }
}
</script>
